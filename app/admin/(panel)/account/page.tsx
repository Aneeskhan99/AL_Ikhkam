import { requirePage, roleLabels } from "@/lib/server/auth";
import AccountForms from "./AccountForms";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requirePage("dashboard.view");
  return (
    <>
      <div className="a-top">
        <div>
          <h1>My account</h1>
          <p>
            Signed in as {user.username}, {roleLabels[user.role]}.
          </p>
        </div>
      </div>
      <AccountForms name={user.name} email={user.email || ""} />
    </>
  );
}
