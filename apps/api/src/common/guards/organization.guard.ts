import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { eq } from 'drizzle-orm';
import { organizations, organizationMembers } from '../../database/schema';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private readonly dbService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const explicitOrgId = request.headers['x-organization-id'] as string;

    if (explicitOrgId) {
      const org = await this.dbService.db.query.organizations.findFirst({
        where: eq(organizations.id, explicitOrgId),
      });

      if (org) {
        request.organization = org;
        request.organizationId = org.id;
        return true;
      }
    }

    // Default to first organization found or user membership
    const firstOrg = await this.dbService.db.query.organizations.findFirst();
    if (firstOrg) {
      request.organization = firstOrg;
      request.organizationId = firstOrg.id;
      return true;
    }

    // If no org exists yet (first boot before seed/onboard)
    request.organizationId = '00000000-0000-0000-0000-000000000000';
    return true;
  }
}
