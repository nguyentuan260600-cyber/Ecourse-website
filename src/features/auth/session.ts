import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RoleCode = "student" | "instructor" | "support" | "admin" | "super_admin";

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  roles: RoleCode[];
}

/**
 * Data Access Layer entry point. Verifies the JWT (getClaims) and loads roles
 * from user_roles — never from user-editable metadata.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || !sub) return null;

  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("display_name,avatar_url").eq("id", sub).maybeSingle(),
    supabase.from("user_roles").select("roles(code)").eq("user_id", sub),
  ]);
  const roles = ((roleRows ?? []) as unknown as { roles: { code: RoleCode } | null }[])
    .map((r) => r.roles?.code)
    .filter((c): c is RoleCode => Boolean(c));

  return {
    id: sub,
    email: String(data.claims.email ?? ""),
    displayName: profile?.display_name || String(data.claims.email ?? "").split("@")[0],
    avatarUrl: profile?.avatar_url ?? null,
    roles,
  };
});

export async function requireUser(nextPath = "/dashboard"): Promise<CurrentUser> {
  await connection(); // protected pages are never prerendered
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireRole(allowed: RoleCode[], nextPath = "/dashboard"): Promise<CurrentUser> {
  const user = await requireUser(nextPath);
  if (!user.roles.some((r) => allowed.includes(r) || r === "super_admin")) redirect("/dashboard?error=forbidden");
  return user;
}
