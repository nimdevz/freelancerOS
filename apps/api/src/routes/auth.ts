import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { resolveUserTier } from '@freelanceros/config';

function decodeGoogleJwt(token: string): { email?: string; name?: string; picture?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    let jsonStr = '';
    if (typeof atob === 'function') {
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      jsonStr = new TextDecoder().decode(bytes);
    } else if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
    }
    const payload = JSON.parse(jsonStr);
    return {
      email: payload.email ? String(payload.email).toLowerCase().trim() : undefined,
      name: payload.name ? String(payload.name).trim() : undefined,
      picture: payload.picture || undefined,
    };
  } catch (err) {
    console.warn('Failed to decode Google JWT on API:', err);
    return null;
  }
}

export const authRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

authRouter.get('/me', async (c) => {
  const db = getDb(c.env);
  const userId = c.get('userId') || '11111111-1111-1111-1111-111111111111';
  const orgId = c.get('organizationId');

  let user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  if (!user) {
    user = await db.query.users.findFirst();
  }

  let org: any = null;
  if (user) {
    const member = await db.query.organizationMembers.findFirst({
      where: eq(schema.organizationMembers.userId, user.id),
    });
    if (member) {
      org = await db.query.organizations.findFirst({
        where: eq(schema.organizations.id, member.organizationId),
      });
    }
  }

  if (!org && orgId) {
    org = await db.query.organizations.findFirst({
      where: eq(schema.organizations.id, orgId),
    });
  }

  if (!org) {
    org = await db.query.organizations.findFirst();
  }

  if (org && user) {
    const plan = resolveUserTier(user.email);
    if (org.plan !== plan) {
      await db.update(schema.organizations)
        .set({ plan })
        .where(eq(schema.organizations.id, org.id));
      org.plan = plan;
    }
  }

  return c.json({ user, organization: org });
});

authRouter.post('/login', async (c) => {
  const db = getDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  const email = (body.email || 'nimish@freelanceros.com').toLowerCase().trim();

  let user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!user) {
    const id = crypto.randomUUID();
    const parts = email.split('@')[0].split(/[._-]/);
    const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Creator';
    const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Pro';

    const now = new Date().toISOString();
    await db.insert(schema.users).values({
      id,
      email,
      firstName,
      lastName,
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    });
    user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  let org = await db.query.organizations.findFirst();
  if (!org && user) {
    const orgId = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(schema.organizations).values({
      id: orgId,
      name: `${user.firstName}'s Studio`,
      slug: `studio-${Date.now().toString(36)}`,
      currency: 'USD',
      plan: resolveUserTier(user.email),
      hourlyRate: 125,
      createdAt: now,
      updatedAt: now,
    });
    org = await db.query.organizations.findFirst({
      where: eq(schema.organizations.id, orgId),
    });
  }

  if (org && user) {
    const plan = resolveUserTier(user.email);
    if (org.plan !== plan) {
      await db.update(schema.organizations).set({ plan }).where(eq(schema.organizations.id, org.id));
      org.plan = plan;
    }
  }

  const token = `bearer-token-${user?.id}`;
  return c.json({ token, user, organization: org });
});

authRouter.post('/signup', async (c) => {
  const db = getDb(c.env);
  const data = await c.req.json().catch(() => ({}));
  const email = (data.email || 'creator@freelanceros.io').toLowerCase().trim();

  let user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  const nameParts = (data.fullName || 'Creator Pro').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Creator';
  const lastName = nameParts.slice(1).join(' ') || 'Studio';

  const now = new Date().toISOString();
  if (!user) {
    const id = crypto.randomUUID();
    await db.insert(schema.users).values({
      id,
      email,
      firstName,
      lastName,
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    });
    user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  const orgId = crypto.randomUUID();
  const studioName = data.studioName || `${firstName}'s Studio`;
  const slug = studioName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 899 + 100);

  await db.insert(schema.organizations).values({
    id: orgId,
    name: studioName,
    slug,
    currency: 'USD',
    plan: resolveUserTier(user?.email || email),
    freelancerType: data.freelancerType || 'creative',
    hourlyRate: 125,
    createdAt: now,
    updatedAt: now,
  });

  if (user) {
    await db.insert(schema.organizationMembers).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: user.id,
      role: 'owner',
      createdAt: now,
    });
  }

  const org = await db.query.organizations.findFirst({
    where: eq(schema.organizations.id, orgId),
  });

  const token = `bearer-token-${user?.id}`;
  return c.json({ token, user, organization: org });
});

authRouter.post('/google', async (c) => {
  const db = getDb(c.env);
  const data = await c.req.json().catch(() => ({}));
  let email = (data.email || '').toLowerCase().trim();
  let name = (data.name || '').trim();
  let picture = data.picture || null;

  if (data.credential && !email) {
    const decoded = decodeGoogleJwt(data.credential);
    if (decoded?.email) email = decoded.email;
    if (decoded?.name && !name) name = decoded.name;
    if (decoded?.picture && !picture) picture = decoded.picture;
  }

  if (!email) {
    email = 'google.user@freelanceros.com';
  }

  let user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  const now = new Date().toISOString();
  if (!user) {
    const nameParts = (name || 'Google Creator').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Google';
    const lastName = nameParts.slice(1).join(' ') || 'Creator';

    const id = crypto.randomUUID();
    await db.insert(schema.users).values({
      id,
      email,
      firstName,
      lastName,
      avatarUrl: picture,
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    });
    user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  // Find organization by member relation first
  let member = user
    ? await db.query.organizationMembers.findFirst({
        where: eq(schema.organizationMembers.userId, user.id),
      })
    : null;

  let org = member
    ? await db.query.organizations.findFirst({
        where: eq(schema.organizations.id, member.organizationId),
      })
    : null;

  if (!org && user) {
    org = await db.query.organizations.findFirst();
    if (!org) {
      const orgId = crypto.randomUUID();
      await db.insert(schema.organizations).values({
        id: orgId,
        name: `${user.firstName}'s Studio`,
        slug: `studio-${Date.now().toString(36)}`,
        currency: 'USD',
        plan: resolveUserTier(user.email),
        hourlyRate: 125,
        createdAt: now,
        updatedAt: now,
      });
      org = await db.query.organizations.findFirst({
        where: eq(schema.organizations.id, orgId),
      });
    }

    if (org) {
      await db.insert(schema.organizationMembers).values({
        id: crypto.randomUUID(),
        organizationId: org.id,
        userId: user.id,
        role: 'owner',
        createdAt: now,
      }).onConflictDoNothing();
    }
  }

  if (org && user) {
    const plan = resolveUserTier(user.email);
    if (org.plan !== plan) {
      await db.update(schema.organizations).set({ plan }).where(eq(schema.organizations.id, org.id));
      org.plan = plan;
    }
  }

  const token = `bearer-token-${user?.id}`;
  return c.json({ token, user, organization: org });
});
