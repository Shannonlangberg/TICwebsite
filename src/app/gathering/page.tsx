import { Calendar, MapPin } from "lucide-react";
import SiteNav from "../components/site-nav";
import SiteFooter from "../components/site-footer";
import { getSignupDetails } from "@/lib/pco";
import { getSetting, GATHERING_SIGNUP_ID_KEY } from "@/lib/settings";

// Default signup — used until an admin picks a different PCO event from
// /admin/gathering, or if the live API call fails.
const DEFAULT_SIGNUP_ID = "3754960";

const FALLBACK = {
  date: "Sun 30 Aug, 1:30 PM",
  location: "Copper Coast Campus, 4716 Copper Coast Hwy, Kadina SA 5554",
  url: `https://futuresaustralia.churchcenter.com/registrations/signups/${DEFAULT_SIGNUP_ID}`,
};

function formatEventDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const datePart = new Intl.DateTimeFormat("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Australia/Adelaide",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Australia/Adelaide",
    }).format(d);
    return `${datePart}, ${timePart}`;
  } catch {
    return null;
  }
}

export default async function GatheringPage() {
  const signupId = (await getSetting(GATHERING_SIGNUP_ID_KEY)) || DEFAULT_SIGNUP_ID;
  const live = await getSignupDetails(signupId);

  // Prefer the live event start time (from the signup's next_signup_time)
  // over the hardcoded fallback — falls back if PCO doesn't have one set.
  const dateLabel = formatEventDate(live?.eventStartsAt ?? null) ?? FALLBACK.date;

  const pcoUrl = live?.registrationUrl ?? FALLBACK.url;
  const locationLabel = live?.locationName
    ? [live.locationName, live.locationAddress].filter(Boolean).join(" — ")
    : FALLBACK.location;
  const closedNotice = live && !live.open;
  const fullNotice = live?.atMaximumCapacity;

  return (
    <main className="flex-1 flex flex-col bg-cream">
      <SiteNav active="gathering" />

      <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-copper px-6 py-24 text-center text-white">
        <p className="label-caps !text-laser-lemon">Come together</p>
        <h1 className="font-display text-[clamp(36px,6vw,56px)] leading-tight text-white">
          TIC Gathering
        </h1>
        <p className="max-w-xl font-sans text-base text-white/90 md:text-lg">
          Once you&rsquo;ve worked through the videos, come talk it all
          through with the group in person. Grab your spot below — we&rsquo;ll
          see you there.
        </p>

        <div className="my-3 flex flex-wrap justify-center gap-7 rounded-xl bg-white/10 px-7 py-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-mono text-[13px]">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-mono text-[13px]">{locationLabel}</span>
          </div>
        </div>

        {(closedNotice || fullNotice) && (
          <p className="max-w-md font-sans text-sm text-white/80">
            {fullNotice
              ? "This gathering is currently at capacity — reach out to us directly if you'd like to be added to the waitlist."
              : "Registration for this gathering is currently closed."}
          </p>
        )}

        <a
          href={pcoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-8 py-3.5 font-sans text-[15px] font-semibold text-copper transition-colors hover:bg-cream-2"
        >
          Register your spot
        </a>
      </div>

      <SiteFooter />
    </main>
  );
}
