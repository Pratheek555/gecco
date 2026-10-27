import { NextResponse } from "next/server";
import { memberRelationWhere, requirePermission } from "@/app/api/auth/authorization";
import { emailMemberReceipt } from "@/app/api/payment/notify-member";
import { pdfResponse, renderBillPdf } from "@/app/lib/bill-pdf";
import { billFileName } from "@/app/lib/bills";
import { isUuid, loadBill } from "@/app/lib/bills-server";
import { prisma } from "db/client";

export const runtime = "nodejs";

/** Downloads the bill PDF for a payment. `?inline=1` opens it in the browser instead. */
export async function GET(request: Request, context: RouteContext<"/api/payment/[paymentid]/bill">) {
  const auth = await requirePermission("payments:read");
  if (!auth.ok) return auth.response;
  const { paymentid: paymentId } = await context.params;
  if (!isUuid(paymentId)) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  const bill = await loadBill({ id: paymentId, gymId: auth.session.activeGym.id, ...memberRelationWhere(auth.session) });
  if (!bill) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  const inline = new URL(request.url).searchParams.get("inline") === "1";
  return pdfResponse(await renderBillPdf(bill), billFileName(bill), inline ? "inline" : "attachment");
}

/** Emails the bill to the member on request, regardless of the automatic-receipt setting. */
export async function POST(request: Request, context: RouteContext<"/api/payment/[paymentid]/bill">) {
  const auth = await requirePermission("payments:record");
  if (!auth.ok) return auth.response;
  const { paymentid: paymentId } = await context.params;
  if (!isUuid(paymentId)) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, gymId: auth.session.activeGym.id, ...memberRelationWhere(auth.session) },
    select: { id: true },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  try {
    const result = await emailMemberReceipt(payment.id, request, { automatic: false });
    switch (result.status) {
      case "sent":
        return NextResponse.json({ sentTo: result.to });
      case "no_email":
        return NextResponse.json({ error: "This member has no email address. Add one to their profile first." }, { status: 409 });
      case "not_paid":
        return NextResponse.json({ error: "Voided or refunded payments can't be emailed as bills." }, { status: 409 });
      default:
        return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to email bill", error);
    return NextResponse.json({ error: "The email could not be sent. Try again in a moment." }, { status: 502 });
  }
}
