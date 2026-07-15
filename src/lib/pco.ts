// Planning Center API client.
//
// Two separate PCO products are used here, with very different write
// capabilities:
//
// - Registrations API (v2): READ-ONLY in practice — Signup/Registration/
//   Attendee only expose GET endpoints. Used to pull live event details
//   (name, date, location, capacity, open/closed) for the Gathering page.
//   Actual registration still happens on PCO's hosted signup page.
//
// - People API (v2): fully writable. Used to create/update a Person record
//   when someone signs up and checks "I'm new to Futures" — sets their
//   name, email, phone, primary_campus, and membership = "New Christian".
//
// Both use the same Basic Auth credential pair: PCO_APPLICATION_ID + PCO_SECRET.

const REGISTRATIONS_BASE = "https://api.planningcenteronline.com/registrations/v2";
const PEOPLE_BASE = "https://api.planningcenteronline.com/people/v2";

// Exact label as configured in this org's PCO People > Membership settings.
// Must match verbatim — PCO rejects values that aren't in the org's
// pre-configured membership list.
const NEW_CHRISTIAN_MEMBERSHIP = "New Christian";

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

// ---------------------------------------------------------------------------
// Registrations API (read-only)
// ---------------------------------------------------------------------------

export type PcoSignupDetails = {
  name: string;
  openAt: string | null;
  closeAt: string | null;
  open: boolean;
  atMaximumCapacity: boolean;
  locationName: string | null;
  locationAddress: string | null;
  registrationUrl: string;
};

export async function getSignupDetails(
  signupId: string
): Promise<PcoSignupDetails | null> {
  const headers = authedHeaders();
  if (!headers) return null;

  try {
    const res = await fetch(
      `${REGISTRATIONS_BASE}/signups/${signupId}?include=signup_location&fields[Signup]=name,open_at,close_at,open,at_maximum_capacity,new_registration_url`,
      { headers, next: { revalidate: 300 } }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const attrs = json?.data?.attributes ?? {};
    const location = json?.included?.find(
      (i: { type: string }) => i.type === "SignupLocation"
    )?.attributes;

    return {
      name: attrs.name ?? null,
      openAt: attrs.open_at ?? null,
      closeAt: attrs.close_at ?? null,
      open: Boolean(attrs.open),
      atMaximumCapacity: Boolean(attrs.at_maximum_capacity),
      locationName: location?.name ?? null,
      locationAddress: location
        ? [location.address_data?.line_1, location.address_data?.city, location.address_data?.state]
            .filter(Boolean)
            .join(", ")
        : null,
      registrationUrl:
        attrs.new_registration_url ??
        `https://futuresaustralia.churchcenter.com/registrations/signups/${signupId}`,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// People API (writable)
// ---------------------------------------------------------------------------

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

export type NewChristianSignup = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: string | null; // "Male" | "Female" — omitted if not provided
  campusId?: string | null;
};

export type PcoSyncResult =
  | { ok: true; personId: string; created: boolean }
  | { ok: false; reason: string };

// Finds an existing Person by email first (avoids creating duplicates for
// people already in PCO), otherwise creates a new one. Either way, sets
// membership = "New Christian" and primary_campus, then makes sure the
// email/phone are attached.
export async function syncNewChristian(
  input: NewChristianSignup
): Promise<PcoSyncResult> {
  const headers = authedHeaders({ "Content-Type": "application/json" });
  if (!headers) return { ok: false, reason: "PCO credentials not configured" };

  try {
    let personId: string | null = null;
    let created = false;

    // 1. Look for an existing person by email.
    const searchRes = await fetch(
      `${PEOPLE_BASE}/people?where[search_name_or_email]=${encodeURIComponent(
        input.email
      )}&per_page=1`,
      { headers }
    );
    if (searchRes.ok) {
      const searchJson = await searchRes.json();
      personId = searchJson?.data?.[0]?.id ?? null;
    }

    const attributes: Record<string, unknown> = {
      membership: NEW_CHRISTIAN_MEMBERSHIP,
    };
    if (input.gender === "Male" || input.gender === "Female") {
      attributes.gender = input.gender;
    }
    const relationships: Record<string, unknown> = {};
    if (input.campusId) {
      relationships.primary_campus = {
        data: { type: "Campus", id: input.campusId },
      };
    }

    if (personId) {
      // 2a. Update the existing person.
      const patchRes = await fetch(`${PEOPLE_BASE}/people/${personId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          data: { type: "Person", id: personId, attributes, relationships },
        }),
      });
      if (!patchRes.ok) {
        return { ok: false, reason: `PCO update failed (${patchRes.status})` };
      }
    } else {
      // 2b. Create a new person.
      const createRes = await fetch(`${PEOPLE_BASE}/people`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: {
            type: "Person",
            attributes: {
              first_name: input.firstName,
              last_name: input.lastName,
              ...attributes,
            },
            relationships,
          },
        }),
      });
      if (!createRes.ok) {
        return { ok: false, reason: `PCO create failed (${createRes.status})` };
      }
      const createJson = await createRes.json();
      personId = createJson?.data?.id;
      created = true;
      if (!personId) return { ok: false, reason: "PCO create returned no id" };
    }

    // 3. Attach email (skip failures — non-fatal, person record still exists).
    await fetch(`${PEOPLE_BASE}/people/${personId}/emails`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "Email",
          attributes: { address: input.email, location: "Home", primary: true },
        },
      }),
    }).catch(() => null);

    // 4. Attach phone number, if provided.
    if (input.phone) {
      await fetch(`${PEOPLE_BASE}/people/${personId}/phone_numbers`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: {
            type: "PhoneNumber",
            attributes: { number: input.phone, location: "Mobile" },
          },
        }),
      }).catch(() => null);
    }

    return { ok: true, personId, created };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
