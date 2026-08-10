"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

type Campus = { id: string; name: string };

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isNewChristian, setIsNewChristian] = useState(false);
  const [gender, setGender] = useState("");
  const [campusId, setCampusId] = useState("");
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNewChristian || campuses.length > 0) return;
    fetch("/api/pco/campuses")
      .then((r) => r.json())
      .then((data) => setCampuses(data.campuses ?? []))
      .catch(() => setCampuses([]));
  }, [isNewChristian, campuses.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const campusName = campuses.find((c) => c.id === campusId)?.name ?? "";

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
          is_new_christian: isNewChristian,
          gender: isNewChristian ? gender || null : null,
          pco_campus_id: isNewChristian ? campusId || null : null,
          pco_campus_name: isNewChristian ? campusName || null : null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setStatus("error");
      return;
    }

    // Sync every sign-up to Heartbeat — best-effort, never blocks the sign-up
    // flow if it fails. No longer pushes to Planning Center (dropped
    // 2026-08-10 — TIC signups stay local + Heartbeat only now).
    if (data.user) {
      const [firstName, ...rest] = fullName.trim().split(" ");
      fetch("/api/signup/sync-heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName || fullName,
          lastName: rest.join(" ") || "",
          email,
          phone: phone || null,
          gender: gender || null,
          campusName: campusName || null,
          isNewChristian,
        }),
      }).catch(() => null);
    }

    setStatus("sent");
  }

  const Logo = (
    <Link href="/" className="flex items-center gap-2.5">
      <Image src="/brand/Futures2.png" alt="Futures Church" width={202} height={20} className="h-6 w-auto" />
      <span style={{ fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700, letterSpacing: 2 }} className="text-brown">
        TIC
      </span>
    </Link>
  );

  if (status === "sent") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-10 bg-cream px-6 py-16">
        {Logo}
        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl bg-white p-9 text-center shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
          <h1 className="font-display text-[28px] text-midnight">Check your inbox</h1>
          <p className="font-sans text-brown">
            We&rsquo;ve sent a verification link to <strong>{email}</strong>.
            Click it to finish setting up your account, then come back and
            log in.
          </p>
          <Link href="/login" className="font-sans text-sm text-copper underline">
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 bg-cream px-6 py-16">
      {Logo}
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow-[0_1px_5px_rgba(0,0,0,0.06)]"
      >
        <h1 className="font-display text-[28px] text-midnight">Sign up</h1>
        <p className="-mt-2 mb-1 font-sans text-[13px] text-brown">
          Create your account to start the course.
        </p>

        <label className="flex flex-col gap-1.5 font-sans text-sm text-brown">
          Full name
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 font-sans text-sm text-brown">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 font-sans text-sm text-brown">
          Phone
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="04xx xxx xxx"
            className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 font-sans text-sm text-brown">
          Password
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
        </label>

        <label className="flex items-start gap-2.5 font-sans text-sm text-brown">
          <input
            type="checkbox"
            checked={isNewChristian}
            onChange={(e) => setIsNewChristian(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-cream-2"
          />
          <span>I&rsquo;m new to Futures Church / new to following Jesus.</span>
        </label>

        {isNewChristian && (
          <>
            <label className="flex flex-col gap-1.5 font-sans text-sm text-brown">
              Which campus?
              <select
                required
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="rounded-lg border border-cream-2 bg-white px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
              >
                <option value="" disabled>
                  {campuses.length ? "Select a campus" : "Loading campuses…"}
                </option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 font-sans text-sm text-brown">
              Gender
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="rounded-lg border border-cream-2 bg-white px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </>
        )}

        {error && <p className="font-sans text-sm text-copper">{error}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-1.5 rounded-full bg-copper px-8 py-3 font-sans font-semibold text-white transition-colors hover:bg-copper/90 disabled:opacity-60"
        >
          {status === "loading" ? "Signing up…" : "Sign up"}
        </button>
        <p className="text-center font-sans text-sm text-brown">
          Already have an account?{" "}
          <Link href="/login" className="text-copper underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
