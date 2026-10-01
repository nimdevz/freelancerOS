import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(AuthGuard, OrganizationGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  async list(@CurrentOrgId() orgId: string) {
    return this.projectsService.list(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project detail and finances' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.projectsService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.projectsService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project status or details' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.projectsService.update(orgId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async delete(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.projectsService.delete(orgId, id);
  }
}
