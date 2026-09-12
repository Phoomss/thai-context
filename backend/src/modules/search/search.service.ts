import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly db: DatabaseService,
    private readonly aiService: AIService
  ) {}

  async searchMeaning(query: string) {
    return this.aiService.executeMeaningSearch(query);
  }

  async searchKeyword(keyword: string) {
    const sql = `
      SELECT 
        w.id,
        w.headword,
        d.pos,
        d.definition_text as definition,
        similarity(w.headword, $1) as score
      FROM words w
      LEFT JOIN word_entries we ON w.id = we.word_id
      LEFT JOIN definitions d ON we.id = d.word_entry_id
      WHERE w.headword % $1 OR w.headword ILIKE $2
      ORDER BY score DESC
      LIMIT 10;
    `;
    const res = await this.db.query(sql, [keyword, `%${keyword}%`]);
    return { success: true, count: res.rowCount, data: res.rows };
  }
}
