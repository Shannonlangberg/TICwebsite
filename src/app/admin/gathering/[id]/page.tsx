import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSidebar } from "../../AdminSidebar";
import { NotAdmin } from "../../AdminGate";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const check = await requireAdmin();
  if (!check.signedIn) redirect(`/login?next=/admin/gathering/${params.id}`);
  if (!check.isAdmin) return <NotAdmin email={check.user.email} />;

  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, title, description, starts_at, location, capacity")
    .eq("id", params.id)
    .maybeSingle();

  const { data: rsvps } = await supabase
    .from("event_rsvps")
    .select("id, full_name, email, phone, created_at")
    .eq("event_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex min-h-full flex-1 bg-cream">
      <AdminSidebar active="/admin/gathering" />
      <main className="flex-1 px-10 py-9">
        <Link
          href="/admin/gathering"
          className="mb-5 inline-flex items-center gap-1.5 font-sans text-sm text-thistle-green hover:text-copper"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Gathering
        </Link>

        {!event ? (
          <p className="font-sans text-sm text-copper">Event not found.</p>
        ) : (
          <>
            <div className="mb-7">
              <p className="label-caps mb-1.5">
                {rsvps?.length ?? 0}{event.capacity ? ` / ${event.capacity}` : ""} registered
              </p>
              <h1 className="font-display text-[28px] text-midnight">{event.title}</h1>
              <p className="mt-1.5 font-sans text-sm text-thistle-green">
                {new Date(event.starts_at).toLocaleString("en-AU", {
                  weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true,
                })}
                {event.location && <> · {event.location}</>}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
              <table className="w-full border-collapse font-sans text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="border-b border-cream-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">Name</th>
                    <th className="border-b border-cream-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">Email</th>
                    <th className="border-b border-cream-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">Phone</th>
                    <th className="border-b border-cream-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">RSVP&rsquo;d</th>
                  </tr>
                </thead>
                <tbody>
                  {(rsvps ?? []).map((r) => (
                    <tr key={r.id} className="hover:bg-cream-2/60">
                      <td className="border-b border-cream-2 px-5 py-3 text-brown">{r.full_name}</td>
                      <td className="border-b border-cream-2 px-5 py-3 text-brown">{r.email}</td>
                      <td className="border-b border-cream-2 px-5 py-3 text-brown">{r.phone || "—"}</td>
                      <td className="border-b border-cream-2 px-5 py-3 text-brown">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!rsvps || rsvps.length === 0) && (
                <p className="px-5 py-4 font-sans text-sm text-thistle-green">No one&rsquo;s registered yet.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
