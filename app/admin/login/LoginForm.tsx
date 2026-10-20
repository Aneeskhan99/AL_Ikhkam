"use client";

import { useActionState } from "react";
import { loginAction } from "../actions/auth";
import { Mark, submitWithoutReset } from "../ui";

export default function LoginForm({ next, dbReady }: { next: string; dbReady: boolean }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form onSubmit={submitWithoutReset(action)} className="a-login-card">
      <div className="head">
        <Mark />
        <div>
          <h1>Al-Ihkam admin</h1>
          <p>Sign in to manage the website.</p>
        </div>
      </div>
      {!dbReady && <p className="a-note warn">The database is not set up on this server yet, so signing in is not possible.</p>}
      {state && !state.ok && (
        <p className="a-note error" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <div className="a-field">
        <label htmlFor="username">Username or email</label>
        <input id="username" name="username" type="text" autoComplete="username" required autoFocus />
      </div>
      <div className="a-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit" className="a-btn" disabled={pending}>
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
