"use client";

import { useActionState } from "react";
import { signInAction, type ActionState } from "@/app/actions";

export function SignInForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(signInAction, null);
  return (
    <form action={action} className="signin-form">
      <h1>Sign in to Gecco HQ</h1>
      <p>Use your Gecco account. Only staff on the access list can enter.</p>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@gecco.in" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button type="submit" className="btn primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
