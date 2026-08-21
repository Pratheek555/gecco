"use client";

import { FormEvent, useState } from "react";
import styles from "./signup.module.css";

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gymName: string;
  timezone: string;
};

const initialValues: FormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  gymName: "",
  timezone: "Asia/Kolkata",
};

export default function SignupForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function continueToGym() {
    if (!values.fullName.trim() || !values.email.trim()) {
      setError("Enter your name and email address to continue.");
      return;
    }
    if (values.password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setError("");
    setStep(2);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.gymName.trim()) {
      setError("Give your gym a name to finish setup.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          gymName: values.gymName,
          timezone: values.timezone,
        }),
      });
      const result = await response.json() as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "We could not create your workspace. Please try again.");
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setError("We could not reach Gecco. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.formWrap}>
      <div className={styles.formHeader}>
        <p className={styles.stepLabel}>Step {step} of 2</p>
        <h2>{step === 1 ? "Create your account" : "Set up your gym"}</h2>
        <p>{step === 1 ? "Use a work email so your team can find you later." : "A few details, then your workspace is ready."}</p>
      </div>

      <div className={styles.progress} aria-label={`Onboarding step ${step} of 2`}><i style={{ width: `${step * 50}%` }} /></div>

      {step === 1 ? (
        <div className={styles.fields}>
          <label>
            <span>Full name</span>
            <input autoComplete="name" value={values.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="e.g. Priya Khanna" />
          </label>
          <label>
            <span>Work email</span>
            <input type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} placeholder="you@gym.com" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" autoComplete="new-password" value={values.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 8 characters" />
          </label>
          <label>
            <span>Confirm password</span>
            <input type="password" autoComplete="new-password" value={values.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Re-enter your password" onKeyDown={(event) => { if (event.key === "Enter") continueToGym(); }} />
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.primaryButton} type="button" onClick={continueToGym}>Continue <span>→</span></button>
        </div>
      ) : (
        <form className={styles.fields} onSubmit={submit}>
          <label>
            <span>Gym name</span>
            <input autoFocus value={values.gymName} onChange={(event) => update("gymName", event.target.value)} placeholder="e.g. Pulse Fitness" />
          </label>
          <label>
            <span>Timezone</span>
            <select value={values.timezone} onChange={(event) => update("timezone", event.target.value)}>
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
              <option value="Asia/Singapore">Singapore Standard Time (SGT)</option>
              <option value="Europe/London">Greenwich Mean Time (GMT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
            </select>
          </label>
          <div className={styles.readyCard}><span>✦</span><p><strong>What happens next?</strong>Your workspace will include owner access and Cash + UPI payment modes.</p></div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            <button className={styles.backButton} type="button" onClick={() => { setError(""); setStep(1); }}>Back</button>
            <button className={styles.primaryButton} disabled={isSubmitting} type="submit">{isSubmitting ? "Creating workspace…" : "Create workspace"} {!isSubmitting && <span>→</span>}</button>
          </div>
        </form>
      )}
      <p className={styles.loginLink}>Already have a workspace? <a href="/login">Log in</a></p>
    </div>
  );
}
