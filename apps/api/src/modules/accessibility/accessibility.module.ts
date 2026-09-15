import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { AccessibilityService } from './accessibility.service';
import { AccessibilityController } from './accessibility.controller';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [AccessibilityController],
  providers: [AccessibilityService],
  exports: [AccessibilityService],
})
export class AccessibilityModule {}
