// Runs migrations + seed + policy tests on embedded Postgres (PGlite).
// Usage: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "supabase");
const db = new PGlite({ extensions: { pgcrypto } });
const results = [];
const run = (file) =>
  db.exec(readFileSync(file, "utf8"), {
    onNotice: (n) => /PASS|FAIL/.test(n.message) && results.push(n.message),
  });

try {
  await run(join(root, "tests/supabase_stub.sql"));
  for (const f of readdirSync(join(root, "migrations")).sort()) await run(join(root, "migrations", f));
  await run(join(root, "seed.sql"));
  await run(join(root, "seed.sql")); // seed must be re-runnable
  await run(join(root, "tests/policy_test.sql"));
  results.forEach((r) => console.log("  " + r));
  console.log(`OK: ${results.length} kiểm thử chính sách đạt.`);
} catch (error) {
  results.forEach((r) => console.log("  " + r));
  console.error("THẤT BẠI:", error.message);
  process.exit(1);
}
