"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../session-provider";
import styles from "./signup.module.css";

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gymName: string;
  timezone: string;
};

type Step = 1 | 2 | 3;

type CreatedInvite = { id: string; label: string; role: "STAFF" | "TRAINER"; url: string };

type Seats = { seatLimit: number; seatsUsed: number };

const initialValues: FormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  gymName: "",
  timezone: "Asia/Kolkata",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const stepCopy: Record<Step, { title: string; copy: string }> = {
  1: { title: "Create your account", copy: "Use a work email so your team can find you later." },
  2: { title: "Set up your gym", copy: "A few details, then your workspace is ready." },
  3: {
    title: "Invite your team",
    copy: "Create a private link for each trainer or staff member. You can skip this and invite people later.",
  },
};

function InviteTeamStep({ onFinish }: { onFinish: () => void }) {
  const [seats, setSeats] = useState<Seats | null>(null);
  const [inviteeName, setInviteeName] = useState("");
  const [role, setRole] = useState<"TRAINER" | "STAFF">("TRAINER");
  const [invites, setInvites] = useState<CreatedInvite[]>([]);
  const [copiedId, setCopiedId] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/team")
      .then((response) => (response.ok ? (response.json() as Promise<{ seats: Seats }>) : null))
      .then((data) => {
        if (!cancelled && data) setSeats(data.seats);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const seatsLeft = seats ? Math.max(seats.seatLimit - seats.seatsUsed, 0) : null;

  async function createInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCreating(true);
    try {
      const response = await fetch("/api/team/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeName, role }),
      });
      const data = (await response.json()) as { invite?: { id: string }; url?: string; error?: string };
      if (!response.ok || !data.invite || !data.url) {
        setError(data.error ?? "Could not create the invite link.");
        return;
      }
      setInvites((current) => [
        { id: data.invite!.id, label: inviteeName.trim() || (role === "TRAINER" ? "Trainer" : "Staff member"), role, url: data.url! },
        ...current,
      ]);
      setSeats((current) => current && { ...current, seatsUsed: current.seatsUsed + 1 });
      setInviteeName("");
    } catch {
      setError("We could not reach Gecco. Check your connection and try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function copy(invite: CreatedInvite) {
    try {
      await navigator.clipboard.writeText(invite.url);
      setCopiedId(invite.id);
      window.setTimeout(() => setCopiedId((current) => (current === invite.id ? "" : current)), 1800);
    } catch {
      setError("Copy failed. Select the link and copy it manually.");
    }
  }

  return (
    <div className={styles.fields}>
      {seats && (
        <p className={styles.seatNote}>
          <strong>{seatsLeft}</strong> of {seats.seatLimit} team seats left
        </p>
      )}
      <form className={styles.inviteForm} onSubmit={createInvite}>
        <label>
          <span>Name (optional)</span>
          <input
            value={inviteeName}
            maxLength={100}
            onChange={(event) => setInviteeName(event.target.value)}
            placeholder="e.g. Rahul"
          />
        </label>
        <label>
          <span>Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value as "TRAINER" | "STAFF")}>
            <option value="TRAINER">Trainer</option>
            <option value="STAFF">Front desk / staff</option>
          </select>
        </label>
        <button className={styles.secondaryButton} type="submit" disabled={isCreating || seatsLeft === 0}>
          {isCreating ? "Creating…" : seatsLeft === 0 ? "No seats left" : "Create invite link"}
        </button>
      </form>
      <div className={styles.readyCard}>
        <span>✦</span>
        <p>
          <strong>Who sees what?</strong>
          Trainers start with only their own assigned members. Staff can run the front desk but cannot
          change plans, incentives, or your team. You can fine-tune access per person anytime from Team.
        </p>
      </div>
      {invites.length > 0 && (
        <ul className={styles.inviteList}>
          {invites.map((invite) => (
            <li key={invite.id}>
              <div>
                <strong>{invite.label}</strong>
                <small>{invite.role === "TRAINER" ? "Trainer" : "Staff"} · link expires in 7 days</small>
              </div>
              <input readOnly value={invite.url} onFocus={(event) => event.currentTarget.select()} aria-label={`Invite link for ${invite.label}`} />
              <button type="button" className={styles.backButton} onClick={() => void copy(invite)}>
                {copiedId === invite.id ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.primaryButton} type="button" onClick={onFinish}>
        {invites.length ? "Go to my dashboard" : "Skip for now"} <span>→</span>
      </button>
    </div>
  );
}

type SignupFormProps = {
  /** Token from the single-use signup link. */
  token: string;
  defaultGymName: string;
  /** When the link was issued for a specific owner, only this email can sign up. */
  lockedEmail: string | null;
};

export default function SignupForm({ token, defaultGymName, lockedEmail }: SignupFormProps) {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<FormValues>(() => ({
    ...initialValues,
    email: lockedEmail ?? "",
    gymName: defaultGymName,
  }));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function continueToGym() {
    if (values.fullName.trim().length < 2) {
      setError("Enter your full name to continue.");
      return;
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      setError("Enter a valid email address.");
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
    if (values.gymName.trim().length < 2) {
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
          token,
        }),
      });
      const result = await response.json() as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "We could not create your workspace. Please try again.");
        if (response.status === 409 || response.status === 403) setStep(1);
        return;
      }

      // The workspace exists and the owner is signed in; the password is no longer needed here.
      setValues((current) => ({ ...current, password: "", confirmPassword: "" }));
      setStep(3);
    } catch {
      setError("We could not reach Gecco. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function finish() {
    await refreshSession();
    router.push("/dashboard");
  }

  return (
    <div className={styles.formWrap}>
      <div className={styles.formHeader}>
        <p className={styles.stepLabel}>Step {step} of 3</p>
        <h2>{stepCopy[step].title}</h2>
        <p>{stepCopy[step].copy}</p>
      </div>

      <div className={styles.progress} aria-label={`Onboarding step ${step} of 3`}><i style={{ width: `${(step / 3) * 100}%` }} /></div>

      {step === 1 ? (
        <div className={styles.fields}>
          <label>
            <span>Full name</span>
            <input autoComplete="name" value={values.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="e.g. Priya Khanna" />
          </label>
          <label>
            <span>Work email</span>
            <input type="email" autoComplete="email" value={values.email} readOnly={Boolean(lockedEmail)} onChange={(event) => update("email", event.target.value)} placeholder="you@gym.com" />
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
      ) : step === 2 ? (
        <form className={styles.fields} onSubmit={submit}>
          <label>
            <span>Gym name</span>
            <input autoFocus value={values.gymName} maxLength={100} onChange={(event) => update("gymName", event.target.value)} placeholder="e.g. Pulse Fitness" />
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
          <div className={styles.readyCard}><span>✦</span><p><strong>What happens next?</strong>Your workspace will include owner access and Cash + UPI payment modes. Then you can invite your team.</p></div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            <button className={styles.backButton} type="button" disabled={isSubmitting} onClick={() => { setError(""); setStep(1); }}>Back</button>
            <button className={styles.primaryButton} disabled={isSubmitting} type="submit">{isSubmitting ? "Creating workspace…" : "Create workspace"} {!isSubmitting && <span>→</span>}</button>
          </div>
        </form>
      ) : (
        <InviteTeamStep onFinish={() => void finish()} />
      )}
      {step !== 3 && <p className={styles.loginLink}>Already have a workspace? <a href="/login">Log in</a></p>}
    </div>
  );
}
