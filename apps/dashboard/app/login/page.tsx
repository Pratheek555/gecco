"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { useSession } from "../session-provider";
import { AuthShell } from "./auth-shell";

type LoginResponse = {
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as LoginResponse;

      if (!response.ok) {
        setError(result.error ?? "We could not sign you in. Please try again.");
        return;
      }

      await refreshSession();
      router.push("/dashboard");
    } catch {
      setError("We could not reach Gecco. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <header>
        <span className={styles.kicker}>Welcome back</span>
        <h2>Sign in to your workspace</h2>
        <p>Use the email address connected to your gym.</p>
      </header>

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
          />
        </div>

        <div className={styles.labelRow}>
          <label htmlFor="password">Password</label>
          <Link className={styles.forgot} href="/forgot-password">Forgot password?</Link>
        </div>
        <div className={styles.inputWrap}>
          <LockKeyhole size={17} aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
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

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "Signing in…" : "Sign in"}</span>
          {!isSubmitting && <ArrowRight size={17} />}
        </button>
      </form>

      <p className={styles.signup}>New to Gecco? <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support%40gecco.in" target="_blank" rel="noreferrer">Talk to our team</a></p>
    </AuthShell>
  );
}
