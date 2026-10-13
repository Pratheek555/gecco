"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../session-provider";
import styles from "../../signup/signup.module.css";

type InvitePreview = {
  status: "pending" | "accepted" | "revoked" | "expired";
  gymName: string;
  role: "OWNER" | "STAFF" | "TRAINER";
  inviteeName: string | null;
  invitedBy: string;
  expiresAt: string;
  signedInAs: { fullName: string; email: string; alreadyMember: boolean } | null;
};

type Mode = "new" | "existing";

const unavailableCopy: Record<Exclude<InvitePreview["status"], "pending">, string> = {
  accepted: "This invite has already been used. If it was you, just log in.",
  revoked: "This invite was cancelled by the gym owner. Ask them for a new link.",
  expired: "This invite has expired. Ask the gym owner to send you a fresh link.",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState<Mode>("new");
  const [useOtherAccount, setUseOtherAccount] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/invites/${encodeURIComponent(token)}`);
        const data = (await response.json()) as InvitePreview & { error?: string };
        if (cancelled) return;
        if (!response.ok) {
          setLoadError(data.error ?? "This invite link is not valid.");
          return;
        }
        setInvite(data);
        if (data.inviteeName) setFullName(data.inviteeName);
      } catch {
        if (!cancelled) setLoadError("We could not reach Gecco. Check your connection and try again.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function accept(body: Record<string, string>) {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/invites/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { redirectTo?: string; error?: string };
      if (!response.ok || !data.redirectTo) {
        setError(data.error ?? "We could not accept the invite. Please try again.");
        if (response.status === 409 && body.mode === "new") setMode("existing");
        return;
      }
      await refreshSession();
      router.push(data.redirectTo);
    } catch {
      setError("We could not reach Gecco. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode === "existing") {
      void accept({ mode, email, password });
      return;
    }
    if (fullName.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    void accept({ mode, fullName, email, password });
  }

  if (loadError || (invite && invite.status !== "pending")) {
    return (
      <div className={styles.formWrap}>
        <div className={styles.formHeader}>
          <p className={styles.stepLabel}>Invite unavailable</p>
          <h2>{invite ? `Join ${invite.gymName}` : "Invite not found"}</h2>
          <p>{invite && invite.status !== "pending" ? unavailableCopy[invite.status] : loadError}</p>
        </div>
        <a className={styles.primaryButton} href="/login">Go to log in <span>→</span></a>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className={styles.formWrap}>
        <div className={styles.formHeader}>
          <p className={styles.stepLabel}>Loading invite…</p>
        </div>
      </div>
    );
  }

  const roleLabel = invite.role === "TRAINER" ? "a trainer" : "a team member";
  const header = (
    <div className={styles.formHeader}>
      <p className={styles.stepLabel}>Invite from {invite.invitedBy}</p>
      <h2>Join {invite.gymName}</h2>
      <p>
        You&apos;ve been invited as {roleLabel}. The gym owner decides which sections you can see.
      </p>
    </div>
  );

  if (invite.signedInAs?.alreadyMember) {
    return (
      <div className={styles.formWrap}>
        {header}
        <div className={styles.readyCard}><span>✦</span><p><strong>You&apos;re already in</strong>{invite.signedInAs.email} is already part of {invite.gymName}.</p></div>
        <button className={styles.primaryButton} type="button" onClick={() => router.push("/")}>Open my workspace <span>→</span></button>
      </div>
    );
  }

  if (invite.signedInAs && !useOtherAccount) {
    return (
      <div className={styles.formWrap}>
        {header}
        <div className={styles.fields}>
          <div className={styles.readyCard}><span>✦</span><p><strong>Signed in as {invite.signedInAs.fullName}</strong>{invite.signedInAs.email}</p></div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.primaryButton} type="button" disabled={isSubmitting} onClick={() => void accept({ mode: "session" })}>
            {isSubmitting ? "Joining…" : `Join ${invite.gymName}`} {!isSubmitting && <span>→</span>}
          </button>
          <button className={styles.backButton} type="button" onClick={() => { setError(""); setUseOtherAccount(true); }}>Use a different account</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formWrap}>
      {header}
      <div className={styles.actions} role="tablist" aria-label="Account type">
        <button type="button" role="tab" aria-selected={mode === "new"} className={mode === "new" ? styles.secondaryButton : styles.backButton} style={{ flex: 1 }} onClick={() => { setError(""); setMode("new"); }}>I&apos;m new to Gecco</button>
        <button type="button" role="tab" aria-selected={mode === "existing"} className={mode === "existing" ? styles.secondaryButton : styles.backButton} style={{ flex: 1 }} onClick={() => { setError(""); setMode("existing"); }}>I have an account</button>
      </div>
      <form className={styles.fields} style={{ marginTop: 21 }} onSubmit={submit}>
        {mode === "new" && (
          <label>
            <span>Full name</span>
            <input autoComplete="name" value={fullName} maxLength={100} onChange={(event) => setFullName(event.target.value)} placeholder="e.g. Rahul Mehta" />
          </label>
        )}
        <label>
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        </label>
        <label>
          <span>Password</span>
          <input type="password" autoComplete={mode === "new" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "new" ? "At least 8 characters" : "Your Gecco password"} />
        </label>
        {mode === "new" && (
          <label>
            <span>Confirm password</span>
            <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" />
          </label>
        )}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining…" : mode === "new" ? "Create account & join" : "Sign in & join"} {!isSubmitting && <span>→</span>}
        </button>
      </form>
    </div>
  );
}
