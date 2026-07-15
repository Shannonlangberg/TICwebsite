import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function VideosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, slug, order_index")
    .eq("published", true)
    .order("order_index");

  const { data: progress } = user
    ? await supabase
        .from("video_progress")
        .select("video_id, completed")
        .eq("user_id", user.id)
    : { data: [] };

  const completedIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.video_id)
  );

  return (
    <main className="flex-1 flex flex-col bg-copper text-thistle-green px-6 py-12 md:px-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-4xl md:text-5xl">TIC videos</h1>
        <Link href="/gathering" className="font-sans underline text-sm">
          TIC Gathering →
        </Link>
      </div>

      <ul className="flex flex-col gap-3 max-w-2xl">
        {(videos ?? []).map((video) => (
          <li key={video.id}>
            <Link
              href={`/videos/${video.slug}`}
              className="flex items-center justify-between rounded-xl bg-judge-gray/40 px-5 py-4 font-sans hover:bg-judge-gray/60 transition-colors"
            >
              <span>{video.title}</span>
              {completedIds.has(video.id) && (
                <span className="text-xs uppercase tracking-wide text-laser-lemon">
                  Watched
                </span>
              )}
            </Link>
          </li>
        ))}
        {(!videos || videos.length === 0) && (
          <p className="font-sans text-sm text-thistle-green/70">
            No videos published yet — check back soon.
          </p>
        )}
      </ul>
    </main>
  );
}
