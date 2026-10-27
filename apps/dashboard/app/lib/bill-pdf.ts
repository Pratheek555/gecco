import { degrees, PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import { type Bill, billStatusLabels, formatBillDate } from "./bills";

const INK = rgb(0.067, 0.067, 0.09);
const SOFT = rgb(0.4, 0.41, 0.46);
const FAINT = rgb(0.6, 0.61, 0.66);
const RULE = rgb(0.89, 0.9, 0.93);
const PANEL = rgb(0.97, 0.975, 0.98);
const GREEN = rgb(0.08, 0.6, 0.44);
const AMBER = rgb(0.75, 0.47, 0.08);
const RED = rgb(0.82, 0.3, 0.35);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT = PAGE_WIDTH - MARGIN * 2;

const amountFormat = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** The standard PDF fonts have no ₹ glyph, so bills use the "Rs." form common on Indian receipts. */
const rupees = (value: number) => `Rs. ${amountFormat.format(value)}`;

/**
 * Standard fonts only encode Latin-1. Accents are folded to their base letter and anything
 * else unencodable becomes "?", so an unusual character never fails the whole download.
 */
export function pdfSafe(value: string) {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/₹/g, "Rs.")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

type Text = { size: number; font: PDFFont; color?: ReturnType<typeof rgb> };

function fit(text: string, width: number, { size, font }: Text) {
  let value = pdfSafe(text);
  if (font.widthOfTextAtSize(value, size) <= width) return value;
  while (value.length > 1 && font.widthOfTextAtSize(`${value}...`, size) > width) value = value.slice(0, -1);
  return `${value.trimEnd()}...`;
}

function draw(page: PDFPage, text: string, x: number, y: number, style: Text, options: { align?: "left" | "right"; width?: number } = {}) {
  const width = options.width ?? CONTENT;
  const value = fit(text, width, style);
  const left = options.align === "right" ? x - style.font.widthOfTextAtSize(value, style.size) : x;
  page.drawText(value, { x: left, y, size: style.size, font: style.font, color: style.color ?? INK });
}

const rule = (page: PDFPage, y: number, color = RULE) =>
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color });

export async function renderBillPdf(bill: Bill, generatedAt = new Date()) {
  const doc = await PDFDocument.create();
  doc.setTitle(pdfSafe(`${bill.gymName} bill #${bill.number}`));
  doc.setAuthor(pdfSafe(bill.gymName));
  doc.setSubject(pdfSafe(`Payment receipt for ${bill.memberName}`));
  doc.setCreator("Gecco");
  doc.setProducer("Gecco");
  doc.setCreationDate(generatedAt);

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const right = PAGE_WIDTH - MARGIN;
  const voided = bill.status !== "SUCCEEDED";

  if (voided) {
    page.drawText(billStatusLabels[bill.status].toUpperCase(), {
      x: 150,
      y: 300,
      size: 130,
      font: bold,
      color: RED,
      opacity: 0.08,
      rotate: degrees(35),
    });
  }

  // Header: who issued the bill, and which bill this is.
  let y = PAGE_HEIGHT - MARGIN - 16;
  draw(page, bill.gymName, MARGIN, y, { size: 20, font: bold }, { width: CONTENT * 0.6 });
  draw(page, "PAYMENT RECEIPT", right, y + 6, { size: 9, font: bold, color: SOFT }, { align: "right" });
  draw(page, `Bill #${bill.number}`, right, y - 9, { size: 11, font: bold }, { align: "right" });
  y -= 22;
  draw(page, `Issued ${formatBillDate(bill.paidOn)}`, MARGIN, y, { size: 9.5, font: regular, color: SOFT });

  y -= 22;
  rule(page, y);

  // Billed to (left) and payment details (right).
  y -= 26;
  const topOfDetails = y;
  draw(page, "BILLED TO", MARGIN, y, { size: 8, font: bold, color: FAINT });
  draw(page, bill.memberName, MARGIN, y - 18, { size: 13, font: bold }, { width: CONTENT / 2 - 20 });
  draw(page, `Member #${bill.memberNumber}`, MARGIN, y - 34, { size: 9.5, font: regular, color: SOFT });
  if (bill.planName) draw(page, bill.planName, MARGIN, y - 49, { size: 9.5, font: regular, color: SOFT }, { width: CONTENT / 2 - 20 });
  if (bill.period) {
    draw(page, `${formatBillDate(bill.period.startsOn)} - ${formatBillDate(bill.period.endsOn)}`, MARGIN, y - 63, {
      size: 9.5,
      font: regular,
      color: SOFT,
    });
  }

  const recordedAt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: bill.timezone,
  }).format(bill.recordedAt);
  const details: [string, string][] = [
    ["Paid on", formatBillDate(bill.paidOn)],
    ["Payment method", bill.paymentMode],
    ["Received by", bill.receivedBy],
    ...(bill.reference ? ([["Reference", bill.reference]] as [string, string][]) : []),
    ["Recorded", recordedAt],
  ];
  const labelX = MARGIN + CONTENT / 2 + 20;
  details.forEach(([label, value], index) => {
    const rowY = topOfDetails - index * 15;
    draw(page, label, labelX, rowY, { size: 9.5, font: regular, color: SOFT });
    draw(page, value, right, rowY, { size: 9.5, font: bold }, { align: "right", width: CONTENT / 4 });
  });

  // Line items: each charge this payment went towards.
  y = Math.min(topOfDetails - 80, topOfDetails - details.length * 15 - 22);
  const columns = [
    { label: "Description", x: MARGIN + 10, align: "left" as const },
    { label: "Charged", x: MARGIN + 270, align: "right" as const },
    { label: "Paid earlier", x: MARGIN + 345, align: "right" as const },
    { label: "This payment", x: MARGIN + 422, align: "right" as const },
    { label: "Balance", x: right - 10, align: "right" as const },
  ];
  page.drawRectangle({ x: MARGIN, y: y - 8, width: CONTENT, height: 24, color: PANEL });
  for (const column of columns) draw(page, column.label.toUpperCase(), column.x, y, { size: 7.5, font: bold, color: SOFT }, { align: column.align });
  y -= 32;

  const rows = bill.lines.map((line) => ({
    title: line.description,
    caption: `Due ${formatBillDate(line.dueOn)}`,
    values: [rupees(line.charged), rupees(line.paidEarlier), rupees(line.paidNow), rupees(line.balanceAfter)],
  }));
  if (bill.unapplied > 0) {
    rows.push({ title: "Credit on account", caption: "Held for future dues", values: ["-", "-", rupees(bill.unapplied), "-"] });
  }
  if (rows.length === 0) rows.push({ title: "Payment received", caption: "", values: ["-", "-", rupees(bill.amount), "-"] });

  for (const row of rows) {
    draw(page, row.title, columns[0].x, y, { size: 10, font: bold }, { width: 190 });
    if (row.caption) draw(page, row.caption, columns[0].x, y - 13, { size: 8.5, font: regular, color: SOFT }, { width: 190 });
    row.values.forEach((value, index) => {
      const column = columns[index + 1];
      draw(page, value, column.x, y, { size: 9.5, font: index === 2 ? bold : regular }, { align: "right", width: 75 });
    });
    y -= 34;
    rule(page, y + 12);
  }

  // Totals.
  y -= 14;
  const totalsX = MARGIN + CONTENT / 2 + 20;
  draw(page, "Amount paid", totalsX, y, { size: 11, font: regular, color: SOFT });
  draw(page, rupees(bill.amount), right, y, { size: 16, font: bold }, { align: "right" });
  y -= 20;
  draw(page, "Balance after this payment", totalsX, y, { size: 9.5, font: regular, color: SOFT });
  draw(page, rupees(bill.balanceAfter), right, y, { size: 10, font: bold }, { align: "right" });

  const stamp = voided
    ? { text: `${billStatusLabels[bill.status]}`.toUpperCase(), color: RED }
    : bill.balanceAfter > 0
      ? { text: "PART PAID", color: AMBER }
      : { text: "PAID IN FULL", color: GREEN };
  const stampWidth = bold.widthOfTextAtSize(stamp.text, 10) + 24;
  page.drawRectangle({ x: MARGIN, y: y - 4, width: stampWidth, height: 26, borderColor: stamp.color, borderWidth: 1.5 });
  page.drawText(stamp.text, { x: MARGIN + 12, y: y + 5, size: 10, font: bold, color: stamp.color });

  if (voided) {
    y -= 40;
    page.drawRectangle({ x: MARGIN, y: y - 10, width: CONTENT, height: 30, color: rgb(1, 0.94, 0.95) });
    draw(page, `This payment was ${bill.status === "REFUNDED" ? "refunded" : "voided"}${bill.voidReason ? `: ${bill.voidReason}` : "."}`, MARGIN + 12, y, {
      size: 9.5,
      font: regular,
      color: RED,
    }, { width: CONTENT - 24 });
  }

  // Footer.
  const footerY = MARGIN + 20;
  rule(page, footerY + 22);
  draw(page, voided ? "This bill is no longer valid." : "Thank you for your payment.", MARGIN, footerY, { size: 10, font: bold });
  draw(page, "Computer-generated bill; no signature required.", right, footerY, { size: 8.5, font: regular, color: FAINT }, { align: "right" });
  draw(page, `Generated ${formatBillDate(generatedAt)} via Gecco`, right, footerY - 13, { size: 8.5, font: regular, color: FAINT }, { align: "right" });

  return doc.save();
}

/** Wraps PDF bytes in a download response. */
export function pdfResponse(bytes: Uint8Array, fileName: string, disposition: "attachment" | "inline" = "attachment") {
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
