import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Film, Calendar, Users, LogOut } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/videos", label: "Sessions", icon: Film },
  { href: "/admin/gathering", label: "Gathering", icon: Calendar },
  { href: "/admin/team", label: "Team", icon: Users },
];

export function AdminSidebar({ active }: { active: string }) {
  return (
    <aside className="flex w-56 flex-shrink-0 flex-col gap-6 bg-midnight px-3.5 py-6">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <Image
          src="/brand/Futures2white.png"
          alt="Futures Church"
          width={141}
          height={14}
          className="h-[14px] w-auto"
        />
        <span
          className="text-[#F4F1E6]"
          style={{ fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}
        >
          TIC Admin
        </span>
      </Link>
      <nav className="flex flex-col gap-0.5">
        {ITEMS.map((item) => {
          const isActive = item.href === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "flex items-center gap-2.5 rounded-lg border-l-2 border-copper bg-copper/15 px-3.5 py-2.5 pl-3 font-sans text-sm text-[#F4F1E6]"
                  : "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-sans text-sm text-[#F4F1E6]/65 transition-colors hover:bg-white/5 hover:text-[#F4F1E6]"
              }
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-sans text-sm text-[#F4F1E6]/65 transition-colors hover:bg-white/5 hover:text-[#F4F1E6]"
        >
          <LogOut className="h-4 w-4" /> Exit admin
        </Link>
      </nav>
    </aside>
  );
}
