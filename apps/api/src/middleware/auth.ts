import { MiddlewareHandler } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb } from '../db';

export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: AppVariables }> = async (c, next) => {
  const headerOrgId = c.req.header('x-organization-id');
  const authHeader = c.req.header('authorization');

  let userId = '11111111-1111-1111-1111-111111111111';
  let orgId = headerOrgId;

  if (authHeader && authHeader.startsWith('Bearer bearer-token-')) {
    userId = authHeader.replace('Bearer bearer-token-', '');
  }

  if (!orgId) {
    try {
      const db = getDb(c.env);
      const firstOrg = await db.query.organizations.findFirst();
      if (firstOrg) {
        orgId = firstOrg.id;
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
