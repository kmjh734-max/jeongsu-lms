/**
 * Apply a supabase/migrations/*.sql file to jeongsu Postgres.
 *
 *   SUPABASE_DB_PASSWORD=... node scripts/apply-sql-migration.mjs 095_credit_payments_toss.sql
 *   # or path:
 *   SUPABASE_DB_PASSWORD=... node scripts/apply-sql-migration.mjs supabase/migrations/096_....sql
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1].trim();
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const arg = process.argv[2];
if (!arg) {
  console.error(
    "Usage: node scripts/apply-sql-migration.mjs <migration-file.sql>"
  );
  process.exit(1);
}

const sqlPath = path.isAbsolute(arg)
  ? arg
  : fs.existsSync(path.join(root, arg))
    ? path.join(root, arg)
    : path.join(root, "supabase", "migrations", arg);

if (!fs.existsSync(sqlPath)) {
  console.error("SQL file not found:", sqlPath);
  process.exit(1);
}

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("SUPABASE_DB_PASSWORD missing (.env.local or env)");
  process.exit(1);
}

const ref =
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace("https://", "")
    .replace(".supabase.co", "")
    .trim() || "vsncgcqkhswfwztdgdps";
const enc = encodeURIComponent(password);
const sql = fs.readFileSync(sqlPath, "utf8");

const candidates = [
  `postgresql://postgres.${ref}:${enc}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres`,
];

const client = new pg.Client({
  connectionString: candidates[0],
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function connect() {
  let lastErr;
  for (const cs of candidates) {
    const c = new pg.Client({
      connectionString: cs,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
    });
    try {
      await c.connect();
      console.log("connected", cs.replace(enc, "***"));
      return c;
    } catch (e) {
      lastErr = e;
      try {
        await c.end();
      } catch {
        /* ignore */
      }
    }
  }
  throw lastErr || new Error("connect failed");
}

const c = await connect();
try {
  await c.query("begin");
  await c.query(sql);
  await c.query("commit");
  console.log("OK applied", path.basename(sqlPath));
} catch (e) {
  try {
    await c.query("rollback");
  } catch {
    /* ignore */
  }
  console.error("FAIL", e.message);
  process.exit(1);
} finally {
  await c.end();
}
