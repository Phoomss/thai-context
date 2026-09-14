import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { AccessibilityService } from './accessibility.service';
import { AccessibilityController } from './accessibility.controller';
import { SignLanguageController } from './sign-language.controller';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [AccessibilityController, SignLanguageController],
  providers: [AccessibilityService],
  exports: [AccessibilityService],
})
export class AccessibilityModule {}
