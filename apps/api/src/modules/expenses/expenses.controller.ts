import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(AuthGuard, OrganizationGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List expenses' })
  async list(@CurrentOrgId() orgId: string, @Query('projectId') projectId?: string) {
    return this.expensesService.list(orgId, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense detail' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.expensesService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Log new expense' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.expensesService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.expensesService.update(orgId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  async delete(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.expensesService.delete(orgId, id);
  }
}
