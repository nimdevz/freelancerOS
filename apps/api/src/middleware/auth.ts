import { MiddlewareHandler } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq } from 'drizzle-orm';

export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: AppVariables }> = async (c, next) => {
  const headerOrgId = c.req.header('x-organization-id');
  const authHeader = c.req.header('authorization');

  let userId = '11111111-1111-1111-1111-111111111111';
  let orgId = headerOrgId;

  if (authHeader) {
    const raw = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (raw.startsWith('bearer-token-')) {
      userId = raw.replace('bearer-token-', '');
    } else if (raw.startsWith('google-token-')) {
      userId = raw.replace('google-token-', '');
    } else if (raw && raw !== 'demo-token') {
      userId = raw;
    }
  }

  if (!orgId) {
    try {
      const db = getDb(c.env);
      const member = await db.query.organizationMembers.findFirst({
        where: eq(schema.organizationMembers.userId, userId),
      });
      if (member) {
        orgId = member.organizationId;
      } else {
        const firstOrg = await db.query.organizations.findFirst();
        if (firstOrg) {
          orgId = firstOrg.id;
        }
      }
    } catch {
      // Fallback
      orgId = '22222222-2222-2222-2222-222222222222';
    }
  }

  c.set('userId', userId);
  c.set('organizationId', orgId);

  await next();
};
