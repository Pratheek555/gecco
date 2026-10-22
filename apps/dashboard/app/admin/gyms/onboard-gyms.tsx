"use client";

import { Building2, CheckCircle2, Clock3, Link2, LoaderCircle, Plus, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader, SummaryCard, SummaryGrid } from "../../_components/managed-page-ui";
import { useDashboardToast } from "../../manage-shell";
import styles from "./admin.module.css";

type SignupInvite = {
  id: string;
  gymName: string | null;
  email: string | null;
  seatLimit: number;
  note: string | null;
  status: "PENDING" | "USED" | "REVOKED" | "EXPIRED";
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  createdBy: string;
  gym: { id: string; name: string } | null;
};

const statusLabels: Record<SignupInvite["status"], { label: string; tone: string }> = {
  PENDING: { label: "Pending", tone: "warning" },
  USED: { label: "Used", tone: "active" },
  REVOKED: { label: "Revoked", tone: "paused" },
  EXPIRED: { label: "Expired", tone: "paused" },
};

async function readJson<T>(response: Response) {
  const body = await response.text();
  try {
    return (body ? JSON.parse(body) : {}) as T & { error?: string };
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }
}

async function fetchInvites(): Promise<{ invites: SignupInvite[] } | { error: string }> {
  try {
    const response = await fetch("/api/admin/signup-invites");
    const body = await readJson<{ invites?: SignupInvite[] }>(response);
    if (!response.ok || !body.invites) return { error: body.error ?? "Could not load signup links." };
    return { invites: body.invites };
  } catch (reason) {
    return { error: reason instanceof Error ? reason.message : "Could not load signup links." };
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function LinkResult({ url, title, close }: { url: string; title: string; close: () => void }) {
  const notify = useDashboardToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      notify("Signup link copied");
    } catch {
      notify("Copy failed. Select the link and copy it manually.");
    }
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="signup-link-title" onMouseDown={(event) => event.currentTarget === event.target && close()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 id="signup-link-title">{title}</h2>
            <p>Send this private link to the gym owner. It works once and expires in 14 days.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <label>
          Signup link
          <input readOnly value={url} autoFocus onFocus={(event) => event.currentTarget.select()} />
        </label>
        <p className={styles.hint}>For security this link is only shown now. You can always issue a new one from the list.</p>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close}>Done</button>
          <button type="button" className="button primary" onClick={() => void copy()}>
            <Link2 size={15} /> Copy link
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ close, onCreated }: { close: () => void; onCreated: (invite: SignupInvite, url: string) => void }) {
  const [gymName, setGymName] = useState("");
  const [email, setEmail] = useState("");
  const [seatLimit, setSeatLimit] = useState("5");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/signup-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymName, email, note, seatLimit: Number(seatLimit) }),
      });
      const data = await readJson<{ invite?: SignupInvite; url?: string }>(response);
      if (!response.ok || !data.invite || !data.url) throw new Error(data.error ?? "Could not create the signup link.");
      onCreated(data.invite, data.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the signup link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="create-signup-title" onMouseDown={(event) => event.currentTarget === event.target && !submitting && close()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="create-signup-title">New gym signup link</h2>
            <p>The owner uses this link to create their account and gym workspace.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close" disabled={submitting}>
            <X size={18} />
          </button>
        </div>
        <label>
          Gym name <span>(optional, the owner can change it)</span>
          <input value={gymName} maxLength={100} onChange={(event) => setGymName(event.target.value)} placeholder="e.g. Pulse Fitness" disabled={submitting} />
        </label>
        <label>
          Owner email <span>(optional, locks the link to this email)</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@gym.com" disabled={submitting} />
        </label>
        <label>
          Team seats
          <input type="number" min={0} max={100} step={1} value={seatLimit} onChange={(event) => setSeatLimit(event.target.value)} disabled={submitting} />
          <span>Trainers and staff the owner can invite, not counting themselves.</span>
        </label>
        <label>
          Internal note <span>(optional, only Gecco staff see this)</span>
          <input value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Annual plan, onboarded by Priya" disabled={submitting} />
        </label>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>Cancel</button>
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create signup link"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function OnboardGyms() {
  const notify = useDashboardToast();
  const [invites, setInvites] = useState<SignupInvite[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [link, setLink] = useState<{ url: string; title: string } | null>(null);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    const result = await fetchInvites();
    if ("error" in result) setLoadError(result.error);
    else {
      setInvites(result.invites);
      setLoadError("");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchInvites().then((result) => {
      if (cancelled) return;
      if ("error" in result) setLoadError(result.error);
      else setInvites(result.invites);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function regenerate(invite: SignupInvite) {
    setBusyId(invite.id);
    try {
      const response = await fetch(`/api/admin/signup-invites/${invite.id}`, { method: "POST" });
      const body = await readJson<{ url?: string }>(response);
      if (!response.ok || !body.url) throw new Error(body.error ?? "Could not issue a new link.");
      setLink({ url: body.url, title: `New link for ${invite.gymName ?? invite.email ?? "this gym"}` });
      await load();
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Could not issue a new link.");
    } finally {
      setBusyId("");
    }
  }

  async function revoke(invite: SignupInvite) {
    if (!window.confirm("Revoke this signup link? It will stop working immediately.")) return;
    setBusyId(invite.id);
    try {
      const response = await fetch(`/api/admin/signup-invites/${invite.id}`, { method: "DELETE" });
      const body = await readJson<object>(response);
      if (!response.ok) throw new Error(body.error ?? "Could not revoke the link.");
      notify("Signup link revoked");
      await load();
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Could not revoke the link.");
    } finally {
      setBusyId("");
    }
  }

  const pending = invites?.filter((invite) => invite.status === "PENDING").length;
  const used = invites?.filter((invite) => invite.status === "USED").length;

  return (
    <>
      <PageHeader
        eyebrow="GECCO ADMIN"
        title="Onboard gyms"
        copy="New gyms can only sign up with a private link from the Gecco team. Create one per gym."
        action="New signup link"
        icon={Plus}
        onAction={() => setIsCreateOpen(true)}
      />
      <SummaryGrid>
        <SummaryCard icon={Clock3} tone="amber" label="Pending links" value={String(pending ?? "—")} detail="Waiting for the owner to sign up" loading={!invites && !loadError} />
        <SummaryCard icon={CheckCircle2} tone="green" label="Gyms onboarded" value={String(used ?? "—")} detail="Signed up through a link" loading={!invites && !loadError} />
      </SummaryGrid>

      {loadError && <div className="panel managed-empty"><Building2 size={23} /><strong>{loadError}</strong></div>}
      {!invites && !loadError && (
        <div className={`panel ${styles.loading}`}><LoaderCircle size={20} className="plan-spinner" /> Loading signup links…</div>
      )}

      {invites && (
        <section className={`panel ${styles.card}`}>
          <header>
            <h2>Signup links</h2>
            <p>The most recent 200 links, newest first.</p>
          </header>
          {invites.length === 0 ? (
            <p className={styles.empty}>No signup links yet. Create one to onboard your first gym.</p>
          ) : (
            <ul className={styles.list}>
              {invites.map((invite) => {
                const status = statusLabels[invite.status];
                const isPending = invite.status === "PENDING";
                const isOpen = isPending || invite.status === "EXPIRED";
                return (
                  <li key={invite.id} className={isOpen || invite.status === "USED" ? undefined : styles.closed}>
                    <div className={styles.primary}>
                      <strong>{invite.gym?.name ?? invite.gymName ?? "Unnamed gym"}</strong>
                      <small>{invite.email ?? "Any email"} · {invite.seatLimit} seats</small>
                    </div>
                    <div>
                      <span className={`managed-status ${status.tone}`}>{status.label}</span>
                    </div>
                    <p className={styles.details}>
                      {invite.status === "USED" && invite.usedAt
                        ? `Signed up ${formatDate(invite.usedAt)}`
                        : isPending
                          ? `Expires ${formatDate(invite.expiresAt)}`
                          : `Created ${formatDate(invite.createdAt)}`}
                      <small>By {invite.createdBy}{invite.note && ` · ${invite.note}`}</small>
                    </p>
                    <div className={styles.actions}>
                      {isOpen && (
                        <button className="button secondary" disabled={busyId === invite.id} onClick={() => void regenerate(invite)}>New link</button>
                      )}
                      {isPending && (
                        <button className={`button secondary ${styles.danger}`} disabled={busyId === invite.id} onClick={() => void revoke(invite)}>Revoke</button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {isCreateOpen && (
        <CreateModal
          close={() => setIsCreateOpen(false)}
          onCreated={(invite, url) => {
            setIsCreateOpen(false);
            setLink({ url, title: `Signup link for ${invite.gymName ?? invite.email ?? "new gym"} ready` });
            void load();
          }}
        />
      )}
      {link && <LinkResult url={link.url} title={link.title} close={() => setLink(null)} />}
    </>
  );
}
