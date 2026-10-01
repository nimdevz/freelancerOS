import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentUser, CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard, OrganizationGuard)
  @ApiOperation({ summary: 'Get current user profile and workspace' })
  async getMe(@CurrentUser() user: any, @CurrentOrgId() orgId: string) {
    return this.authService.getMe(user.id, orgId);
  }

  @Post('login')
  @ApiOperation({ summary: 'Sign in with email and password' })
  async login(@Body() body: { email: string; password?: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register workspace with email and password' })
  async signup(@Body() body: { email: string; password?: string; fullName?: string; studioName?: string; freelancerType?: string }) {
    return this.authService.signup(body);
  }

  @Post('google')
  @ApiOperation({ summary: 'Sign in or register with Google OAuth' })
  async google(@Body() body: { credential?: string; email?: string; name?: string; picture?: string }) {
    return this.authService.loginWithGoogle(body);
  }
}
