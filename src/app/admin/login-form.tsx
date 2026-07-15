"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Wrong password");
      return;
    }

    router.refresh();
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 bg-cream px-6 py-16">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/brand/Futures2.png" alt="Futures Church" width={202} height={20} className="h-6 w-auto" />
        <span style={{ fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700, letterSpacing: 2 }} className="text-brown">
          TIC Admin
        </span>
      </Link>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow-[0_1px_5px_rgba(0,0,0,0.06)]"
      >
        <h1 className="font-display text-[28px] text-midnight">Admin</h1>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="rounded-lg border border-cream-2 px-3 py-2.5 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
        />
        {error && <p className="font-sans text-sm text-copper">{error}</p>}
        <button
          type="submit"
          className="rounded-full bg-copper px-8 py-3 font-sans font-semibold text-white transition-colors hover:bg-copper/90"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
