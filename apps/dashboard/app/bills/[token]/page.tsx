import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, ReceiptText } from "lucide-react";
import { prisma } from "db/client";
import { GeccoMark } from "@/components/gecco-mark";
import { billNumber, billStatusLabels, formatBillDate } from "@/app/lib/bills";
import { isBillsToken } from "@/app/lib/bills-server";
import styles from "./bills.module.css";

export const metadata: Metadata = {
  title: "Your bills",
  description: "View and download your payment receipts.",
  robots: { index: false, follow: false },
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

/** A member's private list of bills, reached from the link in their receipt emails. */
export default async function MemberBillsPage({ params }: PageProps<"/bills/[token]">) {
  const { token } = await params;
  if (!isBillsToken(token)) notFound();

  const member = await prisma.member.findUnique({
    where: { billsToken: token },
    select: {
      id: true,
      gymId: true,
      fullName: true,
      memberNumber: true,
      gym: { select: { name: true } },
      payments: {
        orderBy: [{ paidOn: "desc" }, { createdAt: "desc" }],
        take: 500,
        select: {
          id: true,
          amount: true,
          paidOn: true,
          status: true,
          paymentMode: { select: { name: true } },
          membership: { select: { plan: { select: { name: true } } } },
        },
      },
    },
  });
  if (!member) notFound();

  const balance = await prisma.memberBalanceSummary.findFirst({
    where: { gymId: member.gymId, memberId: member.id },
    select: { totalOutstanding: true },
  });
  const outstanding = Number(balance?.totalOutstanding ?? 0);
  const paid = member.payments.filter((payment) => payment.status === "SUCCEEDED");
  const totalPaid = paid.reduce((total, payment) => total + Number(payment.amount), 0);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.gym}>{member.gym.name}</p>
          <h1>Your bills</h1>
          <p className={styles.who}>
            {member.fullName} · Member #{member.memberNumber}
          </p>
        </header>

        <section className={styles.summary} aria-label="Summary">
          <div>
            <span>Total paid</span>
            <strong>{money.format(totalPaid)}</strong>
            <small>
              across {paid.length} {paid.length === 1 ? "payment" : "payments"}
            </small>
          </div>
          <div>
            <span>Balance due</span>
            <strong className={outstanding > 0 ? styles.due : styles.clear}>{money.format(outstanding)}</strong>
            <small>{outstanding > 0 ? "Pay at the front desk" : "You're all paid up"}</small>
          </div>
        </section>

        <section className={styles.list} aria-label="Bills">
          {member.payments.length === 0 ? (
            <div className={styles.empty}>
              <ReceiptText size={24} />
              <strong>No bills yet</strong>
              <span>Bills appear here as soon as {member.gym.name} records a payment.</span>
            </div>
          ) : (
            <ul>
              {member.payments.map((payment) => {
                const number = billNumber(payment.id);
                const valid = payment.status === "SUCCEEDED";
                return (
                  <li key={payment.id} className={valid ? undefined : styles.muted}>
                    <div className={styles.date}>
                      <strong>{formatBillDate(payment.paidOn)}</strong>
                      <small>Bill #{number}</small>
                    </div>
                    <div className={styles.item}>
                      <strong>{payment.membership?.plan.name ?? "Payment"}</strong>
                      <small>Paid via {payment.paymentMode.name}</small>
                    </div>
                    <div className={styles.amount}>
                      <strong>{money.format(Number(payment.amount))}</strong>
                      <span className={`${styles.status} ${valid ? styles.paid : styles.void}`}>{billStatusLabels[payment.status]}</span>
                    </div>
                    <a
                      className={styles.download}
                      href={`/api/bills/${token}/${payment.id}`}
                      download
                      aria-label={`Download bill #${number} as PDF`}
                    >
                      <Download size={15} />
                      <span>PDF</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className={styles.footer}>
          <p>This page is private to you. Anyone with the link can view these bills, so share it with care.</p>
          <p className={styles.powered}>
            <GeccoMark size={12} /> Powered by Gecco
          </p>
        </footer>
      </div>
    </main>
  );
}
