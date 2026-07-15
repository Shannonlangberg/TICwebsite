// Tiny key/value config store backed by the `settings` table — used for
// admin-editable config that isn't tied to a specific user, e.g. which PCO
// signup the Gathering page currently links to. Always goes through the
// service_role client since the table has no RLS policies.

import { createAdminClient } from "@/lib/supabase/admin";

export const GATHERING_SIGNUP_ID_KEY = "gathering_signup_id";

export async function getSetting(key: string): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return data?.value ?? null;
  } catch {
    // Table may not exist yet if the schema migration hasn't been run —
    // fail soft so callers just fall back to their default.
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  return !error;
}
