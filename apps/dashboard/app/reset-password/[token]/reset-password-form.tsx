"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../login/login.module.css";

type Status = "checking" | "ready" | "invalid" | "done";

type ResetResponse = {
  email?: string;
  error?: string;
};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endpoint = `/api/password-reset/${encodeURIComponent(token)}`;

  useEffect(() => {
    let cancelled = false;

    fetch(endpoint)
      .then(async (response) => {
        const result = await response.json() as ResetResponse;
        if (cancelled) return;
        if (response.ok) {
          setAccountEmail(result.email ?? "");
          setStatus("ready");
        } else {
          setError(result.error ?? "");
          setStatus("invalid");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as ResetResponse;

      if (response.status === 404) {
        setError(result.error ?? "");
        setStatus("invalid");
        return;
      }
      if (!response.ok) {
        setError(result.error ?? "We could not update your password. Please try again.");
        return;
      }

      setStatus("done");
    } catch {
      setError("We could not reach Gecco. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "checking") {
    return (
      <header>
        <span className={styles.kicker}>Account recovery</span>
        <h2>Checking your link…</h2>
      </header>
    );
  }

  if (status === "invalid") {
    return (
      <>
        <header>
          <span className={styles.kicker}>Account recovery</span>
          <h2>This link has expired</h2>
          <p>{error || "This reset link is invalid or has expired. Request a new one."}</p>
        </header>
        <Link className={styles.submit} href="/forgot-password">
          <span>Request a new link</span>
          <ArrowRight size={17} />
        </Link>
        <p className={styles.signup}><Link href="/login">Back to sign in</Link></p>
      </>
    );
  }

  if (status === "done") {
    return (
      <>
        <header>
          <span className={styles.kicker}>All set</span>
          <h2>Password updated</h2>
          <p>Your new password is ready. For your security, you have been signed out on every device.</p>
        </header>
        <Link className={styles.submit} href="/login">
          <span>Sign in</span>
          <ArrowRight size={17} />
        </Link>
      </>
    );
  }

  return (
    <>
      <header>
        <span className={styles.kicker}>Account recovery</span>
        <h2>Choose a new password</h2>
        <p>{accountEmail ? <>Setting a new password for <strong>{accountEmail}</strong>.</> : "Set a new password for your account."}</p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="password">New password</label>
        <div className={styles.inputWrap}>
          <LockKeyhole size={17} aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            autoFocus
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <div className={styles.labelRow}>
          <label htmlFor="confirm-password">Confirm new password</label>
        </div>
        <div className={styles.inputWrap}>
          <LockKeyhole size={17} aria-hidden="true" />
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your new password"
            required
          />
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "Saving…" : "Update password"}</span>
          {!isSubmitting && <ArrowRight size={17} />}
        </button>
      </form>
    </>
  );
}
