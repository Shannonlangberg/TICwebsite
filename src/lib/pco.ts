// Planning Center API client.
//
// TIC stopped pushing anything to PCO on 2026-08-10 — signups no longer
// create/update People records, and the Gathering is a fully standalone
// event (see supabase/schema_v2_events_admin.sql) instead of a PCO
// Registrations signup. The only PCO call left is a read-only campus name
// lookup for the sign-up form's dropdown — reading a list of names isn't
// "linking" anyone to PCO, so this one stayed.
//
// Uses the same Basic Auth credential pair as before: PCO_APPLICATION_ID +
// PCO_SECRET. If this dropdown is ever removed too, PCO_APPLICATION_ID/
// PCO_SECRET can come out of the Netlify env entirely.

const PEOPLE_BASE = "https://api.planningcenteronline.com/people/v2";

function authHeader(): string | null {
  const id = process.env.PCO_APPLICATION_ID;
  const secret = process.env.PCO_SECRET;
  if (!id || !secret) return null;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

function authedHeaders(extra?: Record<string, string>) {
  const auth = authHeader();
  if (!auth) return null;
  return { Authorization: auth, ...extra };
}

export type PcoCampus = { id: string; name: string };

// Cached in-memory for the life of the server process — campus lists change
// rarely. Falls back to an empty list (client should handle gracefully).
export async function listCampuses(): Promise<PcoCampus[]> {
  const headers = authedHeaders();
  if (!headers) return [];

  try {
    const res = await fetch(
      `${PEOPLE_BASE}/campuses?per_page=100&order=name`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data ?? []).map((c: { id: string; attributes: { name: string } }) => ({
      id: c.id,
      name: c.attributes.name,
    }));
  } catch {
    return [];
  }
}
