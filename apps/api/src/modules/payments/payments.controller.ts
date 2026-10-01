import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(AuthGuard, OrganizationGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List recorded payments' })
  async list(@CurrentOrgId() orgId: string, @Query('invoiceId') invoiceId?: string) {
    return this.paymentsService.list(orgId, invoiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Record payment for invoice' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.paymentsService.create(orgId, body);
  }
}
