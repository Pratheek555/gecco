import { NextResponse } from "next/server";
import { pdfResponse, renderBillPdf } from "@/app/lib/bill-pdf";
import { billFileName } from "@/app/lib/bills";
import { isBillsToken, isUuid, loadBill } from "@/app/lib/bills-server";

export const runtime = "nodejs";

/** Public bill download for members, authorised by the private token in their bills link. */
export async function GET(request: Request, context: RouteContext<"/api/bills/[token]/[paymentid]">) {
  const { token, paymentid: paymentId } = await context.params;
  if (!isBillsToken(token) || !isUuid(paymentId)) return NextResponse.json({ error: "Bill not found." }, { status: 404 });

  const bill = await loadBill({ id: paymentId, member: { billsToken: token } });
  if (!bill) return NextResponse.json({ error: "Bill not found." }, { status: 404 });

  const inline = new URL(request.url).searchParams.get("inline") === "1";
  return pdfResponse(await renderBillPdf(bill), billFileName(bill), inline ? "inline" : "attachment");
}
