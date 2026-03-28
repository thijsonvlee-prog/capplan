/**
 * Pre-migration script for Vercel deploys.
 *
 * Handles the case where _prisma_migrations was baselined but the
 * actual application tables don't exist (e.g. after a Neon DB reset).
 * Removes the stale baseline record so `prisma migrate deploy` can
 * run the init migration for real.
 */
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.log("No DATABASE_URL set – skipping migrations.");
  process.exit(0);
}

const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();

try {
  const { rows } = await client.query(
    `SELECT to_regclass('public._prisma_migrations') AS migrations,
            to_regclass('public."Driver"') AS driver`
  );

  const hasMigrationsTable = rows[0].migrations !== null;
  const hasAppTables = rows[0].driver !== null;

  if (hasMigrationsTable && !hasAppTables) {
    // Baseline exists but tables were never created (or DB was reset).
    // Remove the init record so prisma migrate deploy actually runs it.
    console.log("Migrations table exists but application tables are missing.");
    console.log("Removing stale baseline so init migration can run…");
    await client.query(
      `DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20260328000000_init'`
    );
    console.log("Done – prisma migrate deploy will now apply the init migration.");
  } else if (!hasMigrationsTable) {
    console.log("No _prisma_migrations table – prisma migrate deploy will set everything up.");
  } else {
    console.log("Database OK – tables and migration history both present.");
  }
} finally {
  await client.end();
}
