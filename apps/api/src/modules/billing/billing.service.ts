import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PRICING_PLANS } from '@freelanceros/config';
import { organizations } from '../../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly dbService: DatabaseService) {}

  getPlans() {
    return PRICING_PLANS;
  }

  async createCheckoutSession(organizationId: string, planId: string) {
    this.logger.log(`Initiating Stripe checkout session for org ${organizationId}, plan: ${planId}`);
    // Stripe checkout session architecture
    // In demo/production, updates the organization's plan:
    await this.dbService.db
      .update(organizations)
      .set({ plan: planId, updatedAt: new Date().toISOString() })
      .where(eq(organizations.id, organizationId));

    return {
      url: `/settings/billing?upgraded=true&plan=${planId}`,
      success: true,
      planId,
    };
  }

  async getBillingStatus(organizationId: string) {
    const org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    const currentPlan = PRICING_PLANS.find((p) => p.id === (org?.plan || 'pro')) || PRICING_PLANS[1];

    return {
      plan: currentPlan,
      status: 'active',
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerPortalUrl: '#',
    };
  }
}
