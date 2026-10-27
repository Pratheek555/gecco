import { prisma } from "db/client";
import { buildBill } from "./bills";

type PaymentWhere = NonNullable<NonNullable<Parameters<typeof prisma.payment.findFirst>[0]>["where"]>;

export const billSelect = {
  id: true,
  amount: true,
  paidOn: true,
  createdAt: true,
  status: true,
  reference: true,
  voidReason: true,
  gym: { select: { name: true, timezone: true } },
  member: { select: { fullName: true, memberNumber: true } },
  membership: { select: { startsOn: true, endsOn: true, plan: { select: { name: true } } } },
  paymentMode: { select: { name: true } },
  recipient: { select: { displayName: true } },
  allocations: {
    orderBy: { createdAt: "asc" },
    select: {
      amount: true,
      charge: {
        select: {
          kind: true,
          description: true,
          amount: true,
          dueOn: true,
          allocations: { select: { amount: true, payment: { select: { id: true, status: true, createdAt: true } } } },
        },
      },
    },
  },
} as const;

/** Loads one payment as a bill, or null when nothing matches the (already scoped) filter. */
export async function loadBill(where: PaymentWhere) {
  const payment = await prisma.payment.findFirst({ where, select: billSelect });
  return payment && buildBill(payment);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

/** Rejects malformed ids before they reach Postgres, which would otherwise error on the uuid cast. */
export const isUuid = (value: string) => UUID_PATTERN.test(value);
export const isBillsToken = (value: string) => TOKEN_PATTERN.test(value);

/** The member's private page listing every bill, shared in receipt emails and from the dashboard. */
export function memberBillsUrl(token: string, request: Request) {
  return new URL(`/bills/${token}`, process.env.APP_URL || request.url).toString();
}
