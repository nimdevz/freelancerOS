import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { users, organizations } from '../../database/schema';
import { eq } from 'drizzle-orm';

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
}
