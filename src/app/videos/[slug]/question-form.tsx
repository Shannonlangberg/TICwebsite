"use client";

import { useState } from "react";
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
    const supabase = createClient();
    await supabase.from("video_progress").upsert({
      user_id: userId,
      video_id: videoId,
      completed: true,
      completed_at: new Date().toISOString(),
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <button
        onClick={markWatched}
        className="self-start rounded-full bg-orange px-6 py-2 font-sans text-sm font-semibold text-judge-gray hover:bg-laser-lemon transition-colors"
      >
        Mark as watched
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="font-sans text-sm">
          Got a question from this session? It goes straight to the team —
          only you and the admins can see it.
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          className="rounded-md px-3 py-2 text-judge-gray bg-thistle-green font-sans"
          placeholder="Type your question here…"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="self-start rounded-full bg-thistle-green px-6 py-2 font-sans text-sm font-semibold text-judge-gray hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {status === "saving" ? "Sending…" : "Submit question"}
        </button>
        {status === "saved" && (
          <p className="font-sans text-sm text-laser-lemon">
            Thanks — your question's been sent through.
          </p>
        )}
        {status === "error" && (
          <p className="font-sans text-sm text-laser-lemon">
            Something went wrong — try again.
          </p>
        )}
      </form>
    </div>
  );
}
