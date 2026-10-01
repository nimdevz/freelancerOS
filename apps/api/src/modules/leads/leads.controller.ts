import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(AuthGuard, OrganizationGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List sales pipeline leads' })
  async list(@CurrentOrgId() orgId: string) {
    return this.leadsService.list(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead detail' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.leadsService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new lead' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.leadsService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lead (e.g. stage change, notes, value)' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.leadsService.update(orgId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lead' })
  async delete(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.leadsService.delete(orgId, id);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert won lead to client and project' })
  async convert(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.leadsService.convert(orgId, id);
  }
}
