import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin =
    cookieStore.get("tic_admin")?.value === process.env.ADMIN_PASSWORD;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: questions } = await supabase
    .from("questions")
    .select("question_text, created_at, user_id, video_id")
    .order("created_at", { ascending: false });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email");

  const { data: videos } = await supabase.from("videos").select("id, title");

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const videoMap = new Map((videos ?? []).map((v) => [v.id, v]));

  const rows = [
    ["Name", "Email", "Video", "Question", "Submitted at"],
    ...(questions ?? []).map((q) => {
      const profile = profileMap.get(q.user_id);
      const video = videoMap.get(q.video_id);
      return [
        profile?.full_name ?? "",
        profile?.email ?? "",
        video?.title ?? "",
        q.question_text,
        new Date(q.created_at).toISOString(),
      ];
    }),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tic-questions.csv"`,
    },
  });
}
