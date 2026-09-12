import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmbeddingCacheService {
  private readonly logger = new Logger(EmbeddingCacheService.name);
  private cache = new Map<string, { vector: number[]; expiresAt: number }>();
  private readonly TTL_MS = 1000 * 60 * 60 * 24; // 24 hours TTL

  get(text: string): number[] | null {
    const key = text.trim().toLowerCase();
    const hit = this.cache.get(key);
    if (!hit) return null;

    if (Date.now() > hit.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    this.logger.debug(`⚡ In-Memory Embedding Cache HIT for: "${text.substring(0, 30)}..."`);
    return hit.vector;
  }

  set(text: string, vector: number[]): void {
    const key = text.trim().toLowerCase();
    if (this.cache.size > 5000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { vector, expiresAt: Date.now() + this.TTL_MS });
  }
}
