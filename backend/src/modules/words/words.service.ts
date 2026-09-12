import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class WordsService {
  constructor(private readonly db: DatabaseService) {}

  async getWordDetail(headword: string) {
    const query = `
      SELECT 
        w.headword,
        de.edition_year,
        de.edition_name,
        d.pos,
        d.definition_text,
        we.page_number
      FROM words w
      JOIN word_entries we ON w.id = we.word_id
      JOIN dictionary_editions de ON we.edition_id = de.id
      JOIN definitions d ON we.id = d.word_entry_id
      WHERE w.headword = $1
      ORDER BY de.edition_year DESC;
    `;
    const res = await this.db.query(query, [headword]);
    if (res.rows.length === 0) {
      throw new NotFoundException(`Word '${headword}' not found in official dictionary`);
    }
    return { headword, entries: res.rows };
  }

  async getWordEvolution(headword: string) {
    const query = `
      SELECT 
        de.edition_year,
        de.edition_name,
        d.definition_text,
        we.page_number
      FROM dictionary_editions de
      LEFT JOIN word_entries we ON de.id = we.edition_id
      LEFT JOIN words w ON we.word_id = w.id AND w.headword = $1
      LEFT JOIN definitions d ON we.id = d.word_entry_id
      ORDER BY de.edition_year ASC;
    `;
    const res = await this.db.query(query, [headword]);

    let previousDef: string | null = null;
    const timeline = res.rows.map((row) => {
      let status = 'UNCHANGED';
      if (!row.definition_text) {
        status = 'NOT_FOUND';
      } else if (!previousDef) {
        status = 'ADDED';
        previousDef = row.definition_text;
      } else if (previousDef !== row.definition_text) {
        status = 'MODIFIED';
        previousDef = row.definition_text;
      }
      return {
        year: row.edition_year,
        edition_name: row.edition_name,
        definition: row.definition_text,
        page_number: row.page_number,
        status,
      };
    });

    return { headword, timeline };
  }

  async compareWords(headwords: string[]) {
    const details = await Promise.all(
      headwords.map(async (hw) => {
        try {
          return await this.getWordDetail(hw);
        } catch {
          return { headword: hw, entries: [] };
        }
      })
    );
    return { success: true, comparison: details };
  }
}
