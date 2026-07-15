import Image from "next/image";
import Link from "next/link";

/**
 * Shared top nav for every public page (Home, Videos, Video detail, Gathering).
 * Sticky cream bar, hairline bottom border, logo + wordmark left, links right.
 * `active` highlights the current section link in copper.
 */
export default function SiteNav({
  active,
}: {
  active?: "videos" | "gathering";
}) {
  const linkClass = (key: string) =>
    `font-sans text-sm transition-colors hover:text-copper ${
      active === key ? "text-copper" : "text-brown"
    }`;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-cream border-b border-cream-2">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/brand/Futures1.png"
          alt="Futures Church"
          width={90}
          height={20}
          className="h-[22px] w-auto"
        />
        <span
          className="text-brown"
          style={{
            fontFamily: "var(--font-label)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          TIC
        </span>
      </Link>
      <nav className="flex items-center gap-7">
        <Link href="/videos" className={linkClass("videos")}>
          Videos
        </Link>
        <Link href="/gathering" className={linkClass("gathering")}>
          Gathering
        </Link>
        <Link href="/login" className="font-sans text-sm text-brown hover:text-copper transition-colors">
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-copper px-5 py-2 font-sans text-[13px] font-medium text-white transition-colors hover:bg-copper/90"
        >
          Sign up
        </Link>
      </nav>
    </header>
  );
}
