"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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

  if (status === "sent") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-copper text-thistle-green text-center px-6 gap-4">
        <h1 className="font-display text-4xl">Check your inbox</h1>
        <p className="font-sans max-w-md">
          We've sent a verification link to <strong>{email}</strong>. Click it
          to finish setting up your account, then come back and log in.
        </p>
        <Link href="/login" className="font-sans underline">
          Back to login
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-copper text-thistle-green px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="font-display text-4xl mb-2">Sign up</h1>
        <label className="font-sans text-sm flex flex-col gap-1">
          Full name
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md px-3 py-2 text-judge-gray bg-thistle-green"
          />
        </label>
        <label className="font-sans text-sm flex flex-col gap-1">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md px-3 py-2 text-judge-gray bg-thistle-green"
          />
        </label>
        <label className="font-sans text-sm flex flex-col gap-1">
          Password
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md px-3 py-2 text-judge-gray bg-thistle-green"
          />
        </label>
        {error && <p className="text-laser-lemon text-sm font-sans">{error}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 rounded-full bg-orange px-8 py-3 font-sans font-semibold text-judge-gray hover:bg-laser-lemon transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "Signing up…" : "Sign up"}
        </button>
        <p className="font-sans text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
