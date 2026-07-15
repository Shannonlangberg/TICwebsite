"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function QuestionForm({
  videoId,
  userId,
}: {
  videoId: string;
  userId: string;
}) {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [watched, setWatched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setStatus("saving");

    const supabase = createClient();
    const { error } = await supabase.from("questions").insert({
      user_id: userId,
      video_id: videoId,
      question_text: question.trim(),
    });

    if (error) {
      setStatus("error");
      return;
    }

    setQuestion("");
    setStatus("saved");
  }

  async function markWatched() {
    setWatched(true);
    const supabase = createClient();
    await supabase.from("video_progress").upsert({
      user_id: userId,
      video_id: videoId,
      completed: true,
      completed_at: new Date().toISOString(),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <button
        onClick={markWatched}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-judge-gray/20 px-5 py-2 font-sans text-sm font-medium text-midnight transition-colors hover:bg-cream-2"
      >
        <Check className="h-3.5 w-3.5" />
        {watched ? "Marked as watched" : "Mark as watched"}
      </button>

      <div className="rounded-xl bg-white p-7 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
        <p className="label-caps mb-2.5">Got a question?</p>
        <p className="mb-4 font-sans text-sm text-brown">
          It goes straight to the team — only you and the admins can see it.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="Type your question here…"
            className="rounded-lg border border-cream-2 bg-white px-3 py-2.5 font-sans text-sm text-midnight placeholder:text-thistle-green focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-fit rounded-full bg-copper px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-copper/90 disabled:opacity-60"
          >
            {status === "saving" ? "Sending…" : "Submit question"}
          </button>
          {status === "saved" && (
            <p className="font-sans text-sm text-olive">
              Thanks — your question&rsquo;s been sent through.
            </p>
          )}
          {status === "error" && (
            <p className="font-sans text-sm text-copper">
              Something went wrong — try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
