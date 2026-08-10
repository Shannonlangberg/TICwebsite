import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "../AdminSidebar";
import { NotAdmin } from "../AdminGate";
import TeamTable from "./TeamTable";

export default async function AdminTeamPage() {
  const check = await requireAdmin();
  if (!check.signedIn) redirect("/login?next=/admin/team");
  if (!check.isAdmin) return <NotAdmin email={check.user.email} />;

  return (
    <div className="flex min-h-full flex-1 bg-cream">
      <AdminSidebar active="/admin/team" />
      <main className="flex-1 px-10 py-9">
        <div className="mb-7">
          <p className="label-caps mb-1.5">TIC Platform</p>
          <h1 className="font-display text-[28px] text-midnight">Team</h1>
          <p className="mt-1.5 font-sans text-sm text-thistle-green">
            Anyone with an account can be given admin access here — no shared password anymore,
            each person signs in with their own login.
          </p>
        </div>
        <TeamTable currentUserId={check.user.id} />
      </main>
    </div>
  );
}
