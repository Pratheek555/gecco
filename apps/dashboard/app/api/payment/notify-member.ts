import { prisma } from "db/client";
import { normalizeEmail } from "@/app/api/auth/email";
import { sendEmail } from "@/app/api/auth/mailer";
import { memberReceiptEmail } from "@/app/api/payment/member-receipt-email";
import { renderBillPdf } from "@/app/lib/bill-pdf";
import { billFileName, buildBill } from "@/app/lib/bills";
import { billSelect, memberBillsUrl } from "@/app/lib/bills-server";

type Contact = { kind: string; value: string; isPrimary: boolean };

/** The address receipts go to: the primary email contact, else the first valid one. */
export function receiptEmailAddress(contacts: Contact[]) {
  const emails = contacts.filter((contact) => contact.kind === "EMAIL");
  const ordered = [...emails.filter((contact) => contact.isPrimary), ...emails.filter((contact) => !contact.isPrimary)];
  for (const contact of ordered) {
    const email = normalizeEmail(contact.value);
    if (email) return email;
  }
  return null;
}

export const receiptContactSelect = {
  where: { kind: "EMAIL" },
  orderBy: { createdAt: "asc" },
  select: { kind: true, value: true, isPrimary: true },
} as const;

export type MemberReceiptResult =
  | { status: "sent"; to: string }
  | { status: "disabled" | "no_email" | "not_found" | "not_paid" };

/**
 * Emails the member their receipt with the PDF bill attached. Automatic sends honour the gym's
 * setting; a staff member pressing "Email bill" is an explicit request, so it skips that check.
 */
export async function emailMemberReceipt(
  paymentId: string,
  request: Request,
  { automatic }: { automatic: boolean },
): Promise<MemberReceiptResult> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      ...billSelect,
      gym: { select: { name: true, timezone: true, emailMemberReceipts: true } },
      member: { select: { fullName: true, memberNumber: true, billsToken: true, contacts: receiptContactSelect } },
    },
  });
  if (!payment) return { status: "not_found" };
  if (automatic && !payment.gym.emailMemberReceipts) return { status: "disabled" };
  if (payment.status !== "SUCCEEDED") return { status: "not_paid" };

  const to = receiptEmailAddress(payment.member.contacts);
  if (!to) return { status: "no_email" };

  const bill = buildBill(payment);
  const pdf = await renderBillPdf(bill);
  await sendEmail({
    to,
    ...memberReceiptEmail(bill, memberBillsUrl(payment.member.billsToken, request)),
    attachments: [{ filename: billFileName(bill), content: pdf }],
  });
  return { status: "sent", to };
}
