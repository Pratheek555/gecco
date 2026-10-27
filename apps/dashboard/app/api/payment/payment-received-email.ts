import { billNumber } from "@/app/lib/bills";

export type PaymentReceivedDetails = {
  paymentId: string;
  gymName: string;
  ownerName: string;
  amount: number;
  paidOn: Date;
  recordedAt: Date;
  timezone: string;
  memberName: string;
  memberNumber: string;
  planName: string | null;
  paymentMode: string;
  recipient: string;
  reference: string | null;
  recordedBy: string | null;
  /** Member's outstanding balance after this payment. */
  memberOutstanding: number;
  todayTotal: number;
  todayCount: number;
  monthTotal: number;
  monthCount: number;
  lastMonthTotal: number;
  monthLabel: string;
  paymentsUrl: string;
};

export const FONT = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";
export const PAGE = "#1d3b8b";
export const PAPER = "#fcfcf4";
export const INK = "#111111";
export const SOFT = "#5c5c57";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const inrWhole = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** Drops the paise when the amount is whole, so ₹12,000 never reads as ₹12,000.00. */
export function money(value: number) {
  return Number.isInteger(value) ? inrWhole.format(value) : inr.format(value);
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** Where this month stands against last month, as a headline and a 0–100 bar fill. */
function monthMomentum(monthTotal: number, lastMonthTotal: number) {
  if (lastMonthTotal <= 0) return { headline: "Every rupee this month is fresh growth", percent: 100, ahead: true };

  const ratio = monthTotal / lastMonthTotal;
  if (ratio >= 1) {
    const ahead = Math.round((ratio - 1) * 100);
    return { headline: ahead === 0 ? "Level with last month" : `${ahead}% ahead of last month`, percent: 100, ahead: true };
  }

  const percent = Math.max(2, Math.round(ratio * 100));
  return { headline: `${percent}% of last month's ${money(lastMonthTotal)}`, percent, ahead: false };
}

/** Half-circle bites along the paper edge, like a torn-off till roll. */
export function scallops(edge: "top" | "bottom", background = PAGE) {
  const radius = edge === "top" ? "0 0 9px 9px" : "9px 9px 0 0";
  const notch = `<td width="18" style="padding:0;"><div style="width:18px;height:9px;background:${background};border-radius:${radius};font-size:0;line-height:0;">&nbsp;</div></td>`;
  const gap = `<td width="6" style="padding:0;font-size:0;line-height:0;">&nbsp;</td>`;
  const cells = Array.from({ length: 17 }, () => notch).join(gap);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${gap}${cells}${gap}</tr></table>`;
}

/** A decorative barcode whose bars are derived from the payment id, so each receipt gets its own. */
export function barcode(seed: string) {
  const source = seed.replace(/[^0-9a-z]/gi, "").toLowerCase() || "gecco";
  const units: [number, boolean][] = [[2, true], [1, false], [2, true], [2, false]];
  for (let i = 0; i < 60; i++) {
    const code = source.charCodeAt(i % source.length) + i * 7;
    units.push([(code % 3) + 1, true], [((code >> 2) % 3) + 1, false]);
  }
  units.push([2, true], [1, false], [2, true]);

  // Percentage widths let the barcode span the receipt on any screen without overflowing.
  const total = units.reduce((sum, [width]) => sum + width, 0);
  const bars = units.map(([width, ink]) =>
    `<td width="${((width / total) * 100).toFixed(3)}%" height="58" style="height:58px;padding:0;background:${ink ? INK : PAPER};font-size:0;line-height:0;">&nbsp;</td>`,
  );

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr>${bars.join("")}</tr></table>`;
}

export const dashed = (gap = 22) =>
  `<tr><td style="padding:${gap}px 0;"><div style="border-top:2px dashed #2a2a2a;font-size:0;line-height:0;">&nbsp;</div></td></tr>`;

export function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:5px 0;font:400 13px/1.4 ${FONT};color:${SOFT};">${label}</td>
    <td align="right" style="padding:5px 0;font:500 13px/1.4 ${FONT};color:${INK};">${value}</td>
  </tr>`;
}

function flowRow(label: string, caption: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;font:600 15px/1.3 ${FONT};color:${INK};">${label} <span style="font-weight:400;font-size:12px;color:${SOFT};">${caption}</span></td>
    <td align="right" style="padding:6px 0;font:600 15px/1.3 ${FONT};color:${INK};">${value}</td>
  </tr>`;
}

export function paymentReceivedEmail(details: PaymentReceivedDetails) {
  const e = escapeHtml;
  const amount = money(details.amount);
  const memberFirstName = details.memberName.trim().split(/\s+/)[0] || details.memberName;
  const receiptNumber = billNumber(details.paymentId);
  const paidOn = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(details.paidOn);
  const recordedAt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: details.timezone })
    .format(details.recordedAt)
    .toUpperCase();
  const momentum = monthMomentum(details.monthTotal, details.lastMonthTotal);
  const settled = details.memberOutstanding <= 0;
  const itemTitle = details.planName ?? "Membership payment";

  const subject = `+${amount} received from ${details.memberName}`;
  const preheader = `${amount} just landed at ${details.gymName}. That's ${money(details.monthTotal)} collected in ${details.monthLabel}.`;

  const stamp = settled
    ? { text: "&#10003;&nbsp; Paid in full", color: "#13805d" }
    : { text: `Balance due &nbsp;${e(money(details.memberOutstanding))}`, color: "#b45f06" };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800;900&display=swap" rel="stylesheet">
<title>${e(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${e(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" style="background:${PAGE};">
<tr><td align="center" style="padding:40px 12px 36px;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAPER}" style="max-width:440px;background:${PAPER};">
    <tr><td style="padding:0;">${scallops("top")}</td></tr>
    <tr><td style="padding:30px 34px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

        <tr><td align="center" style="font-size:42px;line-height:1;">&#128179;</td></tr>
        <tr><td align="center" style="padding-top:18px;font:900 58px/1 ${FONT};color:${INK};letter-spacing:-.02em;">RECEIPT</td></tr>
        <tr><td align="center" style="padding-top:16px;font:500 16px/1.6 ${FONT};color:${INK};">
          ${e(details.gymName)}<br>
          Payment #${receiptNumber}<br>
          ${e(paidOn)} &middot; ${e(recordedAt)}
        </td></tr>

        ${dashed(26)}

        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="46" valign="middle" style="padding-right:14px;">
              <div style="width:44px;height:44px;border:1px solid #e3e3da;border-radius:8px;background:#ffffff;text-align:center;font:700 15px/44px ${FONT};color:${INK};">${e(initials(details.memberName))}</div>
            </td>
            <td valign="middle">
              <div style="font:700 15px/1.3 ${FONT};color:${INK};">${e(itemTitle)}</div>
              <div style="padding-top:3px;font:400 12px/1.3 ${FONT};color:${INK};">${e(details.memberName)} &middot; #${e(details.memberNumber)}</div>
            </td>
            <td align="right" valign="middle" style="font:500 15px/1.3 ${FONT};color:${INK};white-space:nowrap;">${e(amount)}</td>
          </tr></table>
        </td></tr>

        <tr><td style="padding-top:18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow("Paid via", e(details.paymentMode))}
            ${infoRow("Received by", e(details.recipient))}
            ${details.reference ? infoRow("Reference", e(details.reference)) : ""}
            ${details.recordedBy ? infoRow("Recorded by", e(details.recordedBy)) : ""}
          </table>
        </td></tr>

        ${dashed()}

        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font:500 19px/1.2 ${FONT};color:${INK};">Total</td>
            <td align="right" style="font:600 22px/1.2 ${FONT};color:${INK};">${e(amount)}</td>
          </tr></table>
        </td></tr>
        <tr><td align="center" style="padding-top:22px;">
          <span style="display:inline-block;border:2px solid ${stamp.color};border-radius:6px;padding:7px 14px;font:800 12px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${stamp.color};">${stamp.text}</span>
        </td></tr>

        ${dashed()}

        <tr><td style="padding-bottom:8px;font:600 11px/1 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${SOFT};">Your money this month</td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${flowRow("Today", e(plural(details.todayCount, "payment")), e(money(details.todayTotal)))}
            ${flowRow(e(details.monthLabel), e(plural(details.monthCount, "payment")), e(money(details.monthTotal)))}
          </table>
        </td></tr>
        <tr><td style="padding-top:12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e6e6dc" style="background:#e6e6dc;"><tr>
            <td width="${momentum.percent}%" height="6" bgcolor="${INK}" style="background:${INK};font-size:0;line-height:0;">&nbsp;</td>
            ${momentum.percent < 100 ? `<td width="${100 - momentum.percent}%" height="6" style="font-size:0;line-height:0;">&nbsp;</td>` : ""}
          </tr></table>
        </td></tr>
        <tr><td style="padding-top:9px;font:500 12px/1.4 ${FONT};color:${momentum.ahead ? "#13805d" : SOFT};">${momentum.ahead ? "&#9650;&nbsp;" : ""}${e(momentum.headline)}</td></tr>

        <tr><td align="center" style="padding:40px 0 16px;font:500 13px/1 ${FONT};letter-spacing:.06em;text-transform:uppercase;color:${INK};">Thank you for growing with Gecco</td></tr>
        <tr><td align="center">${barcode(details.paymentId)}</td></tr>
        <tr><td align="center" style="padding:8px 0 26px;font:400 10px/1 'Courier New',Courier,monospace;letter-spacing:.4em;color:${SOFT};">${receiptNumber}</td></tr>

      </table>
    </td></tr>
    <tr><td style="padding:0;">${scallops("bottom")}</td></tr>
  </table>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr>
    <td bgcolor="${PAPER}" style="border-radius:999px;background:${PAPER};">
      <a href="${e(details.paymentsUrl)}" style="display:inline-block;padding:13px 26px;font:600 14px/1 ${FONT};color:${INK};text-decoration:none;border-radius:999px;">View all payments &rarr;</a>
    </td>
  </tr></table>
  <div style="padding-top:20px;font:400 12px/1.6 ${FONT};color:#a9bbe8;">You own ${e(details.gymName)} on Gecco, so every payment lands here.</div>

</td></tr>
</table>
</body>
</html>`;

  const text = [
    "RECEIPT",
    details.gymName,
    `Payment #${receiptNumber}`,
    `${paidOn} · ${recordedAt}`,
    "",
    `${itemTitle}: ${amount}`,
    `${details.memberName} · #${details.memberNumber}`,
    `Paid via: ${details.paymentMode}`,
    `Received by: ${details.recipient}`,
    ...(details.reference ? [`Reference: ${details.reference}`] : []),
    ...(details.recordedBy ? [`Recorded by: ${details.recordedBy}`] : []),
    "",
    `Total: ${amount}`,
    settled ? `${memberFirstName} is paid in full.` : `Balance due from ${memberFirstName}: ${money(details.memberOutstanding)}`,
    "",
    `Today: ${money(details.todayTotal)} (${plural(details.todayCount, "payment")})`,
    `${details.monthLabel}: ${money(details.monthTotal)} (${plural(details.monthCount, "payment")})`,
    momentum.headline,
    "",
    `View all payments: ${details.paymentsUrl}`,
  ].join("\n");

  return { subject, text, html };
}
