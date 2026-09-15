import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { TtsService } from './tts.service';
import { TtsController } from './tts.controller';
import { AiServiceTtsProvider } from './providers/ai-service-tts.provider';
import { LocalMockTtsProvider } from './providers/local-mock-tts.provider';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [TtsController],
  providers: [TtsService, AiServiceTtsProvider, LocalMockTtsProvider],
  exports: [TtsService],
})
export class TtsModule {}
