import { NextResponse, type NextRequest } from "next/server";
import { syncNewChristian } from "@/lib/pco";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendToHeartbeat } from "@/lib/heartbeat";

// Called right after every successful Supabase sign-up.
//
// 1. PCO sync (new Christians only for now — the membership label written is
//    "New Christian", so non-NC signups skip PCO and get matched later via
//    Heartbeat's own PCO link).
// 2. Heartbeat webhook (everyone) — converges the TIC signup onto their
//    Heartbeat person record: TIC-enrolled milestone, pathway nudge, and
//    dedupe against QR/Sunday captures.
//
// Non-fatal by design: if PCO or Heartbeat is unavailable, we still return
// 200 so the sign-up flow itself never breaks — the profile row already has
// is_new_christian / campus stored from the sign-up form as a fallback, and
// this can be retried/backfilled later.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.userId || !body?.firstName || !body?.email) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const { userId, firstName, lastName, email, phone, gender, campusId, campusName } = body;
  const isNewChristian = body.isNewChristian === true;

  let pcoPersonId: string | null = null;
  let pcoResult: unknown = { ok: false, skipped: true };

  if (isNewChristian) {
    const result = await syncNewChristian({
      firstName,
      lastName: lastName || "",
      email,
      phone: phone || null,
      gender: gender || null,
      campusId: campusId || null,
    });
    pcoResult = result;

    if (result.ok) {
      pcoPersonId = result.personId;
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
  }

  // Heartbeat — everyone, fire-and-forget semantics but awaited so the
  // serverless function doesn't get frozen mid-request.
  await sendToHeartbeat("signup", {
    first_name: firstName,
    last_name: lastName || null,
    email,
    phone: phone || null,
    gender: gender || null,
    pco_person_id: pcoPersonId,
    campus_name: campusName || null,
    is_new_christian: isNewChristian,
  });

  return NextResponse.json({ ok: true, pco: pcoResult });
}
