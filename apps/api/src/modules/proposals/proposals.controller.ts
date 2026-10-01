import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Proposals')
@Controller('proposals')
@UseGuards(AuthGuard, OrganizationGuard)
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get()
  @ApiOperation({ summary: 'List all proposals' })
  async list(@CurrentOrgId() orgId: string) {
    return this.proposalsService.list(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal details and items' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.proposalsService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create proposal' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.proposalsService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update proposal' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.proposalsService.update(orgId, id, body);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Mark proposal as sent to client' })
  async send(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.proposalsService.send(orgId, id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept proposal and convert to project' })
  async accept(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.proposalsService.accept(orgId, id);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'Decline proposal' })
  async decline(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.proposalsService.decline(orgId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete proposal' })
  async delete(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.proposalsService.delete(orgId, id);
  }
}
