import { NextResponse, type NextRequest } from "next/server";
import { sendToHeartbeat } from "@/lib/heartbeat";

// Called right after every successful Supabase sign-up.
//
// TIC no longer pushes signups to Planning Center (dropped 2026-08-10 —
// was: syncNewChristian in src/lib/pco.ts, called from here). This route now
// only does one thing: forward the signup to Heartbeat's tic-webhook so the
// person's discipleship record stays unified (TIC-enrolled milestone,
// pathway nudge, dedupe against QR/Sunday captures).
//
// Non-fatal by design: if Heartbeat is unavailable, we still return 200 so
// the sign-up flow itself never breaks.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.firstName || !body?.email) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, gender, campusName } = body;
  const isNewChristian = body.isNewChristian === true;

  await sendToHeartbeat("signup", {
    first_name: firstName,
    last_name: lastName || null,
    email,
    phone: phone || null,
    gender: gender || null,
    pco_person_id: null,
    campus_name: campusName || null,
    is_new_christian: isNewChristian,
  });

  return NextResponse.json({ ok: true });
}
