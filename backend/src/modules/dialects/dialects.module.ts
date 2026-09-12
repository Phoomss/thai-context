import { Module } from '@nestjs/common';
import { DialectsController } from './dialects.controller';
import { DialectsService } from './dialects.service';

@Module({
  controllers: [DialectsController],
  providers: [DialectsService],
  exports: [DialectsService],
})
export class DialectsModule {}
