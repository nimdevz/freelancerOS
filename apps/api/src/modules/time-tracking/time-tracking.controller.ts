import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('TimeTracking')
@Controller('time-tracking')
@UseGuards(AuthGuard, OrganizationGuard)
export class TimeTrackingController {
  constructor(private readonly timeService: TimeTrackingService) {}

  @Get()
  @ApiOperation({ summary: 'List time entries' })
  async list(@CurrentOrgId() orgId: string, @Query('projectId') projectId?: string) {
    return this.timeService.list(orgId, projectId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get currently active running stopwatch timer' })
  async getActive(@CurrentOrgId() orgId: string) {
    return this.timeService.getActive(orgId);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start a live timer' })
  async startTimer(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.timeService.startTimer(orgId, body);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop running timer' })
  async stopTimer(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.timeService.stopTimer(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Log manual time entry' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.timeService.create(orgId, body);
  }
}
