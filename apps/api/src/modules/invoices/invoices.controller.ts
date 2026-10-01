import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(AuthGuard, OrganizationGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices' })
  async list(@CurrentOrgId() orgId: string) {
    return this.invoicesService.list(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice detail' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.invoicesService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new invoice' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.invoicesService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.invoicesService.update(orgId, id, body);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Mark invoice as sent' })
  async send(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.invoicesService.send(orgId, id);
  }

  @Post(':id/mark-overdue')
  @ApiOperation({ summary: 'Mark invoice as overdue' })
  async markOverdue(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.invoicesService.markOverdue(orgId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  async delete(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.invoicesService.delete(orgId, id);
  }
}
