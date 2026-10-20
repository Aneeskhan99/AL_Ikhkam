"use client";

import { useRouter } from "next/navigation";
import { createUser, resetPassword, updateUser } from "../../actions/users";
import { ActionForm, SubmitButton } from "../../ui";

type U = { id: number; username: string; name: string; email: string; role: string; disabled: boolean };

function RoleSelect({ value }: { value?: string }) {
  return (
    <div className="a-field">
      <label htmlFor="role">Role</label>
      <select id="role" name="role" defaultValue={value || "editor"}>
        <option value="admin">Administrator</option>
        <option value="editor">Editor</option>
        <option value="author">Author</option>
      </select>
    </div>
  );
}

export default function UserForm({ user }: { user?: U }) {
  const router = useRouter();
  if (!user) {
    return (
      <ActionForm action={createUser} resetOnSuccess onSuccess={() => router.refresh()}>
        {(pending) => (
          <>
            <div className="a-field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" required />
            </div>
            <div className="a-field">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" type="text" required autoComplete="off" />
            </div>
            <div className="a-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" />
              <span className="hint">Used for enquiry assignment emails.</span>
            </div>
            <RoleSelect />
            <div className="a-field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
              <span className="hint">At least 8 characters. Share it privately.</span>
            </div>
            <SubmitButton pending={pending}>Add user</SubmitButton>
          </>
        )}
      </ActionForm>
    );
  }
  return (
    <div className="a-stack">
      <section className="a-panel a-panel-pad">
        <h2 style={{ marginBottom: "1rem" }}>Details</h2>
        <ActionForm action={updateUser} onSuccess={() => router.refresh()}>
          {(pending) => (
            <>
              <input type="hidden" name="id" value={user.id} />
              <div className="a-field">
                <label>Username</label>
                <input type="text" value={user.username} disabled />
              </div>
              <div className="a-field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" type="text" defaultValue={user.name} required />
              </div>
              <div className="a-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" defaultValue={user.email} />
              </div>
              <RoleSelect value={user.role} />
              <label className="a-check">
                <input type="checkbox" name="disabled" defaultChecked={user.disabled} /> Disabled (cannot sign in)
              </label>
              <div>
                <SubmitButton pending={pending}>Save user</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      </section>
      <section className="a-panel a-panel-pad">
        <h2 style={{ marginBottom: "1rem" }}>Reset password</h2>
        <ActionForm action={resetPassword} resetOnSuccess>
          {(pending) => (
            <>
              <input type="hidden" name="id" value={user.id} />
              <div className="a-field">
                <label htmlFor="newpw">New password</label>
                <input id="newpw" name="password" type="password" minLength={8} required autoComplete="new-password" />
                <span className="hint">They will be signed out everywhere and must use the new password.</span>
              </div>
              <div>
                <SubmitButton pending={pending} className="a-btn secondary">
                  Reset password
                </SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      </section>
    </div>
  );
}
