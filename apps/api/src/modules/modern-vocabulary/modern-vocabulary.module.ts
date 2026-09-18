import { Module } from '@nestjs/common';
import { ModernVocabularyController, AdminModernVocabularyController } from './modern-vocabulary.controller';
import { ModernVocabularyService } from './modern-vocabulary.service';

@Module({
  controllers: [ModernVocabularyController, AdminModernVocabularyController],
  providers: [ModernVocabularyService],
  exports: [ModernVocabularyService],
})
export class ModernVocabularyModule {}
