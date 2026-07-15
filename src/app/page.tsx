import Link from "next/link";
import { ArrowRight, Play, MessageCircle, Users, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SiteNav from "./components/site-nav";
import SiteFooter from "./components/site-footer";

export default async function Home() {
  const supabase = await createClient();
  const { data: videos } = await supabase
    .from("videos")
    .select("title, order_index")
    .eq("published", true)
    .order("order_index")
    .limit(3);

  const washes = [
    { wash: "bg-wash-sky", icon: "text-teal" },
    { wash: "bg-wash-peach", icon: "text-copper" },
    { wash: "bg-wash-butter", icon: "text-gold" },
  ];
  const sessions = (videos ?? []).map((v, i) => ({
    n: String(v.order_index).padStart(2, "0"),
    title: v.title,
    ...washes[i % washes.length],
  }));

  return (
    <main className="flex-1 flex flex-col bg-cream">
      <SiteNav />

      <section className="flex flex-col items-center gap-5 px-6 py-24 text-center">
        <p className="label-caps">The Investigative Course</p>
        <h1 className="font-display max-w-3xl text-[clamp(40px,6vw,72px)] leading-tight text-midnight">
          Watch. Ask.
          <br />
          Show up.
        </h1>
        <p className="max-w-xl font-sans text-base text-brown/90 md:text-lg">
          Work through the TIC videos at your own pace, send through your
          questions, then confirm your spot at the TIC Gathering — where we
          come together to talk it through.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3.5">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-copper px-8 py-3.5 font-sans text-[15px] font-medium text-white transition-colors hover:bg-copper/90"
          >
            Start watching <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-judge-gray/20 px-7 py-3.5 font-sans text-[15px] font-medium text-midnight transition-colors hover:bg-cream-2"
          >
            Already signed up? Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <p className="label-caps mb-3.5">How it works</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-7 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-wash-sky">
              <Play className="h-5 w-5 text-teal" />
            </div>
            <h3 className="mb-1.5 font-sans text-[17px] font-semibold text-midnight">Watch</h3>
            <p className="font-sans text-sm text-brown">
              Nine short sessions, in your own time. Pick up right where you left off.
            </p>
          </div>
          <div className="rounded-xl bg-white p-7 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-wash-peach">
              <MessageCircle className="h-5 w-5 text-copper" />
            </div>
            <h3 className="mb-1.5 font-sans text-[17px] font-semibold text-midnight">Ask</h3>
            <p className="font-sans text-sm text-brown">
              Send through whatever&rsquo;s on your mind after each session — it goes straight to the team.
            </p>
          </div>
          <div className="rounded-xl bg-white p-7 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-wash-butter">
              <Users className="h-5 w-5 text-gold" />
            </div>
            <h3 className="mb-1.5 font-sans text-[17px] font-semibold text-midnight">Show up</h3>
            <p className="font-sans text-sm text-brown">
              Grab your spot at the TIC Gathering and talk it all through in person.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="mb-3.5 flex items-baseline justify-between">
          <p className="label-caps">The sessions</p>
          <Link href="/videos" className="flex items-center gap-1 font-sans text-sm text-brown hover:text-copper transition-colors">
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {sessions.map((v) => (
            <Link
              key={v.n}
              href="/videos"
              className="flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_5px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
            >
              <div className={`flex h-[120px] items-center justify-center ${v.wash}`}>
                <PlayCircle className={`h-8 w-8 ${v.icon}`} />
              </div>
              <div className="p-4">
                <p className="font-mono text-xs text-thistle-green">Session {v.n}</p>
                <p className="font-sans font-semibold text-midnight">{v.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-24 flex w-full max-w-3xl flex-col items-center gap-4 rounded-xl bg-copper px-6 py-16 text-center">
        <p className="label-caps !text-laser-lemon">Come together</p>
        <h2 className="font-display text-[36px] text-white">TIC Gathering</h2>
        <p className="max-w-md font-sans text-white/85">
          Once you&rsquo;ve worked through the videos, come talk it all through with the group in person.
        </p>
        <Link
          href="/gathering"
          className="rounded-full bg-white px-8 py-3.5 font-sans text-[15px] font-semibold text-copper transition-colors hover:bg-cream-2"
        >
          Reserve your spot
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
