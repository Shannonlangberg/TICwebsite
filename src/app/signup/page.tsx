"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  const Logo = (
    <Link href="/" className="flex items-center gap-2.5">
      <Image src="/brand/Futures1.png" alt="Futures Church" width={90} height={20} className="h-6 w-auto" />
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
