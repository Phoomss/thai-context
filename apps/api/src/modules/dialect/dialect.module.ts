import { Module } from '@nestjs/common';
import { DialectController } from './dialect.controller';
import { DialectService } from './dialect.service';
import { DialectRankingService } from './dialect-ranking.service';

@Module({
  controllers: [DialectController],
  providers: [DialectService, DialectRankingService],
  exports: [DialectService, DialectRankingService],
})
export class DialectModule {}
