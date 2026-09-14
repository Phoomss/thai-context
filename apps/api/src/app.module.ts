import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AIModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { SearchModule } from './modules/search/search.module';
import { CompareModule } from './modules/compare/compare.module';
import { EvolutionModule } from './modules/evolution/evolution.module';
import { DialectModule } from './modules/dialect/dialect.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { TtsModule } from './modules/tts/tts.module';
import { AccessibilityModule } from './modules/accessibility/accessibility.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AIModule,
    HealthModule,
    DictionaryModule,
    SearchModule,
    CompareModule,
    EvolutionModule,
    DialectModule,
    FeedbackModule,
    TtsModule,
    AccessibilityModule,
  ],
})
export class AppModule {}
