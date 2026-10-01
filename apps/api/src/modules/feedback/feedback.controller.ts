import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { CurrentOrgId } from '../../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(AuthGuard, OrganizationGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @ApiOperation({ summary: 'List feedback for deliverable' })
  async list(@CurrentOrgId() orgId: string, @Query('deliverableId') deliverableId: string) {
    return this.feedbackService.list(orgId, deliverableId);
  }

  @Post()
  @ApiOperation({ summary: 'Post feedback or comment' })
  async create(@CurrentOrgId() orgId: string, @Body() body: any) {
    return this.feedbackService.create(orgId, body);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve feedback item' })
  async resolve(@CurrentOrgId() orgId: string, @Param('id') id: string) {
    return this.feedbackService.resolve(orgId, id);
  }
}
