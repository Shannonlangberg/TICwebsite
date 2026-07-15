"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="flex-1 flex flex-col items-center justify-center bg-copper text-thistle-green px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="font-display text-4xl mb-2">Admin</h1>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="rounded-md px-3 py-2 text-judge-gray bg-thistle-green"
        />
        {error && <p className="text-laser-lemon text-sm font-sans">{error}</p>}
        <button
          type="submit"
          className="rounded-full bg-orange px-8 py-3 font-sans font-semibold text-judge-gray hover:bg-laser-lemon transition-colors"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
