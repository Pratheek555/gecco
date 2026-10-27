"use client";

import { ChevronRight, LoaderCircle, Mail, ReceiptText } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { timezoneOptions } from "../lib/timezones";
import { useDashboardToast } from "../manage-shell";
import { useSession } from "../session-provider";
import styles from "./settings.module.css";

type GymDetails = {
  id: string;
  name: string;
  timezone: string;
  emailOwnersOnPayment: boolean;
  emailMemberReceipts: boolean;
};

type EmailSetting = "emailOwnersOnPayment" | "emailMemberReceipts";

const emailSettings: { key: EmailSetting; icon: typeof Mail; title: string; description: string; on: string; off: string }[] = [
  {
    key: "emailOwnersOnPayment",
    icon: Mail,
    title: "Email owners about each payment",
    description: "Every owner gets a receipt with today's and this month's collections.",
    on: "Owners will be emailed for each payment",
    off: "Owners will no longer be emailed for payments",
  },
  {
    key: "emailMemberReceipts",
    icon: ReceiptText,
    title: "Email members their receipt",
    description: "Members with an email on file get their bill as a PDF and a link to download past bills. Members without an email are skipped.",
    on: "Members will be emailed their receipts",
    off: "Members will no longer be emailed receipts",
  },
];

function PaymentEmailSettings({ gym, onSaved }: { gym: GymDetails; onSaved: (gym: GymDetails) => void }) {
  const notify = useDashboardToast();
  const [values, setValues] = useState({ emailOwnersOnPayment: gym.emailOwnersOnPayment, emailMemberReceipts: gym.emailMemberReceipts });
  const [pending, setPending] = useState<EmailSetting | null>(null);
  const [error, setError] = useState("");

  async function toggle(key: EmailSetting, label: { on: string; off: string }) {
    const next = !values[key];
    setValues((current) => ({ ...current, [key]: next }));
    setPending(key);
    setError("");
    try {
      const response = await fetch("/api/gym", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
      const body = (await response.json()) as { gym?: GymDetails; error?: string };
      if (!response.ok || !body.gym) throw new Error(body.error ?? "Could not update this setting.");
      onSaved(body.gym);
      notify(next ? label.on : label.off);
    } catch (toggleError) {
      setValues((current) => ({ ...current, [key]: !next }));
      setError(toggleError instanceof Error ? toggleError.message : "Could not update this setting.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className={`panel ${styles.card}`} aria-labelledby="payment-emails-title">
      <header>
        <h2 id="payment-emails-title">Payment emails</h2>
        <p>Sent automatically each time a payment is recorded. Changes save instantly.</p>
      </header>
      <ul className={styles.toggles}>
        {emailSettings.map(({ key, icon: Icon, title, description, on, off }) => (
          <li key={key}>
            <span className={styles.toggleIcon}><Icon size={16} /></span>
            <div>
              <strong id={`${key}-label`}>{title}</strong>
              <p id={`${key}-description`}>{description}</p>
            </div>
            <button
              type="button"
              className={`toggle ${values[key] ? "on" : ""}`}
              role="switch"
              aria-checked={values[key]}
              aria-labelledby={`${key}-label`}
              aria-describedby={`${key}-description`}
              disabled={pending !== null}
              onClick={() => void toggle(key, { on, off })}
            >
              <i />
            </button>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className={`${styles.error} ${styles.cardError}`}>{error}</p>}
      <footer className={styles.note}>
        You can still download any bill from Payments, or email it to a member on demand.
      </footer>
    </section>
  );
}

function currentTime(timezone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZone: timezone, hour: "numeric", minute: "2-digit", weekday: "short" }).format(new Date());
  } catch {
    return "";
  }
}

const pickEmailSettings = ({ emailOwnersOnPayment, emailMemberReceipts }: GymDetails) => ({ emailOwnersOnPayment, emailMemberReceipts });

export default function GymSettings() {
  const notify = useDashboardToast();
  const { session, setActiveGym } = useSession();
  const [saved, setSaved] = useState<GymDetails | null>(null);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/gym");
        const body = (await response.json()) as { gym?: GymDetails; error?: string };
        if (cancelled) return;
        if (!response.ok || !body.gym) {
          setLoadError(body.error ?? "Could not load gym settings.");
          return;
        }
        setSaved(body.gym);
        setName(body.gym.name);
        setTimezone(body.gym.timezone);
      } catch {
        if (!cancelled) setLoadError("Could not load gym settings.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const zones = useMemo(() => (timezone ? timezoneOptions(timezone) : []), [timezone]);
  const dirty = Boolean(saved && (name.trim() !== saved.name || timezone !== saved.timezone));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!saved || !dirty) return;
    if (name.trim().length < 2) {
      setError("Gym name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/gym", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), timezone }),
      });
      const body = (await response.json()) as { gym?: GymDetails; error?: string };
      if (!response.ok || !body.gym) {
        setError(body.error ?? "Could not save gym settings.");
        return;
      }
      setSaved(body.gym);
      setName(body.gym.name);
      setTimezone(body.gym.timezone);
      if (session && session.activeGym.id === body.gym.id) {
        setActiveGym({ ...session.activeGym, name: body.gym.name, timezone: body.gym.timezone });
      }
      notify("Gym settings saved");
    } catch {
      setError("Could not save gym settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-heading managed-heading">
        <div>
          <p className="managed-breadcrumb">
            Manage <ChevronRight size={12} /> Settings
          </p>
          <h1>Settings</h1>
          <p>Your gym&apos;s details, timezone, and the emails sent when payments are recorded.</p>
        </div>
      </div>

      {loadError ? (
        <div className="panel managed-empty"><strong>{loadError}</strong></div>
      ) : !saved ? (
        <div className={`panel ${styles.loading}`}><LoaderCircle size={20} className="plan-spinner" /> Loading settings…</div>
      ) : (
        <div className={styles.stack}>
        <form className={`panel ${styles.card}`} onSubmit={submit}>
          <header>
            <h2>Gym details</h2>
            <p>Changes apply to everyone on your team.</p>
          </header>
          <div className={styles.fields}>
            <label>
              <span>Gym name</span>
              <input value={name} maxLength={100} onChange={(event) => setName(event.target.value)} disabled={saving} required />
            </label>
            <label>
              <span>Timezone</span>
              <select value={timezone} onChange={(event) => setTimezone(event.target.value)} disabled={saving}>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>{zone.replaceAll("_", " ")}</option>
                ))}
              </select>
              <small>Local time there: {currentTime(timezone)}</small>
            </label>
            {saved.timezone !== timezone && (
              <p className={styles.hint}>&ldquo;Today&rdquo;, overdue dues, and renewal counts will be calculated in the new timezone from now on. Existing records are not changed.</p>
            )}
            {error && <p role="alert" className={styles.error}>{error}</p>}
          </div>
          <footer>
            <button
              type="button"
              className="button secondary"
              disabled={!dirty || saving}
              onClick={() => {
                setName(saved.name);
                setTimezone(saved.timezone);
                setError("");
              }}
            >
              Discard
            </button>
            <button type="submit" className="button primary" disabled={!dirty || saving}>{saving ? "Saving…" : "Save changes"}</button>
          </footer>
        </form>
        <PaymentEmailSettings gym={saved} onSaved={(gym) => setSaved((current) => (current ? { ...current, ...pickEmailSettings(gym) } : gym))} />
        </div>
      )}
    </>
  );
}
