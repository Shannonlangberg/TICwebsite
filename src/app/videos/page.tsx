import Link from "next/link";
import { ArrowRight, Check, Play, Lock, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SiteNav from "../components/site-nav";
import SiteFooter from "../components/site-footer";

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
  const list = videos ?? [];
  const doneCount = list.filter((v) => completedIds.has(v.id)).length;
  const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0;
  const nextIndex = list.findIndex((v) => !completedIds.has(v.id));

  return (
    <main className="flex-1 flex flex-col bg-cream">
      <SiteNav active="videos" />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-caps mb-2">Your progress</p>
            <h1 className="font-display text-[42px] text-midnight">TIC Videos</h1>
          </div>
          <Link
            href="/gathering"
            className="flex items-center gap-1 font-sans text-sm text-brown hover:text-copper transition-colors"
          >
            TIC Gathering <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="mb-9 mt-2 max-w-lg font-sans text-brown">
          Nine sessions — work through them in order, at your own pace.
          You&rsquo;re {doneCount} of {list.length || 9} done.
        </p>

        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-cream-2">
          <div
            className="h-full rounded-full bg-copper"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ul className="flex flex-col gap-3">
          {list.length === 0 && (
            <p className="font-sans text-sm text-thistle-green">
              No videos published yet — check back soon.
            </p>
          )}
          {list.map((video, i) => {
            const done = completedIds.has(video.id);
            const isNext = i === nextIndex;
            return (
              <li key={video.id}>
                <Link
                  href={`/videos/${video.slug}`}
                  className={`flex items-center gap-4 rounded-xl bg-white px-5 py-4.5 shadow-[0_1px_5px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] ${
                    isNext ? "border-l-[3px] border-copper" : ""
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-wash-mint" : isNext ? "bg-wash-sky" : "bg-cream-2"
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4 text-olive" />
                    ) : isNext ? (
                      <Play className="h-4 w-4 text-teal" />
                    ) : (
                      <Lock className="h-4 w-4 text-thistle-green" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-[11px] text-thistle-green">
                      SESSION {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="font-sans font-semibold text-midnight">
                      {video.title}
                    </p>
                  </div>
                  {done && <span className="label-caps !text-olive">Watched</span>}
                  {isNext && <span className="label-caps">Up next</span>}
                  <ChevronRight className="h-4.5 w-4.5 text-thistle-green" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <SiteFooter />
    </main>
  );
}
