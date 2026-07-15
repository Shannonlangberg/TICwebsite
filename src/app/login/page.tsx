"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/videos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 bg-cream px-6 py-16">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/brand/Futures2.png" alt="Futures Church" width={202} height={20} className="h-6 w-auto" />
        <span style={{ fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700, letterSpacing: 2 }} className="text-brown">
          TIC
        </span>
      </Link>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow-[0_1px_5px_rgba(0,0,0,0.06)]"
      >
        <h1 className="font-display text-[28px] text-midnight">Log in</h1>
        <p className="-mt-2 mb-1 font-sans text-[13px] text-brown">Good to see you again.</p>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
        </label>
        {error && <p className="font-sans text-sm text-copper">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 rounded-full bg-copper px-8 py-3 font-sans font-semibold text-white transition-colors hover:bg-copper/90 disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-center font-sans text-sm text-brown">
          Need an account?{" "}
          <Link href="/signup" className="text-copper underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
