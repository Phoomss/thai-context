import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AIModule } from './modules/ai/ai.module';
import { SearchModule } from './modules/search/search.module';
import { WordsModule } from './modules/words/words.module';
import { DialectsModule } from './modules/dialects/dialects.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    DatabaseModule,
    AIModule,
    SearchModule,
    WordsModule,
    DialectsModule,
    FeedbackModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
