// Grants super_admin to an EXISTING user (sign up through the site first).
// Runs with the service role key from your shell — never from the browser.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-admin.mjs you@example.com
import { createClient } from "@supabase/supabase-js";

const [email] = process.argv.slice(2);
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !url || !key) {
  console.error("Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-admin.mjs <email>");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

let user;
for (let page = 1; !user; page++) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (data.users.length < 200) break;
}
if (!user) {
  console.error(`Không tìm thấy người dùng ${email}. Hãy đăng ký tài khoản trên website trước.`);
  process.exit(1);
}
const { data: roles, error: rErr } = await db.from("roles").select("id,code").in("code", ["admin", "super_admin"]);
if (rErr) throw rErr;
const { error } = await db.from("user_roles").upsert(roles.map((r) => ({ user_id: user.id, role_id: r.id })), { onConflict: "user_id,role_id" });
if (error) throw error;
await db.from("audit_logs").insert({ action: "role.bootstrap_super_admin", entity_type: "user", entity_id: user.id, after_state: { roles: ["admin", "super_admin"] } });
console.log(`Đã cấp quyền admin + super_admin cho ${email}`);
