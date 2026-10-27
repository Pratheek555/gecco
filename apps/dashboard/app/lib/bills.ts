type Amount = { toString(): string } | number | string;

type ChargeKind = "MEMBERSHIP_FEE" | "RENEWAL" | "ADD_ON" | "ADJUSTMENT";
type PaymentStatus = "SUCCEEDED" | "VOIDED" | "REFUNDED";

/** The payment shape `billSelect` loads; kept structural so the builder stays testable without Prisma. */
export type BillSource = {
  id: string;
  amount: Amount;
  paidOn: Date;
  createdAt: Date;
  status: PaymentStatus;
  reference: string | null;
  voidReason: string | null;
  gym: { name: string; timezone: string };
  member: { fullName: string; memberNumber: string };
  membership: { startsOn: Date; endsOn: Date; plan: { name: string } } | null;
  paymentMode: { name: string };
  recipient: { displayName: string };
  allocations: {
    amount: Amount;
    charge: {
      kind: ChargeKind;
      description: string | null;
      amount: Amount;
      dueOn: Date;
      allocations: { amount: Amount; payment: { id: string; status: PaymentStatus; createdAt: Date } }[];
    };
  }[];
};

export type BillLine = {
  description: string;
  dueOn: Date;
  charged: number;
  paidEarlier: number;
  paidNow: number;
  /** What was still owed on this charge right after this payment. */
  balanceAfter: number;
};

export type Bill = {
  paymentId: string;
  number: string;
  status: PaymentStatus;
  amount: number;
  paidOn: Date;
  recordedAt: Date;
  timezone: string;
  gymName: string;
  memberName: string;
  memberNumber: string;
  planName: string | null;
  period: { startsOn: Date; endsOn: Date } | null;
  paymentMode: string;
  receivedBy: string;
  reference: string | null;
  voidReason: string | null;
  lines: BillLine[];
  /** Part of the payment not applied to any charge, held as credit. */
  unapplied: number;
  balanceAfter: number;
};

const chargeLabels: Record<ChargeKind, string> = {
  MEMBERSHIP_FEE: "Membership fee",
  RENEWAL: "Renewal fee",
  ADD_ON: "Add-on",
  ADJUSTMENT: "Adjustment",
};

const cents = (value: Amount) => Math.round(Number(value.toString()) * 100);

/** Short, human-friendly bill number derived from the payment id. Matches the owner receipt email. */
export function billNumber(paymentId: string) {
  return paymentId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function billFileName(bill: Pick<Bill, "number" | "paidOn">) {
  return `bill-${bill.paidOn.toISOString().slice(0, 10)}-${bill.number}.pdf`;
}

/**
 * Turns a payment into the member's side of the bill. Earlier payments are those recorded
 * before this one, so a bill downloaded months later still shows the balance as it stood then.
 */
export function buildBill(payment: BillSource): Bill {
  const counted = payment.status === "SUCCEEDED";

  const lines = payment.allocations.map(({ amount, charge }) => {
    const paidEarlier = charge.allocations
      .filter(({ payment: other }) => other.id !== payment.id && other.status === "SUCCEEDED" && other.createdAt < payment.createdAt)
      .reduce((total, allocation) => total + cents(allocation.amount), 0);
    const paidNow = cents(amount);
    const charged = cents(charge.amount);
    const balanceAfter = Math.max(charged - paidEarlier - (counted ? paidNow : 0), 0);

    return {
      description: charge.description?.trim() || chargeLabels[charge.kind],
      dueOn: charge.dueOn,
      charged: charged / 100,
      paidEarlier: paidEarlier / 100,
      paidNow: paidNow / 100,
      balanceAfter: balanceAfter / 100,
    };
  });

  const amount = cents(payment.amount);
  const applied = lines.reduce((total, line) => total + Math.round(line.paidNow * 100), 0);

  return {
    paymentId: payment.id,
    number: billNumber(payment.id),
    status: payment.status,
    amount: amount / 100,
    paidOn: payment.paidOn,
    recordedAt: payment.createdAt,
    timezone: payment.gym.timezone,
    gymName: payment.gym.name,
    memberName: payment.member.fullName,
    memberNumber: payment.member.memberNumber,
    planName: payment.membership?.plan.name ?? null,
    period: payment.membership && { startsOn: payment.membership.startsOn, endsOn: payment.membership.endsOn },
    paymentMode: payment.paymentMode.name,
    receivedBy: payment.recipient.displayName,
    reference: payment.reference,
    voidReason: payment.voidReason,
    lines,
    unapplied: Math.max(amount - applied, 0) / 100,
    balanceAfter: lines.reduce((total, line) => total + Math.round(line.balanceAfter * 100), 0) / 100,
  };
}

/** Calendar dates (`paidOn`, `dueOn`, membership dates) are stored at UTC midnight. */
export function formatBillDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export const billStatusLabels: Record<PaymentStatus, string> = {
  SUCCEEDED: "Paid",
  VOIDED: "Void",
  REFUNDED: "Refunded",
};
