import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./signup.module.css";

/** Two-panel layout for creating a new gym workspace. */
export function SignupShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>↗</span>
          Gecco
        </Link>
        <div className={styles.introContent}>
          <span className={styles.eyebrow}>Gym management, made simple</span>
          <h1>Build a better routine for your business.</h1>
          <p>Bring your members, payments, and team into one calm, connected workspace.</p>
          <ul className={styles.benefits}>
            <li><span>✓</span> Your first gym workspace is ready in minutes</li>
            <li><span>✓</span> Start with Cash and UPI payment modes</li>
            <li><span>✓</span> Invite trainers and staff, and choose what each one sees</li>
          </ul>
        </div>
        <p className={styles.note}>Built for fitness teams that want clarity, not clutter.</p>
      </section>
      <section className={styles.panel}>{children}</section>
    </main>
  );
}

const CONTACT_URL = "https://mail.google.com/mail/?view=cm&fs=1&to=support%40gecco.in";

/** Shown when someone reaches signup without a usable invite link. */
export function SignupClosed({ title, copy }: { title: string; copy: string }) {
  return (
    <div className={styles.formWrap}>
      <div className={styles.formHeader}>
        <p className={styles.stepLabel}>Invite only</p>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      <a className={styles.primaryButton} href={CONTACT_URL} target="_blank" rel="noreferrer">
        Talk to our team <span>→</span>
      </a>
      <p className={styles.loginLink}>Already have a workspace? <a href="/login">Log in</a></p>
    </div>
  );
}
