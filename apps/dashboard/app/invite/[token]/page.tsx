import Link from "next/link";
import styles from "../../signup/signup.module.css";
import AcceptInvite from "./accept-invite";

export const metadata = {
  title: "Join your gym on Gecco",
  description: "Accept your invite to a Gecco gym workspace.",
};

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>↗</span>
          Gecco
        </Link>
        <div className={styles.introContent}>
          <span className={styles.eyebrow}>You&apos;re invited</span>
          <h1>Your gym team, in one place.</h1>
          <p>Accept the invite to see the members, plans, and schedules your gym has shared with you.</p>
        </div>
        <p className={styles.note}>Built for fitness teams that want clarity, not clutter.</p>
      </section>
      <section className={styles.panel}>
        <AcceptInvite token={token} />
      </section>
    </main>
  );
}
