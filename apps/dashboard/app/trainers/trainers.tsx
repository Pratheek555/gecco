"use client";

import {
  AlertCircle,
  ChevronDown,
  Dumbbell,
  LoaderCircle,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Empty, PageHeader, Tab, Toolbar } from "../_components/managed-page-ui";
import { type Notify, useDashboardToast } from "../manage-shell";

async function readJson<T>(response: Response) {
  const body = await response.text();
  if (!body.trim()) throw new Error(`The server returned an empty response (${response.status}).`);

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }
}

type TrainerRecord = {
  id: string;
  fullName: string;
  isActive: boolean;
  clientCount: number;
  assignmentCount: number;
  monthlyRevenue: { month: string; amount: number }[];
};

type TrainerStats = {
  activeCount: number;
  inactiveCount: number;
  totalClients: number;
  availability: { label: string; value: number; tone: string }[];
  revenueMonths: string[];
};

type TrainerProfileMembership = {
  id: string;
  member: { id: string; fullName: string };
  plan: { id: string; name: string; code: string; type: "GT" | "PT" };
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startsOn: string;
  endsOn: string;
  assignmentStartsOn: string;
  assignmentEndsOn: string | null;
  agreedFee: string;
  paidAmount: string;
  monthlyRevenue: number;
};

type TrainerProfileData = {
  trainer: { id: string; fullName: string; isActive: boolean; createdAt: string };
  summary: {
    activeClients: number;
    activeMemberships: number;
    totalMemberships: number;
    totalRevenue: string;
  };
  monthlyRevenue: { month: string; amount: number }[];
  memberships: TrainerProfileMembership[];
};

const trainerMoney = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const trainerTones = ["violet", "pink", "blue", "amber"];

function trainerInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function trainerTone(id: string) {
  let hash = 0;
  for (const character of id) hash += character.charCodeAt(0);
  return trainerTones[hash % trainerTones.length];
}

function AddTrainerModal({
  close,
  onCreated,
  editingTrainer,
  onUpdated,
}: {
  close: () => void;
  onCreated?: (trainer: TrainerRecord) => void;
  editingTrainer?: TrainerRecord;
  onUpdated?: (trainer: TrainerRecord) => void;
}) {
  const [fullName, setFullName] = useState(editingTrainer?.fullName ?? "");
  const [isActive, setIsActive] = useState(editingTrainer?.isActive ?? true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(
        editingTrainer ? `/api/trainers/${editingTrainer.id}` : "/api/trainers",
        {
          method: editingTrainer ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, isActive }),
        },
      );
      const data = (await response.json()) as TrainerRecord & { error?: string };
      if (!response.ok)
        throw new Error(
          data.error ?? `Could not ${editingTrainer ? "update" : "create"} the trainer.`,
        );
      if (!data.id || !data.fullName)
        throw new Error("The created trainer response was incomplete.");
      if (editingTrainer) onUpdated?.({ ...editingTrainer, ...data });
      else onCreated?.(data);
      close();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : `Could not ${editingTrainer ? "update" : "create"} the trainer.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trainer-editor-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="trainer-editor-title">{editingTrainer ? "Edit trainer" : "Add trainer"}</h2>
            <p>
              {editingTrainer
                ? "Update this coach’s profile and availability."
                : "Add a coach to your gym team."}
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={close}
            aria-label="Close"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>
        <label>
          Full name
          <input
            required
            autoFocus
            minLength={2}
            maxLength={100}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="e.g. Ananya Kapoor"
            disabled={submitting}
          />
        </label>
        <label className="plan-active-toggle">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            disabled={submitting}
          />{" "}
          Make this trainer active
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>
            Cancel
          </button>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting
              ? editingTrainer
                ? "Saving…"
                : "Adding…"
              : editingTrainer
                ? "Save changes"
                : "Add trainer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TrainerCharts({
  stats,
  trainers,
  selectedTrainerId,
  onTrainerChange,
}: {
  stats: TrainerStats;
  trainers: TrainerRecord[];
  selectedTrainerId: string;
  onTrainerChange: (id: string) => void;
}) {
  const total = stats.activeCount + stats.inactiveCount;
  const activePercent = total ? (stats.activeCount / total) * 100 : 0;
  const selectedTrainer =
    trainers.find((trainer) => trainer.id === selectedTrainerId) ?? trainers[0];
  const revenue = selectedTrainer?.monthlyRevenue ?? [];
  const maxRevenue = Math.max(1, ...revenue.map((item) => item.amount));
  const points = revenue
    .map(
      (item, index) =>
        `${revenue.length === 1 ? 280 : (index / (revenue.length - 1)) * 520 + 20},${180 - (item.amount / maxRevenue) * 140}`,
    )
    .join(" ");
  const formatMonth = (month: string) =>
    new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(`${month}-01T00:00:00Z`));

  return (
    <section className="trainer-charts">
      <article className="panel trainer-chart-card">
        <div className="managed-card-head">
          <div>
            <h2>Trainer availability</h2>
            <p>Active and inactive coaches</p>
          </div>
          <Dumbbell size={17} />
        </div>
        <div className="trainer-pie-wrap">
          <div
            className="trainer-pie"
            style={{
              background: `conic-gradient(var(--brand) 0 ${activePercent}%, var(--border-strong) ${activePercent}% 100%)`,
            }}
          >
            <div>
              <strong>{stats.activeCount}</strong>
              <span>active</span>
            </div>
          </div>
          <div className="trainer-pie-legend">
            <div>
              <i className="purple" />
              <span>Active trainers</span>
              <strong>{stats.activeCount}</strong>
            </div>
            <div>
              <i className="muted" />
              <span>Inactive trainers</span>
              <strong>{stats.inactiveCount}</strong>
            </div>
            <small>{stats.totalClients} active client assignments</small>
          </div>
        </div>
      </article>
      <article className="panel trainer-chart-card trainer-line-card">
        <div className="managed-card-head">
          <div>
            <h2>Monthly trainer revenue</h2>
            <p>Successful plan payments divided across membership duration</p>
          </div>
          {trainers.length > 0 && (
            <label className="trainer-chart-select">
              <span className="sr-only">Trainer</span>
              <select
                value={selectedTrainer?.id ?? ""}
                onChange={(event) => onTrainerChange(event.target.value)}
              >
                {trainers.map((trainer) => (
                  <option value={trainer.id} key={trainer.id}>
                    {trainer.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
          )}
        </div>
        {selectedTrainer && revenue.length ? (
          <div className="trainer-line-chart">
            <div className="trainer-line-y-labels">
              <span>₹{Math.round(maxRevenue).toLocaleString("en-IN")}</span>
              <span>₹{Math.round(maxRevenue / 2).toLocaleString("en-IN")}</span>
              <span>₹0</span>
            </div>
            <svg
              viewBox="0 0 560 220"
              role="img"
              aria-label={`Monthly revenue for ${selectedTrainer.fullName}`}
              preserveAspectRatio="none"
            >
              <line className="trainer-chart-grid-line" x1="20" y1="40" x2="540" y2="40" />
              <line className="trainer-chart-grid-line" x1="20" y1="110" x2="540" y2="110" />
              <line className="trainer-chart-grid-line" x1="20" y1="180" x2="540" y2="180" />
              <polyline className="trainer-chart-line" points={points} />
              {revenue.map((item, index) => {
                const x = revenue.length === 1 ? 280 : (index / (revenue.length - 1)) * 520 + 20;
                const y = 180 - (item.amount / maxRevenue) * 140;
                return (
                  <circle key={item.month} className="trainer-chart-dot" cx={x} cy={y} r="4" />
                );
              })}
            </svg>
            <div className="trainer-line-x-labels">
              {revenue.map((item) => (
                <span key={item.month}>{formatMonth(item.month)}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="trainer-chart-empty">
            Record a payment for a trainer-assigned plan to see monthly revenue.
          </div>
        )}
      </article>
    </section>
  );
}

function TrainerProfileModal({ trainerId, close }: { trainerId: string; close: () => void }) {
  const [data, setData] = useState<TrainerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Past">("All");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/trainers/${trainerId}`);
        const result = await readJson<TrainerProfileData & { error?: string }>(response);
        if (!response.ok) throw new Error(result.error ?? "Could not load trainer profile.");
        if (!cancelled) setData(result);
      } catch (reason) {
        if (!cancelled)
          setError(reason instanceof Error ? reason.message : "Could not load trainer profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  const visibleMemberships = useMemo(
    () =>
      data?.memberships.filter((membership) => {
        const membershipFilter = membership.status === "ACTIVE" ? "Active" : "Past";
        return (
          (filter === "All" || membershipFilter === filter) &&
          `${membership.member.fullName} ${membership.plan.name} ${membership.plan.code}`
            .toLowerCase()
            .includes(query.trim().toLowerCase())
        );
      }) ?? [],
    [data, filter, query],
  );

  const revenue = data?.monthlyRevenue ?? [];
  const maxRevenue = Math.max(1, ...revenue.map((item) => item.amount));
  const points = revenue
    .map(
      (item, index) =>
        `${revenue.length === 1 ? 320 : (index / (revenue.length - 1)) * 600 + 20},${170 - (item.amount / maxRevenue) * 125}`,
    )
    .join(" ");
  const formatMonth = (month: string) =>
    new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(`${month}-01T00:00:00Z`));
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(`${date}T00:00:00Z`),
    );

  return (
    <div
      className="modal-layer trainer-profile-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trainer-profile-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <section className="trainer-profile-modal">
        <div className="trainer-profile-header">
          <div className="trainer-profile-identity">
            <span className={`avatar trainer-avatar ${trainerTone(trainerId)}`}>
              {data ? (
                trainerInitials(data.trainer.fullName)
              ) : (
                <LoaderCircle size={17} className="plan-spinner" />
              )}
            </span>
            <div>
              <small>Trainer profile</small>
              <h2 id="trainer-profile-title">{data?.trainer.fullName ?? "Loading trainer…"}</h2>
              {data && (
                <span className={`managed-status ${data.trainer.isActive ? "active" : "warning"}`}>
                  {data.trainer.isActive ? "Active trainer" : "Inactive trainer"}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={close}
            aria-label="Close trainer profile"
          >
            <X size={19} />
          </button>
        </div>
        {loading && (
          <div className="trainer-profile-loading">
            <LoaderCircle size={20} className="plan-spinner" />
            Loading trainer profile…
          </div>
        )}
        {error && (
          <div className="trainer-profile-error" role="alert">
            <AlertCircle size={17} />
            {error}
          </div>
        )}
        {data && (
          <>
            <div className="trainer-profile-stats">
              <div>
                <small>Active clients</small>
                <strong>{data.summary.activeClients}</strong>
                <span>Unique current PT clients</span>
              </div>
              <div>
                <small>Active memberships</small>
                <strong>{data.summary.activeMemberships}</strong>
                <span>{data.summary.totalMemberships} total assignments</span>
              </div>
              <div>
                <small>Total collected</small>
                <strong>{trainerMoney.format(Number(data.summary.totalRevenue))}</strong>
                <span>Successful payments</span>
              </div>
              <div>
                <small>Current month</small>
                <strong>{trainerMoney.format(Number(revenue.at(-1)?.amount ?? 0))}</strong>
                <span>Allocated trainer revenue</span>
              </div>
            </div>
            <section className="trainer-profile-section trainer-profile-revenue">
              <div className="trainer-profile-section-head">
                <div>
                  <h3>Revenue by month</h3>
                  <p>Payment totals divided by each membership’s duration.</p>
                </div>
                <span>{trainerMoney.format(Number(data.summary.totalRevenue))} collected</span>
              </div>
              <div className="trainer-profile-chart">
                <div className="trainer-profile-y-labels">
                  <span>₹{Math.round(maxRevenue).toLocaleString("en-IN")}</span>
                  <span>₹{Math.round(maxRevenue / 2).toLocaleString("en-IN")}</span>
                  <span>₹0</span>
                </div>
                <svg
                  viewBox="0 0 640 205"
                  role="img"
                  aria-label={`Revenue by month for ${data.trainer.fullName}`}
                  preserveAspectRatio="none"
                >
                  <line className="trainer-chart-grid-line" x1="20" y1="45" x2="620" y2="45" />
                  <line className="trainer-chart-grid-line" x1="20" y1="107" x2="620" y2="107" />
                  <line className="trainer-chart-grid-line" x1="20" y1="170" x2="620" y2="170" />
                  <polyline className="trainer-chart-line" points={points} />
                  {revenue.map((item, index) => {
                    const x =
                      revenue.length === 1 ? 320 : (index / (revenue.length - 1)) * 600 + 20;
                    const y = 170 - (item.amount / maxRevenue) * 125;
                    return (
                      <circle key={item.month} className="trainer-chart-dot" cx={x} cy={y} r="4" />
                    );
                  })}
                </svg>
                <div className="trainer-line-x-labels">
                  {revenue.map((item) => (
                    <span key={item.month}>{formatMonth(item.month)}</span>
                  ))}
                </div>
              </div>
            </section>
            <section className="trainer-profile-section trainer-profile-members">
              <div className="trainer-profile-section-head">
                <div>
                  <h3>Assigned members</h3>
                  <p>PT memberships connected to this trainer.</p>
                </div>
                <span>{data.summary.totalMemberships} assignments</span>
              </div>
              <div className="trainer-profile-toolbar">
                <div className="trainer-profile-tabs">
                  {(["All", "Active", "Past"] as const).map((item) => (
                    <button
                      key={item}
                      className={filter === item ? "active" : ""}
                      onClick={() => setFilter(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <label>
                  <Search size={14} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search members or plans"
                  />
                </label>
              </div>
              <div className="trainer-profile-table-wrap">
                <table className="trainer-profile-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Plan</th>
                      <th>Membership</th>
                      <th>Monthly revenue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMemberships.length ? (
                      visibleMemberships.map((membership) => (
                        <tr key={membership.id}>
                          <td>
                            <div className="member-cell">
                              <span className={`avatar ${trainerTone(membership.member.id)}`}>
                                {trainerInitials(membership.member.fullName)}
                              </span>
                              <strong>{membership.member.fullName}</strong>
                            </div>
                          </td>
                          <td>
                            <strong>{membership.plan.name}</strong>
                            <small>{membership.plan.code}</small>
                          </td>
                          <td>
                            <span>
                              {formatDate(membership.startsOn)} – {formatDate(membership.endsOn)}
                            </span>
                            <small>{trainerMoney.format(Number(membership.paidAmount))} paid</small>
                          </td>
                          <td>
                            <strong>{trainerMoney.format(membership.monthlyRevenue)}</strong>
                            <small>per membership month</small>
                          </td>
                          <td>
                            <span
                              className={`managed-status ${membership.status === "ACTIVE" ? "active" : "paused"}`}
                            >
                              {membership.status === "ACTIVE" ? "Active" : "Past"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          <div className="trainer-profile-empty">
                            <Users size={20} />
                            <strong>No assigned members found</strong>
                            <span>Try adjusting your search or filter.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  );
}

function Trainers({ notify }: { notify: Notify }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Available" | "Busy">("All");
  const [items, setItems] = useState<TrainerRecord[]>([]);
  const [stats, setStats] = useState<TrainerStats>({
    activeCount: 0,
    inactiveCount: 0,
    totalClients: 0,
    availability: [],
    revenueMonths: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerRecord | null>(null);
  const [profileTrainerId, setProfileTrainerId] = useState<string | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/trainers");
        const data = (await response.json()) as {
          trainers?: TrainerRecord[];
          stats?: TrainerStats;
          error?: string;
        };
        if (!response.ok || !data.trainers || !data.stats)
          throw new Error(data.error ?? "Could not load trainers.");
        setItems(data.trainers);
        setStats(data.stats);
        setSelectedTrainerId(data.trainers[0]?.id ?? "");
      } catch (reason) {
        setLoadError(reason instanceof Error ? reason.message : "Could not load trainers.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visible = useMemo(
    () =>
      items.filter((trainer) => {
        const state = trainer.isActive ? "Available" : "Busy";
        return (
          (filter === "All" || state === filter) &&
          trainer.fullName.toLowerCase().includes(query.toLowerCase())
        );
      }),
    [filter, items, query],
  );

  function addTrainer(trainer: TrainerRecord) {
    setItems((current) =>
      [...current, trainer].sort((left, right) => left.fullName.localeCompare(right.fullName)),
    );
    setStats((current) => ({
      ...current,
      activeCount: current.activeCount + (trainer.isActive ? 1 : 0),
      inactiveCount: current.inactiveCount + (trainer.isActive ? 0 : 1),
      availability: [],
    }));
    setSelectedTrainerId((current) => current || trainer.id);
    notify("Trainer added successfully");
  }

  function updateTrainer(trainer: TrainerRecord) {
    setItems((current) => current.map((item) => (item.id === trainer.id ? trainer : item)));
    setStats((current) => ({
      ...current,
      activeCount:
        items.filter((item) => item.id !== trainer.id && item.isActive).length +
        (trainer.isActive ? 1 : 0),
      inactiveCount:
        items.filter((item) => item.id !== trainer.id && !item.isActive).length +
        (trainer.isActive ? 0 : 1),
    }));
    notify("Trainer updated successfully");
  }

  async function deactivateTrainer(trainer: TrainerRecord) {
    if (
      !window.confirm(
        `Deactivate ${trainer.fullName}? Assignment and revenue history will be retained.`,
      )
    )
      return;
    const response = await fetch(`/api/trainers/${trainer.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      notify(data.error ?? "Could not deactivate trainer.");
      return;
    }
    updateTrainer({ ...trainer, isActive: false });
  }

  return (
    <>
      <PageHeader
        eyebrow="TEAM & SCHEDULING"
        title="Trainers"
        copy="Balance coaching load, schedules, and client outcomes in one place."
        action="Add trainer"
        icon={UserPlus}
        onAction={() => setIsAddOpen(true)}
      />
      <TrainerCharts
        stats={stats}
        trainers={items}
        selectedTrainerId={selectedTrainerId}
        onTrainerChange={setSelectedTrainerId}
      />
      <Toolbar query={query} setQuery={setQuery} placeholder="Search trainers">
        <Tab active={filter === "All"} onClick={() => setFilter("All")}>
          All
        </Tab>
        <Tab active={filter === "Available"} onClick={() => setFilter("Available")}>
          Available
        </Tab>
        <Tab active={filter === "Busy"} onClick={() => setFilter("Busy")}>
          Busy
        </Tab>
      </Toolbar>
      <section className="trainer-layout">
        <div className="trainer-grid">
          {loading ? (
            <div className="trainer-loading">
              <LoaderCircle size={22} className="plan-spinner" />
              Loading trainers…
            </div>
          ) : loadError ? (
            <Empty icon={Users} label={loadError} />
          ) : (
            visible.map((trainer) => (
              <article className="panel trainer-card" key={trainer.id}>
                <div className="trainer-head">
                  <span className={`avatar trainer-avatar ${trainerTone(trainer.id)}`}>
                    {trainerInitials(trainer.fullName)}
                  </span>
                  <div>
                    <h2>{trainer.fullName}</h2>
                    <p>Gym coaching team</p>
                  </div>
                  <span className={`managed-status ${trainer.isActive ? "active" : "warning"}`}>
                    {trainer.isActive ? "Available" : "Busy"}
                  </span>
                </div>
                <div className="trainer-data">
                  <div>
                    <strong>{trainer.clientCount}</strong>
                    <small>Clients</small>
                  </div>
                  <div>
                    <strong>{trainer.assignmentCount}</strong>
                    <small>Assignments</small>
                  </div>
                  <div>
                    <strong>{trainer.isActive ? "Active" : "Off"}</strong>
                    <small>Status</small>
                  </div>
                </div>
                <div className="capacity">
                  <div>
                    <span>Client load</span>
                    <strong>{trainer.clientCount}</strong>
                  </div>
                  <span>
                    <i
                      style={{
                        width: `${Math.min(100, (trainer.clientCount / Math.max(1, maxTrainerClients(items))) * 100)}%`,
                      }}
                    />
                  </span>
                </div>
                <div className="trainer-foot">
                  <span>
                    <Dumbbell size={14} />
                    {trainer.isActive ? "Currently active" : "Currently inactive"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="button secondary" onClick={() => setEditingTrainer(trainer)}>
                      Edit
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => setProfileTrainerId(trainer.id)}
                    >
                      View profile
                    </button>
                    {trainer.isActive && (
                      <button
                        className="button secondary"
                        onClick={() => void deactivateTrainer(trainer)}
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
          {!loading && !loadError && visible.length === 0 && (
            <Empty icon={Users} label="No matching trainers" />
          )}
        </div>
      </section>
      {isAddOpen && <AddTrainerModal close={() => setIsAddOpen(false)} onCreated={addTrainer} />}
      {editingTrainer && (
        <AddTrainerModal
          editingTrainer={editingTrainer}
          close={() => setEditingTrainer(null)}
          onUpdated={updateTrainer}
        />
      )}
      {profileTrainerId && (
        <TrainerProfileModal trainerId={profileTrainerId} close={() => setProfileTrainerId(null)} />
      )}
    </>
  );
}

function maxTrainerClients(items: TrainerRecord[]) {
  return Math.max(1, ...items.map((trainer) => trainer.clientCount));
}

export default function TrainersView() {
  const notify = useDashboardToast();
  return <Trainers notify={notify} />;
}
