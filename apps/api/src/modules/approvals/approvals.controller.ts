import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Approvals')
@Controller('approvals')
@UseGuards(AuthGuard, OrganizationGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'List approvals' })
  async list(@CurrentOrgId() orgId: string) {
    return this.approvalsService.list(orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Request approval for deliverable version' })
  async request(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.approvalsService.request(orgId, body);
  }

  @Post(':id/decide')
  @ApiOperation({ summary: 'Decide approval (approve or request changes)' })
  async decide(
    @CurrentOrgId() orgId: string,
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'changes_requested'; decidedBy: string; comments?: string },
  ) {
    return this.approvalsService.decide(orgId, id, body);
  }
}
