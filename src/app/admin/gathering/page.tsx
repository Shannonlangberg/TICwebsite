import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Film, Calendar, LogOut } from "lucide-react";
import AdminLoginForm from "../login-form";
import SignupPicker from "./signup-picker";

export default async function AdminGatheringPage() {
  const cookieStore = await cookies();
  const isAdmin =
    cookieStore.get("tic_admin")?.value === process.env.ADMIN_PASSWORD;

  if (!isAdmin) {
    return <AdminLoginForm />;
  }

  return (
    <div className="flex min-h-full flex-1 bg-cream">
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
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-sans text-sm text-[#F4F1E6]/65 transition-colors hover:bg-white/5 hover:text-[#F4F1E6]"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            href="/videos"
            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-sans text-sm text-[#F4F1E6]/65 transition-colors hover:bg-white/5 hover:text-[#F4F1E6]"
          >
            <Film className="h-4 w-4" /> Sessions
          </Link>
          <Link
            href="/admin/gathering"
            className="flex items-center gap-2.5 rounded-lg border-l-2 border-copper bg-copper/15 px-3.5 py-2.5 pl-3 font-sans text-sm text-[#F4F1E6]"
          >
            <Calendar className="h-4 w-4" /> Gathering
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-sans text-sm text-[#F4F1E6]/65 transition-colors hover:bg-white/5 hover:text-[#F4F1E6]"
          >
            <LogOut className="h-4 w-4" /> Exit admin
          </Link>
        </nav>
      </aside>

      <main className="flex-1 px-10 py-9">
        <div className="mb-7">
          <p className="label-caps mb-1.5">TIC Platform</p>
          <h1 className="font-display text-[28px] text-midnight">Gathering</h1>
        </div>

        <SignupPicker />
      </main>
    </div>
  );
}
