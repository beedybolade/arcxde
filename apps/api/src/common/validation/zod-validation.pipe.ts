/**
 * ZodValidationPipe — validates body/query/param using a Zod schema.
 *
 * Why not class-validator: ADR-0003. Short version: Zod schemas already exist
 * in @app/contracts as the single source of truth shared with the frontend.
 * Duplicating them as classes here would create drift.
 *
 * Usage:
 *
 *   @Post()
 *   create(@Body(new ZodValidationPipe(createOrganizationBodySchema)) body: CreateOrganizationBody) { ... }
 *
 * Or, more ergonomically, use the helper decorators in this file:
 *
 *   @Post()
 *   create(@ZodBody(createOrganizationBodySchema) body: CreateOrganizationBody) { ... }
 */
import type { ZodSchema } from 'zod';

import { type ArgumentMetadata, Injectable, type PipeTransform } from '@nestjs/common';

import { DomainError } from '../errors/domain-error.js';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    throw DomainError.validation('VALIDATION_FAILED', 'Request validation failed', {
      details: {
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          code: issue.code,
          message: issue.message,
        })),
      },
      cause: result.error,
    });
  }
}
