"use client";

import { useEffect, useState } from "react";

type Person = {
  id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
};

export default function TeamTable({ currentUserId }: { currentUserId: string }) {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/admin/team");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json = await res.json();
      setPeople(json.people ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(person: Person) {
    setPendingId(person.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: person.id, isAdmin: !person.is_admin }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `Failed (${res.status})`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPendingId(null);
    }
  }

  if (error && !people) {
    return <p className="font-sans text-sm text-copper">{error}</p>;
  }
  if (!people) {
    return <p className="font-sans text-sm text-thistle-green">Loading…</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="text-left">
            <th className="border-b border-cream-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">
              Name
            </th>
            <th className="border-b border-cream-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">
              Email
            </th>
            <th className="border-b border-cream-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">
              Admin access
            </th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id} className="hover:bg-cream-2/60">
              <td className="border-b border-cream-2 px-5 py-3 text-brown">
                {p.full_name || "—"}
                {p.id === currentUserId && <span className="ml-1.5 text-thistle-green">(you)</span>}
              </td>
              <td className="border-b border-cream-2 px-5 py-3 text-brown">{p.email}</td>
              <td className="border-b border-cream-2 px-5 py-3">
                <button
                  onClick={() => toggle(p)}
                  disabled={pendingId === p.id || (p.id === currentUserId && p.is_admin)}
                  className="rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  style={
                    p.is_admin
                      ? { background: "rgba(99,153,34,0.12)", color: "#639922" }
                      : { background: "#F0EDE4", color: "#50482E" }
                  }
                  title={p.id === currentUserId && p.is_admin ? "You can't remove your own access" : undefined}
                >
                  {p.is_admin ? "Admin" : "Grant admin"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {people.length === 0 && (
        <p className="px-5 py-4 font-sans text-sm text-thistle-green">No accounts yet.</p>
      )}
      {error && <p className="px-5 py-3 font-sans text-sm text-copper">{error}</p>}
    </div>
  );
}
