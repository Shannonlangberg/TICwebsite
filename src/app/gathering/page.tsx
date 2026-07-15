import { Calendar, MapPin } from "lucide-react";
import SiteNav from "../components/site-nav";
import SiteFooter from "../components/site-footer";
import { getSignupDetails } from "@/lib/pco";

const SIGNUP_ID = "3754960";

// Fallback values (confirmed with Shannon 15 Jul 2026) — used until
// PCO_APPLICATION_ID is set, or if the live API call fails.
const FALLBACK = {
  date: "Sun 30 Aug, 1:30 PM",
  location: "Copper Coast Campus, 4716 Copper Coast Hwy, Kadina SA 5554",
  url: `https://futuresaustralia.churchcenter.com/registrations/signups/${SIGNUP_ID}`,
};

export default async function GatheringPage() {
  const live = await getSignupDetails(SIGNUP_ID);

  // PCO's public API doesn't expose the event's own start time (only
  // registration open/close times), so the date/time stays the confirmed
  // fallback regardless of whether the live call succeeds.
  const dateLabel = FALLBACK.date;

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
