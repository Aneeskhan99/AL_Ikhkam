import { requirePage } from "@/lib/server/auth";
import { getSettings } from "@/lib/server/content";
import { one } from "@/lib/server/db";
import { mailConfigured } from "@/lib/server/mail";
import { fmtDateTime } from "../../format";
import SettingsForm, { TestEmailForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requirePage("settings.edit");
  const [s, meta, me] = await Promise.all([
    getSettings(),
    one<{ updated_at: Date; name: string | null }>(`SELECT s.updated_at, u.name FROM settings s LEFT JOIN users u ON u.id = s.updated_by WHERE s.key = 'site'`),
    one<{ email: string | null }>(`SELECT email FROM users WHERE id = $1`, [user.id]),
  ]);
  const smtp = mailConfigured();
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Settings</h1>
          <p>
            Contact details, Zakat reference figures, social links and analytics for the whole website.
            {meta && ` Last changed ${fmtDateTime(meta.updated_at)}${meta.name ? ` by ${meta.name}` : ""}.`}
          </p>
        </div>
      </div>
      <SettingsForm values={s} />
      <section className="a-panel a-panel-pad a-mt set-sections" id="email">
        <section>
          <header>
            <h2>Email delivery</h2>
            <p>Mail server details are kept in the server’s .env.local file, never in the database.</p>
          </header>
          <div className="a-stack" style={{ gap: "0.8rem" }}>
            {smtp ? (
              <p className="a-note">Email sending is on. New consultation requests are emailed to the notification addresses above, and staff get an email when an enquiry is assigned to them.</p>
            ) : (
              <p className="a-note warn">
                Email sending is off. Every consultation request is still saved under Enquiries. To turn emails on, the server admin adds SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM to .env.local and restarts the site.
              </p>
            )}
            {smtp && <TestEmailForm defaultTo={me?.email || s.notifyEmails.split(",")[0]?.trim() || ""} />}
          </div>
        </section>
      </section>
    </>
  );
}
