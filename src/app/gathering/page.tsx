import { Calendar, MapPin } from "lucide-react";
import SiteNav from "../components/site-nav";
import SiteFooter from "../components/site-footer";
import { createAdminClient } from "@/lib/supabase/admin";
import RsvpForm from "./RsvpForm";

function formatEventDate(iso: string): string {
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
    return iso;
  }
}

export default async function GatheringPage() {
  // Public read via service_role — events has an "anyone can view" RLS
  // policy too, but the admin client keeps this consistent with the rest
  // of the app's data-access convention rather than exposing the anon key
  // to a broader query surface.
  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, title, description, starts_at, location, capacity")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let rsvpCount = 0;
  if (event) {
    const { count } = await supabase
      .from("event_rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id);
    rsvpCount = count ?? 0;
  }
  const atCapacity = event?.capacity != null && rsvpCount >= event.capacity;

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
          through with the group in person.
        </p>

        {event ? (
          <>
            <div className="my-3 flex flex-wrap justify-center gap-7 rounded-xl bg-white/10 px-7 py-5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-mono text-[13px]">{formatEventDate(event.starts_at)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-mono text-[13px]">{event.location}</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="max-w-md font-sans text-sm text-white/85">{event.description}</p>
            )}

            <div className="w-full max-w-sm rounded-xl bg-white p-6 text-left shadow-lg">
              {atCapacity ? (
                <p className="font-sans text-sm text-brown">
                  This gathering is currently at capacity — reach out to us directly if you&rsquo;d
                  like to be added to the waitlist.
                </p>
              ) : (
                <RsvpForm eventId={event.id} />
              )}
            </div>
          </>
        ) : (
          <p className="max-w-md font-sans text-sm text-white/85">
            No Gathering scheduled yet — check back soon.
          </p>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
