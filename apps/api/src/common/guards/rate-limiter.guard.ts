import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ClientHitRecord {
  timestamps: number[];
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);
  private readonly hits = new Map<string, ClientHitRecord>();
  private readonly WINDOW_MS = 60 * 1000; // 1 minute window
  private readonly MAX_REQUESTS = 120; // 120 requests per minute per IP

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let clientRecord = this.hits.get(ip);

    if (!clientRecord) {
      clientRecord = { timestamps: [] };
      this.hits.set(ip, clientRecord);
    }

    // Clean up timestamps outside current sliding window
    clientRecord.timestamps = clientRecord.timestamps.filter(
      (ts) => now - ts < this.WINDOW_MS
    );

    if (clientRecord.timestamps.length >= this.MAX_REQUESTS) {
      const oldest = clientRecord.timestamps[0];
      const retryAfterSeconds = Math.ceil((oldest + this.WINDOW_MS - now) / 1000);

      res.setHeader('Retry-After', retryAfterSeconds.toString());
      this.logger.warn(`Rate limit exceeded for IP ${ip}. Requests in window: ${clientRecord.timestamps.length}`);

      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: `Too many requests. Please retry after ${retryAfterSeconds} seconds.`,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    clientRecord.timestamps.push(now);

    // Periodic map cleanup if too large
    if (this.hits.size > 2000) {
      for (const [key, val] of this.hits.entries()) {
        if (val.timestamps.length === 0 || now - val.timestamps[val.timestamps.length - 1] > this.WINDOW_MS) {
          this.hits.delete(key);
        }
      }
    }

    return true;
  }
}
