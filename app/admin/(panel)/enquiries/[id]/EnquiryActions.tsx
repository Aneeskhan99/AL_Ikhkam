"use client";

import { useRouter } from "next/navigation";
import { addEnquiryNote, deleteEnquiry, updateEnquiry } from "../../../actions/enquiries";
import { statusLabels } from "../../../format";
import { ActionForm, ConfirmAction, SubmitButton } from "../../../ui";

export function StatusForm({ id, status, assigned, staff }: { id: number; status: string; assigned: number | null; staff: { id: number; name: string }[] }) {
  const router = useRouter();
  return (
    <ActionForm action={updateEnquiry} onSuccess={() => router.refresh()}>
      {(pending) => (
        <>
          <input type="hidden" name="id" value={id} />
          <div className="a-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={status}>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <label htmlFor="assigned_to">Assigned to</label>
            <select id="assigned_to" name="assigned_to" defaultValue={assigned ? String(assigned) : ""}>
              <option value="">Nobody</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span className="hint">The person assigned gets an email when SMTP is set up.</span>
          </div>
          <SubmitButton pending={pending}>Save</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function NoteForm({ id }: { id: number }) {
  const router = useRouter();
  return (
    <ActionForm action={addEnquiryNote} resetOnSuccess onSuccess={() => router.refresh()}>
      {(pending) => (
        <>
          <input type="hidden" name="id" value={id} />
          <div className="a-field">
            <label htmlFor="note" className="a-sr">
              Internal note
            </label>
            <textarea id="note" name="note" rows={3} placeholder="Add an internal note, for example what was discussed on the call" required />
          </div>
          <div>
            <SubmitButton pending={pending} className="a-btn secondary">
              Add note
            </SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}

export function DeleteEnquiry({ id }: { id: number }) {
  return (
    <ConfirmAction
      action={deleteEnquiry}
      fields={{ id }}
      label="Delete enquiry"
      title="Delete this enquiry?"
      message="The enquiry and its notes are removed permanently. Export it first if you need a record."
    />
  );
}
