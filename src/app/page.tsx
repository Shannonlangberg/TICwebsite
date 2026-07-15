import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col bg-copper text-thistle-green">
      <header className="flex items-center justify-between px-8 py-6">
        <Image
          src="/brand/Futures1white.png"
          alt="Futures Church"
          width={180}
          height={40}
          priority
        />
        <nav className="font-sans text-sm tracking-wide flex gap-6">
          <Link href="/login" className="hover:underline">
            Log in
          </Link>
          <Link href="/signup" className="hover:underline">
            Sign up
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <Link
          href="/videos"
          className="uppercase tracking-[0.3em] text-sm text-orange font-sans hover:underline"
        >
          Learn more ↓
        </Link>
        <h1 className="font-display text-5xl md:text-7xl leading-tight max-w-3xl">
          Watch. Ask. <br /> Show up.
        </h1>
        <p className="font-sans max-w-xl text-base md:text-lg text-thistle-green/90">
          Work through the TIC videos at your own pace, send through your
          questions, then confirm your spot at the TIC Gathering — where we
          come together to talk it through.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-block rounded-full bg-orange px-8 py-3 font-sans font-semibold text-judge-gray hover:bg-laser-lemon transition-colors"
        >
          Sign up
        </Link>
      </section>

      <footer className="px-8 py-6 text-center text-xs font-sans text-thistle-green/70">
        Futures Church — TIC Platform
      </footer>
    </main>
  );
}
