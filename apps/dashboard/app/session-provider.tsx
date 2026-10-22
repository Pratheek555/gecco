"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import type { MemberScope, Permission } from "./api/auth/permissions";

export type CurrentSession = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  activeGym: {
    id: string;
    name: string;
    timezone: string;
    role: "OWNER" | "STAFF" | "TRAINER";
    permissions: Permission[];
    memberScope: MemberScope;
  };
  gyms: Array<CurrentSession["activeGym"]>;
  /** Gecco staff who can onboard new gyms. UI hint only; admin APIs check it server-side. */
  isPlatformAdmin: boolean;
};

type SessionContextValue = {
  session: CurrentSession | null;
  loading: boolean;
  setActiveGym: (gym: CurrentSession["activeGym"]) => void;
  /** Reloads the session after signing in, signing up, or accepting an invite. */
  refreshSession: () => Promise<void>;
};

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

async function fetchSession() {
  try {
    const response = await fetch("/api/session");
    return response.ok ? ((await response.json()) as CurrentSession) : null;
  } catch {
    return null;
  }
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CurrentSession | null>(null);
  const [loading, setLoading] = useState(true);

  function setActiveGym(gym: CurrentSession["activeGym"]) {
    setSession((current) =>
      current
        ? {
            ...current,
            activeGym: gym,
            gyms: current.gyms.map((item) => (item.id === gym.id ? gym : item)),
          }
        : current,
    );
  }

  useEffect(() => {
    let cancelled = false;
    void fetchSession().then((data) => {
      if (cancelled) return;
      setSession(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSession = useCallback(async () => {
    setSession(await fetchSession());
    setLoading(false);
  }, []);

  return <SessionContext value={{ session, loading, setActiveGym, refreshSession }}>{children}</SessionContext>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider.");
  return value;
}

/** UI hint only; every API route enforces the same permission server-side. */
export function useCan(permission: Permission) {
  const { session } = useSession();
  return Boolean(session?.activeGym.permissions.includes(permission));
}
