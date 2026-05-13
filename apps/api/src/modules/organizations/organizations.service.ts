/**
 * OrganizationsService.
 *
 * Application/domain layer:
 *   - Knows nothing about HTTP (no Request, Response, status codes).
 *   - Knows nothing about Prisma (only the repository).
 *   - Throws DomainError for expected failure paths (not-found, slug taken).
 *
 * This is the layer that's directly unit-tested. Controllers and repositories
 * are wired in higher-level tests.
 */
import { Injectable } from '@nestjs/common';

import type {
  CreateOrganizationBody,
  Organization,
  PaginationMeta,
  UpdateOrganizationBody,
} from '@app/contracts';

import { DomainError } from '../../common/errors/domain-error.js';

import { ListOrganizationsInput, OrganizationsRepository } from './organizations.repository.js';

@Injectable()
export class OrganizationsService {
  constructor(private readonly repo: OrganizationsRepository) {}

  async getById(id: string): Promise<Organization> {
    const org = await this.repo.findById(id);
    if (!org) {
      throw DomainError.notFound('Organization');
    }
    return org;
  }

  async list(
    input: ListOrganizationsInput,
  ): Promise<{ data: Organization[]; pagination: PaginationMeta }> {
    const { items, nextCursor } = await this.repo.list(input);
    return {
      data: items,
      pagination: {
        nextCursor,
        hasMore: nextCursor !== null,
        limit: input.limit,
      },
    };
  }

  async create(input: CreateOrganizationBody): Promise<Organization> {
    // Uniqueness is enforced at the DB level too, but checking here gives a
    // clean DomainError with field-level details instead of a P2002 leak.
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) {
      throw DomainError.conflict('ORGANIZATION_SLUG_TAKEN', 'Slug is already in use', {
        details: { field: 'slug', value: input.slug },
      });
    }
    return this.repo.create(input);
  }

  async update(id: string, input: UpdateOrganizationBody): Promise<Organization> {
    // Ensure exists first so we get a clean 404, not a Prisma "record to update not found" 500.
    await this.getById(id);

    if (input.slug) {
      const collide = await this.repo.findBySlug(input.slug);
      if (collide && collide.id !== id) {
        throw DomainError.conflict('ORGANIZATION_SLUG_TAKEN', 'Slug is already in use', {
          details: { field: 'slug', value: input.slug },
        });
      }
    }

    return this.repo.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
