import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { RevisionsService } from './revisions.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Revisions')
@Controller('revisions')
@UseGuards(AuthGuard, OrganizationGuard)
export class RevisionsController {
  constructor(private readonly revisionsService: RevisionsService) {}

  @Get()
  @ApiOperation({ summary: 'List revisions (optional filter by projectId)' })
  async list(@CurrentOrgId() orgId: string, @Query('projectId') projectId?: string) {
    return this.revisionsService.list(orgId, projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Request revision cycle' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.revisionsService.create(orgId, body);
  }
}
