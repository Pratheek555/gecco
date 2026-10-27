import { prisma } from "db/client";
import { sendEmail } from "@/app/api/auth/mailer";
import { paymentReceivedEmail } from "@/app/api/payment/payment-received-email";

/** The gym's calendar date as YYYY-MM-DD, matching how `paidOn` is stored. */
function gymToday(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function utcDate(year: number, monthIndex: number, day = 1) {
  return new Date(Date.UTC(year, monthIndex, day));
}

async function collected(gymId: string, gte: Date, lt: Date) {
  const result = await prisma.payment.aggregate({
    where: { gymId, status: "SUCCEEDED", paidOn: { gte, lt } },
    _sum: { amount: true },
    _count: true,
  });
  return { total: Number(result._sum.amount ?? 0), count: result._count };
}

/**
 * Emails every active owner of the gym a celebratory receipt for a newly
 * recorded payment, with today's and this month's collection totals.
 * Owners can turn this off in Settings.
 */
export async function notifyOwnersOfPayment(paymentId: string, request: Request) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      amount: true,
      paidOn: true,
      reference: true,
      createdAt: true,
      gymId: true,
      memberId: true,
      gym: { select: { name: true, timezone: true, emailOwnersOnPayment: true } },
      member: { select: { fullName: true, memberNumber: true } },
      membership: { select: { plan: { select: { name: true } } } },
      paymentMode: { select: { name: true } },
      recipient: { select: { displayName: true } },
      recordedBy: { select: { fullName: true } },
    },
  });
  if (!payment || !payment.gym.emailOwnersOnPayment) return;

  const owners = await prisma.gymUser.findMany({
    where: { gymId: payment.gymId, role: "OWNER", isActive: true },
    select: { user: { select: { fullName: true, email: true } } },
  });
  if (owners.length === 0) return;

  const [year, month, day] = gymToday(payment.gym.timezone).split("-").map(Number);
  const todayStart = utcDate(year, month - 1, day);
  const tomorrowStart = utcDate(year, month - 1, day + 1);
  const monthStart = utcDate(year, month - 1);
  const nextMonthStart = utcDate(year, month);
  const lastMonthStart = utcDate(year, month - 2);

  const [today, thisMonth, lastMonth, balance] = await Promise.all([
    collected(payment.gymId, todayStart, tomorrowStart),
    collected(payment.gymId, monthStart, nextMonthStart),
    collected(payment.gymId, lastMonthStart, monthStart),
    prisma.memberBalanceSummary.findFirst({
      where: { gymId: payment.gymId, memberId: payment.memberId },
      select: { totalOutstanding: true },
    }),
  ]);

  const paymentsUrl = new URL("/payments", process.env.APP_URL || request.url).toString();
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", timeZone: "UTC" }).format(monthStart);

  const results = await Promise.allSettled(
    owners.map(({ user }) =>
      sendEmail({
        to: user.email,
        ...paymentReceivedEmail({
          paymentId,
          gymName: payment.gym.name,
          ownerName: user.fullName,
          amount: Number(payment.amount),
          paidOn: payment.paidOn,
          recordedAt: payment.createdAt,
          timezone: payment.gym.timezone,
          memberName: payment.member.fullName,
          memberNumber: payment.member.memberNumber,
          planName: payment.membership?.plan.name ?? null,
          paymentMode: payment.paymentMode.name,
          recipient: payment.recipient.displayName,
          reference: payment.reference,
          recordedBy: payment.recordedBy?.fullName ?? null,
          memberOutstanding: Number(balance?.totalOutstanding ?? 0),
          todayTotal: today.total,
          todayCount: today.count,
          monthTotal: thisMonth.total,
          monthCount: thisMonth.count,
          lastMonthTotal: lastMonth.total,
          monthLabel,
          paymentsUrl,
        }),
      }),
    ),
  );

  for (const result of results) {
    if (result.status === "rejected") console.error("Failed to send payment notification", result.reason);
  }
}
