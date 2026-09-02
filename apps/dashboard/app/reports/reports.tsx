"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { PageHeader, SummaryCard, SummaryGrid, Tab } from "../_components/managed-page-ui";
import { type Notify, useDashboardToast } from "../manage-shell";

function Reports({ notify }: { notify: Notify }) {
  const [metric, setMetric] = useState<"Revenue" | "Members" | "Attendance">("Revenue");
  const [period, setPeriod] = useState("30 days");
  const data =
    metric === "Revenue"
      ? [48, 56, 51, 68, 73, 79, 88, 91, 84, 97, 94, 100]
      : metric === "Members"
        ? [52, 55, 58, 61, 65, 70, 74, 79, 83, 89, 94, 98]
        : [71, 68, 79, 74, 88, 82, 91, 77, 93, 89, 96, 86];
  function exportReport(name = "Performance report") {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(["Metric,Value\nRevenue,1280000\nMembers,1284\nVisits,12482"], { type: "text/csv" }),
    );
    link.download = "gymwise-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    notify(`${name} exported`);
  }
  return (
    <>
      <PageHeader
        eyebrow="BUSINESS INTELLIGENCE"
        title="Reports"
        copy="Understand performance, spot trends, and share what matters."
        action="Export report"
        icon={Download}
        onAction={() => exportReport()}
      />
      <SummaryGrid>
        <SummaryCard
          icon={WalletCards}
          tone="green"
          label="Gross revenue"
          value="₹12.8L"
          detail="+8.2% vs last month"
        />
        <SummaryCard
          icon={Users}
          tone="purple"
          label="Net growth"
          value="+58"
          detail="136 joins, 78 cancellations"
        />
        <SummaryCard
          icon={Activity}
          tone="blue"
          label="Total visits"
          value="12,482"
          detail="+12.4% vs last month"
        />
        <SummaryCard
          icon={TrendingUp}
          tone="amber"
          label="Revenue per member"
          value="₹997"
          detail="+3.1% vs last month"
        />
      </SummaryGrid>
      <section className="report-layout">
        <article className="panel report-chart">
          <div className="report-head">
            <div>
              <small>PERFORMANCE OVERVIEW</small>
              <h2>{metric === "Revenue" ? "₹12.8L" : metric === "Members" ? "1,284" : "12,482"}</h2>
              <p>
                <strong>
                  <ArrowUpRight size={13} />
                  {metric === "Revenue" ? "8.2" : metric === "Members" ? "4.8" : "12.4"}%
                </strong>{" "}
                compared with last month
              </p>
            </div>
            <label className="managed-select">
              <CalendarDays size={15} />
              <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                <option>7 days</option>
                <option>30 days</option>
                <option>90 days</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
          <div className="report-tabs">
            {(["Revenue", "Members", "Attendance"] as const).map((item) => (
              <Tab key={item} active={metric === item} onClick={() => setMetric(item)}>
                {item}
              </Tab>
            ))}
          </div>
          <div className="report-bars">
            {data.map((height, index) => (
              <div key={index}>
                <span>
                  <i style={{ height: `${height}%` }} />
                </span>
                <small>
                  {
                    [
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                    ][index]
                  }
                </small>
              </div>
            ))}
          </div>
        </article>
        <Insights notify={notify} />
      </section>
      <section className="saved-section">
        <div className="section-title">
          <div>
            <h2>Saved reports</h2>
            <p>Ready-to-share views for your team.</p>
          </div>
          <button
            className="button secondary"
            onClick={() => notify("Custom report builder opened")}
          >
            <Plus size={15} />
            New report
          </button>
        </div>
        <div className="saved-grid">
          {[
            ["Monthly business review", "Revenue, growth and retention", "Today", "purple"],
            ["Trainer performance", "Sessions, ratings and capacity", "Yesterday", "blue"],
            ["Member retention cohort", "Joins, churn and engagement", "3 days ago", "green"],
          ].map(([name, detail, updated, tone]) => (
            <article className="panel saved-report" key={name}>
              <span className={`managed-glyph ${tone}`}>
                <BarChart3 size={19} />
              </span>
              <div>
                <h3>{name}</h3>
                <p>{detail}</p>
                <small>Updated {updated}</small>
              </div>
              <button className="icon-button small" onClick={() => exportReport(name)}>
                <Download size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function Insights({ notify }: { notify: Notify }) {
  return (
    <article className="panel insights-card">
      <div className="managed-card-head">
        <div>
          <h2>AI insights</h2>
          <p>What changed this period</p>
        </div>
        <Sparkles size={18} />
      </div>
      <div className="insight-list">
        <div className="green">
          <ArrowUpRight size={16} />
          <span>
            <strong>Annual plans are accelerating</strong>
            <small>Conversions rose 18% after the July offer.</small>
          </span>
        </div>
        <div className="amber">
          <Clock3 size={16} />
          <span>
            <strong>Friday evenings are at capacity</strong>
            <small>Add one trainer between 6–8 PM.</small>
          </span>
        </div>
        <div className="blue">
          <Users size={16} />
          <span>
            <strong>New-member retention improved</strong>
            <small>Onboarding lifted repeat visits by 9%.</small>
          </span>
        </div>
      </div>
      <button className="managed-row-action" onClick={() => notify("Detailed insights opened")}>
        Explore all insights <ChevronRight size={14} />
      </button>
    </article>
  );
}

export default function ReportsView() {
  const notify = useDashboardToast();
  return <Reports notify={notify} />;
}
