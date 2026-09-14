import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response, Request } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const requestId =
      (request.headers['x-request-id'] as string) ||
      (request.headers['x-correlation-id'] as string) ||
      randomUUID();

    // Store in request context for logging and downstream propagation
    (request as any).requestId = requestId;

    // Attach to outgoing response headers
    response.setHeader('X-Request-Id', requestId);

    return next.handle();
  }
}
