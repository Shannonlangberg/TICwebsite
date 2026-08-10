import Link from "next/link";
import Image from "next/image";

// Shown when a signed-in user hits /admin/* without is_admin — never a
// generic 404/500, so it's obvious to a team member why they're blocked and
// what to do (ask an existing admin to grant access from /admin/team).
export function NotAdmin({ email }: { email: string | null }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-cream px-6 py-16 text-center">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/brand/Futures2.png" alt="Futures Church" width={202} height={20} className="h-6 w-auto" />
      </Link>
      <div className="flex max-w-sm flex-col gap-2 rounded-xl bg-white p-8 shadow-[0_1px_5px_rgba(0,0,0,0.06)]">
        <h1 className="font-display text-[24px] text-midnight">No admin access</h1>
        <p className="font-sans text-sm text-brown">
          {email ? <>You&rsquo;re signed in as <strong>{email}</strong>, but this account</> : "This account"}{" "}
          doesn&rsquo;t have TIC admin access yet. Ask an existing admin to add you from Team.
        </p>
        <Link href="/videos" className="mt-2 font-sans text-sm text-copper underline">
          Back to the sessions
        </Link>
      </div>
    </main>
  );
}
