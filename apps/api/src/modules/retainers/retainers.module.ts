import { Module } from '@nestjs/common';
import { RetainersService } from './retainers.service';
import { RetainersController } from './retainers.controller';

@Module({
  controllers: [RetainersController],
  providers: [RetainersService],
  exports: [RetainersService],
})
export class RetainersModule {}
