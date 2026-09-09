"use client";

import {
  AlertTriangle,
  ArrowDown,
  CalendarDays,
  Check,
  CheckCircle2,
  CloudUpload,
  Download,
  FileSpreadsheet,
  Hash,
  Info,
  LoaderCircle,
  Phone,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import styles from "./member-import-dialog.module.css";

type MemberImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotify: (message: string) => void;
};

type ImportStatus =
  | "UPLOADING"
  | "QUEUED"
  | "VALIDATING"
  | "READY_FOR_REVIEW"
  | "COMMITTING"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "FAILED";

type ImportResult = {
  id: string;
  originalFileName: string;
  fileSize: number;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  validRows: number;
  excludedRows: number;
  importedRows: number;
  correctionForId: string | null;
  failureMessage: string | null;
};

type ExcludedRow = {
  id: string;
  rowNumber: number;
  memberId: string | null;
  fullName: string | null;
  errors: unknown;
};

const templateHeaders = [
  "member_id",
  "full_name",
  "joined_on",
  "status",
  "phone",
  "email",
  "whatsapp",
];

const exampleRow = [
  "MEM-001",
  "Asha Mehta",
  "2026-09-01",
  "ACTIVE",
  "9876543210",
  "asha@example.com",
  "9876543210",
];

const columns = [
  {
    name: "member_id",
    label: "Member ID",
    detail: "A unique ID for each member in this gym.",
    required: true,
    icon: Hash,
  },
  {
    name: "full_name",
    label: "Full name",
    detail: "Member's name as it should appear in Gecco.",
    required: true,
    icon: UserRound,
  },
  {
    name: "joined_on",
    label: "Joined on",
    detail: "Use the date format YYYY-MM-DD.",
    required: true,
    icon: CalendarDays,
  },
  {
    name: "status",
    label: "Status",
    detail: "Use ACTIVE or ARCHIVED. Blank defaults to ACTIVE.",
    required: false,
    icon: Check,
  },
  {
    name: "phone / email / whatsapp",
    label: "Contact details",
    detail: "Optional contact fields; leave unused cells blank.",
    required: false,
    icon: Phone,
  },
];

function downloadTemplate() {
  const csv = [templateHeaders, exampleRow]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "gecco-member-import-template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function uploadToR2(
  url: string,
  file: File,
  contentType: string,
  onProgress: (value: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", contentType);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("The spreadsheet could not be uploaded to secure storage."));
    });
    request.addEventListener("error", () =>
      reject(new Error("The spreadsheet upload was interrupted.")),
    );
    request.send(file);
  });
}

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const text = await response.text();
  if (!text) throw new Error(`${fallback} (empty server response)`);
  try { return JSON.parse(text) as T; }
  catch { throw new Error(`${fallback} (${text.slice(0, 160)})`); }
}

export default function MemberImportDialog({
  open,
  onOpenChange,
  onNotify,
}: MemberImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"prepare" | "uploading" | "processing" | "review" | "complete" | "error">(
    "prepare",
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [memberImport, setMemberImport] = useState<ImportResult | null>(null);
  const [excludedRows, setExcludedRows] = useState<ExcludedRow[]>([]);
  const [error, setError] = useState("");

  function reset() {
    setPhase("prepare");
    setUploadProgress(0);
    setMemberImport(null);
    setExcludedRows([]);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function monitorImport(importId: string): Promise<ImportResult> {
    for (let attempt = 0; attempt < 600; attempt += 1) {
      const response = await fetch(`/api/member-imports/${importId}`, { cache: "no-store" });
      const data = (await response.json()) as { import?: ImportResult; error?: string };
      if (!response.ok || !data.import)
        throw new Error(data.error ?? "Could not read import progress.");
      setMemberImport(data.import);

      if (data.import.status === "FAILED")
        throw new Error(data.import.failureMessage ?? "Spreadsheet validation failed.");
      if (data.import.status === "READY_FOR_REVIEW") {
        const rowsResponse = await fetch(
          `/api/member-imports/${importId}/rows?status=EXCLUDED&pageSize=100`,
          { cache: "no-store" },
        );
        const rowsData = (await rowsResponse.json()) as { rows?: ExcludedRow[] };
        if (rowsResponse.ok) setExcludedRows(rowsData.rows ?? []);
        setPhase("review");
        onNotify(
          data.import.excludedRows
            ? `Spreadsheet checked. ${data.import.excludedRows} rows were excluded.`
            : `Spreadsheet checked. All ${data.import.validRows} rows are valid.`,
        );
        return data.import;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }
    throw new Error(
      "Validation is taking longer than expected. You can close this window and try again shortly.",
    );
  }

  async function monitorCommit(importId: string) {
    for (let attempt = 0; attempt < 600; attempt += 1) {
      const response = await fetch(`/api/member-imports/${importId}`, { cache: "no-store" });
      const data = (await response.json()) as { import?: ImportResult; error?: string };
      if (!response.ok || !data.import) throw new Error(data.error ?? "Could not read import progress.");
      setMemberImport(data.import);
      if (data.import.status === "FAILED") throw new Error(data.import.failureMessage ?? "Bulk upload failed.");
      if (data.import.status === "COMPLETED" || data.import.status === "COMPLETED_WITH_ERRORS") {
        setPhase("complete");
        onNotify(`Bulk upload finished. ${data.import.importedRows} members imported.`);
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }
    throw new Error("Bulk upload is taking longer than expected.");
  }

  async function finishImport(correctionImportId?: string) {
    if (!memberImport) return;
    setError("");
    setPhase("processing");
    try {
      const response = await fetch(`/api/member-imports/${memberImport.id}/commit`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(correctionImportId ? { correctionImportId } : {}),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not start the bulk upload.");
      await monitorCommit(memberImport.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Bulk upload failed.");
      setPhase("error");
    }
  }

  async function startImport(file: File, correctionForId?: string) {
    const extension = file.name.toLowerCase().split(".").pop();
    if (extension !== "csv" && extension !== "xlsx") {
      setError("Choose a CSV or XLSX spreadsheet.");
      setPhase("error");
      return;
    }
    if (!file.size || file.size > 10 * 1024 * 1024) {
      setError("The spreadsheet must be no larger than 10 MB.");
      setPhase("error");
      return;
    }

    setError("");
    setUploadProgress(0);
    setPhase("uploading");
    try {
      const createResponse = await fetch("/api/member-imports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size, correctionForId }),
      });
      const created = await readJson<{
        import?: ImportResult;
        uploadUrl?: string;
        contentType?: string;
        error?: string;
      }>(createResponse, "Could not prepare the spreadsheet upload");
      if (!createResponse.ok || !created.import || !created.uploadUrl || !created.contentType) {
        throw new Error(created.error ?? "Could not prepare the spreadsheet upload.");
      }
      setMemberImport(created.import);
      await uploadToR2(created.uploadUrl, file, created.contentType, setUploadProgress);

      const completeResponse = await fetch(
        `/api/member-imports/${created.import.id}/complete-upload`,
        { method: "POST" },
      );
      const completed = await readJson<{ error?: string }>(completeResponse, "Could not start spreadsheet validation");
      if (!completeResponse.ok)
        throw new Error(completed.error ?? "Could not start spreadsheet validation.");
      setPhase("processing");
      const validated = await monitorImport(created.import.id);
      if (correctionForId && validated.status === "READY_FOR_REVIEW") await finishImport(created.import.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Spreadsheet processing failed.");
      setPhase("error");
    }
  }

  const progress = memberImport?.totalRows
    ? Math.round((memberImport.processedRows / memberImport.totalRows) * 100)
    : 8;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog}>
        <DialogHeader className={styles.header}>
          <div className={styles.titleIcon} aria-hidden="true">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <DialogTitle className={styles.title}>Prepare your member spreadsheet</DialogTitle>
            <DialogDescription className={styles.description}>
              Follow this format so every member can be checked and imported correctly.
            </DialogDescription>
          </div>
        </DialogHeader>

        {phase === "prepare" && (
          <div className={styles.body}>
            <ol className={styles.steps} aria-label="Spreadsheet preparation steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Download the template</strong>
                  <small>Start with the provided headers and example row.</small>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Add one member per row</strong>
                  <small>Keep the first row and column names unchanged.</small>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Save as CSV or XLSX</strong>
                  <small>Your spreadsheet will be checked before anything is imported.</small>
                </div>
              </li>
            </ol>

            <section className={styles.preview} aria-labelledby="spreadsheet-example-title">
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.eyebrow}>Example</span>
                  <h3 id="spreadsheet-example-title">Your spreadsheet should look like this</h3>
                </div>
                <span className={styles.legend}>
                  <i /> Required column
                </span>
              </div>

              <div className={styles.sheetFrame}>
                <div className={styles.sheetBar}>
                  <span>
                    <FileSpreadsheet size={14} /> members.xlsx
                  </span>
                  <span>Sheet 1</span>
                </div>
                <div className={styles.tableScroller}>
                  <table className={styles.sheetTable}>
                    <thead>
                      <tr>
                        <th aria-label="Row number" />
                        {templateHeaders.map((header, index) => (
                          <th
                            key={header}
                            className={index < 3 ? styles.requiredHeader : undefined}
                          >
                            {header}
                            {index < 3 && <sup>*</sup>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">2</th>
                        {exampleRow.map((cell, index) => (
                          <td key={`${cell}-${index}`}>{cell}</td>
                        ))}
                      </tr>
                      <tr className={styles.emptyRow} aria-hidden="true">
                        <th>3</th>
                        {templateHeaders.map((header) => (
                          <td key={header}>&nbsp;</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={styles.scrollHint}>
                <ArrowDown size={13} /> Scroll sideways to see all columns
              </div>
            </section>

            <section className={styles.columnSection} aria-labelledby="column-guide-title">
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.eyebrow}>Column guide</span>
                  <h3 id="column-guide-title">What goes in each column</h3>
                </div>
              </div>
              <div className={styles.columnGrid}>
                {columns.map(({ name, label, detail, required, icon: Icon }) => (
                  <article key={name} className={styles.columnCard}>
                    <span className={styles.columnIcon}>
                      <Icon size={15} />
                    </span>
                    <div>
                      <div className={styles.columnTitle}>
                        <strong>{label}</strong>
                        <code>{name}</code>
                        <span className={required ? styles.requiredTag : styles.optionalTag}>
                          {required ? "Required" : "Optional"}
                        </span>
                      </div>
                      <p>{detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className={styles.note}>
              <Info size={17} aria-hidden="true" />
              <div>
                <strong>Before you save</strong>
                <p>
                  Member IDs cannot repeat. Keep phone numbers as text if they begin with zero, and
                  leave optional cells empty instead of writing “N/A”.
                </p>
              </div>
            </aside>
          </div>
        )}

        {(phase === "uploading" || phase === "processing") && (
          <div className={`${styles.body} ${styles.stateBody}`} aria-live="polite">
            <div className={styles.processingIcon}>
              <LoaderCircle size={25} />
            </div>
            <span className={styles.eyebrow}>
              {phase === "uploading" ? "Secure upload" : "Background validation"}
            </span>
            <h3>
              {phase === "uploading" ? "Uploading your spreadsheet" : "Checking every member row"}
            </h3>
            <p>
              {phase === "uploading"
                ? "Keep this window open until the file reaches secure storage."
                : "You can close this window—the validation job will continue without blocking Gecco."}
            </p>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label={
                phase === "uploading"
                  ? "Spreadsheet upload progress"
                  : "Spreadsheet validation progress"
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={phase === "uploading" ? uploadProgress : progress}
            >
              <span style={{ width: `${phase === "uploading" ? uploadProgress : progress}%` }} />
            </div>
            <div className={styles.progressMeta}>
              <strong>
                {phase === "uploading"
                  ? `${uploadProgress}% uploaded`
                  : memberImport?.totalRows
                    ? `${memberImport.processedRows.toLocaleString()} of ${memberImport.totalRows.toLocaleString()} rows checked`
                    : "Preparing spreadsheet…"}
              </strong>
              <span>{memberImport?.originalFileName}</span>
            </div>
          </div>
        )}

        {phase === "review" && memberImport && (
          <div className={styles.body}>
            <div className={styles.resultHero}>
              <span className={memberImport.excludedRows ? styles.warningIcon : styles.successIcon}>
                {memberImport.excludedRows ? (
                  <AlertTriangle size={24} />
                ) : (
                  <CheckCircle2 size={24} />
                )}
              </span>
              <div>
                <span className={styles.eyebrow}>Validation complete</span>
                <h3>
                  {memberImport.excludedRows
                    ? "Some rows need your attention"
                    : "Every row looks good"}
                </h3>
                <p>
                  {memberImport.excludedRows
                    ? "Excluded rows will not be imported. Review the reasons below or download a correction file."
                    : "All rows passed validation and are ready for the member import step."}
                </p>
              </div>
            </div>
            <div className={styles.resultStats}>
              <div>
                <strong>{memberImport.totalRows.toLocaleString()}</strong>
                <span>Total rows</span>
              </div>
              <div className={styles.validStat}>
                <strong>{memberImport.validRows.toLocaleString()}</strong>
                <span>Valid</span>
              </div>
              <div className={memberImport.excludedRows ? styles.excludedStat : undefined}>
                <strong>{memberImport.excludedRows.toLocaleString()}</strong>
                <span>Excluded</span>
              </div>
            </div>
            {memberImport.excludedRows > 0 && (
              <section className={styles.excludedSection} aria-labelledby="excluded-rows-title">
                <div className={styles.sectionHeading}>
                  <div>
                    <span className={styles.eyebrow}>Excluded rows</span>
                    <h3 id="excluded-rows-title">What needs to be corrected</h3>
                  </div>
                  <a
                    className={styles.reportLink}
                    href={`/api/member-imports/${memberImport.id}/report`}
                  >
                    <Download size={14} /> Download correction CSV
                  </a>
                </div>
                <div className={styles.excludedTableWrap}>
                  <table className={styles.excludedTable}>
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Member ID</th>
                        <th>Full name</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excludedRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.rowNumber}</td>
                          <td>{row.memberId || "—"}</td>
                          <td>{row.fullName || "—"}</td>
                          <td>
                            {Array.isArray(row.errors)
                              ? row.errors.join(" ")
                              : "Validation failed."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {memberImport.excludedRows > excludedRows.length && (
                  <p className={styles.moreRows}>
                    Showing the first {excludedRows.length} excluded rows. The correction CSV
                    contains all of them.
                  </p>
                )}
                <div className={styles.reviewActions}>
                  <Button onClick={() => inputRef.current?.click()}>
                    <CloudUpload size={15} /> Upload corrected rows
                  </Button>
                </div>
              </section>
            )}
            {memberImport.excludedRows === 0 && (
              <div className={styles.reviewActions}>
                <Button onClick={() => void finishImport()}>
                  <CheckCircle2 size={15} /> Finish bulk upload
                </Button>
              </div>
            )}
          </div>
        )}

        {phase === "complete" && memberImport && (
          <div className={`${styles.body} ${styles.stateBody}`} role="status">
            <div className={styles.successIcon}><CheckCircle2 size={25} /></div>
            <span className={styles.eyebrow}>Bulk upload complete</span>
            <h3>{memberImport.importedRows} members imported</h3>
            <p>{memberImport.excludedRows ? `${memberImport.excludedRows} rows still need correction.` : "All valid rows are now in your member list."}</p>
          </div>
        )}

        {phase === "error" && (
          <div className={`${styles.body} ${styles.stateBody}`} role="alert">
            <div className={styles.errorIcon}>
              <AlertTriangle size={25} />
            </div>
            <span className={styles.eyebrow}>Could not check spreadsheet</span>
            <h3>Something needs to be fixed</h3>
            <p>{error}</p>
          </div>
        )}

        <DialogFooter className={styles.footer}>
          <input
            ref={inputRef}
            className={styles.fileInput}
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void startImport(file, phase === "review" ? memberImport?.id : undefined);
            }}
          />
          {phase === "prepare" && (
            <>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download size={15} /> Download template
              </Button>
              <Button onClick={() => inputRef.current?.click()}>
                <CloudUpload size={15} /> Choose spreadsheet
              </Button>
            </>
          )}
          {(phase === "uploading" || phase === "processing") && (
            <DialogClose asChild>
              <Button variant="outline">Close and continue in background</Button>
            </DialogClose>
          )}
          {(phase === "review" || phase === "error" || phase === "complete") && (
            <>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button onClick={reset}>
                <RotateCcw size={15} /> Check another file
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
