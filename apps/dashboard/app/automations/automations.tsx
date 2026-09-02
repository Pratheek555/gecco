"use client";

import {
  Activity,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  MessageCircle,
  UserPlus,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  Empty,
  PageHeader,
  SummaryCard,
  SummaryGrid,
  Tab,
  Toolbar,
} from "../_components/managed-page-ui";
import { type Notify, useDashboardToast } from "../manage-shell";

const workflowSeed = [
  {
    id: 1,
    name: "Welcome new members",
    detail: "Send a welcome message and onboarding guide after signup.",
    trigger: "Member joins",
    runs: "128 runs",
    success: "98.4%",
    active: true,
    icon: UserPlus,
    tone: "purple",
  },
  {
    id: 2,
    name: "Failed payment recovery",
    detail: "Retry payment and notify the member over WhatsApp.",
    trigger: "Payment fails",
    runs: "31 runs",
    success: "87.1%",
    active: true,
    icon: CreditCard,
    tone: "red",
  },
  {
    id: 3,
    name: "Win back inactive members",
    detail: "Reach out when a member has not visited for 14 days.",
    trigger: "14 days inactive",
    runs: "64 runs",
    success: "72.6%",
    active: true,
    icon: MessageCircle,
    tone: "blue",
  },
  {
    id: 4,
    name: "Renewal reminder",
    detail: "Remind members seven and two days before renewal.",
    trigger: "Renewal approaching",
    runs: "92 runs",
    success: "96.8%",
    active: false,
    icon: CalendarDays,
    tone: "amber",
  },
];

function Automations({ notify }: { notify: Notify }) {
  const [items, setItems] = useState(workflowSeed);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Paused">("All");
  const visible = items.filter(
    (item) =>
      (filter === "All" || (filter === "Active" ? item.active : !item.active)) &&
      `${item.name} ${item.trigger}`.toLowerCase().includes(query.toLowerCase()),
  );
  function toggle(id: number) {
    const item = items.find((entry) => entry.id === id);
    setItems((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, active: !entry.active } : entry)),
    );
    notify(`${item?.name} ${item?.active ? "paused" : "activated"}`);
  }
  return (
    <>
      <PageHeader
        eyebrow="SMART WORKFLOWS"
        title="Automations"
        copy="Put member communication and routine follow-ups on autopilot."
        action="Create automation"
        icon={Zap}
        onAction={() => notify("Automation builder opened")}
      />
      <SummaryGrid>
        <SummaryCard
          icon={Zap}
          tone="purple"
          label="Active automations"
          value={String(items.filter((item) => item.active).length)}
          detail="Workflows running now"
        />
        <SummaryCard
          icon={Activity}
          tone="blue"
          label="Runs this month"
          value="315"
          detail="+22% from last month"
        />
        <SummaryCard
          icon={Clock3}
          tone="green"
          label="Hours saved"
          value="38.5"
          detail="About 9 hours each week"
        />
        <SummaryCard
          icon={MessageCircle}
          tone="amber"
          label="Messages delivered"
          value="97.2%"
          detail="1.8% above benchmark"
        />
      </SummaryGrid>
      <Toolbar query={query} setQuery={setQuery} placeholder="Search automations or triggers">
        <Tab active={filter === "All"} onClick={() => setFilter("All")}>
          All
        </Tab>
        <Tab active={filter === "Active"} onClick={() => setFilter("Active")}>
          Active
        </Tab>
        <Tab active={filter === "Paused"} onClick={() => setFilter("Paused")}>
          Paused
        </Tab>
      </Toolbar>
      <section className="automation-layout">
        <div className="workflow-list">
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <article className="panel workflow-card" key={item.id}>
                <span className={`managed-glyph ${item.tone}`}>
                  <Icon size={19} />
                </span>
                <div className="workflow-copy">
                  <div>
                    <h2>{item.name}</h2>
                    <span className={`managed-status ${item.active ? "active" : "paused"}`}>
                      {item.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p>{item.detail}</p>
                  <footer>
                    <span>
                      <Zap size={12} />
                      {item.trigger}
                    </span>
                    <span>
                      <Activity size={12} />
                      {item.runs}
                    </span>
                    <span>
                      <Check size={12} />
                      {item.success}
                    </span>
                  </footer>
                </div>
                <div className="workflow-actions">
                  <button
                    className={`toggle ${item.active ? "on" : ""}`}
                    role="switch"
                    aria-checked={item.active}
                    aria-label={`${item.active ? "Pause" : "Activate"} ${item.name}`}
                    onClick={() => toggle(item.id)}
                  >
                    <i />
                  </button>
                  <button
                    className="icon-button small"
                    onClick={() => notify(`${item.name} editor opened`)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </article>
            );
          })}
          {visible.length === 0 && <Empty icon={Zap} label="No matching automations" />}
        </div>
        <RunLog notify={notify} />
      </section>
    </>
  );
}

function RunLog({ notify }: { notify: Notify }) {
  const events = [
    ["Welcome sent to Riya Das", "Welcome new members", "2m", "ok"],
    ["Payment recovered for Dev Patel", "Failed payment recovery", "18m", "ok"],
    ["WhatsApp delivery failed", "Renewal reminder", "41m", "error"],
    ["12 inactive members contacted", "Win back inactive members", "1h", "ok"],
  ];
  return (
    <article className="panel run-card">
      <div className="managed-card-head">
        <div>
          <h2>Recent runs</h2>
          <p>Live workflow activity</p>
        </div>
        <span className="managed-live">
          <i />
          Live
        </span>
      </div>
      <div className="run-list">
        {events.map(([title, detail, time, state]) => (
          <div key={title}>
            <i className={state} />
            <span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
            <time>{time}</time>
          </div>
        ))}
      </div>
      <button
        className="managed-row-action"
        onClick={() => notify("Complete automation history opened")}
      >
        View run history <ChevronRight size={14} />
      </button>
    </article>
  );
}

export default function AutomationsView() {
  const notify = useDashboardToast();
  return <Automations notify={notify} />;
}
