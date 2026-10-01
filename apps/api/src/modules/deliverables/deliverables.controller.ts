import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Deliverables')
@Controller('deliverables')
@UseGuards(AuthGuard, OrganizationGuard)
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Get()
  @ApiOperation({ summary: 'List deliverables' })
  async list(@CurrentOrgId() orgId: string, @Query('projectId') projectId?: string) {
    return this.deliverablesService.list(orgId, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deliverable with version history' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.deliverablesService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create deliverable with V1 draft' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.deliverablesService.create(orgId, body);
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Upload new version (e.g. V2, V3, Final)' })
  async addVersion(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.deliverablesService.addVersion(orgId, id, body);
  }
}
