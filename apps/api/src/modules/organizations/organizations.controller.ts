import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId, CurrentUser } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(AuthGuard, OrganizationGuard)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current workspace organization' })
  async getCurrent(@CurrentOrgId() orgId: string) {
    return this.orgsService.getCurrent(orgId);
  }

  @Patch('current')
  @ApiOperation({ summary: 'Update workspace organization settings' })
  async update(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.orgsService.update(orgId, body);
  }

  @Post('onboard')
  @ApiOperation({ summary: 'Complete onboarding wizard setup' })
  async onboard(@CurrentUser() user: any, @Body() body: any) {
    return this.orgsService.onboard(user.id, body);
  }
}
