"use client";

import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  LoaderCircle,
  MoreHorizontal,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { type Notify, useDashboardToast } from "../manage-shell";
import {
  Empty,
  PageHeader,
  SummaryCard,
  SummaryGrid,
  Tab,
  Toolbar,
} from "../_components/managed-page-ui";

async function readJson<T>(response: Response) {
  const body = await response.text();
  if (!body.trim()) throw new Error(`The server returned an empty response (${response.status}).`);

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }
}

type PlanOption = {
  id: string;
  code: string;
  name: string;
  type: "GT" | "PT";
  standardMonthlyFee: string | number;
  durationMonths: number;
  requiresTrainer: boolean;
  trainerRevenueEligible: boolean;
  isActive: boolean;
};
type MembershipRecord = {
  id: string;
  startsOn: string;
  endsOn: string;
  agreedFee: string | number;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  member: { id: string; fullName: string };
  plan: { id: string; name: string; code: string };
  trainerAssignments: { trainer: { id: string; fullName: string } }[];
};
type MembershipSummary = {
  activeMemberships: number;
  activeMembers: number;
  monthlyRecurringRevenue: string;
  renewingThisMonth: number;
  renewalValueAtRisk: string;
  collectionRate: string;
  outstandingAmount: string;
  overdueMembers: number;
  newMemberships: number;
  cancelledMemberships: number;
  netGrowth: number;
  trainerCoverage: string;
  averageMembershipValue: string;
  totalCollected: string;
  totalCollectedChange: string | null;
};
type PlanCard = {
  id: string;
  code: string;
  name: string;
  type: "GT" | "PT";
  standardMonthlyFee: string | number;
  durationMonths: number;
  requiresTrainer: boolean;
  trainerRevenueEligible: boolean;
  isActive: boolean;
  detail: string;
  price: string;
  cadence: string;
  members: number;
  revenue: string;
  growth: string;
  state: "Active" | "Archived";
  tone: string;
};

function planToCard(plan: PlanOption): PlanCard {
  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    type: plan.type,
    standardMonthlyFee: plan.standardMonthlyFee,
    durationMonths: plan.durationMonths,
    requiresTrainer: plan.requiresTrainer,
    trainerRevenueEligible: plan.trainerRevenueEligible,
    isActive: plan.isActive,
    detail: `${plan.type === "GT" ? "Gym Training" : "Personal Training"} · ${plan.code}${plan.requiresTrainer ? " · Trainer required" : ""}${plan.trainerRevenueEligible ? " · Trainer revenue" : ""}`,
    price: new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(plan.standardMonthlyFee)),
    cadence: `/${plan.durationMonths} ${plan.durationMonths === 1 ? "month" : "months"}`,
    members: 0,
    revenue: "₹0",
    growth: "—",
    state: plan.isActive ? "Active" : "Archived",
    tone: plan.type === "GT" ? "purple" : "blue",
  };
}

function AddPlanModal({
  close,
  onCreated,
  editingPlan,
  onUpdated,
}: {
  close: () => void;
  onCreated?: (plan: PlanCard) => void;
  editingPlan?: PlanCard;
  onUpdated?: (plan: PlanCard) => void;
}) {
  const [code, setCode] = useState(editingPlan?.code ?? "");
  const [name, setName] = useState(editingPlan?.name ?? "");
  const [type, setType] = useState<"GT" | "PT">(editingPlan?.type ?? "GT");
  const [monthlyFee, setMonthlyFee] = useState(
    editingPlan ? String(editingPlan.standardMonthlyFee) : "",
  );
  const [durationMonths, setDurationMonths] = useState(String(editingPlan?.durationMonths ?? 1));
  const [requiresTrainer, setRequiresTrainer] = useState(editingPlan?.requiresTrainer ?? false);
  const [trainerRevenueEligible, setTrainerRevenueEligible] = useState(
    editingPlan?.trainerRevenueEligible ?? false,
  );
  const [isActive, setIsActive] = useState(editingPlan?.isActive ?? true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(editingPlan ? `/api/plans/${editingPlan.id}` : "/api/plans", {
        method: editingPlan ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          type,
          standardMonthlyFee: monthlyFee,
          durationMonths,
          requiresTrainer,
          trainerRevenueEligible,
          isActive,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        id?: string;
        code?: string;
        name?: string;
        type?: "GT" | "PT";
        standardMonthlyFee?: string | number;
        durationMonths?: number;
        requiresTrainer?: boolean;
        trainerRevenueEligible?: boolean;
        isActive?: boolean;
      };
      if (!response.ok)
        throw new Error(data.error ?? `Could not ${editingPlan ? "update" : "create"} the plan.`);

      if (
        !data.id ||
        !data.code ||
        !data.name ||
        !data.type ||
        data.standardMonthlyFee === undefined ||
        data.durationMonths === undefined
      )
        throw new Error("The created plan response was incomplete.");
      const savedPlan = planToCard({
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.type,
        standardMonthlyFee: data.standardMonthlyFee,
        durationMonths: data.durationMonths,
        requiresTrainer: data.requiresTrainer ?? requiresTrainer,
        trainerRevenueEligible: data.trainerRevenueEligible ?? trainerRevenueEligible,
        isActive: data.isActive ?? isActive,
      });
      if (editingPlan) onUpdated?.(savedPlan);
      else onCreated?.(savedPlan);
      close();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : `Could not ${editingPlan ? "update" : "create"} the plan.`,
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
      aria-labelledby="plan-editor-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="plan-editor-title">{editingPlan ? "Edit plan" : "Add plan"}</h2>
            <p>
              {editingPlan
                ? "Update the plan used for future memberships."
                : "Create a membership plan for your gym."}
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
        <div className="form-row">
          <label>
            Plan code
            <input
              required
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. GT-MONTHLY"
              disabled={submitting}
            />
          </label>
          <label>
            Plan type
            <select
              value={type}
              onChange={(event) => setType(event.target.value as "GT" | "PT")}
              disabled={submitting}
            >
              <option value="GT">Gym Training</option>
              <option value="PT">Personal Training</option>
            </select>
          </label>
        </div>
        <label>
          Plan name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Monthly Flex"
            disabled={submitting}
          />
        </label>
        <div className="form-row">
          <label>
            Monthly fee
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={monthlyFee}
              onChange={(event) => setMonthlyFee(event.target.value)}
              placeholder="₹ 0"
              disabled={submitting}
            />
          </label>
          <label>
            Duration (months)
            <input
              required
              type="number"
              min="1"
              max="120"
              step="1"
              value={durationMonths}
              onChange={(event) => setDurationMonths(event.target.value)}
              disabled={submitting}
            />
          </label>
        </div>
        <label className="plan-active-toggle">
          <input
            type="checkbox"
            checked={trainerRevenueEligible}
            onChange={(event) => setTrainerRevenueEligible(event.target.checked)}
            disabled={submitting}
          />{" "}
          Include payments from this plan in trainer revenue
        </label>
        <label className="plan-active-toggle">
          <input
            type="checkbox"
            checked={requiresTrainer}
            onChange={(event) => setRequiresTrainer(event.target.checked)}
            disabled={submitting}
          />{" "}
          Require a trainer when this plan is assigned
        </label>
        <label className="plan-active-toggle">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            disabled={submitting}
          />{" "}
          Make this plan active
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>
            Cancel
          </button>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting
              ? editingPlan
                ? "Saving…"
                : "Creating…"
              : editingPlan
                ? "Save changes"
                : "Create plan"}
          </button>
        </div>
      </form>
    </div>
  );
}

type MemberOption = { id: string; fullName: string };
type TrainerOption = { id: string; fullName: string; isActive: boolean };

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonthsClampedDate(value: string, months: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return dateInputValue(target);
}

function AssignPlanModal({ close, onAssigned }: { close: () => void; onAssigned: () => void }) {
  const today = dateInputValue(new Date());
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [startsOn, setStartsOn] = useState(today);
  const [endsOn, setEndsOn] = useState(() => addMonthsClampedDate(today, 1));
  const [agreedFee, setAgreedFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [membersResponse, plansResponse, trainersResponse] = await Promise.all([
          fetch("/api/members/allMembers"),
          fetch("/api/plans"),
          fetch("/api/trainers"),
        ]);
        const membersData = (await membersResponse.json()) as {
          members?: MemberOption[];
          error?: string;
        };
        const plansData = (await plansResponse.json()) as { plans?: PlanOption[]; error?: string };
        const trainersData = (await trainersResponse.json()) as {
          trainers?: TrainerOption[];
          error?: string;
        };
        if (
          !membersResponse.ok ||
          !plansResponse.ok ||
          !trainersResponse.ok ||
          !membersData.members ||
          !plansData.plans ||
          !trainersData.trainers
        )
          throw new Error(
            membersData.error ??
              plansData.error ??
              trainersData.error ??
              "Could not load members, plans, and trainers.",
          );
        setMembers(membersData.members);
        setAvailablePlans(plansData.plans.filter((plan) => plan.isActive));
        setTrainers(trainersData.trainers.filter((trainer) => trainer.isActive));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not load members and plans.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function selectPlan(id: string) {
    setPlanId(id);
    setTrainerId("");
    const plan = availablePlans.find((item) => item.id === id);
    if (plan) {
      setAgreedFee(String(plan.standardMonthlyFee));
      setEndsOn(addMonthsClampedDate(startsOn, plan.durationMonths));
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const plan = availablePlans.find((item) => item.id === planId);
      if (plan?.requiresTrainer && !trainerId) {
        setError("Select a trainer for this plan.");
        return;
      }
      const response = await fetch(`/api/members/${memberId}/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, startsOn, agreedFee, trainerId: trainerId || undefined }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not assign the plan.");
      onAssigned();
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not assign the plan.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedPlan = availablePlans.find((plan) => plan.id === planId);
  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-plan-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="assign-plan-title">Assign plan</h2>
            <p>Give a member an active membership plan.</p>
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
        {loading && (
          <div className="modal-loading" role="status">
            <LoaderCircle className="plan-spinner" size={16} /> Loading members, plans, and
            trainers…
          </div>
        )}
        <label>
          Member
          <select
            required
            autoFocus
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            disabled={loading || submitting}
          >
            <option value="" disabled>
              Select a member
            </option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Plan
          <select
            required
            value={planId}
            onChange={(event) => selectPlan(event.target.value)}
            disabled={loading || submitting}
          >
            <option value="" disabled>
              {availablePlans.length ? "Select an active plan" : "No active plans available"}
            </option>
            {availablePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.code}) · {plan.durationMonths}{" "}
                {plan.durationMonths === 1 ? "month" : "months"} · ₹{plan.standardMonthlyFee}
                {plan.requiresTrainer ? " · Trainer required" : ""}
              </option>
            ))}
          </select>
        </label>
        {selectedPlan?.requiresTrainer && (
          <label>
            Trainer
            <select
              required
              value={trainerId}
              onChange={(event) => setTrainerId(event.target.value)}
              disabled={loading || submitting}
            >
              <option value="" disabled>
                {trainers.length ? "Select a trainer" : "No active trainers available"}
              </option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.fullName}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="form-row">
          <label>
            Starts on
            <input
              required
              type="date"
              value={startsOn}
              onChange={(event) => {
                const value = event.target.value;
                setStartsOn(value);
                const plan = availablePlans.find((item) => item.id === planId);
                if (plan) setEndsOn(addMonthsClampedDate(value, plan.durationMonths));
              }}
              disabled={submitting}
            />
          </label>
          <label>
            Ends on
            <input type="date" value={endsOn} readOnly disabled={submitting} />
          </label>
        </div>
        <p className="modal-hint">End date is calculated from the plan duration.</p>
        <label>
          Agreed fee
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={agreedFee}
            onChange={(event) => setAgreedFee(event.target.value)}
            placeholder="₹ 0"
            disabled={submitting}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>
            Cancel
          </button>
          <button
            className="button primary"
            type="submit"
            disabled={
              loading ||
              submitting ||
              !memberId ||
              !planId ||
              Boolean(selectedPlan?.requiresTrainer && !trainerId)
            }
          >
            {submitting ? "Assigning…" : "Assign plan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditMembershipModal({
  membership,
  close,
  onSaved,
}: {
  membership: MembershipRecord;
  close: () => void;
  onSaved: (membership: Partial<MembershipRecord> & { id: string }) => void;
}) {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [planId, setPlanId] = useState(membership.plan.id);
  const [startsOn, setStartsOn] = useState(membership.startsOn.slice(0, 10));
  const [agreedFee, setAgreedFee] = useState(String(membership.agreedFee));
  const [trainerId, setTrainerId] = useState(membership.trainerAssignments[0]?.trainer.id ?? "");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([fetch("/api/plans"), fetch("/api/trainers")])
      .then(async ([plansResponse, trainersResponse]) => {
        const planData = (await plansResponse.json()) as { plans?: PlanOption[]; error?: string };
        const trainerData = (await trainersResponse.json()) as {
          trainers?: TrainerOption[];
          error?: string;
        };
        if (!plansResponse.ok || !trainersResponse.ok || !planData.plans || !trainerData.trainers)
          throw new Error(
            planData.error ?? trainerData.error ?? "Could not load membership options.",
          );
        setPlans(planData.plans);
        setTrainers(trainerData.trainers.filter((trainer) => trainer.isActive));
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Could not load membership options."),
      )
      .finally(() => setLoading(false));
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === planId);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/memberships/${membership.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          startsOn,
          agreedFee,
          trainerId: selectedPlan?.requiresTrainer || trainerId ? trainerId : null,
        }),
      });
      const data = (await response.json()) as Partial<MembershipRecord> & {
        id?: string;
        error?: string;
      };
      if (!response.ok || !data.id) throw new Error(data.error ?? "Could not update membership.");
      onSaved(data as Partial<MembershipRecord> & { id: string });
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update membership.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-membership-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="edit-membership-title">Edit membership</h2>
            <p>Update this member’s plan terms and trainer assignment.</p>
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
        {loading && (
          <div className="modal-loading">
            <LoaderCircle className="plan-spinner" size={16} /> Loading options…
          </div>
        )}
        <label>
          Plan
          <select
            required
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
            disabled={loading || submitting}
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.code})
              </option>
            ))}
          </select>
        </label>
        {selectedPlan?.requiresTrainer && (
          <label>
            Trainer
            <select
              required
              value={trainerId}
              onChange={(event) => setTrainerId(event.target.value)}
              disabled={loading || submitting}
            >
              <option value="" disabled>
                Select a trainer
              </option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.fullName}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="form-row">
          <label>
            Starts on
            <input
              required
              type="date"
              value={startsOn}
              onChange={(event) => setStartsOn(event.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            Agreed fee
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={agreedFee}
              onChange={(event) => setAgreedFee(event.target.value)}
              disabled={submitting}
            />
          </label>
        </div>
        <p className="modal-hint">
          Changing the fee is unavailable after a payment has been applied.
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>
            Cancel
          </button>
          <button
            className="button primary"
            type="submit"
            disabled={loading || submitting || !planId}
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Memberships({ notify }: { notify: Notify }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Archived">("All");
  const [items, setItems] = useState<PlanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [membershipsError, setMembershipsError] = useState("");
  const [summary, setSummary] = useState<MembershipSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanCard | null>(null);
  const [openPlanMenu, setOpenPlanMenu] = useState<string | null>(null);
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<MembershipRecord | null>(null);
  const visible = useMemo(
    () =>
      items.filter(
        (plan) =>
          (filter === "All" || plan.state === filter) &&
          `${plan.name} ${plan.detail}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [filter, items, query],
  );
  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/plans");
        const data = await readJson<{ plans?: PlanOption[]; error?: string }>(response);
        if (!response.ok || !data.plans)
          throw new Error(data.error ?? "Could not load membership plans.");
        setItems(data.plans.map(planToCard));
      } catch (reason) {
        setLoadError(reason instanceof Error ? reason.message : "Could not load membership plans.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/memberships/summary");
        const data = await readJson<{ summary?: MembershipSummary; error?: string }>(response);
        if (!response.ok || !data.summary)
          throw new Error(data.error ?? "Could not load membership insights.");
        setSummary(data.summary);
      } catch (reason) {
        setSummaryError(
          reason instanceof Error ? reason.message : "Could not load membership insights.",
        );
      } finally {
        setSummaryLoading(false);
      }
    })();
  }, []);
  const summaryMoney = (value: string | number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  const summaryValue = (value: string) => (summaryLoading ? "—" : summaryError ? "—" : value);
  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/memberships");
        const data = (await response.json()) as {
          memberships?: MembershipRecord[];
          error?: string;
        };
        if (!response.ok || !data.memberships)
          throw new Error(data.error ?? "Could not load active memberships.");
        setMemberships(data.memberships);
      } catch (reason) {
        setMembershipsError(
          reason instanceof Error ? reason.message : "Could not load active memberships.",
        );
      } finally {
        setMembershipsLoading(false);
      }
    })();
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="MEMBERSHIP MANAGEMENT"
        title="Memberships"
        copy="Create plans, track adoption, and stay ahead of upcoming renewals."
        action="Create plan"
        onAction={() => setIsAddPlanOpen(true)}
        secondaryAction="Assign plan"
        onSecondaryAction={() => setIsAssignPlanOpen(true)}
      />
      <SummaryGrid>
        <SummaryCard
          loading={summaryLoading}
          icon={Users}
          tone="purple"
          label="Active memberships"
          value={summary ? String(summary.activeMemberships) : summaryValue("")}
          detail={
            summary
              ? `${summary.activeMembers} members · ${summary.netGrowth >= 0 ? "+" : ""}${summary.netGrowth} net this month`
              : "Loading membership totals…"
          }
        />
        <SummaryCard
          loading={summaryLoading}
          icon={WalletCards}
          tone="green"
          label="Monthly recurring revenue"
          value={summary ? summaryMoney(summary.monthlyRecurringRevenue) : summaryValue("")}
          detail={
            summary?.totalCollectedChange
              ? `${Number(summary.totalCollectedChange) >= 0 ? "+" : ""}${summary.totalCollectedChange}% collected vs last month`
              : summary
                ? `${summaryMoney(summary.totalCollected)} collected this month`
                : "Loading revenue…"
          }
        />
        <SummaryCard
          loading={summaryLoading}
          icon={CalendarDays}
          tone="blue"
          label="Renewing this month"
          value={summary ? String(summary.renewingThisMonth) : summaryValue("")}
          detail={
            summary
              ? `${summaryMoney(summary.renewalValueAtRisk)} value at risk`
              : "Loading renewals…"
          }
        />
        <SummaryCard
          loading={summaryLoading}
          icon={TrendingUp}
          tone="amber"
          label="Average membership value"
          value={summary ? summaryMoney(summary.averageMembershipValue) : summaryValue("")}
          detail={
            summary
              ? `${summary.collectionRate}% collection rate · ${summary.overdueMembers} overdue`
              : "Loading plan value…"
          }
        />
      </SummaryGrid>
      <Toolbar query={query} setQuery={setQuery} placeholder="Search membership plans">
        <Tab active={filter === "All"} onClick={() => setFilter("All")}>
          All
        </Tab>
        <Tab active={filter === "Active"} onClick={() => setFilter("Active")}>
          Active
        </Tab>
        <Tab active={filter === "Archived"} onClick={() => setFilter("Archived")}>
          Archived
        </Tab>
      </Toolbar>
      <section className="plan-grid">
        {loading ? (
          <LoadingPlans />
        ) : loadError ? (
          <Empty icon={CreditCard} label={loadError} />
        ) : (
          visible.map((plan) => (
            <article className="panel plan-card flex justify-center flex-col" key={plan.id}>
              <div className="plan-top">
                <span className={`managed-glyph ${plan.tone}`}>
                  <CreditCard size={19} />
                </span>
                <span className={`managed-status ${plan.state === "Active" ? "active" : "paused"}`}>
                  {plan.state}
                </span>
                <button
                  className="icon-button small"
                  aria-label={`${plan.name} options`}
                  onClick={() =>
                    setOpenPlanMenu((current) => (current === plan.id ? null : plan.id))
                  }
                >
                  <MoreHorizontal size={17} />
                </button>
                {openPlanMenu === plan.id && (
                  <div className="membership-menu plan-menu" role="menu">
                    <button
                      role="menuitem"
                      onClick={() => {
                        setOpenPlanMenu(null);
                        setEditingPlan(plan);
                      }}
                    >
                      Edit plan
                    </button>
                    <button
                      role="menuitem"
                      onClick={async () => {
                        setOpenPlanMenu(null);
                        if (
                          !window.confirm(
                            `Archive ${plan.name}? Existing memberships will keep their original terms.`,
                          )
                        )
                          return;
                        const response = await fetch(`/api/plans/${plan.id}`, { method: "DELETE" });
                        const data = (await response.json()) as { error?: string };
                        if (!response.ok) {
                          notify(data.error ?? "Could not archive the plan.");
                          return;
                        }
                        setItems((current) =>
                          current.map((item) =>
                            item.id === plan.id
                              ? { ...item, state: "Archived", isActive: false }
                              : item,
                          ),
                        );
                        notify("Plan archived successfully");
                      }}
                    >
                      Archive plan
                    </button>
                  </div>
                )}
              </div>
              <h2>{plan.name}</h2>
              <p>{plan.detail}</p>
              <div className="plan-price">
                <strong>{plan.price}</strong>
                <span>{plan.cadence}</span>
              </div>
              <div className="plan-data">
                <div>
                  <small>Members</small>
                  <strong>{plan.members}</strong>
                </div>
                <div>
                  <small>Revenue</small>
                  <strong>{plan.revenue}</strong>
                </div>
              </div>
              <button className="managed-row-action text-red " onClick={() => setEditingPlan(plan)}>
                Manage plan <ChevronRight size={15} />
              </button>
            </article>
          ))
        )}
        {!loading && !loadError && visible.length === 0 && (
          <Empty icon={CreditCard} label="No matching plans" />
        )}
      </section>
      <Renewals
        notify={notify}
        memberships={memberships}
        loading={membershipsLoading}
        error={membershipsError}
        onEdit={setEditingMembership}
        onDeleted={(membershipId) =>
          setMemberships((current) =>
            current.filter((membership) => membership.id !== membershipId),
          )
        }
      />
      {isAddPlanOpen && (
        <AddPlanModal
          close={() => setIsAddPlanOpen(false)}
          onCreated={(plan) => {
            setItems((current) => [plan, ...current]);
            notify("Membership plan created successfully");
          }}
        />
      )}
      {editingPlan && (
        <AddPlanModal
          editingPlan={editingPlan}
          close={() => setEditingPlan(null)}
          onUpdated={(updated) => {
            setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            notify("Membership plan updated successfully");
          }}
        />
      )}
      {isAssignPlanOpen && (
        <AssignPlanModal
          close={() => setIsAssignPlanOpen(false)}
          onAssigned={() => notify("Plan assigned successfully")}
        />
      )}
      {editingMembership && (
        <EditMembershipModal
          membership={editingMembership}
          close={() => setEditingMembership(null)}
          onSaved={(updated) => {
            setMemberships((current) =>
              current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
            );
            notify("Membership updated successfully");
          }}
        />
      )}
    </>
  );
}

function Renewals({
  notify,
  memberships,
  loading,
  error,
  onEdit,
  onDeleted,
}: {
  notify: Notify;
  memberships: MembershipRecord[];
  loading: boolean;
  error: string;
  onEdit: (membership: MembershipRecord) => void;
  onDeleted: (membershipId: string) => void;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  async function deleteMembership(membership: MembershipRecord) {
    if (
      !window.confirm(`Cancel ${membership.member.fullName}'s ${membership.plan.name} membership?`)
    )
      return;
    const response = await fetch(`/api/memberships/${membership.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      notify(data.error ?? "Could not delete membership.");
      return;
    }
    onDeleted(membership.id);
    notify("Membership deleted successfully");
  }
  return (
    <article className="panel managed-table-panel">
      <div className="managed-card-head">
        <div>
          <h2>Active memberships</h2>
          <p>All active memberships, status, and trainer assignments</p>
        </div>
        <button onClick={() => notify("All active memberships opened")}>
          View all <ChevronRight size={14} />
        </button>
      </div>
      <div className="member-table-wrap">
        <table className="member-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Plan</th>
              <th>Ends</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Trainer</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <div className="payment-empty">
                    <LoaderCircle size={22} className="plan-spinner" />
                    <strong>Loading memberships</strong>
                    <span>Fetching active memberships…</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7}>
                  <div className="payment-empty">
                    <strong>Could not load memberships</strong>
                    <span>{error}</span>
                  </div>
                </td>
              </tr>
            ) : memberships.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="payment-empty">
                    <strong>No active memberships</strong>
                    <span>Assign a plan to a member to see it here.</span>
                  </div>
                </td>
              </tr>
            ) : (
              memberships.map((membership) => (
                <tr key={membership.id}>
                  <td>
                    <div className="member-cell">
                      <span className="avatar violet">
                        {membership.member.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <strong>{membership.member.fullName}</strong>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{membership.plan.name}</strong>
                      <small>{membership.plan.code}</small>
                    </div>
                  </td>
                  <td>
                    {new Date(membership.endsOn).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <strong>₹{Number(membership.agreedFee).toLocaleString("en-IN")}</strong>
                  </td>
                  <td>
                    <span className="managed-status active">
                      {membership.status === "ACTIVE" ? "Active" : membership.status}
                    </span>
                  </td>
                  <td>
                    {membership.trainerAssignments[0]?.trainer.fullName ?? (
                      <span className="last-visit">Unassigned</span>
                    )}
                  </td>
                  <td className="membership-actions">
                    <button
                      className="icon-button small"
                      aria-label={`Actions for ${membership.member.fullName}`}
                      onClick={() =>
                        setOpenMenu((current) => (current === membership.id ? null : membership.id))
                      }
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {openMenu === membership.id && (
                      <div className="membership-menu" role="menu">
                        <button
                          role="menuitem"
                          onClick={() => {
                            setOpenMenu(null);
                            onEdit(membership);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => {
                            setOpenMenu(null);
                            void deleteMembership(membership);
                          }}
                        >
                          Cancel membership
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function LoadingPlans() {
  return (
    <div className="panel managed-empty" role="status" aria-live="polite">
      <LoaderCircle className="plan-spinner" size={24} />
      <strong>Loading plans</strong>
      <span>Fetching plans from your gym.</span>
    </div>
  );
}

export default function MembershipsView() {
  const notify = useDashboardToast();
  return <Memberships notify={notify} />;
}
