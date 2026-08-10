"use client";

import { useEffect, useState } from "react";

type PcoSignupSummary = {
  id: string;
  name: string;
  open: boolean;
  eventStartsAt: string | null;
};

type PcoSignupDetails = {
  name: string;
  locationName: string | null;
  locationAddress: string | null;
  eventStartsAt: string | null;
  open: boolean;
  atMaximumCapacity: boolean;
  registrationUrl: string;
};

type PcoAttendee = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  waitlisted: boolean;
  active: boolean;
  createdAt: string | null;
};

type ApiResponse = {
  signups: PcoSignupSummary[];
  selectedId: string | null;
  selected: PcoSignupDetails | null;
  registrants: PcoAttendee[];
};

function formatStarts(iso: string | null) {
  if (!iso) return "No date set in PCO";
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

export default function SignupPicker() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/admin/gathering-signup");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json: ApiResponse = await res.json();
      setData(json);
      setSelectedId(json.selectedId ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PCO signups");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    setSavedMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/gathering-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId: selectedId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `Save failed (${res.status})`);
      }
      setSavedMsg("Saved — the Gathering page now links to this event.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (error && !data) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
        <p className="font-sans text-sm text-copper">{error}</p>
        <p className="mt-2 font-sans text-sm text-thistle-green">
          Double check PCO_APPLICATION_ID / PCO_SECRET are set, and that the
          settings table migration has been run in Supabase.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
        <p className="font-sans text-sm text-thistle-green">Loading PCO events…</p>
      </div>
    );
  }

  const selectedSummary = data.signups.find((s) => s.id === selectedId);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-white p-6 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
        <p className="label-caps mb-1">Linked PCO event</p>
        <p className="mb-4 font-sans text-sm text-thistle-green">
          Pick which Planning Center signup the Gathering page should link
          to. The date, time and location shown on the site update
          automatically from PCO.
        </p>

        {data.signups.length === 0 ? (
          <p className="font-sans text-sm text-copper">
            No signups came back from PCO — check the credentials are set,
            or create the event in Planning Center Registrations first.
          </p>
        ) : (
          <>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mb-3 w-full rounded-lg border border-cream-2 bg-cream px-3.5 py-2.5 font-sans text-sm text-midnight"
            >
              <option value="" disabled>
                Select an event…
              </option>
              {data.signups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.open ? "" : "(closed)"} — {formatStarts(s.eventStartsAt)}
                </option>
              ))}
            </select>

            <button
              onClick={handleSave}
              disabled={saving || !selectedId || selectedId === data.selectedId}
              className="rounded-lg bg-copper px-5 py-2.5 font-sans text-[13px] font-medium text-white transition-colors hover:bg-copper/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>

            {savedMsg && (
              <p className="mt-3 font-sans text-sm text-olive">{savedMsg}</p>
            )}
            {error && <p className="mt-3 font-sans text-sm text-copper">{error}</p>}

            {selectedSummary && (
              <p className="mt-3 font-mono text-[11px] text-thistle-green">
                Signup ID: {selectedSummary.id}
              </p>
            )}
          </>
        )}
      </div>

      {data.selected && (
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
          <p className="label-caps mb-3">Currently live on the Gathering page</p>
          <div className="flex flex-col gap-1.5 font-sans text-sm text-brown">
            <p>
              <span className="text-thistle-green">Event: </span>
              {data.selected.name}
            </p>
            <p>
              <span className="text-thistle-green">When: </span>
              {formatStarts(data.selected.eventStartsAt)}
            </p>
            <p>
              <span className="text-thistle-green">Where: </span>
              {[data.selected.locationName, data.selected.locationAddress]
                .filter(Boolean)
                .join(" — ") || "Not set in PCO"}
            </p>
            <p>
              <span className="text-thistle-green">Status: </span>
              {data.selected.atMaximumCapacity
                ? "At capacity"
                : data.selected.open
                  ? "Open"
                  : "Closed"}
            </p>
          </div>
        </div>
      )}

      {data.selectedId && (
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
          <p className="label-caps mb-1">
            Who&rsquo;s coming{data.registrants.length > 0 ? ` · ${data.registrants.length}` : ""}
          </p>
          <p className="mb-4 font-sans text-sm text-thistle-green">
            Pulled live from Planning Center — registration itself still happens on PCO&rsquo;s hosted page.
          </p>

          {data.registrants.length === 0 ? (
            <p className="font-sans text-sm text-thistle-green">
              No registrants yet, or PCO didn&rsquo;t return any for this event.
            </p>
          ) : (
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="text-left">
                  <th className="border-b border-cream-2 pb-2 pr-4 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">
                    Name
                  </th>
                  <th className="border-b border-cream-2 pb-2 pr-4 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">
                    Email
                  </th>
                  <th className="border-b border-cream-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-thistle-green">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.registrants.map((r) => (
                  <tr key={r.id}>
                    <td className="border-b border-cream-2 py-2 pr-4 text-brown">
                      {[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="border-b border-cream-2 py-2 pr-4 text-brown">{r.email ?? "—"}</td>
                    <td className="border-b border-cream-2 py-2 text-brown">
                      {r.waitlisted ? "Waitlisted" : r.active ? "Registered" : "Cancelled"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
