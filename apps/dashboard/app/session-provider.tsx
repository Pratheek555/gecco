"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

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
  };
  gyms: Array<{
    id: string;
    name: string;
    timezone: string;
    role: "OWNER" | "STAFF" | "TRAINER";
  }>;
};

type SessionContextValue = {
  session: CurrentSession | null;
  loading: boolean;
  setActiveGym: (gym: CurrentSession["activeGym"]) => void;
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

    async function loadSession() {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Could not load the current session.");

        const data = (await response.json()) as CurrentSession;
        if (!cancelled) setSession(data);
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return <SessionContext value={{ session, loading, setActiveGym }}>{children}</SessionContext>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider.");
  return value;
}
