/**
 * Global HTTP exception filter.
 *
 * Maps every error thrown by the application — DomainError, NestJS built-ins,
 * Prisma errors, totally unexpected ones — to the standard error envelope
 * defined in docs/conventions/api-design.md.
 *
 * Logging strategy:
 *   - 5xx: logged at error level with full stack and cause chain.
 *   - 4xx: logged at warn (debug in prod) — they're noise, not signals.
 *   - DomainError details are passed through to the client (no leakage of
 *     internals, since DomainError.details is opinionated by the throwing
 *     code).
 */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ArgumentsHost, Catch, type ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { ZodError } from 'zod';

import { DomainError, isDomainError } from './domain-error.js';

interface ErrorPayload {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const requestId = (request.headers['x-request-id'] as string | undefined) ?? request.id;

    const payload = this.toPayload(exception);

    // 5xx → error log with stack; 4xx → debug only (don't pollute on user errors).
    if (payload.status >= 500) {
      this.logger.error(
        {
          err: this.serializeError(exception),
          requestId,
          method: request.method,
          url: request.url,
          status: payload.status,
          code: payload.code,
        },
        `Request failed: ${payload.code}`,
      );
    } else {
      this.logger.debug(
        {
          requestId,
          method: request.method,
          url: request.url,
          status: payload.status,
          code: payload.code,
        },
        `Client error: ${payload.code}`,
      );
    }

    void reply.status(payload.status).send({
      error: {
        code: payload.code,
        message: payload.message,
        requestId,
        ...(payload.details !== undefined ? { details: payload.details } : {}),
      },
    });
  }

  // -------- Mapping --------

  private toPayload(exception: unknown): ErrorPayload {
    if (isDomainError(exception)) {
      return {
        status: exception.httpStatus,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof ZodError) {
      // Validation failures that escaped a pipe still get the standard treatment.
      return {
        status: 422,
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        details: {
          issues: exception.issues.map((i) => ({
            path: i.path.join('.'),
            code: i.code,
            message: i.message,
          })),
        },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string }).message ?? exception.message);
      return {
        status,
        code: this.statusToCode(status),
        message,
      };
    }

    // Catch-all: unexpected error. Never leak internals.
    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  private statusToCode(status: number): string {
    if (status === 400) {
      return 'BAD_REQUEST';
    }
    if (status === 401) {
      return 'UNAUTHENTICATED';
    }
    if (status === 403) {
      return 'FORBIDDEN';
    }
    if (status === 404) {
      return 'NOT_FOUND';
    }
    if (status === 409) {
      return 'CONFLICT';
    }
    if (status === 412) {
      return 'PRECONDITION_FAILED';
    }
    if (status === 422) {
      return 'VALIDATION_FAILED';
    }
    if (status === 429) {
      return 'RATE_LIMITED';
    }
    if (status >= 500) {
      return 'INTERNAL_ERROR';
    }
    return 'ERROR';
  }

  private serializeError(exception: unknown): Record<string, unknown> {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        ...(exception.cause ? { cause: this.serializeError(exception.cause) } : {}),
        ...(isDomainError(exception) ? { kind: exception.kind, code: exception.code } : {}),
      };
    }
    return { value: String(exception) };
  }
}

// Re-export for ergonomic imports
export { DomainError };
