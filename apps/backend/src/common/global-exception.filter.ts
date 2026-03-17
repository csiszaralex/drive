import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiErrorResponse } from '@repo/shared-types';
import { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { AppConfigService } from '../configs/app-config.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  constructor(private readonly config: AppConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message: string | string[] = 'Váratlan szerverhiba történt.';

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'VALIDATION_ERROR';
      message = zodError.issues.map((i) => {
        const path = i.path.length > 0 ? `${i.path.join('.')}: ` : '';
        return `${path}${i.message}`;
      });
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody =
        (exception.getResponse() as { error?: string; message?: string }) || undefined;

      errorCode = responseBody?.error || HttpStatus[status].toString();
      message = responseBody?.message || exception.message;
    } else if (this.isPrismaError(exception)) {
      const code = exception.code;
      const meta = exception.meta || {};

      switch (code) {
        case 'P2025': {
          // Record not found
          status = HttpStatus.NOT_FOUND;
          errorCode = 'RESOURCE_NOT_FOUND';
          message = 'A kért erőforrás nem található vagy már törölték.';
          break;
        }
        case 'P2002': {
          // Unique constraint failed
          status = HttpStatus.CONFLICT;
          errorCode = 'UNIQUE_CONSTRAINT_FAILED';
          const target = meta.target ? ` (${meta.target})` : '';
          message = `Egyedi azonosító ütközés: a megadott adat már létezik${target}.`;
          break;
        }
        case 'P2003': {
          // Foreign key constraint failed
          status = HttpStatus.BAD_REQUEST;
          errorCode = 'FOREIGN_KEY_CONSTRAINT_FAILED';
          message = 'Hivatkozási hiba: a kapcsolódó erőforrás nem létezik.';
          break;
        }
        default: {
          // Egyéb Prisma hiba (pl. P1001 DB down) marad 500-as, de logoljuk!
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          errorCode = `DATABASE_ERROR_${code}`;
          message = 'Adatbázis műveleti hiba történt.';
          this.logger.error(
            `[Prisma ${code}] ${request.method} ${request.url} - ${exception.message}`,
            exception.stack,
          );
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${exception.message}`,
        exception.stack,
      );
    }

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(!this.config.isProduction && exception instanceof Error && exception.stack
        ? { stack: exception.stack }
        : {}),
    };

    response.status(status).json(errorResponse);
  }

  private isPrismaError(
    error: unknown,
  ): error is { code: string; meta?: { target?: string }; message: string; stack?: string } {
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    if (!('code' in error)) {
      return false;
    }
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.code !== 'string') {
      return false;
    }
    return errorObj.code.startsWith('P');
  }
}
