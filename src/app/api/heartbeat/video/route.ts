import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendToHeartbeat } from "@/lib/heartbeat";

// Forwards a video completion to Heartbeat's tic-webhook.
//
// Identity comes from the signed-in session — the request body only names
// the video, so a user can only ever report their own progress. The shared
// webhook secret stays server-side in sendToHeartbeat.
//
// Body: { videoId: uuid }
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.videoId) {
    return NextResponse.json({ ok: false, error: "Missing videoId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [{ data: profile }, { data: video }, { count: total }] = await Promise.all([
    admin
      .from("profiles")
      .select("full_name, email, phone, gender, pco_person_id, pco_campus_name, is_new_christian")
      .eq("id", user.id)
      .maybeSingle(),
    admin
      .from("videos")
      .select("title, order_index")
      .eq("id", body.videoId)
      .maybeSingle(),
    admin
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
  ]);

  if (!profile || !video) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const [firstName, ...rest] = (profile.full_name ?? "").trim().split(" ");

  await sendToHeartbeat(
    "video_progress",
    {
      first_name: firstName || profile.full_name || "Unknown",
      last_name: rest.join(" ") || null,
      email: profile.email ?? user.email ?? null,
      phone: profile.phone ?? null,
      gender: profile.gender ?? null,
      pco_person_id: profile.pco_person_id ?? null,
      campus_name: profile.pco_campus_name ?? null,
      is_new_christian: profile.is_new_christian ?? false,
    },
    {
      title: video.title,
      order_index: video.order_index,
      total: total ?? 0,
      completed: true,
    }
  );

  return NextResponse.json({ ok: true });
}
