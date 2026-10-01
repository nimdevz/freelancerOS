import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentUser, CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(AuthGuard, OrganizationGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile and workspace' })
  async getMe(@CurrentUser() user: any, @CurrentOrgId() orgId: string) {
    return this.authService.getMe(user.id, orgId);
  }
}
