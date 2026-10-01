import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(AuthGuard, OrganizationGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financials')
  @ApiOperation({ summary: 'Get business intelligence and project profitability reports' })
  async getFinancials(@CurrentOrgId() orgId: string) {
    return this.reportsService.getFinancials(orgId);
  }
}
