import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(AuthGuard, OrganizationGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'List all clients in workspace' })
  async list(@CurrentOrgId() orgId: string) {
    return this.clientsService.list(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client details and overview' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.clientsService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.clientsService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client details' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.clientsService.update(orgId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client' })
  async delete(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.clientsService.delete(orgId, id);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get client activity timeline' })
  async getTimeline(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.clientsService.getTimeline(orgId, id);
  }
}
