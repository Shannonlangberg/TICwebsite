import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminLoginForm from "./login-form";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin =
    cookieStore.get("tic_admin")?.value === process.env.ADMIN_PASSWORD;

  if (!isAdmin) {
    return <AdminLoginForm />;
  }

  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false });

  const { data: progress } = await supabase
    .from("video_progress")
    .select("user_id, completed")
    .eq("completed", true);

  const { data: videos } = await supabase.from("videos").select("id");

  const totalVideos = videos?.length ?? 0;
  const progressByUser = new Map<string, number>();
  (progress ?? []).forEach((p) => {
    progressByUser.set(p.user_id, (progressByUser.get(p.user_id) ?? 0) + 1);
  });

  return (
    <main className="flex-1 flex flex-col bg-copper text-thistle-green px-6 py-12 md:px-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Admin</h1>
        <a
          href="/api/admin/questions.csv"
          className="rounded-full bg-orange px-6 py-2 font-sans text-sm font-semibold text-judge-gray hover:bg-laser-lemon transition-colors"
        >
          Download all questions (CSV)
        </a>
      </div>

      <table className="font-sans text-sm w-full max-w-3xl border-collapse">
        <thead>
          <tr className="text-left border-b border-thistle-green/40">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Signed up</th>
            <th className="py-2 pr-4">Videos watched</th>
          </tr>
        </thead>
        <tbody>
          {(profiles ?? []).map((p) => (
            <tr key={p.id} className="border-b border-thistle-green/10">
              <td className="py-2 pr-4">{p.full_name || "—"}</td>
              <td className="py-2 pr-4">{p.email}</td>
              <td className="py-2 pr-4">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
              <td className="py-2 pr-4">
                {progressByUser.get(p.id) ?? 0} / {totalVideos}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(!profiles || profiles.length === 0) && (
        <p className="font-sans text-sm mt-4 text-thistle-green/70">
          No sign-ups yet.
        </p>
      )}
    </main>
  );
}
