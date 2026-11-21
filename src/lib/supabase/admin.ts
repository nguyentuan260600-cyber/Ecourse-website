import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Service-role client. BYPASSES RLS — use only in trusted server code
 * (payment webhooks, role assignment by super admins, outbox workers).
 * Never import from a Client Component.
 */
export function createSupabaseAdminClient() {
  if (!publicEnv.supabaseUrl || !serverEnv.supabaseServiceRoleKey) {
    throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY hoặc NEXT_PUBLIC_SUPABASE_URL");
  }
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
