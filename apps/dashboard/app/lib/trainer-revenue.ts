type RevenuePayment = {
  amount: unknown;
  paidOn: Date;
};

export type RevenueAssignment<TPayment extends RevenuePayment = RevenuePayment> = {
  startsOn: Date;
  endsOn: Date | null;
  membership: {
    trainerRevenueEligibleSnapshot: boolean;
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

export function revenueByMonth(assignments: RevenueAssignment[], months: string[]) {
  const totals = new Map(months.map((month) => [month, 0]));

  for (const assignment of assignments) {
    for (const payment of attributedPayments(assignment)) {
      const month = monthKey(payment.paidOn);
      if (totals.has(month)) {
        totals.set(month, (totals.get(month) ?? 0) + Number(payment.amount));
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
      attributedPayments(assignment).reduce(
        (assignmentTotal, payment) => assignmentTotal + Number(payment.amount),
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
