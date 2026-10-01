import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
@UseGuards(AuthGuard, OrganizationGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across clients, projects, invoices, tasks, leads' })
  async search(@CurrentOrgId() orgId: string, @Query('q') query: string) {
    return this.searchService.search(orgId, query || '');
  }
}
