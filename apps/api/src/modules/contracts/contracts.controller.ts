import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Contracts')
@Controller('contracts')
@UseGuards(AuthGuard, OrganizationGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'List contracts' })
  async list(@CurrentOrgId() orgId: string) {
    return this.contractsService.list(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract detail' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.contractsService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create contract' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.contractsService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contract' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.contractsService.update(orgId, id, body);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign contract' })
  async sign(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: { signerName: string }) {
    return this.contractsService.sign(orgId, id, body.signerName || 'Client Signatory');
  }
}
