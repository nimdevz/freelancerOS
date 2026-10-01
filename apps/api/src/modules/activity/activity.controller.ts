import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Activity')
@Controller('activity')
@UseGuards(AuthGuard, OrganizationGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get workspace recent activity feed' })
  async list(@CurrentOrgId() orgId: string, @Query('limit') limit?: string) {
    return this.activityService.list(orgId, limit ? parseInt(limit, 10) : 50);
  }
}
