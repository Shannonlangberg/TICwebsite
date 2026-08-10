import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: everyone with an account, admin flag included — /admin/team.
export async function GET() {
  const check = await requireAdmin();
  if (!check.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, is_admin, created_at")
    .order("full_name", { ascending: true, nullsFirst: false });

  return NextResponse.json({ people: data ?? [] });
}

// POST { userId, isAdmin }: grant/revoke admin access for one person.
// Can't remove your own access — avoids a team locking itself out entirely.
export async function POST(request: NextRequest) {
  const check = await requireAdmin();
  if (!check.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : "";
  const isAdmin = body?.isAdmin === true;
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  if (userId === check.user.id && !isAdmin) {
    return NextResponse.json({ error: "You can't remove your own admin access" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
