import { NextResponse, type NextRequest } from "next/server";
import { syncNewChristian } from "@/lib/pco";
import { createAdminClient } from "@/lib/supabase/admin";

// Called right after a successful Supabase sign-up when the user checked
// "I'm new to Futures". Creates/updates their PCO Person record (name,
// email, phone, campus, membership = "New Christian") and records the
// PCO person id back on their profile row for reference.
//
// Non-fatal by design: if PCO isn't configured yet, or the call fails, we
// still return 200 so the sign-up flow itself never breaks — the profile
// row already has is_new_christian / campus stored from the sign-up form
// as a fallback, and this can be retried/backfilled later.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.userId || !body?.firstName || !body?.lastName || !body?.email) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const { userId, firstName, lastName, email, phone, campusId, campusName } = body;

  const result = await syncNewChristian({
    firstName,
    lastName,
    email,
    phone: phone || null,
    campusId: campusId || null,
  });

  if (result.ok) {
    const supabase = createAdminClient();
    await supabase
      .from("profiles")
      .update({
        pco_person_id: result.personId,
        pco_campus_id: campusId || null,
        pco_campus_name: campusName || null,
        pco_synced_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  return NextResponse.json({ ok: true, pco: result });
}
