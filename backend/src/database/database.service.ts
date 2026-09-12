import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  onModuleInit() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgrespassword@localhost:5432/thai_context';

    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    this.pool.on('connect', (client) => {
      // Set HNSW search quality parameter per connection for sub-10ms performance
      client.query('SET hnsw.ef_search = 40;').catch((err) => {
        this.logger.debug(`Could not set hnsw.ef_search (pgvector not ready yet): ${err.message}`);
      });
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle database client', err);
    });

    this.logger.log('🐘 PostgreSQL Database Pool initialized successfully.');
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (duration > 100) {
        this.logger.warn(`Slow Query (${duration}ms): ${text.substring(0, 80)}...`);
      }
      return res;
    } catch (error) {
      this.logger.error(`Database Query Error: ${error.message} \nQuery: ${text}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('PostgreSQL Database Pool drained and closed.');
    }
  }
}
