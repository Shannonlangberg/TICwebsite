// Planning Center Registrations API — read-only client.
//
// PCO's public Registrations API (v2) only exposes GET endpoints for
// Signup / Registration / Attendee — there is no way to create a
// registration through it. This client is only for *reading* live event
// details (name, date, location, capacity, open/closed) to display on the
// Gathering page. Actual registration still happens on PCO's hosted page.
//
// Requires PCO_APPLICATION_ID + PCO_SECRET (Basic Auth) in the environment.

const PCO_BASE = "https://api.planningcenteronline.com/registrations/v2";

function authHeader() {
  const id = process.env.PCO_APPLICATION_ID;
  const secret = process.env.PCO_SECRET;
  if (!id || !secret) return null;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

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
  const auth = authHeader();
  if (!auth) return null;

  try {
    const res = await fetch(
      `${PCO_BASE}/signups/${signupId}?include=signup_location&fields[Signup]=name,open_at,close_at,open,at_maximum_capacity,new_registration_url`,
      {
        headers: { Authorization: auth },
        // Revalidate periodically rather than on every request.
        next: { revalidate: 300 },
      }
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
