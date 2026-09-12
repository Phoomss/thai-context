import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DialectsService {
  constructor(private readonly db: DatabaseService) {}

  async exploreDialects(region?: string) {
    let sql = `
      SELECT 
        de.id,
        dr.region_name,
        de.dialect_word,
        de.pronunciation_ipa,
        de.meaning_standard_thai,
        de.cultural_notes
      FROM dialect_entries de
      JOIN dialect_regions dr ON de.region_id = dr.id
    `;
    const params: any[] = [];
    if (region) {
      sql += ` WHERE dr.region_name ILIKE $1`;
      params.push(`%${region}%`);
    }
    sql += ` ORDER BY dr.region_name ASC;`;

    const res = await this.db.query(sql, params);
    return { success: true, count: res.rowCount, data: res.rows };
  }

  async getDialectMap(headword: string) {
    const sql = `
      SELECT 
        w.headword AS standard_thai,
        dr.region_name,
        de.dialect_word,
        sm.is_official,
        sm.confidence_score,
        sm.source_reference
      FROM words w
      JOIN semantic_mappings sm ON w.id = sm.standard_word_id
      JOIN dialect_entries de ON sm.dialect_entry_id = de.id
      JOIN dialect_regions dr ON de.region_id = dr.id
      WHERE w.headword = $1
      ORDER BY dr.region_name ASC;
    `;
    const res = await this.db.query(sql, [headword]);
    return { success: true, headword, mappings: res.rows };
  }
}
