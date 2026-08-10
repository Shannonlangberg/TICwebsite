// Per-user team admin check — replaces the old shared ADMIN_PASSWORD cookie.
// Admins are just regular Supabase-auth users with profiles.is_admin = true,
// so access can be granted/revoked per person from /admin/team instead of
// everyone sharing one password.

import { createClient } from "@/lib/supabase/server";

export type AdminCheck =
  | { signedIn: false; isAdmin: false; user: null }
  | { signedIn: true; isAdmin: boolean; user: { id: string; email: string | null; fullName: string | null } };

export async function requireAdmin(): Promise<AdminCheck> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { signedIn: false, isAdmin: false, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    signedIn: true,
    isAdmin: Boolean(profile?.is_admin),
    user: { id: user.id, email: user.email ?? null, fullName: profile?.full_name ?? null },
  };
}
