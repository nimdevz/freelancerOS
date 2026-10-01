import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { RetainersService } from './retainers.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Retainers')
@Controller('retainers')
@UseGuards(AuthGuard, OrganizationGuard)
export class RetainersController {
  constructor(private readonly retainersService: RetainersService) {}

  @Get()
  @ApiOperation({ summary: 'List client retainers' })
  async list(@CurrentOrgId() orgId: string) {
    return this.retainersService.list(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get retainer detail' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.retainersService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create recurring retainer' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.retainersService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update retainer' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.retainersService.update(orgId, id, body);
  }
}
