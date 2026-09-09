type RevenuePayment = {
  amount: unknown;
  paidOn: Date;
};

export type RevenueAssignment<TPayment extends RevenuePayment = RevenuePayment> = {
  startsOn: Date;
  endsOn: Date | null;
  membership: {
    trainerRevenueEligibleSnapshot: boolean;
    startsOn: Date;
    agreedFee: unknown;
    durationMonths: number;
    payments: TPayment[];
  };
};

export function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function trailingMonthKeys(now = new Date()) {
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const keys: string[] = [];

  for (let index = 0; index < 12; index += 1) {
    keys.push(monthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return keys;
}

export function paymentBelongsToAssignment(
  paidOn: Date,
  assignment: Pick<RevenueAssignment, "startsOn" | "endsOn">,
) {
  return (
    paidOn >= assignment.startsOn && (assignment.endsOn === null || paidOn <= assignment.endsOn)
  );
}

export function attributedPayments<TPayment extends RevenuePayment>(
  assignment: RevenueAssignment<TPayment>,
) {
  if (!assignment.membership.trainerRevenueEligibleSnapshot) return [];

  return assignment.membership.payments.filter((payment) =>
    paymentBelongsToAssignment(payment.paidOn, assignment),
  );
}

function addMonthsClamped(date: Date, months: number) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

export function attributedMonthlyRevenue(assignment: RevenueAssignment) {
  const { membership } = assignment;
  if (!membership.trainerRevenueEligibleSnapshot || membership.durationMonths < 1) return [];

  const total = Number(membership.agreedFee);
  if (!Number.isFinite(total)) return [];

  const monthlyAmount = Number((total / membership.durationMonths).toFixed(2));

  return Array.from({ length: membership.durationMonths }, (_, index) => {
    const attributedOn = addMonthsClamped(membership.startsOn, index);
    const amount =
      index === membership.durationMonths - 1
        ? Number((total - monthlyAmount * (membership.durationMonths - 1)).toFixed(2))
        : monthlyAmount;

    return { attributedOn, amount };
  }).filter(({ attributedOn }) => paymentBelongsToAssignment(attributedOn, assignment));
}

export function revenueByMonth(assignments: RevenueAssignment[], months: string[]) {
  const totals = new Map(months.map((month) => [month, 0]));

  for (const assignment of assignments) {
    for (const allocation of attributedMonthlyRevenue(assignment)) {
      const month = monthKey(allocation.attributedOn);
      if (totals.has(month)) {
        totals.set(month, (totals.get(month) ?? 0) + allocation.amount);
      }
    }
  }

  return months.map((month) => ({
    month,
    amount: Number((totals.get(month) ?? 0).toFixed(2)),
  }));
}

export function totalAttributedRevenue(assignments: RevenueAssignment[]) {
  return assignments.reduce(
    (total, assignment) =>
      total +
      attributedMonthlyRevenue(assignment).reduce(
        (assignmentTotal, allocation) => assignmentTotal + allocation.amount,
        0,
      ),
    0,
  );
}

export type IncentiveRule = {
  id: string;
  percentage: unknown;
  startsOn: Date;
  endsOn: Date | null;
};

export function monthlyIncentives(
  monthlyRevenue: { month: string; amount: number }[],
  rules: IncentiveRule[],
) {
  return monthlyRevenue.map(({ month, amount: revenue }) => {
    const monthStart = new Date(`${month}-01T00:00:00.000Z`);
    const rule = rules
      .filter(
        (candidate) =>
          candidate.startsOn <= monthStart &&
          (candidate.endsOn === null || candidate.endsOn >= monthStart),
      )
      .sort((left, right) => right.startsOn.getTime() - left.startsOn.getTime())[0];
    const percentage = rule ? Number(rule.percentage) : null;

    return {
      month,
      revenue,
      percentage,
      amount: percentage === null ? 0 : Number(((revenue * percentage) / 100).toFixed(2)),
    };
  });
}
