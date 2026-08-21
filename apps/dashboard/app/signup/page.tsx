import SignupForm from "./signup-form";
import styles from "./signup.module.css";

export const metadata = {
  title: "Create your gym workspace | Gecco",
  description: "Set up your Gecco gym management workspace.",
};

export default function SignupPage() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <a className={styles.brand} href="/">
          <span className={styles.brandMark}>↗</span>
          Gecco
        </a>
        <div className={styles.introContent}>
          <span className={styles.eyebrow}>Gym management, made simple</span>
          <h1>Build a better routine for your business.</h1>
          <p>Bring your members, payments, and team into one calm, connected workspace.</p>
          <ul className={styles.benefits}>
            <li><span>✓</span> Your first gym workspace is ready in minutes</li>
            <li><span>✓</span> Start with Cash and UPI payment modes</li>
            <li><span>✓</span> Invite your staff when you are ready</li>
          </ul>
        </div>
        <p className={styles.note}>Built for fitness teams that want clarity, not clutter.</p>
      </section>
      <section className={styles.panel}>
        <SignupForm />
      </section>
    </main>
  );
}
