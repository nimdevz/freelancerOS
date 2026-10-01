import { createClient } from '@libsql/client/web';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './database/schema';
import { Env } from './env';

export function getDb(env: Env): LibSQLDatabase<typeof schema> {
  const url = env.TURSO_DATABASE_URL || 'file:data/freelanceros.db';
  const authToken = env.TURSO_AUTH_TOKEN || undefined;

  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

export { schema };
