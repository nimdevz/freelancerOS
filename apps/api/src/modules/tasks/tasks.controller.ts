import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard, OrganizationGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks (optional filter by projectId)' })
  async list(@CurrentOrgId() orgId: string, @Query('projectId') projectId?: string) {
    return this.tasksService.list(orgId, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task detail' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.tasksService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create task' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.tasksService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(orgId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  async delete(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.tasksService.delete(orgId, id);
  }
}
