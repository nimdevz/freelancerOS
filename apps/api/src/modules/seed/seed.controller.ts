import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('demo')
  @ApiOperation({ summary: 'Reset and seed realistic demo studio content (Nimish Studio)' })
  async seedDemo() {
    return this.seedService.seedDemoData();
  }
}
