"use client";

import {
  accessSections,
  normalizeGrant,
  type MemberScope,
  type Permission,
} from "../api/auth/permissions";
import styles from "./team.module.css";

type Level = "hidden" | "view" | "edit";
type Section = (typeof accessSections)[number];

function sectionLevel(section: Section, permissions: readonly Permission[]): Level {
  if (section.edit && section.edit.every((permission) => permissions.includes(permission))) return "edit";
  if (section.view.every((permission) => permissions.includes(permission))) return "view";
  return "hidden";
}

function withoutSection(section: Section, permissions: readonly Permission[]) {
  const sectionPermissions: readonly Permission[] = [...section.view, ...(section.edit ?? [])];
  return permissions.filter((permission) => !sectionPermissions.includes(permission));
}

/** Sections that force this one to stay visible because their screens depend on it. */
function requiredBy(section: Section, permissions: readonly Permission[], memberScope: MemberScope) {
  const remaining = normalizeGrant(withoutSection(section, permissions), memberScope);
  if (sectionLevel(section, remaining) === "hidden") return [];
  return accessSections
    .filter((other) => other.key !== section.key && sectionLevel(other, permissions) !== "hidden")
    .filter((other) => {
      const withoutOther = normalizeGrant(withoutSection(section, withoutSection(other, permissions)), memberScope);
      return sectionLevel(section, withoutOther) === "hidden";
    })
    .map((other) => other.label);
}

export function AccessEditor({
  permissions,
  memberScope,
  disabled,
  onChange,
}: {
  permissions: Permission[];
  memberScope: MemberScope;
  disabled?: boolean;
  onChange: (next: { permissions: Permission[]; memberScope: MemberScope }) => void;
}) {
  function setLevel(section: Section, level: Level) {
    const base = withoutSection(section, permissions);
    const added = level === "edit" ? [...section.view, ...(section.edit ?? [])] : level === "view" ? section.view : [];
    onChange({ permissions: normalizeGrant([...base, ...added], memberScope), memberScope });
  }

  function setScope(next: MemberScope) {
    onChange({ permissions: normalizeGrant(permissions, next), memberScope: next });
  }

  return (
    <div className={styles.accessEditor}>
      <fieldset className={styles.scope} disabled={disabled}>
        <legend>Which members can they see?</legend>
        <label>
          <input type="radio" name="member-scope" checked={memberScope === "ASSIGNED"} onChange={() => setScope("ASSIGNED")} />
          <span>
            <strong>Only members assigned to them</strong>
            <small>Members whose active plan has this person as their trainer.</small>
          </span>
        </label>
        <label>
          <input type="radio" name="member-scope" checked={memberScope === "ALL"} onChange={() => setScope("ALL")} />
          <span>
            <strong>All members</strong>
            <small>Every member in the gym, plus gym-wide numbers if Overview is on.</small>
          </span>
        </label>
      </fieldset>

      <div className={styles.sections} role="group" aria-label="Visible sections">
        {accessSections.map((section) => {
          const level = sectionLevel(section, permissions);
          const blockedByScope = memberScope === "ASSIGNED" && section.key === "overview";
          const requiredFor = level === "hidden" ? [] : requiredBy(section, permissions, memberScope);
          const levels: Level[] = section.edit ? ["hidden", "view", "edit"] : ["hidden", "view"];

          return (
            <div className={styles.sectionRow} key={section.key}>
              <div>
                <strong>{section.label}</strong>
                <small>
                  {blockedByScope
                    ? "Shows gym-wide numbers, so it needs access to all members."
                    : requiredFor.length
                      ? `Needed by ${requiredFor.join(" and ")}.`
                      : section.description}
                </small>
              </div>
              <div className={styles.levels}>
                {levels.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={level === option}
                    className={level === option ? styles.levelActive : undefined}
                    disabled={
                      disabled ||
                      (blockedByScope && option !== "hidden") ||
                      (option === "hidden" && requiredFor.length > 0)
                    }
                    onClick={() => setLevel(section, option)}
                  >
                    {option === "hidden" ? "Hidden" : option === "view" ? "View" : "Edit"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className={styles.ownerOnly}>
        Plans and pricing, trainer incentives, payment settings, and team access always stay with the owner.
      </p>
    </div>
  );
}

/** Short human summary of what someone can see, for list rows. */
export function accessSummary(permissions: readonly Permission[], memberScope: MemberScope) {
  const parts = accessSections.flatMap((section) => {
    const level = sectionLevel(section, permissions);
    if (level === "hidden") return [];
    return [`${section.label}${level === "view" && section.edit ? " (view)" : ""}`];
  });
  if (!parts.length) return "No sections shared";
  return `${memberScope === "ASSIGNED" ? "Own clients · " : ""}${parts.join(", ")}`;
}
