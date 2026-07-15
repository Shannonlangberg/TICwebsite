import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
    <main className="flex-1 flex flex-col bg-copper text-thistle-green px-6 py-12 md:px-16">
      <Link href="/videos" className="font-sans text-sm underline mb-6">
        ← All videos
      </Link>
      <h1 className="font-display text-4xl md:text-5xl mb-6">
        {video.title}
      </h1>

      <div className="max-w-3xl aspect-video mb-8">
        <iframe
          src={embedSrc}
          className="w-full h-full rounded-xl"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {video.description && (
        <p className="font-sans max-w-2xl mb-8 text-thistle-green/90">
          {video.description}
        </p>
      )}

      {user ? (
        <QuestionForm videoId={video.id} userId={user.id} />
      ) : (
        <p className="font-sans text-sm">
          <Link href="/login" className="underline">
            Log in
          </Link>{" "}
          to submit a question.
        </p>
      )}
    </main>
  );
}
