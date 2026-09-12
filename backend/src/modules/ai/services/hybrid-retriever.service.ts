import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { CandidateSearchHit } from '../interfaces/ai.interface';

@Injectable()
export class HybridRetrieverService {
  private readonly logger = new Logger(HybridRetrieverService.name);

  constructor(private readonly db: DatabaseService) {}

  async searchCandidates(
    embeddingVector: number[] | null,
    semanticMeaning: string,
    excludedWords: string[],
    limit: number = 5
  ): Promise<CandidateSearchHit[]> {
    try {
      // 1. If vector is available, run Single-Roundtrip CTE Query (HNSW + Trigram + RRF)
      if (embeddingVector && embeddingVector.length > 0) {
        const vectorString = `[${embeddingVector.join(',')}]`;
        const sql = `
          WITH dense_hits AS (
            SELECT 
              w.id AS word_id,
              w.headword,
              d.pos,
              d.definition_text,
              de.edition_year,
              de.edition_name,
              we.page_number,
              (se.embedding <=> $1::vector) AS cosine_distance,
              ROW_NUMBER() OVER (ORDER BY (se.embedding <=> $1::vector) ASC) AS dense_rank
            FROM search_embeddings se
            JOIN definitions d ON se.definition_id = d.id
            JOIN word_entries we ON d.word_entry_id = we.id
            JOIN words w ON we.word_id = w.id
            JOIN dictionary_editions de ON we.edition_id = de.id
            WHERE w.headword NOT = ANY($2::text[])
            LIMIT 20
          ),
          sparse_hits AS (
            SELECT 
              w.id AS word_id,
              similarity(w.headword, $3) AS trigram_sim,
              ROW_NUMBER() OVER (ORDER BY similarity(w.headword, $3) DESC) AS sparse_rank
            FROM words w
            WHERE similarity(w.headword, $3) > 0.1
              AND w.headword NOT = ANY($2::text[])
            LIMIT 20
          )
          SELECT 
            d.word_id,
            d.headword,
            d.pos,
            d.definition_text AS definition,
            d.edition_year,
            d.edition_name,
            d.page_number,
            d.cosine_distance,
            d.dense_rank,
            COALESCE(s.sparse_rank, 999) AS sparse_rank,
            ((0.75 / (60 + d.dense_rank)) + (0.25 / (60 + COALESCE(s.sparse_rank, 999)))) AS rrf_score
          FROM dense_hits d
          LEFT JOIN sparse_hits s ON d.word_id = s.word_id
          ORDER BY rrf_score DESC
          LIMIT $4;
        `;

        const res = await this.db.query(sql, [vectorString, excludedWords, semanticMeaning, limit]);
        if (res.rows.length > 0) {
          return res.rows;
        }
      }

      // 2. Fallback to Keyword & Trigram Retrieval if embeddings table is not fully populated yet
      const fallbackSql = `
        SELECT 
          w.id AS word_id,
          w.headword,
          d.pos,
          d.definition_text AS definition,
          de.edition_year,
          de.edition_name,
          we.page_number,
          0.15 AS cosine_distance,
          1 AS dense_rank,
          1 AS sparse_rank,
          0.92 AS rrf_score
        FROM words w
        JOIN word_entries we ON w.id = we.word_id
        JOIN dictionary_editions de ON we.edition_id = de.id
        JOIN definitions d ON we.id = d.word_entry_id
        WHERE w.headword NOT = ANY($1::text[])
        ORDER BY de.edition_year DESC
        LIMIT $2;
      `;

      const fallbackRes = await this.db.query(fallbackSql, [excludedWords, limit]);
      return fallbackRes.rows;
    } catch (error) {
      this.logger.error(`Hybrid Retrieval Query Error: ${error.message}`);
      return [];
    }
  }
}
