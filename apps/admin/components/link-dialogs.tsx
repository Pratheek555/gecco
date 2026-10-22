"use client";

import { Copy, Plus, X } from "lucide-react";
import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createSignupLink, reissueSignupLink, revokeSignupLink, type ActionState } from "@/app/actions";

function CopyField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="field">
      <label htmlFor="signup-url">Signup link</label>
      <div className="joined">
        <input id="signup-url" className="input" readOnly value={url} onFocus={(event) => event.currentTarget.select()} autoFocus />
        <button
          type="button"
          className="btn"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          }}
        >
          <Copy /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="hint">Works once and expires in 14 days. It is only shown now; reissue it from the list if it gets lost.</p>
    </div>
  );
}

function useDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const open = useCallback(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);
  const close = useCallback(() => ref.current?.close(), []);
  return [ref, open, close] as const;
}

function ResultBody({ title, url, close }: { title: string; url: string; close: () => void }) {
  return (
    <div className="dialog-body">
      <div className="dialog-head">
        <div>
          <h2>{title}</h2>
          <p>Send it to the owner on WhatsApp or email. They create their account and gym from it.</p>
        </div>
        <button type="button" className="btn ghost small" onClick={close} aria-label="Close">
          <X />
        </button>
      </div>
      <CopyField url={url} />
      <div className="dialog-actions">
        <button type="button" className="btn primary" onClick={close}>Done</button>
      </div>
    </div>
  );
}

/** The screen's main job: issue a private signup link for one gym. */
export function NewLinkButton() {
  const [dialogRef, openDialog, closeDialog] = useDialog();
  // A fresh form each time the dialog opens, so the last link is never shown again.
  const [round, setRound] = useState(0);

  return (
    <>
      <button type="button" className="btn primary" onClick={() => { setRound((n) => n + 1); openDialog(); }}>
        <Plus /> New signup link
      </button>
      <dialog ref={dialogRef} className="sheet-dialog" aria-label="New signup link">
        <NewLinkForm key={round} close={closeDialog} />
      </dialog>
    </>
  );
}

function NewLinkForm({ close }: { close: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createSignupLink, null);

  if (state?.url) return <ResultBody title={state.title ?? "Signup link ready"} url={state.url} close={close} />;
  return (
          <form action={action} className="dialog-body">
            <div className="dialog-head">
              <div>
                <h2 id="new-link-title">New signup link</h2>
                <p>The owner uses it to create their account and gym workspace.</p>
              </div>
              <button type="button" className="btn ghost small" onClick={close} aria-label="Close">
                <X />
              </button>
            </div>
            <div className="field">
              <label htmlFor="gymName">Gym name <span>(optional, they can change it)</span></label>
              <input id="gymName" name="gymName" className="input" maxLength={100} placeholder="Bodyworks Mysuru" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="email">Owner email <span>(optional)</span></label>
                <input id="email" name="email" type="email" className="input" placeholder="owner@gym.in" />
                <p className="hint">When set, only this email can use the link.</p>
              </div>
              <div className="field">
                <label htmlFor="seatLimit">Team seats</label>
                <input id="seatLimit" name="seatLimit" type="number" min={0} max={100} defaultValue={5} className="input num" />
                <p className="hint">Not counting the owner.</p>
              </div>
            </div>
            <div className="field">
              <label htmlFor="note">Note for the team <span>(optional)</span></label>
              <input id="note" name="note" className="input" maxLength={500} placeholder="Annual plan, met at the Mysuru expo" />
            </div>
            {state?.error && <p className="form-error" role="alert">{state.error}</p>}
            <div className="dialog-actions">
              <button type="button" className="btn" onClick={close} disabled={pending}>Cancel</button>
              <button type="submit" className="btn primary" disabled={pending}>{pending ? "Creating…" : "Create link"}</button>
            </div>
          </form>
  );
}

/** Row actions for a link still waiting: issue a fresh one (the old stops working) or revoke it. */
export function LinkRowActions({ id, name, canRevoke }: { id: string; name: string; canRevoke: boolean }) {
  const [dialogRef, openDialog, closeDialog] = useDialog();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionState>(null);

  useEffect(() => {
    if (result?.url || result?.error) openDialog();
  }, [result, openDialog]);

  return (
    <>
      <button type="button" className="btn small" disabled={pending} onClick={() => start(async () => setResult(await reissueSignupLink(id)))}>
        Reissue
      </button>
      {canRevoke && (
        <button
          type="button"
          className="btn small ghost danger"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Revoke the signup link for ${name}? It stops working at once.`)) return;
            start(async () => setResult(await revokeSignupLink(id)));
          }}
        >
          Revoke
        </button>
      )}
      <dialog ref={dialogRef} className="sheet-dialog" aria-label={`Signup link for ${name}`} onClose={() => setResult(null)}>
        {result?.url ? (
          <ResultBody title={`New link for ${name}`} url={result.url} close={closeDialog} />
        ) : (
          <div className="dialog-body">
            <div className="dialog-head">
              <h2>Nothing changed</h2>
            </div>
            <p className="form-error" role="alert">{result?.error}</p>
            <div className="dialog-actions">
              <button type="button" className="btn primary" onClick={closeDialog}>OK</button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
