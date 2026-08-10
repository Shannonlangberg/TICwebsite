"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function RsvpForm({ eventId }: { eventId: string }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  // Pre-fill from the signed-in profile, if any — one less thing to type
  // for someone who's already done the videos.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setFullName(profile.full_name ?? "");
        setEmail(profile.email ?? "");
        setPhone(profile.phone ?? "");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, fullName, email, phone: phone || undefined }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Something went wrong — try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong — try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <p className="font-display text-[22px] text-midnight">You&rsquo;re in.</p>
        <p className="mt-1 font-sans text-sm text-brown">We&rsquo;ll see you there.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="font-display text-[20px] text-midnight">Reserve your spot</p>
      <label className="flex flex-col gap-1 font-sans text-sm text-brown">
        Full name
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
        />
      </label>
      <label className="flex flex-col gap-1 font-sans text-sm text-brown">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
        />
      </label>
      <label className="flex flex-col gap-1 font-sans text-sm text-brown">
        Phone (optional)
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="04xx xxx xxx"
          className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
        />
      </label>
      {error && <p className="font-sans text-sm text-copper">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 rounded-full bg-copper px-8 py-3 font-sans font-semibold text-white transition-colors hover:bg-copper/90 disabled:opacity-60"
      >
        {status === "loading" ? "Reserving…" : "Reserve my spot"}
      </button>
    </form>
  );
}
