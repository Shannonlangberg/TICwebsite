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
  // The actual event date/time (from the signup's next upcoming
  // SignupTime), as opposed to openAt/closeAt which are the *registration
  // window*, not the event itself.
  eventStartsAt: string | null;
  eventEndsAt: string | null;
};

export async function getSignupDetails(
  signupId: string
): Promise<PcoSignupDetails | null> {
  const headers = authedHeaders();
  if (!headers) return null;

  try {
    const res = await fetch(
      `${REGISTRATIONS_BASE}/signups/${signupId}` +
        `?include=signup_location,next_signup_time` +
        `&fields[Signup]=name,open_at,close_at,open,at_maximum_capacity,new_registration_url` +
        `&fields[SignupTime]=starts_at,ends_at`,
      { headers, next: { revalidate: 300 } }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const attrs = json?.data?.attributes ?? {};
    const included: Array<{ type: string; attributes: Record<string, unknown> }> =
      json?.included ?? [];
    const location = included.find((i) => i.type === "SignupLocation")?.attributes as
      | { name?: string; address_data?: { line_1?: string; city?: string; state?: string } }
      | undefined;
    const signupTime = included.find((i) => i.type === "SignupTime")?.attributes as
      | { starts_at?: string; ends_at?: string }
      | undefined;

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
      // Deliberately NOT using attrs.new_registration_url — that field
      // points straight at the "/reservations/new" flow, which forces a
      // login/account-creation step before showing anything. The plain
      // "/registrations/events/{id}" event page requires no login and lets
      // people see the event details before deciding to register.
      registrationUrl: `https://futuresaustralia.churchcenter.com/registrations/events/${signupId}`,
      eventStartsAt: (signupTime?.starts_at as string) ?? null,
      eventEndsAt: (signupTime?.ends_at as string) ?? null,
    };
  } catch {
    return null;
  }
}

export type PcoSignupSummary = {
  id: string;
  name: string;
  open: boolean;
  eventStartsAt: string | null;
};

// Lists signups so an admin can pick which one the Gathering page should
// link to. Ordered newest-created first so the most likely candidate (the
// event just set up in PCO) is near the top.
export async function listSignups(): Promise<PcoSignupSummary[]> {
  const headers = authedHeaders();
  if (!headers) return [];

  try {
    const res = await fetch(
      `${REGISTRATIONS_BASE}/signups` +
        `?include=next_signup_time&order=-created_at&per_page=50&filter=unarchived` +
        `&fields[Signup]=name,open` +
        `&fields[SignupTime]=starts_at`,
      { headers, next: { revalidate: 120 } }
    );
    if (!res.ok) return [];

    const json = await res.json();
    const included: Array<{ id: string; type: string; attributes: Record<string, unknown> }> =
      json?.included ?? [];

    return (json?.data ?? []).map(
      (s: {
        id: string;
        attributes: { name: string; open: boolean };
        relationships?: { next_signup_time?: { data?: { id: string } | null } };
      }) => {
        const timeId = s.relationships?.next_signup_time?.data?.id;
        const time = timeId
          ? included.find((i) => i.type === "SignupTime" && i.id === timeId)
          : null;
        return {
          id: s.id,
          name: s.attributes.name,
          open: Boolean(s.attributes.open),
          eventStartsAt: (time?.attributes?.starts_at as string) ?? null,
        };
      }
    );
  } catch {
    return [];
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
