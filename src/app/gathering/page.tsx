export default function GatheringPage() {
  const pcoUrl =
    process.env.PCO_REGISTRATION_URL ??
    "https://futuresaustralia.churchcenter.com/registrations/signups/3754960";

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-copper text-thistle-green text-center px-6 py-24 gap-6">
      <p className="uppercase tracking-[0.3em] text-sm text-orange font-sans">
        Come together
      </p>
      <h1 className="font-display text-5xl md:text-6xl leading-tight max-w-2xl">
        TIC Gathering
      </h1>
      <p className="font-sans max-w-xl text-base md:text-lg text-thistle-green/90">
        Once you've worked through the videos, come talk it all through with
        the group in person. Grab your spot below — we'll see you there.
      </p>
      <a
        href={pcoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-orange px-8 py-3 font-sans font-semibold text-judge-gray hover:bg-laser-lemon transition-colors"
      >
        Register
      </a>
    </main>
  );
}
