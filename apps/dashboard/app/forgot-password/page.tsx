"use client";

import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";
import { AuthShell } from "../login/auth-shell";

type ResetRequestResponse = {
  message?: string;
  error?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json() as ResetRequestResponse;

      if (!response.ok) {
        setError(result.error ?? "We could not send the reset link. Please try again.");
        return;
      }

      setSentMessage(result.message ?? "Check your inbox for a reset link.");
    } catch {
      setError("We could not reach Gecco. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <header>
        <span className={styles.kicker}>Account recovery</span>
        <h2>Reset your password</h2>
        <p>Enter the email you sign in with and we&apos;ll send you a link to choose a new password.</p>
      </header>

      {sentMessage ? (
        <div className={styles.notice} role="status">
          <strong>Check your inbox</strong>
          {sentMessage} The link expires in 30 minutes. Don&apos;t forget to check spam.
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email address</label>
          <div className={styles.inputWrap}>
            <Mail size={17} aria-hidden="true" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@yourgym.com"
              required
              autoFocus
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? "Sending link…" : "Send reset link"}</span>
            {!isSubmitting && <ArrowRight size={17} />}
          </button>
        </form>
      )}

      <p className={styles.signup}>
        <Link href="/login"><ArrowLeft size={12} style={{ verticalAlign: "-1px" }} /> Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
