"use client";

import { changeOwnPassword, updateOwnProfile } from "../../actions/auth";
import { ActionForm, SubmitButton } from "../../ui";

export default function AccountForms({ name, email }: { name: string; email: string }) {
  return (
    <div className="a-grid-2">
      <section className="a-panel a-panel-pad">
        <h2 style={{ marginBottom: "1rem" }}>Profile</h2>
        <ActionForm action={updateOwnProfile}>
          {(pending) => (
            <>
              <div className="a-field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" type="text" defaultValue={name} required />
              </div>
              <div className="a-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" defaultValue={email} />
                <span className="hint">Enquiries assigned to you are emailed here.</span>
              </div>
              <div>
                <SubmitButton pending={pending}>Save profile</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      </section>
      <section className="a-panel a-panel-pad">
        <h2 style={{ marginBottom: "1rem" }}>Change password</h2>
        <ActionForm action={changeOwnPassword} resetOnSuccess>
          {(pending) => (
            <>
              <div className="a-field">
                <label htmlFor="current">Current password</label>
                <input id="current" name="current" type="password" required autoComplete="current-password" />
              </div>
              <div className="a-field">
                <label htmlFor="password">New password</label>
                <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
              </div>
              <div className="a-field">
                <label htmlFor="confirm">Repeat new password</label>
                <input id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" />
              </div>
              <div>
                <SubmitButton pending={pending}>Change password</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      </section>
    </div>
  );
}
