import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const url = process.env.TURSO_DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log(`Connecting to Turso database: ${url}`);
  const client = createClient({ url, authToken });

  const sqlPath = path.resolve(__dirname, '..', '..', 'src', 'database', 'migrations', '0001_tired_the_initiative.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by statement-breakpoint
  const statements = sql
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Applying ${statements.length} migration statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.execute(stmt);
      console.log(`[${i + 1}/${statements.length}] Executed statement successfully`);
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        console.log(`[${i + 1}/${statements.length}] Already exists, skipping`);
      } else {
        console.error(`[${i + 1}/${statements.length}] Error:`, err.message);
        throw err;
      }
    }
  }

  console.log('All migrations applied successfully to Turso!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
