"use client";

import { Clock3, Link2, LoaderCircle, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { rolePresets, type MemberScope, type Permission } from "../api/auth/permissions";
import { PageHeader, SummaryCard, SummaryGrid } from "../_components/managed-page-ui";
import { useDashboardToast } from "../manage-shell";
import { useSession } from "../session-provider";
import { AccessEditor, accessSummary } from "./access-editor";
import styles from "./team.module.css";

type InviteRole = "STAFF" | "TRAINER";

type TeamMember = {
  userId: string;
  fullName: string;
  email: string;
  role: "OWNER" | InviteRole;
  permissions: Permission[];
  memberScope: MemberScope;
  isActive: boolean;
  joinedAt: string;
  trainer: { id: string; fullName: string } | null;
};

type PendingInvite = {
  id: string;
  inviteeName: string | null;
  role: InviteRole;
  permissions: Permission[];
  memberScope: MemberScope;
  expiresAt: string;
  createdAt: string;
  trainer: { id: string; fullName: string } | null;
  invitedBy: string;
};

type TeamData = {
  seats: { seatLimit: number; activeMembers: number; pendingInvites: number; seatsUsed: number };
  members: TeamMember[];
  invites: PendingInvite[];
  linkableTrainers: { id: string; fullName: string }[];
};

type Access = { role: InviteRole; permissions: Permission[]; memberScope: MemberScope };

const roleLabels: Record<TeamMember["role"], string> = { OWNER: "Owner", STAFF: "Staff", TRAINER: "Trainer" };

function presetAccess(role: InviteRole): Access {
  return { role, permissions: [...rolePresets[role].permissions], memberScope: rolePresets[role].memberScope };
}

async function readJson<T>(response: Response) {
  const body = await response.text();
  try {
    return (body ? JSON.parse(body) : {}) as T & { error?: string };
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }
}

async function fetchTeam(): Promise<{ data: TeamData } | { error: string }> {
  try {
    const response = await fetch("/api/team");
    const body = await readJson<TeamData>(response);
    if (!response.ok || !body.seats) return { error: body.error ?? "Could not load your team." };
    return { data: body };
  } catch (reason) {
    return { error: reason instanceof Error ? reason.message : "Could not load your team." };
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function RoleFields({
  access,
  onChange,
  disabled,
}: {
  access: Access;
  onChange: (next: Access) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <label>
        Role
        <select
          value={access.role}
          disabled={disabled}
          onChange={(event) => onChange(presetAccess(event.target.value as InviteRole))}
        >
          <option value="TRAINER">Trainer</option>
          <option value="STAFF">Staff</option>
        </select>
        <span>Changing the role resets access to that role&apos;s defaults.</span>
      </label>
      <AccessEditor
        permissions={access.permissions}
        memberScope={access.memberScope}
        disabled={disabled}
        onChange={(next) => onChange({ ...access, ...next })}
      />
    </>
  );
}

function LinkResult({ url, title, close }: { url: string; title: string; close: () => void }) {
  const notify = useDashboardToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      notify("Invite link copied");
    } catch {
      notify("Copy failed. Select the link and copy it manually.");
    }
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="invite-link-title" onMouseDown={(event) => event.currentTarget === event.target && close()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 id="invite-link-title">{title}</h2>
            <p>Send this private link on WhatsApp or email. It works once and expires in 7 days.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <label>
          Invite link
          <input readOnly value={url} autoFocus onFocus={(event) => event.currentTarget.select()} />
        </label>
        <p className={styles.hint}>For security this link is only shown now. You can always issue a new one from the pending invites list.</p>
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

function InviteModal({
  linkableTrainers,
  close,
  onCreated,
}: {
  linkableTrainers: TeamData["linkableTrainers"];
  close: () => void;
  onCreated: (invite: PendingInvite, url: string) => void;
}) {
  const [inviteeName, setInviteeName] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [access, setAccess] = useState<Access>(() => presetAccess("TRAINER"));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/team/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...access,
          inviteeName,
          trainerId: access.role === "TRAINER" && trainerId ? trainerId : null,
        }),
      });
      const data = await readJson<{ invite?: PendingInvite; url?: string }>(response);
      if (!response.ok || !data.invite || !data.url) throw new Error(data.error ?? "Could not create the invite.");
      onCreated(data.invite, data.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the invite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="invite-title" onMouseDown={(event) => event.currentTarget === event.target && !submitting && close()}>
      <form className={`modal ${styles.wideModal}`} onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="invite-title">Invite someone</h2>
            <p>Choose their role and exactly what they can see. You can change this later.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close" disabled={submitting}>
            <X size={18} />
          </button>
        </div>
        <label>
          Name <span>(optional, helps you track the invite)</span>
          <input value={inviteeName} maxLength={100} onChange={(event) => setInviteeName(event.target.value)} placeholder="e.g. Rahul Mehta" disabled={submitting} />
        </label>
        <RoleFields access={access} onChange={setAccess} disabled={submitting} />
        {access.role === "TRAINER" && linkableTrainers.length > 0 && (
          <label>
            Trainer profile <span>(connects their existing clients and revenue)</span>
            <select value={trainerId} onChange={(event) => setTrainerId(event.target.value)} disabled={submitting}>
              <option value="">Create a new trainer profile</option>
              {linkableTrainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>{trainer.fullName}</option>
              ))}
            </select>
          </label>
        )}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>Cancel</button>
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create invite link"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditAccessModal({
  member,
  close,
  onSaved,
}: {
  member: TeamMember;
  close: () => void;
  onSaved: (member: TeamMember) => void;
}) {
  const [access, setAccess] = useState<Access>({
    role: member.role === "OWNER" ? "STAFF" : member.role,
    permissions: member.permissions,
    memberScope: member.memberScope,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/team/members/${member.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(access),
      });
      const data = await readJson<TeamMember>(response);
      if (!response.ok || !data.userId) throw new Error(data.error ?? "Could not update access.");
      onSaved(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update access.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="edit-access-title" onMouseDown={(event) => event.currentTarget === event.target && !submitting && close()}>
      <form className={`modal ${styles.wideModal}`} onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="edit-access-title">{member.fullName}&apos;s access</h2>
            <p>Changes apply the next time they load a page.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close" disabled={submitting}>
            <X size={18} />
          </button>
        </div>
        <RoleFields access={access} onChange={setAccess} disabled={submitting} />
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>Cancel</button>
          <button type="submit" className="button primary" disabled={submitting}>{submitting ? "Saving…" : "Save access"}</button>
        </div>
      </form>
    </div>
  );
}

export default function Team() {
  const notify = useDashboardToast();
  const { session } = useSession();
  const [data, setData] = useState<TeamData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [link, setLink] = useState<{ url: string; title: string } | null>(null);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    const result = await fetchTeam();
    if ("error" in result) setLoadError(result.error);
    else {
      setData(result.data);
      setLoadError("");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchTeam().then((result) => {
      if (cancelled) return;
      if ("error" in result) setLoadError(result.error);
      else setData(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const seatsFull = data ? data.seats.seatsUsed >= data.seats.seatLimit : false;

  async function mutate(id: string, request: () => Promise<Response>, success: string) {
    setBusyId(id);
    try {
      const response = await request();
      const body = await readJson<{ url?: string; invite?: PendingInvite }>(response);
      if (!response.ok) throw new Error(body.error ?? "Something went wrong.");
      notify(success);
      await load();
      return body;
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Something went wrong.");
      return null;
    } finally {
      setBusyId("");
    }
  }

  async function regenerate(invite: PendingInvite) {
    const body = await mutate(invite.id, () => fetch(`/api/team/invites/${invite.id}`, { method: "POST" }), "New invite link created");
    if (body?.url) setLink({ url: body.url, title: `New link for ${invite.inviteeName ?? roleLabels[invite.role]}` });
  }

  function revoke(invite: PendingInvite) {
    if (!window.confirm("Revoke this invite? The link will stop working and the seat is freed.")) return;
    void mutate(invite.id, () => fetch(`/api/team/invites/${invite.id}`, { method: "DELETE" }), "Invite revoked");
  }

  function setActive(member: TeamMember, isActive: boolean) {
    void mutate(
      member.userId,
      () =>
        fetch(`/api/team/members/${member.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }),
      isActive ? `${member.fullName} reactivated` : `${member.fullName} deactivated`,
    );
  }

  function remove(member: TeamMember) {
    if (!window.confirm(`Remove ${member.fullName} from this gym? Their trainer history is kept, but they lose access immediately.`)) return;
    void mutate(member.userId, () => fetch(`/api/team/members/${member.userId}`, { method: "DELETE" }), `${member.fullName} removed`);
  }

  return (
    <>
      <PageHeader
        eyebrow="MANAGE TEAM"
        title="Team"
        copy="Invite trainers and staff, and decide exactly what each person can see."
        action="Invite someone"
        icon={UserPlus}
        onAction={() =>
          seatsFull
            ? notify(`All ${data?.seats.seatLimit} seats are in use. Revoke an invite or remove someone first.`)
            : setIsInviteOpen(true)
        }
      />
      <SummaryGrid>
        <SummaryCard
          icon={Users}
          tone="purple"
          label="Seats used"
          value={data ? `${data.seats.seatsUsed} / ${data.seats.seatLimit}` : "—"}
          detail={seatsFull ? "No seats left. Contact Gecco to add more." : "Active people plus pending invites"}
          loading={!data && !loadError}
        />
        <SummaryCard icon={ShieldCheck} tone="green" label="Active people" value={String(data?.seats.activeMembers ?? "—")} detail="Not counting you, the owner" loading={!data && !loadError} />
        <SummaryCard icon={Clock3} tone="amber" label="Pending invites" value={String(data?.seats.pendingInvites ?? "—")} detail="Links expire after 7 days" loading={!data && !loadError} />
      </SummaryGrid>

      {loadError && <div className="panel managed-empty"><Users size={23} /><strong>{loadError}</strong></div>}
      {!data && !loadError && (
        <div className={`panel ${styles.loading}`}><LoaderCircle size={20} className="plan-spinner" /> Loading team…</div>
      )}

      {data && (
        <>
          <section className={`panel ${styles.card}`}>
            <header>
              <h2>People</h2>
              <p>Everyone with access to this gym.</p>
            </header>
            <ul className={styles.list}>
              {data.members.map((member) => {
                const isSelf = member.userId === session?.user.id;
                const editable = member.role !== "OWNER" && !isSelf;
                return (
                  <li key={member.userId} className={member.isActive ? undefined : styles.inactive}>
                    <div className={styles.person}>
                      <strong>{member.fullName}{isSelf && " (you)"}</strong>
                      <small>{member.email}</small>
                    </div>
                    <div className={styles.meta}>
                      <span className={styles.role}>{roleLabels[member.role]}</span>
                      {!member.isActive && <span className="managed-status paused">Deactivated</span>}
                    </div>
                    <p className={styles.summary}>
                      {member.role === "OWNER" ? "Full access" : accessSummary(member.permissions, member.memberScope)}
                      {member.trainer && <small>Trainer profile: {member.trainer.fullName}</small>}
                    </p>
                    <div className={styles.actions}>
                      {editable && (
                        <>
                          <button className="button secondary" disabled={busyId === member.userId} onClick={() => setEditing(member)}>Edit access</button>
                          <button className="button secondary" disabled={busyId === member.userId} onClick={() => setActive(member, !member.isActive)}>
                            {member.isActive ? "Deactivate" : "Reactivate"}
                          </button>
                          <button className={`button secondary ${styles.danger}`} disabled={busyId === member.userId} onClick={() => remove(member)}>Remove</button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={`panel ${styles.card}`}>
            <header>
              <h2>Pending invites</h2>
              <p>Each pending invite holds a seat until it is accepted, revoked, or expires.</p>
            </header>
            {data.invites.length === 0 ? (
              <p className={styles.empty}>No pending invites.</p>
            ) : (
              <ul className={styles.list}>
                {data.invites.map((invite) => (
                  <li key={invite.id}>
                    <div className={styles.person}>
                      <strong>{invite.inviteeName ?? `Unnamed ${roleLabels[invite.role].toLowerCase()}`}</strong>
                      <small>Invited by {invite.invitedBy} · expires {formatDate(invite.expiresAt)}</small>
                    </div>
                    <div className={styles.meta}>
                      <span className={styles.role}>{roleLabels[invite.role]}</span>
                    </div>
                    <p className={styles.summary}>
                      {accessSummary(invite.permissions, invite.memberScope)}
                      {invite.trainer && <small>Links to trainer: {invite.trainer.fullName}</small>}
                    </p>
                    <div className={styles.actions}>
                      <button className="button secondary" disabled={busyId === invite.id} onClick={() => void regenerate(invite)}>New link</button>
                      <button className={`button secondary ${styles.danger}`} disabled={busyId === invite.id} onClick={() => revoke(invite)}>Revoke</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {isInviteOpen && data && (
        <InviteModal
          linkableTrainers={data.linkableTrainers}
          close={() => setIsInviteOpen(false)}
          onCreated={(invite, url) => {
            setIsInviteOpen(false);
            setLink({ url, title: `Invite ${invite.inviteeName ?? "link"} ready` });
            void load();
          }}
        />
      )}
      {editing && (
        <EditAccessModal
          member={editing}
          close={() => setEditing(null)}
          onSaved={(member) => {
            setEditing(null);
            notify(`Access updated for ${member.fullName}`);
            void load();
          }}
        />
      )}
      {link && <LinkResult url={link.url} title={link.title} close={() => setLink(null)} />}
    </>
  );
}
