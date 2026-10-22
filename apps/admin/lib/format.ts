/** Figures follow Indian grouping (₹12,45,300), the way gym owners read their takings. */
const LOCALE = "en-IN";
const MINUS = "−";
const DAY = 86_400_000;

const inrFormat = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const intFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const pctFormat = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 0 });

export const inr = (value: number) => inrFormat.format(Math.round(value));
export const int = (value: number) => intFormat.format(value);
export const pct = (value: number) => pctFormat.format(value);

/** A sign on every change, with a true minus: +4, 0, −2. */
export function signed(value: number, format: (v: number) => string = int) {
  if (value === 0) return format(0);
  return `${value > 0 ? "+" : MINUS}${format(Math.abs(value))}`;
}

export function daysBetween(from: string | Date, to: string | Date) {
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / DAY);
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${int(count)} ${count === 1 ? one : many}`;
}

/** "12 Oct", or "12 Oct 2025" outside the current year. */
export function shortDate(value: string, now: string) {
  const date = new Date(value);
  const sameYear = date.getUTCFullYear() === new Date(now).getUTCFullYear();
  return date.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** Recency in words: Today, Yesterday, 6 days ago; older than a fortnight falls back to the date. */
export function ago(value: string | null, now: string) {
  if (!value) return null;
  const days = daysBetween(value, now);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  return shortDate(value, now);
}

/** Week bucket labels for chart axes: "13 Oct". */
export function weekLabel(value: string) {
  return new Date(value).toLocaleDateString(LOCALE, { day: "numeric", month: "short", timeZone: "UTC" });
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
