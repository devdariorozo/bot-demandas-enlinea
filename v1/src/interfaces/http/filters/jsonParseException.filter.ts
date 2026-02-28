// Responsabilidad: devolver un mensaje claro cuando el body del request es JSON inválido.

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

const FRIENDLY_MSG =
  'Invalid JSON in request body. Check that array and object elements are separated by commas, that all strings use double quotes, and that there are no trailing commas.';

function isJsonParseError(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('json') ||
    lower.includes('expected ') ||
    lower.includes('unexpected token') ||
    lower.includes('position ')
  );
}

@Catch()
export class JsonParseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(JsonParseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const err = exception as Error & { getStatus?: () => number; getResponse?: () => unknown };
    const status = err.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = err?.message ?? String(exception);

    if (status === HttpStatus.BAD_REQUEST && isJsonParseError(message)) {
      this.logger.warn(`JSON parse error (original): ${message}`);
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: FRIENDLY_MSG,
      });
      return;
    }

    if (typeof err.getResponse === 'function') {
      const response = err.getResponse();
      const body = typeof response === 'object' && response !== null ? response : { message, statusCode: status, error: 'Bad Request' };
      const statusCode = (body as { statusCode?: number }).statusCode ?? status;
      res.status(statusCode).json(body);
      return;
    }

    res.status(status).json({
      statusCode: status,
      error: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : 'Error',
      message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : message,
    });
  }
}
