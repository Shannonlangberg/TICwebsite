import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: all events (newest-starting first), with an RSVP count per event —
// admin list for /admin/gathering.
export async function GET() {
  const check = await requireAdmin();
  if (!check.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, starts_at, location, capacity, created_at")
    .order("starts_at", { ascending: false });

  const { data: rsvps } = await supabase.from("event_rsvps").select("event_id");
  const countByEvent = new Map<string, number>();
  (rsvps ?? []).forEach((r) => {
    countByEvent.set(r.event_id, (countByEvent.get(r.event_id) ?? 0) + 1);
  });

  return NextResponse.json({
    events: (events ?? []).map((e) => ({ ...e, rsvpCount: countByEvent.get(e.id) ?? 0 })),
  });
}

// POST { title, description?, startsAt, location?, capacity? }: create a new event.
export async function POST(request: NextRequest) {
  const check = await requireAdmin();
  if (!check.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const startsAt = typeof body?.startsAt === "string" ? body.startsAt : "";
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!startsAt || Number.isNaN(new Date(startsAt).getTime())) {
    return NextResponse.json({ error: "startsAt must be a valid date/time" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      description: body?.description || null,
      starts_at: startsAt,
      location: body?.location || null,
      capacity: body?.capacity ? Number(body.capacity) : null,
      created_by: check.user.id,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
