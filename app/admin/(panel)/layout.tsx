import { can, requirePage, roleLabels } from "@/lib/server/auth";
import { one } from "@/lib/server/db";
import { logoutAction } from "../actions/auth";
import { CsrfProvider, DeletedNotice, Sidebar, type NavItem } from "../ui";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage("dashboard.view");
  const newCount = can(user, "enquiries.manage")
    ? Number((await one<{ n: string }>(`SELECT count(*) AS n FROM enquiries WHERE status = 'new'`))?.n || 0)
    : 0;

  const all: (NavItem & { show: boolean })[] = [
    { href: "/admin", label: "Dashboard", icon: "dashboard", show: true },
    { href: "/admin/enquiries", label: "Enquiries", icon: "enquiries", count: newCount, show: can(user, "enquiries.manage") },
    { href: "/admin/pages", label: "Pages", icon: "pages", show: can(user, "pages.edit") },
    { href: "/admin/insights", label: "Insights", icon: "insights", show: can(user, "posts.own") },
    { href: "/admin/programmes", label: "Programmes", icon: "programmes", show: can(user, "programmes.edit") },
    { href: "/admin/faculty", label: "Faculty", icon: "faculty", show: can(user, "faculty.edit") },
    { href: "/admin/media", label: "Media library", icon: "media", show: can(user, "media.upload") },
    { href: "/admin/seo", label: "SEO", icon: "seo", show: can(user, "seo.edit"), sep: true },
    { href: "/admin/settings", label: "Settings", icon: "settings", show: can(user, "settings.edit") },
    { href: "/admin/users", label: "Users", icon: "users", show: can(user, "users.manage") },
    { href: "/admin/activity", label: "Activity", icon: "activity", show: can(user, "activity.view") },
  ];
  const items = all.filter((i) => i.show).map(({ show: _show, ...rest }) => rest);

  return (
    <CsrfProvider token={user.csrf}>
      <div className="a-shell">
        <Sidebar items={items} user={{ name: user.name, username: user.username }} roleLabel={roleLabels[user.role]} logout={logoutAction} />
        <main className="a-main">
          <DeletedNotice />
          {children}
        </main>
      </div>
    </CsrfProvider>
  );
}
