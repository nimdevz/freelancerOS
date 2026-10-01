import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(AuthGuard, OrganizationGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List subscription plans' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current workspace billing status' })
  getStatus(@CurrentOrgId() orgId: string) {
    return this.billingService.getBillingStatus(orgId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  createCheckout(@CurrentOrgId() orgId: string, @Body() body: { planId: string }) {
    return this.billingService.createCheckoutSession(orgId, body.planId);
  }
}
