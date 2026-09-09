import { neon } from "@neondatabase/serverless";
import { unzipSync } from "fflate";
import { readSheet } from "read-excel-file/universal";
import {
  isBlankRow,
  type SpreadsheetValue,
  validateHeaders,
  validateMemberRow,
} from "./validation";

type Env = {
  DATABASE_URL: string;
  IMPORT_WORKER_SECRET: string;
  MEMBER_IMPORTS: R2Bucket;
  IMPORT_QUEUE: Queue<{ kind: "validate" | "commit"; importId: string; correctionImportId?: string | null }>;
};

type ImportRecord = {
  id: string;
  gym_id: string;
  storage_key: string;
  content_type: string;
};

const MAX_ROWS = 10_000;
const INSERT_BATCH_SIZE = 250;

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

function csvRows(source: string) {
  const rows: SpreadsheetValue[][] = [];
  let row: SpreadsheetValue[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (character === "\r" && source[index + 1] === "\n") index += 1;
    } else {
      cell += character;
    }
  }
  if (quoted) throw new Error("The CSV contains an unclosed quoted cell.");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function assertSafeXlsxSize(bytes: Uint8Array) {
  let expandedSize = 0;
  for (let index = 0; index <= bytes.length - 46; index += 1) {
    if (
      bytes[index] === 0x50 &&
      bytes[index + 1] === 0x4b &&
      bytes[index + 2] === 0x01 &&
      bytes[index + 3] === 0x02
    ) {
      expandedSize += new DataView(bytes.buffer, bytes.byteOffset + index + 24, 4).getUint32(
        0,
        true,
      );
      if (expandedSize > 50 * 1024 * 1024)
        throw new Error("The XLSX expands beyond the safe processing limit.");
    }
  }
}

async function parseSpreadsheet(buffer: ArrayBuffer, contentType: string) {
  const formulaRows = new Set<number>();
  if (contentType === "text/csv") {
    const rows = csvRows(
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: false })
        .decode(buffer)
        .replace(/^\uFEFF/, ""),
    );
    rows.forEach((row, rowIndex) => {
      if (
        row.some((value, columnIndex) => {
          const header = String(rows[0]?.[columnIndex] ?? "")
            .trim()
            .toLowerCase();
          const cell = String(value ?? "").trim();
          return (
            /^[=@]/.test(cell) || (!["phone", "whatsapp"].includes(header) && /^[+-]/.test(cell))
          );
        })
      )
        formulaRows.add(rowIndex + 1);
    });
    return { rows, formulaRows };
  }

  const bytes = new Uint8Array(buffer);
  assertSafeXlsxSize(bytes);
  const archive = unzipSync(bytes);
  const decoder = new TextDecoder();
  for (const [name, contents] of Object.entries(archive)) {
    if (!/^xl\/worksheets\/sheet\d+\.xml$/i.test(name)) continue;
    const xml = decoder.decode(contents);
    for (const match of xml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      if (!/<f(?:\s|>)/.test(match[2] ?? "")) continue;
      const rowNumber = /\br="[A-Z]+(\d+)"/i.exec(match[1] ?? "")?.[1];
      if (rowNumber) formulaRows.add(Number(rowNumber));
    }
  }
  const rows = (await readSheet(buffer, 1)) as SpreadsheetValue[][];
  return { rows, formulaRows };
}

async function processImport(importId: string, env: Env) {
  const sql = neon(env.DATABASE_URL);
  const claimed = (await sql`
    UPDATE member_imports
    SET status = 'VALIDATING', started_at = COALESCE(started_at, NOW()),
        attempts = attempts + 1, failure_message = NULL, updated_at = NOW()
    WHERE id = ${importId}::uuid AND status = 'QUEUED'
    RETURNING id, gym_id, storage_key, content_type
  `) as ImportRecord[];
  const memberImport = claimed[0];
  if (!memberImport) return;

  const object = await env.MEMBER_IMPORTS.get(memberImport.storage_key);
  if (!object) throw new Error("The uploaded spreadsheet could not be found.");
  const { rows, formulaRows } = await parseSpreadsheet(
    await object.arrayBuffer(),
    memberImport.content_type,
  );
  if (!rows.length) throw new Error("The spreadsheet is empty.");

  const { normalized: headers, errors: headerErrors } = validateHeaders(rows[0]!);
  if (headerErrors.length) throw new Error(headerErrors.join(" "));

  const sourceRows = rows
    .slice(1)
    .map((values, index) => ({ values, rowNumber: index + 2 }))
    .filter(({ values }) => !isBlankRow(values));
  if (!sourceRows.length) throw new Error("The spreadsheet does not contain any member rows.");
  if (sourceRows.length > MAX_ROWS)
    throw new Error("The spreadsheet contains more than 10,000 rows.");

  const records = sourceRows.map(({ values, rowNumber }) => ({
    rowNumber,
    source: Object.fromEntries(headers.map((header, index) => [header, values[index]])),
  }));
  const memberIds = records
    .map(({ source }) => String(source.member_id ?? "").trim())
    .filter(Boolean);
  const existing = (await sql`
    SELECT member_number
    FROM members
    WHERE gym_id = ${memberImport.gym_id}::uuid
      AND member_number = ANY(${memberIds}::text[])
  `) as { member_number: string }[];
  const existingIds = new Set(existing.map((member) => member.member_number));
  const seenIds = new Set<string>();

  const validated = records.map(({ rowNumber, source }) => {
    const memberId = String(source.member_id ?? "").trim();
    const duplicateInFile = Boolean(memberId && seenIds.has(memberId));
    if (memberId) seenIds.add(memberId);
    return validateMemberRow(rowNumber, source, {
      duplicateInFile,
      existsInGym: existingIds.has(memberId),
      containsFormula: formulaRows.has(rowNumber),
    });
  });

  await sql`DELETE FROM member_import_rows WHERE import_id = ${importId}::uuid`;
  let validRows = 0;
  let excludedRows = 0;

  for (let offset = 0; offset < validated.length; offset += INSERT_BATCH_SIZE) {
    const batch = validated.slice(offset, offset + INSERT_BATCH_SIZE).map((row) => {
      const status = row.errors.length ? "EXCLUDED" : "VALID";
      if (status === "VALID") validRows += 1;
      else excludedRows += 1;
      return {
        rowNumber: row.rowNumber,
        memberId: row.data.member_id || null,
        fullName: row.data.full_name || null,
        normalizedData: row.data,
        errors: row.errors,
        status,
      };
    });

    await sql`
      INSERT INTO member_import_rows
        (id, import_id, row_number, member_id, full_name, normalized_data, errors, status, created_at)
      SELECT gen_random_uuid(), ${importId}::uuid, (item->>'rowNumber')::integer,
        NULLIF(item->>'memberId', ''), NULLIF(item->>'fullName', ''),
        item->'normalizedData', item->'errors', (item->>'status')::"MemberImportRowStatus", NOW()
      FROM jsonb_array_elements(${JSON.stringify(batch)}::jsonb) AS item
    `;

    await sql`
      UPDATE member_imports
      SET total_rows = ${validated.length}, processed_rows = ${Math.min(offset + batch.length, validated.length)},
          valid_rows = ${validRows}, excluded_rows = ${excludedRows}, updated_at = NOW()
      WHERE id = ${importId}::uuid
    `;
  }

  await sql`
    UPDATE member_imports
    SET status = 'READY_FOR_REVIEW', processed_rows = total_rows,
        completed_at = NOW(), updated_at = NOW()
    WHERE id = ${importId}::uuid
  `;
}

async function commitImport(importId: string, correctionImportId: string | null, env: Env) {
  const sql = neon(env.DATABASE_URL);
  const claimed = (await sql`
    UPDATE member_imports
    SET status = 'COMMITTING', failure_message = NULL, updated_at = NOW()
    WHERE id = ${importId}::uuid AND status = 'COMMITTING'
    RETURNING id, gym_id
  `) as { id: string; gym_id: string }[];
  const memberImport = claimed[0];
  if (!memberImport) return;

  const correctionClause = correctionImportId
    ? sql`UNION ALL SELECT normalized_data FROM member_import_rows WHERE import_id = ${correctionImportId}::uuid AND status = 'VALID'`
    : sql``;

  await sql`
    WITH source AS (
      SELECT normalized_data
      FROM member_import_rows
      WHERE import_id = ${importId}::uuid AND status = 'VALID'
      ${correctionClause}
    ), inserted AS (
      INSERT INTO members (id, gym_id, member_number, full_name, joined_on, status, created_at, updated_at)
      SELECT gen_random_uuid(), ${memberImport.gym_id}::uuid,
        normalized_data->>'member_id', normalized_data->>'full_name',
        (normalized_data->>'joined_on')::date,
        (normalized_data->>'status')::"MemberRecordStatus", NOW(), NOW()
      FROM source
      ON CONFLICT (gym_id, member_number) DO NOTHING
      RETURNING id, member_number
    )
    INSERT INTO member_contacts (id, member_id, kind, value, is_primary, created_at)
    SELECT gen_random_uuid(), inserted.id, contact.kind::"ContactKind", contact.value, TRUE, NOW()
    FROM inserted
    JOIN source ON source.normalized_data->>'member_id' = inserted.member_number
    CROSS JOIN LATERAL (VALUES
      ('PHONE', NULLIF(source.normalized_data->>'phone', '')),
      ('EMAIL', NULLIF(source.normalized_data->>'email', '')),
      ('WHATSAPP', NULLIF(source.normalized_data->>'whatsapp', ''))
    ) AS contact(kind, value)
    WHERE contact.value IS NOT NULL
  `;

  const remaining = correctionImportId
    ? ((await sql`SELECT excluded_rows FROM member_imports WHERE id = ${correctionImportId}::uuid`) as { excluded_rows: number }[])[0]?.excluded_rows ?? 0
    : 0;
  const importedRows = ((await sql`
    SELECT COUNT(*)::int AS count
    FROM member_import_rows
    WHERE import_id = ${importId}::uuid AND status = 'VALID'
    ${correctionImportId ? sql`UNION ALL SELECT COUNT(*)::int FROM member_import_rows WHERE import_id = ${correctionImportId}::uuid AND status = 'VALID'` : sql``}
  `) as { count: number }[]).reduce((sum, row) => sum + row.count, 0);

  await sql`
    UPDATE member_imports
    SET status = ${remaining ? "COMPLETED_WITH_ERRORS" : "COMPLETED"}::"MemberImportStatus",
        imported_rows = ${importedRows}, excluded_rows = ${remaining},
        processed_rows = total_rows, completed_at = NOW(), updated_at = NOW()
    WHERE id = ${importId}::uuid
  `;
}

async function recordFailure(importId: string, error: unknown, env: Env, retry: boolean) {
  const sql = neon(env.DATABASE_URL);
  const message = error instanceof Error ? error.message : "Spreadsheet validation failed.";
  await sql`
    UPDATE member_imports
    SET status = ${retry ? "QUEUED" : "FAILED"}::"MemberImportStatus",
        failure_message = ${message.slice(0, 1000)}, updated_at = NOW(),
        completed_at = ${retry ? null : new Date()}::timestamptz
    WHERE id = ${importId}::uuid
  `;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return jsonResponse({ ok: true });
    if (request.method !== "POST" || url.pathname !== "/enqueue")
      return jsonResponse({ error: "Not found." }, 404);
    if (request.headers.get("authorization") !== `Bearer ${env.IMPORT_WORKER_SECRET}`) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    let body: { kind?: unknown; importId?: unknown; correctionImportId?: unknown };
    try {
      body = (await request.json()) as { importId?: unknown };
    } catch {
      return jsonResponse({ error: "Invalid JSON." }, 400);
    }
    if (typeof body.importId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.importId)) {
      return jsonResponse({ error: "A valid import ID is required." }, 400);
    }

    const kind = body.kind === "commit" ? "commit" : "validate";
    const correctionImportId = typeof body.correctionImportId === "string" ? body.correctionImportId : null;
    await env.IMPORT_QUEUE.send({ kind, importId: body.importId, correctionImportId });
    return jsonResponse({ queued: true }, 202);
  },

  async queue(batch: MessageBatch<{ kind: "validate" | "commit"; importId: string; correctionImportId?: string | null }>, env: Env) {
    for (const message of batch.messages) {
      try {
        if (message.body.kind === "commit") await commitImport(message.body.importId, message.body.correctionImportId ?? null, env);
        else await processImport(message.body.importId, env);
        message.ack();
      } catch (error) {
        const retry = message.attempts < 3;
        await recordFailure(message.body.importId, error, env, retry);
        if (retry) message.retry({ delaySeconds: 10 * message.attempts });
        else message.ack();
      }
    }
  },

  async scheduled(_controller: ScheduledController, env: Env) {
    const sql = neon(env.DATABASE_URL);
    await sql`DELETE FROM member_imports WHERE created_at < NOW() - INTERVAL '30 days'`;
  },
} satisfies ExportedHandler<Env, { kind: "validate" | "commit"; importId: string; correctionImportId?: string | null }>;
