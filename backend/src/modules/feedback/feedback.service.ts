import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly db: DatabaseService) {}

  async submitFeedback(data: { query: string; word_id?: string; is_relevant: boolean; comments?: string }) {
    const sql = `
      INSERT INTO search_feedback (search_query, recommended_word_id, is_relevant, feedback_comment)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at;
    `;
    const res = await this.db.query(sql, [
      data.query,
      data.word_id || null,
      data.is_relevant,
      data.comments || null,
    ]);
    return { success: true, feedback_id: res.rows[0].id };
  }
}
