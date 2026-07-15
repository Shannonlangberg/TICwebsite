import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Film,
  Calendar,
  LogOut,
  Download,
} from "lucide-react";
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
    .select(
      "id, full_name, email, created_at, is_new_christian, pco_campus_name, pco_person_id"
    )
    .order("created_at", { ascending: false });

  const { data: progress } = await supabase
    .from("video_progress")
    .select("user_id, completed")
    .eq("completed", true);

  const { data: videos } = await supabase.from("videos").select("id");
  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const totalVideos = videos?.length ?? 0;
  const progressByUser = new Map<string, number>();
  (progress ?? []).forEach((p) => {
    progressByUser.set(p.user_id, (progressByUser.get(p.user_id) ?? 0) + 1);
  });

  const signupCount = profiles?.length ?? 0;
  const completedCount = [...progressByUser.values()].filter(
    (n) => n === totalVideos && totalVideos > 0
  ).length;
  const avgWatched = signupCount
    ? (
        [...progressByUser.values()].reduce((a, b) => a + b, 0) / signupCount
      ).toFixed(1)
    : "0";

  return (
    <div className="flex min-h-full flex-1 bg-cream">
      <aside className="flex w-56 flex-shrink-0 flex-col gap-6 bg-midnight px-3.5 py-6">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <Image
            src="/brand/Futures1white.png"
            alt="Futures Church"
            width={80}
            height={18}
            className="h-[18px] w-auto"
          />
          <span
            className="text-[#F4F1E6]"
            style={{ fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}
          >
            TIC Admin
          </span>
        </Link>
        <nav className="flex flex-col gap-0.5">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-lg border-l-2 border-copper bg-copper/15 px-3.5 py-2.5 pl-3 font-sans text-sm text-[#F4F1E6]"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            href="/videos"
            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-sans text-sm text-[#F4F1E6]/65 transition-colors hover:bg-white/5 hover:text-[#F4F1E6]"
          >
            <Film className="h-4 w-4" /> Sessions
          </Link>
          <Link
            href="/gathering"
            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-sans text-sm text-[#F4F1E6]/65 transition-colors hover:bg-white/5 hover:text-[#F4F1E6]"
          >
            <Calendar className="h-4 w-4" /> Gathering
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-sans text-sm text-[#F4F1E6]/65 transition-colors hover:bg-white/5 hover:text-[#F4F1E6]"
          >
            <LogOut className="h-4 w-4" /> Exit admin
          </Link>
        </nav>
      </aside>

      <main className="flex-1 px-10 py-9">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-caps mb-1.5">TIC Platform</p>
            <h1 className="font-display text-[28px] text-midnight">Dashboard</h1>
          </div>
          <a
            href="/api/admin/questions.csv"
            className="inline-flex items-center gap-2 rounded-lg bg-copper px-5 py-2.5 font-sans text-[13px] font-medium text-white transition-colors hover:bg-copper/90"
          >
            <Download className="h-3.5 w-3.5" /> Export questions (CSV)
          </a>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <p className="label-caps mb-2">Signed up</p>
            <p className="font-mono text-[28px] text-midnight">{signupCount}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <p className="label-caps mb-2 !text-olive">Completed course</p>
            <p className="font-mono text-[28px] text-midnight">{completedCount}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <p className="label-caps mb-2 !text-teal">Avg. sessions watched</p>
            <p className="font-mono text-[28px] text-midnight">
              {avgWatched} / {totalVideos || 6}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <p className="label-caps mb-2 !text-gold">Questions</p>
            <p className="font-mono text-[28px] text-midnight">{questions?.length ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <div className="border-b border-cream-2 px-5 py-4.5">
              <p className="label-caps">Sign-ups</p>
            </div>
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green border-b border-cream-2">
                    Name
                  </th>
                  <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green border-b border-cream-2">
                    Email
                  </th>
                  <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green border-b border-cream-2">
                    Signed up
                  </th>
                  <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green border-b border-cream-2">
                    Videos watched
                  </th>
                  <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green border-b border-cream-2">
                    New to Futures?
                  </th>
                </tr>
              </thead>
              <tbody>
                {(profiles ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-cream-2/60">
                    <td className="border-b border-cream-2 px-5 py-3 text-brown">
                      {p.full_name || "—"}
                    </td>
                    <td className="border-b border-cream-2 px-5 py-3 text-brown">
                      {p.email}
                    </td>
                    <td className="border-b border-cream-2 px-5 py-3 text-brown">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="border-b border-cream-2 px-5 py-3 text-brown">
                      {progressByUser.get(p.id) ?? 0} / {totalVideos}
                    </td>
                    <td className="border-b border-cream-2 px-5 py-3 text-brown">
                      {p.is_new_christian ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="label-caps !text-olive">Yes</span>
                          {p.pco_campus_name && (
                            <span className="text-thistle-green">— {p.pco_campus_name}</span>
                          )}
                          {!p.pco_person_id && (
                            <span title="Not yet synced to Planning Center" className="text-copper">
                              (unsynced)
                            </span>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!profiles || profiles.length === 0) && (
              <p className="px-5 py-4 font-sans text-sm text-thistle-green">
                No sign-ups yet.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3.5 rounded-xl bg-white p-5 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <p className="label-caps">Recent questions</p>
            <div className="flex flex-col gap-3">
              {(questions ?? []).map((q: any) => (
                <div key={q.id} className="border-b border-cream-2 pb-3 last:border-0 last:pb-0">
                  <p className="mb-1 font-sans text-[13px] text-brown">
                    &ldquo;{q.question_text}&rdquo;
                  </p>
                  <p className="font-mono text-[11px] text-thistle-green">
                    {q.profiles?.full_name ?? "Anonymous"}
                  </p>
                </div>
              ))}
              {(!questions || questions.length === 0) && (
                <p className="font-sans text-sm text-thistle-green">
                  No questions yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
