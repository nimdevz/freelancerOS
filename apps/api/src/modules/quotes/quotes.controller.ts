import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Quotes')
@Controller('quotes')
@UseGuards(AuthGuard, OrganizationGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'List quotes' })
  async list(@CurrentOrgId() orgId: string) {
    return this.quotesService.list(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote detail' })
  async get(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.quotesService.get(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create quote' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.quotesService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quote' })
  async update(@CurrentOrgId() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.quotesService.update(orgId, id, body);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert quote into active project' })
  async convert(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.quotesService.convertToProject(orgId, id);
  }
}
