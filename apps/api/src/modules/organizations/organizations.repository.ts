/**
 * OrganizationsRepository.
 *
 * The ONLY file in this module that touches Prisma directly. Everything above
 * (service, controller) consumes a typed, intention-revealing API.
 *
 * Why: keeps the query surface auditable in one place, makes it easy to swap
 * storage implementations under test, and prevents "import the prisma client
 * anywhere it's convenient" sprawl.
 *
 * See docs/architecture/backend.md "Layering".
 */
import { Injectable } from '@nestjs/common';
import type { Organization as PrismaOrganization, OrganizationPlan } from '@prisma/client';

import type { Organization } from '@app/contracts';

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
    const row = await this.prisma.organization.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const row = await this.prisma.organization.findUnique({ where: { slug } });
    return row ? this.toDomain(row) : null;
  }

  /**
   * Cursor-paginated list, ordered by createdAt desc, id desc to break ties.
   * See docs/architecture/database.md "Cursor pagination".
   */
  async list(input: ListOrganizationsInput): Promise<ListOrganizationsResult> {
    // Fetch limit+1 to know if there's a next page without a second query.
    const rows = await this.prisma.organization.findMany({
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    const hasMore = rows.length > input.limit;
    const sliced = hasMore ? rows.slice(0, input.limit) : rows;
    return {
      items: sliced.map((r) => this.toDomain(r)),
      nextCursor: hasMore ? (sliced[sliced.length - 1]?.id ?? null) : null,
    };
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    const row = await this.prisma.organization.create({
      data: {
        name: input.name,
        slug: input.slug,
        ...(input.billingEmail !== undefined ? { billingEmail: input.billingEmail } : {}),
      },
    });
    return this.toDomain(row);
  }

  async update(id: string, input: UpdateOrganizationInput): Promise<Organization> {
    const row = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.billingEmail !== undefined ? { billingEmail: input.billingEmail } : {}),
      },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({ where: { id } });
  }

  /**
   * Maps the Prisma row to the public domain shape (which is what @app/contracts
   * declares). Critical conversion: `Date` → ISO string. The contract package
   * declares `createdAt: string`, not `Date`, because that's what JSON serializes to
   * and we want server-side code to manipulate the same shape clients see.
   */
  private toDomain(row: PrismaOrganization): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan as OrganizationPlan,
      billingEmail: row.billingEmail,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
