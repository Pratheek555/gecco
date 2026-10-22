import { Activity, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./login.module.css";

/** Two-panel layout shared by sign-in and password recovery screens. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-label="Gecco introduction">
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}><Activity size={19} strokeWidth={2.8} /></span>
          Gecco
        </Link>
        <div className={styles.introCopy}>
          <span className={styles.eyebrow}>Fitness operations, simplified</span>
          <h1>Spend less time managing. More time growing.</h1>
          <p>Bring your members, payments and team into one focused workspace.</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.featureIcon}><ShieldCheck size={19} /></span>
          <p>Built for the people who keep your gym moving.</p>
          <div className={styles.featureLine}><i /><span>One place for every daily detail</span></div>
        </div>
        <span className={styles.cornerOrb} />
      </section>

      <section className={styles.loginArea}>
        <Link className={styles.mobileBrand} href="/">
          <span className={styles.brandMark}><Activity size={18} strokeWidth={2.8} /></span>
          Gecco
        </Link>
        <div className={styles.loginCard}>{children}</div>
        <p className={styles.security}><LockKeyhole size={13} /> Your credentials are securely encrypted.</p>
      </section>
    </main>
  );
}
