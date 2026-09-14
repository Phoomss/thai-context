import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as any;
        message = Array.isArray(obj.message) ? obj.message.join(', ') : obj.message || message;
        code = obj.error || HttpStatus[status] || code;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    const request = ctx.getRequest<any>();
    const requestId = request?.requestId || request?.headers?.['x-request-id'] || undefined;

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(requestId ? { requestId } : {}),
      },
    });
  }
}
