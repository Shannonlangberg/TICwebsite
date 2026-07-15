import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-cream-2 px-8 py-6">
      <div className="flex items-center gap-2">
        <Image
          src="/brand/Futures2.png"
          alt=""
          width={162}
          height={16}
          className="h-4 w-auto opacity-60"
        />
        <span className="font-mono text-xs text-thistle-green">
          Futures Church — TIC Platform
        </span>
      </div>
      <Link href="/admin" className="font-sans text-xs text-thistle-green hover:text-copper transition-colors">
        Admin
      </Link>
    </footer>
  );
}
