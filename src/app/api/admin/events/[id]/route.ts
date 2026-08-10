import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: one event + its full RSVP list — /admin/gathering/[id].
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (!check.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, description, starts_at, location, capacity")
    .eq("id", id)
    .maybeSingle();
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: rsvps } = await supabase
    .from("event_rsvps")
    .select("id, full_name, email, phone, created_at")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ event, rsvps: rsvps ?? [] });
}

// DELETE: remove an event (and its RSVPs, via cascade).
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (!check.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
