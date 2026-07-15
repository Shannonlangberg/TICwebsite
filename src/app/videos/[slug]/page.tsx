import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SiteNav from "../../components/site-nav";
import SiteFooter from "../../components/site-footer";
import QuestionForm from "./question-form";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: video } = await supabase
    .from("videos")
    .select("id, title, description, vimeo_id, vimeo_hash")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!video) notFound();

  const embedSrc = video.vimeo_hash
    ? `https://player.vimeo.com/video/${video.vimeo_id}?h=${video.vimeo_hash}`
    : `https://player.vimeo.com/video/${video.vimeo_id}`;

  return (
    <main className="flex-1 flex flex-col bg-cream">
      <SiteNav active="videos" />

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Link
          href="/videos"
          className="mb-5 inline-flex items-center gap-1.5 font-sans text-sm text-brown hover:text-copper transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All videos
        </Link>
        <h1 className="mb-6 font-display text-[42px] text-midnight">
          {video.title}
        </h1>

        <div className="mb-7 flex aspect-video items-center justify-center rounded-xl bg-midnight shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
          {/* Real embed */}
          <iframe
            src={embedSrc}
            className="h-full w-full rounded-xl"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>

        {video.description && (
          <p className="mb-7 max-w-xl font-sans text-brown/90">
            {video.description}
          </p>
        )}

        {user ? (
          <QuestionForm videoId={video.id} userId={user.id} />
        ) : (
          <p className="font-sans text-sm text-brown">
            <Link href="/login" className="text-copper underline">
              Log in
            </Link>{" "}
            to submit a question.
          </p>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
