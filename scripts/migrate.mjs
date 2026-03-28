/**
 * Vercel build migration script.
 *
 * If the database already has application tables but no _prisma_migrations
 * table (i.e. it was set up via `prisma db push`), this script baselines
 * the init migration so that `prisma migrate deploy` can proceed.
 */
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.log("No DATABASE_URL set – skipping migrations.");
  process.exit(0);
}

const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();

try {
  // Check whether the _prisma_migrations table already exists
  const { rows } = await client.query(
    `SELECT to_regclass('public._prisma_migrations') AS t`
  );
  const hasMigrationsTable = rows[0].t !== null;

  if (!hasMigrationsTable) {
    console.log("Baselining: _prisma_migrations table does not exist.");
    console.log("Creating table and marking init migration as applied…");

    await client.query(`
      CREATE TABLE "_prisma_migrations" (
        "id"                  VARCHAR(36)  PRIMARY KEY NOT NULL,
        "checksum"            VARCHAR(64)  NOT NULL,
        "finished_at"         TIMESTAMPTZ,
        "migration_name"      VARCHAR(255) NOT NULL,
        "logs"                TEXT,
        "rolled_back_at"      TIMESTAMPTZ,
        "started_at"          TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER      NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      INSERT INTO "_prisma_migrations" (
        id, checksum, finished_at, migration_name, applied_steps_count
      ) VALUES (
        gen_random_uuid(),
        'baseline',
        now(),
        '20260328000000_init',
        1
      );
    `);

    console.log("Baseline complete.");
  } else {
    console.log("_prisma_migrations table exists – no baselining needed.");
  }
} finally {
  await client.end();
}
