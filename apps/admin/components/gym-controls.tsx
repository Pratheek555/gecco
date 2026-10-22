"use client";

import { useActionState, useState, useTransition } from "react";
import { setGymActive, updateSeatLimit, type ActionState } from "@/app/actions";

export function SeatLimitForm({ gymId, seatLimit, used }: { gymId: string; seatLimit: number; used: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSeatLimit.bind(null, gymId), null);
  return (
    <form action={action} className="field">
      <label htmlFor="seat-limit">Team seats</label>
      <div className="joined">
        <input id="seat-limit" name="seatLimit" type="number" min={used} max={100} defaultValue={seatLimit} className="input num" style={{ fontFamily: "var(--font)" }} />
        <button type="submit" className="btn" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      </div>
      <p className="hint">{used} in use, counting pending invites. The owner cannot change this.</p>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.done && <p className="hint">Saved.</p>}
    </form>
  );
}

export function GymActiveButton({ gymId, name, isActive }: { gymId: string; name: string; isActive: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className={`btn${isActive ? " danger" : ""}`}
        disabled={pending}
        onClick={() => {
          const question = isActive
            ? `Deactivate ${name}? Everyone at the gym loses access until it is reactivated. Their data is kept.`
            : `Reactivate ${name}? The owner and team get their access back.`;
          if (!window.confirm(question)) return;
          start(async () => setError((await setGymActive(gymId, !isActive))?.error ?? ""));
        }}
      >
        {isActive ? "Deactivate gym" : "Reactivate gym"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </>
  );
}
