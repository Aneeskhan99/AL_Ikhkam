"use client";

// Small shared client components for the admin: CSRF field, action forms with toasts,
// confirm dialogs, the sidebar and the mark.

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, startTransition, useActionState, useContext, useEffect, useRef, useState } from "react";
import type { ActionResult } from "@/lib/server/validate";

// ---------- CSRF ----------

const CsrfContext = createContext("");
export function CsrfProvider({ token, children }: { token: string; children: React.ReactNode }) {
  return <CsrfContext.Provider value={token}>{children}</CsrfContext.Provider>;
}
export function useCsrf() {
  return useContext(CsrfContext);
}
export function CsrfField() {
  return <input type="hidden" name="csrf" value={useCsrf()} />;
}

// ---------- Toast ----------

export function Toast({ result }: { result: ActionResult | null }) {
  const [shown, setShown] = useState<ActionResult | null>(null);
  useEffect(() => {
    if (!result) return;
    setShown(result);
    const t = setTimeout(() => setShown(null), result.ok ? 2600 : 6000);
    return () => clearTimeout(t);
  }, [result]);
  if (!shown) return null;
  return (
    <div className={`a-toast${shown.ok ? "" : " error"}`} role={shown.ok ? "status" : "alert"}>
      {shown.ok ? shown.message || "Saved." : shown.error}
    </div>
  );
}

// ---------- Action form ----------

/**
 * React 19 resets a <form action={fn}> after every submission, which would wipe what the editor typed
 * when validation fails. Submitting through a transition keeps the fields as they are.
 */
export function submitWithoutReset(formAction: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // portals (media picker) must not submit the form they are opened from
    const fd = new FormData(e.currentTarget);
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.name) fd.set(submitter.name, submitter.value);
    startTransition(() => formAction(fd));
  };
}

type ActionFn = (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;

export function ActionForm({
  action,
  children,
  className = "a-form",
  resetOnSuccess = false,
  onSuccess,
  id,
}: {
  action: ActionFn;
  children: React.ReactNode | ((pending: boolean) => React.ReactNode);
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: (r: ActionResult) => void;
  id?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  const handled = useRef<ActionResult | null>(null);
  const cb = useRef(onSuccess);
  cb.current = onSuccess;
  useEffect(() => {
    if (state && state !== handled.current) {
      handled.current = state;
      if (state.ok) {
        if (resetOnSuccess) ref.current?.reset();
        cb.current?.(state);
      }
    }
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} onSubmit={submitWithoutReset(formAction)} className={className} id={id}>
      <CsrfField />
      {typeof children === "function" ? children(pending) : children}
      <Toast result={state} />
    </form>
  );
}

export function SubmitButton({ children, pending, className = "a-btn", name, value }: { children: React.ReactNode; pending?: boolean; className?: string; name?: string; value?: string }) {
  return (
    <button type="submit" className={className} disabled={pending} name={name} value={value}>
      {children}
    </button>
  );
}

// ---------- Confirm ----------

/** A button that asks for confirmation in a dialog, then submits a hidden form to `action`. */
export function ConfirmAction({
  action,
  fields,
  label,
  title,
  message,
  confirmLabel = "Delete",
  className = "a-btn danger",
  onDone,
}: {
  action: ActionFn;
  fields: Record<string, string | number>;
  label: React.ReactNode;
  title: string;
  message: string;
  confirmLabel?: string;
  className?: string;
  onDone?: (r: ActionResult) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(action, null);
  const handled = useRef<ActionResult | null>(null);
  const cb = useRef(onDone);
  cb.current = onDone;
  useEffect(() => {
    if (state && state !== handled.current) {
      handled.current = state;
      dialog.current?.close();
      cb.current?.(state);
    }
  }, [state]);
  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        {label}
      </button>
      <dialog ref={dialog} className="a-dialog">
        <form onSubmit={submitWithoutReset(formAction)}>
          <CsrfField />
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={String(v)} />
          ))}
          <div className="a-dialog-body">
            <h2>{title}</h2>
            <p>{message}</p>
          </div>
          <div className="a-dialog-foot">
            <button type="button" className="a-btn secondary" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button type="submit" className={confirmLabel === "Delete" || className.includes("danger") ? "a-btn danger" : "a-btn"} disabled={pending}>
              {confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
      <Toast result={state} />
    </>
  );
}

// ---------- Mark ----------

export function Mark() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/al-ihkam-logo.png" alt="" width={581} height={568} style={{ width: "100%", height: "auto" }} />;
}

// ---------- Sidebar ----------

const icons: Record<string, string> = {
  dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  enquiries: "M4 4h16v12H5.2L4 17.2V4zm0-2a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4z",
  pages: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z",
  insights: "M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z",
  programmes: "M12 3 1 9l11 6 9-4.9V17h2V9L12 3zM5 13.2v4L12 21l7-3.8v-4L12 17l-7-3.8z",
  faculty: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z",
  media: "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z",
  seo: "M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 9.5 16a6.5 6.5 0 0 0 4.2-1.6l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
  settings: "M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.3 7.3 0 0 0 1.7 1L11 21h4l.4-2.9a7.3 7.3 0 0 0 1.7-1l2.5 1 2-3.5L19.4 13zM13 15.5a3.5 3.5 0 1 1 3.5-3.5 3.5 3.5 0 0 1-3.5 3.5z",
  users: "M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13zm8 0h-.9a4.3 4.3 0 0 1 1.9 3.5V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z",
  activity: "M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 2 4.9l-1.4 1.4A9 9 0 1 0 13 3zm-1 5v5l4.3 2.5.7-1.2-3.5-2.1V8z",
};

export type NavItem = { href: string; label: string; icon: string; count?: number; sep?: boolean };

export function Sidebar({ items, user, roleLabel, logout }: { items: NavItem[]; user: { name: string; username: string }; roleLabel: string; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  return (
    <>
      <div className="a-mobilebar">
        <b>Al-Ihkam admin</b>
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="admin-side">
          Menu
        </button>
      </div>
      <aside className="a-side" id="admin-side" data-open={open} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <Link href="/admin" className="a-brand">
          <Mark />
          <span>
            <b>Al-Ihkam</b>
            <span>Website admin</span>
          </span>
        </Link>
        <nav aria-label="Admin">
          <ul className="a-nav">
            {items.map((it) => (
              <li key={it.href}>
                {it.sep && <div className="a-nav-sep" />}
                <Link href={it.href} aria-current={active(it.href) ? "page" : undefined}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={icons[it.icon]} />
                  </svg>
                  {it.label}
                  {it.count ? <span className="count">{it.count}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="a-side-foot">
          <div className="who">
            <b>{user.name}</b>
            <span>
              {user.username}, {roleLabel}
            </span>
          </div>
          <Link href="/admin/account">My account</Link>
          <a href="/en" target="_blank" rel="noopener">
            View website
          </a>
          <form action={logout}>
            <button type="submit" className="a-linkbtn">
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}


/** Shown on a list page after a delete action redirects there with ?deleted=1. */
export function DeletedNotice() {
  const deleted = useSearchParams().get("deleted") === "1";
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!deleted) return;
    setHidden(false);
    const t = setTimeout(() => setHidden(true), 2600);
    return () => clearTimeout(t);
  }, [deleted]);
  if (!deleted || hidden) return null;
  return (
    <div className="a-toast" role="status">
      Deleted.
    </div>
  );
}
