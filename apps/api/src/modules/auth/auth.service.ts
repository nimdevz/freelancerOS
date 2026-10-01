import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { users, organizations } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly dbService: DatabaseService) {}

  async getMe(userId: string, orgId: string) {
    let user = await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      user = await this.dbService.db.query.users.findFirst();
    }

    let org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      org = await this.dbService.db.query.organizations.findFirst();
    }

    return {
      user,
      organization: org,
    };
  }

  async login(email: string, _password?: string) {
    const cleanEmail = (email || 'nimish@freelanceros.com').toLowerCase().trim();
    let user = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user) {
      const id = randomUUID();
      const parts = cleanEmail.split('@')[0].split(/[._-]/);
      const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Creator';
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Pro';

      await this.dbService.db.insert(users).values({
        id,
        email: cleanEmail,
        firstName,
        lastName,
        role: 'owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      user = await this.dbService.db.query.users.findFirst({
        where: eq(users.id, id),
      });
    }

    let org = await this.dbService.db.query.organizations.findFirst();
    if (!org) {
      const orgId = randomUUID();
      await this.dbService.db.insert(organizations).values({
        id: orgId,
        name: `${user?.firstName || 'Creator'}'s Studio`,
        slug: `studio-${Date.now().toString(36)}`,
        currency: 'USD',
        hourlyRate: 125,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      org = await this.dbService.db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
      });
    }

    const token = `bearer-token-${user?.id}`;
    return { token, user, organization: org };
  }

  async signup(data: { email: string; password?: string; fullName?: string; studioName?: string; freelancerType?: string }) {
    const email = (data.email || 'creator@freelanceros.io').toLowerCase().trim();
    let user = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    const nameParts = (data.fullName || 'Creator Pro').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Creator';
    const lastName = nameParts.slice(1).join(' ') || 'Studio';

    if (!user) {
      const id = randomUUID();
      await this.dbService.db.insert(users).values({
        id,
        email,
        firstName,
        lastName,
        role: 'owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      user = await this.dbService.db.query.users.findFirst({
        where: eq(users.id, id),
      });
    }

    const orgId = randomUUID();
    const studioName = data.studioName || `${firstName}'s Studio`;
    const slug = studioName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 899 + 100);

    await this.dbService.db.insert(organizations).values({
      id: orgId,
      name: studioName,
      slug,
      currency: 'USD',
      freelancerType: data.freelancerType || 'creative',
      hourlyRate: 125,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    const token = `bearer-token-${user?.id}`;
    return { token, user, organization: org };
  }

  async loginWithGoogle(data: { credential?: string; email?: string; name?: string; picture?: string }) {
    let email = data.email || 'google.user@freelanceros.io';
    let name = data.name || 'Google Creator';
    let avatarUrl = data.picture || null;

    if (data.credential) {
      try {
        const parts = data.credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
          if (payload.picture) avatarUrl = payload.picture;
        }
      } catch {
        // fallback to provided fields
      }
    }

    email = email.toLowerCase().trim();
    let user = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Google';
    const lastName = nameParts.slice(1).join(' ') || 'Creator';

    if (!user) {
      const id = randomUUID();
      await this.dbService.db.insert(users).values({
        id,
        email,
        firstName,
        lastName,
        avatarUrl,
        role: 'owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      user = await this.dbService.db.query.users.findFirst({
        where: eq(users.id, id),
      });
    }

    let org = await this.dbService.db.query.organizations.findFirst();
    if (!org) {
      const orgId = randomUUID();
      await this.dbService.db.insert(organizations).values({
        id: orgId,
        name: `${firstName} Studio`,
        slug: `studio-${Date.now().toString(36)}`,
        currency: 'USD',
        hourlyRate: 125,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      org = await this.dbService.db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
      });
    }

    const token = `google-token-${user?.id}`;
    return { token, user, organization: org };
  }
}
