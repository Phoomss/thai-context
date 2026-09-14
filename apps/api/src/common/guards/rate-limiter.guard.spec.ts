import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterGuard } from './rate-limiter.guard';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;

  beforeEach(() => {
    guard = new RateLimiterGuard();
  });

  const createMockContext = (ip: string) => {
    const headers: Record<string, string> = { 'x-forwarded-for': ip };
    const responseHeaders: Record<string, string> = {};

    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          socket: { remoteAddress: ip },
        }),
        getResponse: () => ({
          setHeader: (name: string, value: string) => {
            responseHeaders[name] = value;
          },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow requests within limit', () => {
    const ctx = createMockContext('192.168.1.1');
    for (let i = 0; i < 50; i++) {
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });

  it('should throw 429 Too Many Requests when limit exceeded', () => {
    const ctx = createMockContext('192.168.1.99');
    for (let i = 0; i < 120; i++) {
      guard.canActivate(ctx);
    }

    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
    try {
      guard.canActivate(ctx);
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });
});
