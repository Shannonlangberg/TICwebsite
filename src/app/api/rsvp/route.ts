import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Public — no login required, mirrors how the old PCO registration page
// worked. Goes through service_role (event_rsvps has no client-side RLS
// policy, same convention as settings/events) so capacity can be enforced
// server-side rather than trusted from the client.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const eventId = typeof body?.eventId === "string" ? body.eventId : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!eventId || !fullName || !email) {
    return NextResponse.json({ ok: false, error: "Name and email are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, capacity")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });

  if (event.capacity != null) {
    const { count } = await admin
      .from("event_rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId);
    if ((count ?? 0) >= event.capacity) {
      return NextResponse.json({ ok: false, error: "This event is at capacity" }, { status: 409 });
    }
  }

  // Attach the signed-in user, if any — best-effort, RSVP still works for
  // someone who isn't logged in (matches the old "no login needed" flow).
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // not signed in — fine
  }

  const { error } = await admin.from("event_rsvps").insert({
    event_id: eventId,
    user_id: userId,
    full_name: fullName,
    email,
    phone: phone || null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: false, error: "You're already registered for this event" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
