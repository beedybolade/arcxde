/**
 * Param decorators that bind a Zod schema in a single annotation.
 *
 *   @Post()
 *   create(@ZodBody(createOrganizationBodySchema) body: CreateOrganizationBody) { ... }
 *
 *   @Get(':id')
 *   getOne(@ZodParam(organizationParamsSchema) params: OrganizationParams) { ... }
 *
 *   @Get()
 *   list(@ZodQuery(paginationQuerySchema) q: PaginationQuery) { ... }
 *
 * Prefer these over the raw pipe — they remove the `new ZodValidationPipe(...)` noise
 * from every controller method.
 */
import type { ZodSchema } from 'zod';

import { Body, Param, Query } from '@nestjs/common';

import { ZodValidationPipe } from './zod-validation.pipe.js';

export const ZodBody = <T>(schema: ZodSchema<T>): ParameterDecorator =>
  Body(new ZodValidationPipe(schema));

export const ZodQuery = <T>(schema: ZodSchema<T>): ParameterDecorator =>
  Query(new ZodValidationPipe(schema));

export const ZodParam = <T>(schema: ZodSchema<T>): ParameterDecorator =>
  Param(new ZodValidationPipe(schema));
