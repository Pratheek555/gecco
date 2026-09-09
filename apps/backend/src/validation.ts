export const EXPECTED_HEADERS = [
  "member_id",
  "full_name",
  "joined_on",
  "status",
  "phone",
  "email",
  "whatsapp",
] as const;

export const REQUIRED_HEADERS = ["member_id", "full_name", "joined_on"] as const;

export type SpreadsheetValue = string | number | boolean | Date | null | undefined;

export type NormalizedMemberRow = {
  member_id: string;
  full_name: string;
  joined_on: string;
  status: "ACTIVE" | "ARCHIVED" | string;
  phone: string;
  email: string;
  whatsapp: string;
};

export type ValidatedMemberRow = {
  rowNumber: number;
  data: NormalizedMemberRow;
  errors: string[];
};

function text(value: SpreadsheetValue) {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeDate(value: SpreadsheetValue) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return text(value);
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parts = value.split("-").map(Number);
  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function isContactNumber(value: string) {
  return (
    !value ||
    (/^[+0-9()\-\s]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.length <= 24)
  );
}

export function validateHeaders(headers: SpreadsheetValue[]) {
  const normalized = headers.map((header) => text(header).toLowerCase());
  const duplicates = normalized.filter(
    (header, index) => header && normalized.indexOf(header) !== index,
  );
  const missing = REQUIRED_HEADERS.filter((header) => !normalized.includes(header));
  const unsupported = normalized.filter(
    (header) => header && !EXPECTED_HEADERS.includes(header as (typeof EXPECTED_HEADERS)[number]),
  );
  const orderErrors = [
    ...(normalized[0] !== "member_id" ? ["The first column must be member_id."] : []),
    ...(normalized[1] !== "full_name" ? ["The second column must be full_name."] : []),
  ];
  return {
    normalized,
    errors: [
      ...orderErrors,
      ...missing.map((header) => `Missing required column: ${header}.`),
      ...new Set(duplicates.map((header) => `Column appears more than once: ${header}.`)),
      ...new Set(unsupported.map((header) => `Unsupported column: ${header}.`)),
    ],
  };
}

export function validateMemberRow(
  rowNumber: number,
  source: Record<string, SpreadsheetValue>,
  options: { duplicateInFile?: boolean; existsInGym?: boolean; containsFormula?: boolean } = {},
): ValidatedMemberRow {
  const data: NormalizedMemberRow = {
    member_id: text(source.member_id),
    full_name: text(source.full_name),
    joined_on: normalizeDate(source.joined_on),
    status: text(source.status).toUpperCase() || "ACTIVE",
    phone: text(source.phone),
    email: text(source.email).toLowerCase(),
    whatsapp: text(source.whatsapp),
  };
  const errors: string[] = [];

  if (!data.member_id) errors.push("Member ID is required.");
  else if (data.member_id.length > 100) errors.push("Member ID must be 100 characters or fewer.");
  if (!data.full_name) errors.push("Full name is required.");
  else if (data.full_name.length > 200) errors.push("Full name must be 200 characters or fewer.");
  if (!data.joined_on) errors.push("Joined date is required.");
  else if (!isCalendarDate(data.joined_on)) errors.push("Joined date must use YYYY-MM-DD.");
  if (data.status !== "ACTIVE" && data.status !== "ARCHIVED")
    errors.push("Status must be ACTIVE or ARCHIVED.");
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("Email address is not valid.");
  if (!isContactNumber(data.phone)) errors.push("Phone number is not valid.");
  if (!isContactNumber(data.whatsapp)) errors.push("WhatsApp number is not valid.");
  if (options.duplicateInFile) errors.push("Member ID is repeated in this spreadsheet.");
  if (options.existsInGym) errors.push("Member ID already exists in this gym.");
  if (options.containsFormula) errors.push("Formula cells are not supported.");

  return { rowNumber, data, errors };
}

export function isBlankRow(row: SpreadsheetValue[]) {
  return row.every((value) => text(value) === "");
}
