"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  location: string | null;
  capacity: number | null;
  rsvpCount: number;
};

function formatStarts(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Australia/Adelaide",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function EventsPanel() {
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json = await res.json();
      setEvents(json.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
          location: location || undefined,
          capacity: capacity || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `Failed (${res.status})`);
      }
      setTitle("");
      setDescription("");
      setStartsAt("");
      setLocation("");
      setCapacity("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event and every RSVP for it?")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-white p-6 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps">Events</p>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg bg-copper px-4 py-2 font-sans text-[13px] font-medium text-white transition-colors hover:bg-copper/90"
          >
            {showForm ? "Cancel" : "New event"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-5 flex flex-col gap-3 rounded-lg bg-cream p-4">
            <label className="flex flex-col gap-1 font-sans text-sm text-brown">
              Title
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="TIC Gathering — August"
                className="rounded-lg border border-cream-2 bg-white px-3 py-2 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
              />
            </label>
            <label className="flex flex-col gap-1 font-sans text-sm text-brown">
              When
              <input
                required
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="rounded-lg border border-cream-2 bg-white px-3 py-2 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
              />
            </label>
            <label className="flex flex-col gap-1 font-sans text-sm text-brown">
              Location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Copper Coast Campus, 4716 Copper Coast Hwy, Kadina SA"
                className="rounded-lg border border-cream-2 bg-white px-3 py-2 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
              />
            </label>
            <label className="flex flex-col gap-1 font-sans text-sm text-brown">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="rounded-lg border border-cream-2 bg-white px-3 py-2 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
              />
            </label>
            <label className="flex flex-col gap-1 font-sans text-sm text-brown">
              Capacity (optional)
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="rounded-lg border border-cream-2 bg-white px-3 py-2 text-midnight focus:outline-none focus:ring-2 focus:ring-teal/20"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="self-start rounded-lg bg-copper px-5 py-2 font-sans text-[13px] font-medium text-white transition-colors hover:bg-copper/90 disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create event"}
            </button>
          </form>
        )}

        {error && <p className="mb-3 font-sans text-sm text-copper">{error}</p>}

        {!events ? (
          <p className="font-sans text-sm text-thistle-green">Loading…</p>
        ) : events.length === 0 ? (
          <p className="font-sans text-sm text-thistle-green">No events yet — create the first one above.</p>
        ) : (
          <div className="flex flex-col divide-y divide-cream-2">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/gathering/${ev.id}`} className="font-sans text-sm font-medium text-midnight hover:text-copper">
                    {ev.title}
                  </Link>
                  <p className="font-mono text-[11px] text-thistle-green">
                    {formatStarts(ev.starts_at)}
                    {ev.location && <> · {ev.location}</>}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <span className="font-sans text-xs text-thistle-green">
                    {ev.rsvpCount}{ev.capacity ? ` / ${ev.capacity}` : ""} registered
                  </span>
                  <Link
                    href={`/admin/gathering/${ev.id}`}
                    className="font-sans text-xs font-medium text-teal hover:underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="font-sans text-xs font-medium text-copper hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
