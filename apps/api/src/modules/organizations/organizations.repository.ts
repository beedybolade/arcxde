/**
 * OrganizationsRepository.
 *
 * The ONLY file in this module that touches Prisma directly. Everything above
 * (service, controller) consumes a typed, intention-revealing API.
 *
 * See docs/architecture/backend.md "Layering".
 */
import type { Organization } from '@app/contracts';
import type { Organization as PrismaOrganization } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  billingEmail?: string | undefined;
}

export interface UpdateOrganizationInput {
  name?: string | undefined;
  slug?: string | undefined;
  billingEmail?: string | undefined;
}

export interface ListOrganizationsInput {
  cursor?: string | undefined;
  limit: number;
}

export interface ListOrganizationsResult {
  items: Organization[];
  nextCursor: string | null;
}

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Organization | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const row = await this.prisma.organization.findUnique({ where: { id } });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const row = await this.prisma.organization.findUnique({ where: { slug } });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return row ? this.toDomain(row) : null;
  }

  async list(input: ListOrganizationsInput): Promise<ListOrganizationsResult> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const rows = await this.prisma.organization.findMany({
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const hasMore = rows.length > input.limit;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const sliced = hasMore ? rows.slice(0, input.limit) : rows;
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      items: sliced.map((r: PrismaOrganization) => this.toDomain(r)),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      nextCursor: hasMore ? (sliced[sliced.length - 1]?.id ?? null) : null,
    };
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const row = await this.prisma.organization.create({
      data: {
        name: input.name,
        slug: input.slug,
        ...(input.billingEmail !== undefined ? { billingEmail: input.billingEmail } : {}),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.toDomain(row);
  }

  async update(id: string, input: UpdateOrganizationInput): Promise<Organization> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const row = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.billingEmail !== undefined ? { billingEmail: input.billingEmail } : {}),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.prisma.organization.delete({ where: { id } });
  }

  private toDomain(row: PrismaOrganization): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      billingEmail: row.billingEmail,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
