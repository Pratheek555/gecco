export type GymRole = "OWNER" | "STAFF" | "TRAINER";
export type MemberScope = "ALL" | "ASSIGNED";

export const allPermissions = [
  "overview:read",
  "members:read",
  "members:write",
  "leads:read",
  "leads:write",
  "payments:read",
  "payments:record",
  "memberships:read",
  "memberships:write",
  "memberships:cancel",
  "plans:read",
  "plans:manage",
  "trainers:read",
  "trainers:manage",
  "trainer-incentives:manage",
  "campaigns:read",
  "campaigns:send",
  "gym:manage",
  "team:manage",
] as const;

export type Permission = (typeof allPermissions)[number];

/** Configuration and team control never leave the owner. */
export const ownerOnlyPermissions: readonly Permission[] = [
  "plans:manage",
  "trainer-incentives:manage",
  "gym:manage",
  "team:manage",
];

/**
 * Screens need supporting data: recording a payment needs the member picker,
 * assigning a plan needs the plan and trainer lists, and so on.
 */
export const impliedPermissions: Partial<Record<Permission, readonly Permission[]>> = {
  "members:write": ["members:read"],
  "leads:write": ["leads:read"],
  "payments:read": ["members:read"],
  "payments:record": ["payments:read"],
  "memberships:read": ["members:read", "plans:read"],
  "memberships:write": ["memberships:read", "trainers:read"],
  "memberships:cancel": ["memberships:read"],
  "trainers:manage": ["trainers:read"],
  "campaigns:send": ["campaigns:read"],
};

/**
 * These permissions expose gym-wide data or create members outside anyone's
 * assignment, so they cannot be combined with an assigned-members scope.
 */
export const fullScopePermissions: readonly Permission[] = [
  "overview:read",
  "campaigns:read",
  "campaigns:send",
];

/** Access sections the owner toggles, in display order. */
export const accessSections = [
  {
    key: "overview",
    label: "Overview",
    description: "Gym-wide revenue, renewals, and activity stats.",
    view: ["overview:read"],
    edit: null,
  },
  {
    key: "members",
    label: "Members",
    description: "Member profiles, contacts, and notes.",
    view: ["members:read"],
    edit: ["members:write"],
  },
  {
    key: "leads",
    label: "Leads",
    description: "Enquiries, follow-ups, and trials.",
    view: ["leads:read"],
    edit: ["leads:write"],
  },
  {
    key: "payments",
    label: "Payments",
    description: "Payment history and dues. Edit allows recording and voiding.",
    view: ["payments:read"],
    edit: ["payments:record"],
  },
  {
    key: "memberships",
    label: "Memberships",
    description: "Active plans per member. Edit allows assigning, changing, and cancelling.",
    view: ["memberships:read"],
    edit: ["memberships:write", "memberships:cancel"],
  },
  {
    key: "trainers",
    label: "Trainers",
    description: "Trainer roster, clients, and revenue.",
    view: ["trainers:read"],
    edit: ["trainers:manage"],
  },
  {
    key: "campaigns",
    label: "Campaigns",
    description: "Message segments of members and leads. Edit allows creating and sending.",
    view: ["campaigns:read"],
    edit: ["campaigns:send"],
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  view: readonly Permission[];
  edit: readonly Permission[] | null;
}>;

export const rolePresets: Record<Exclude<GymRole, "OWNER">, { permissions: Permission[]; memberScope: MemberScope }> = {
  STAFF: {
    permissions: [
      "overview:read",
      "members:write",
      "leads:write",
      "payments:record",
      "memberships:write",
      "memberships:cancel",
      "trainers:manage",
    ],
    memberScope: "ALL",
  },
  TRAINER: {
    permissions: ["members:read", "memberships:read"],
    memberScope: "ASSIGNED",
  },
};

export function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && (allPermissions as readonly string[]).includes(value);
}

export function isMemberScope(value: unknown): value is MemberScope {
  return value === "ALL" || value === "ASSIGNED";
}

/**
 * Turns an owner's selection into the stored grant: drops unknown and
 * owner-only keys, adds what the selection depends on, and removes gym-wide
 * permissions when the person is limited to their assigned members.
 */
export function normalizeGrant(permissions: readonly string[], memberScope: MemberScope): Permission[] {
  const granted = new Set<Permission>();
  const queue = permissions.filter(isPermission);

  while (queue.length) {
    const permission = queue.pop()!;
    if (granted.has(permission) || ownerOnlyPermissions.includes(permission)) continue;
    if (memberScope === "ASSIGNED" && fullScopePermissions.includes(permission)) continue;
    granted.add(permission);
    queue.push(...(impliedPermissions[permission] ?? []));
  }

  return allPermissions.filter((permission) => granted.has(permission));
}

export function effectivePermissions(role: string, permissions: readonly string[], memberScope: MemberScope): Permission[] {
  if (role === "OWNER") return [...allPermissions];
  if (role !== "STAFF" && role !== "TRAINER") return [];
  return normalizeGrant(permissions, memberScope);
}

export function hasPermission(permissions: readonly Permission[], permission: Permission) {
  return permissions.includes(permission);
}
