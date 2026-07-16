// src/lib/heartbeat.ts
// ─────────────────────────────────────────────────────────────────────────────
// Server-side bridge to Futures Heartbeat (the futures-OS Supabase project).
//
// Every TIC signup and video completion is forwarded to Heartbeat's
// `tic-webhook` edge function so the person's discipleship journey stays on
// one record. Heartbeat does the matching (PCO id → phone → email) and never
// duplicates people.
//
// Env (server only — never expose the secret to the client):
//   HEARTBEAT_WEBHOOK_URL — defaults to the futures-OS tic-webhook endpoint
//   TIC_WEBHOOK_SECRET    — shared secret, must match Heartbeat's function secret
//
// Fail-soft by design: if the env isn't set or Heartbeat is down, TIC keeps
// working and we just log. The next event will catch the person up.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_WEBHOOK_URL =
  "https://dzgiirkdmrtzbchrlebe.supabase.co/functions/v1/tic-webhook";

export interface HeartbeatPerson {
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  pco_person_id?: string | null;
  campus_name?: string | null;
  is_new_christian?: boolean;
}

export interface HeartbeatVideo {
  title: string;
  order_index: number;
  total: number;
  position_seconds?: number;
  completed: boolean;
}

export async function sendToHeartbeat(
  event: "signup" | "video_progress",
  person: HeartbeatPerson,
  video?: HeartbeatVideo
): Promise<void> {
  const secret = process.env.TIC_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[heartbeat] TIC_WEBHOOK_SECRET not set — skipping", event);
    return;
  }
  const url = process.env.HEARTBEAT_WEBHOOK_URL ?? DEFAULT_WEBHOOK_URL;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tic-secret": secret,
      },
      body: JSON.stringify({ event, person, video }),
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) {
      console.error("[heartbeat] webhook rejected", event, resp.status, await resp.text());
    }
  } catch (err) {
    console.error("[heartbeat] webhook failed", event, err);
  }
}
