"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight, LoaderCircle, Plus, Search, UserPlus } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  copy,
  action,
  icon: Icon = Plus,
  onAction,
  secondaryAction,
  onSecondaryAction,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action: string;
  icon?: LucideIcon;
  onAction: () => void;
  secondaryAction?: string;
  onSecondaryAction?: () => void;
}) {
  const parent = eyebrow.includes("WORKSPACE") ? "Workspace" : "Manage";
  return (
    <div className="page-heading managed-heading">
      <div>
        <p className="managed-breadcrumb" title={eyebrow}>
          {parent} <ChevronRight size={12} /> {title}
        </p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <div className="heading-actions">
        {secondaryAction && (
          <button className="button secondary" onClick={onSecondaryAction}>
            <UserPlus size={16} />
            {secondaryAction}
          </button>
        )}
        <button className="button primary" onClick={onAction}>
          <Icon size={16} />
          {action}
        </button>
      </div>
    </div>
  );
}

export function SummaryCard({
  icon: Icon,
  tone,
  label,
  value,
  detail,
  loading = false,
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  value: string;
  detail: string;
  loading?: boolean;
}) {
  return (
    <article className="managed-stat">
      <span className={`managed-stat-icon ${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{loading ? <LoaderCircle className="plan-spinner" size={16} /> : value}</strong>
        <em>{detail}</em>
      </div>
    </article>
  );
}

export function SummaryGrid({ children }: { children: ReactNode }) {
  return <section className="managed-stats">{children}</section>;
}

export function Toolbar({
  query,
  setQuery,
  placeholder,
  children,
}: {
  query: string;
  setQuery: (value: string) => void;
  placeholder: string;
  children: ReactNode;
}) {
  return (
    <div className="managed-toolbar">
      <label>
        <Search size={15} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
      </label>
      <div className="managed-tabs">{children}</div>
    </div>
  );
}

export function Tab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      {children}
    </button>
  );
}

export function Empty({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="panel managed-empty">
      <Icon size={23} />
      <strong>{label}</strong>
      <span>Try adjusting your search or filter.</span>
    </div>
  );
}
