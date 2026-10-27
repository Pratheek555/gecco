import { type Bill, formatBillDate } from "@/app/lib/bills";
import { dashed, escapeHtml, FONT, INK, infoRow, money, PAPER, scallops, SOFT } from "./payment-received-email";

/** Calmer than the owner email: this one is from the gym to its member, not a Gecco celebration. */
const BACKDROP = "#ecebe4";

/**
 * The member's side of a payment: what they paid, what it covered, and what is still due.
 * Business figures (daily totals, who recorded it) stay in the owner email.
 */
export function memberReceiptEmail(bill: Bill, billsUrl: string) {
  const e = escapeHtml;
  const amount = money(bill.amount);
  const firstName = bill.memberName.trim().split(/\s+/)[0] || bill.memberName;
  const paidOn = formatBillDate(bill.paidOn);
  const settled = bill.balanceAfter <= 0;
  const itemTitle = bill.planName ?? bill.lines[0]?.description ?? "Payment";
  const period = bill.period ? `${formatBillDate(bill.period.startsOn)} – ${formatBillDate(bill.period.endsOn)}` : null;

  const subject = `Your receipt from ${bill.gymName} · ${amount}`;
  const preheader = `We've received ${amount} for ${itemTitle}. Your bill #${bill.number} is attached.`;

  const stamp = settled
    ? { text: "&#10003;&nbsp; Paid in full", color: "#13805d" }
    : { text: `Balance due &nbsp;${e(money(bill.balanceAfter))}`, color: "#b45f06" };

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
<body style="margin:0;padding:0;background:${BACKDROP};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${e(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BACKDROP}" style="background:${BACKDROP};">
<tr><td align="center" style="padding:36px 12px;">

  <div style="padding-bottom:18px;font:700 13px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${INK};">${e(bill.gymName)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAPER}" style="max-width:440px;background:${PAPER};">
    <tr><td style="padding:0;">${scallops("top", BACKDROP)}</td></tr>
    <tr><td style="padding:28px 34px 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

        <tr><td align="center" style="font:600 12px/1 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${SOFT};">Payment received</td></tr>
        <tr><td align="center" style="padding-top:14px;font:900 46px/1 ${FONT};color:${INK};letter-spacing:-.02em;">${e(amount)}</td></tr>
        <tr><td align="center" style="padding-top:14px;font:400 15px/1.6 ${FONT};color:${INK};">Thank you, ${e(firstName)}. Here&rsquo;s your receipt.</td></tr>

        ${dashed(24)}

        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td valign="top">
              <div style="font:700 15px/1.3 ${FONT};color:${INK};">${e(itemTitle)}</div>
              ${period ? `<div style="padding-top:3px;font:400 12px/1.4 ${FONT};color:${SOFT};">${e(period)}</div>` : ""}
            </td>
            <td align="right" valign="top" style="font:500 15px/1.3 ${FONT};color:${INK};white-space:nowrap;">${e(amount)}</td>
          </tr></table>
        </td></tr>

        <tr><td style="padding-top:16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow("Bill number", `#${e(bill.number)}`)}
            ${infoRow("Paid on", e(paidOn))}
            ${infoRow("Paid via", e(bill.paymentMode))}
            ${bill.reference ? infoRow("Reference", e(bill.reference)) : ""}
            ${infoRow("Member", `${e(bill.memberName)} &middot; #${e(bill.memberNumber)}`)}
          </table>
        </td></tr>

        ${dashed()}

        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font:500 19px/1.2 ${FONT};color:${INK};">Total paid</td>
            <td align="right" style="font:600 22px/1.2 ${FONT};color:${INK};">${e(amount)}</td>
          </tr></table>
        </td></tr>
        <tr><td align="center" style="padding:22px 0 26px;">
          <span style="display:inline-block;border:2px solid ${stamp.color};border-radius:6px;padding:7px 14px;font:800 12px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${stamp.color};">${stamp.text}</span>
        </td></tr>

      </table>
    </td></tr>
    <tr><td style="padding:0;">${scallops("bottom", BACKDROP)}</td></tr>
  </table>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;"><tr>
    <td bgcolor="${INK}" style="border-radius:999px;background:${INK};">
      <a href="${e(billsUrl)}" style="display:inline-block;padding:13px 26px;font:600 14px/1 ${FONT};color:#ffffff;text-decoration:none;border-radius:999px;">View &amp; download your bills &rarr;</a>
    </td>
  </tr></table>
  <div style="max-width:420px;padding-top:18px;font:400 12px/1.6 ${FONT};color:${SOFT};">
    Your bill is attached as a PDF. Keep the link above to download any of your bills later.<br>
    Questions about this payment? Contact ${e(bill.gymName)} directly.
  </div>

</td></tr>
</table>
</body>
</html>`;

  const text = [
    bill.gymName,
    "",
    `Payment received: ${amount}`,
    `Thank you, ${firstName}. Here's your receipt.`,
    "",
    `${itemTitle}: ${amount}`,
    ...(period ? [period] : []),
    `Bill number: #${bill.number}`,
    `Paid on: ${paidOn}`,
    `Paid via: ${bill.paymentMode}`,
    ...(bill.reference ? [`Reference: ${bill.reference}`] : []),
    `Member: ${bill.memberName} · #${bill.memberNumber}`,
    "",
    `Total paid: ${amount}`,
    settled ? "Paid in full." : `Balance due: ${money(bill.balanceAfter)}`,
    "",
    "Your bill is attached as a PDF. View and download all your bills:",
    billsUrl,
    "",
    `Questions about this payment? Contact ${bill.gymName} directly.`,
  ].join("\n");

  return { subject, text, html };
}
