# agxnda

> Enterprise-grade platform built on **NestJS**, **Next.js**, **PostgreSQL**, and **Prisma**.
> Documentation-first. Performance-obsessed. Automation-native.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Documentation Map](#documentation-map)
- [Development Workflow](#development-workflow)
- [Quality Gates](#quality-gates)
- [Support](#support)

---

## Project Overview

agxnda is a [one-line product description, e.g. "B2B automation platform that..."].

**North-star metrics**

- Time-to-value for new customers: `< X minutes`
- P95 API latency: `< 200ms`
- Uptime SLO: `99.9%`
- Deployment frequency: `multiple per day`

**Engineering principles**

1. **Documentation-first** — no feature ships without ADR + API contract + runbook.
2. **Type safety end-to-end** — strict TypeScript across backend, frontend, and shared contracts.
3. **Performance is a feature** — every endpoint has a measured budget, every page has a Lighthouse target.
4. **Automate the boring** — anything done twice manually becomes a script or workflow.
5. **Observable by default** — structured logs, metrics, and traces ship with every service from day one.

---

## Tech Stack

| Layer         | Technology                             | Why                                                                   |
| ------------- | -------------------------------------- | --------------------------------------------------------------------- |
| Backend       | **NestJS** (TypeScript)                | Modular, DI-driven, opinionated structure that scales with team size. |
| Frontend      | **Next.js 14+ (App Router)**           | RSC, streaming, edge-ready, best-in-class DX for TS.                  |
| Database      | **PostgreSQL 16+**                     | ACID, JSONB, full-text search, mature ecosystem.                      |
| ORM           | **Prisma**                             | Type-safe queries, migration system, generator ecosystem.             |
| Cache / Queue | **Redis**                              | Sessions, rate limiting, BullMQ job queues.                           |
| Auth          | **JWT + refresh tokens** (or NextAuth) | Stateless, scalable, standard.                                        |
| Validation    | **Zod**                                | Shared schemas between BE and FE.                                     |
| Testing       | **Vitest / Jest, Playwright**          | Fast unit tests, real E2E.                                            |
| Observability | **OpenTelemetry + Pino + Sentry**      | Open standards, low overhead.                                         |
| CI/CD         | **GitHub Actions**                     | Native to the repo, mature marketplace.                               |
| Container     | **Docker + Docker Compose**            | Reproducible dev and prod environments.                               |
| Infra         | **[AWS / Fly.io / Render / Vercel]**   | Decide per ADR-0007.                                                  |

See [`docs/adr/`](./docs/adr/) for the _why_ behind each choice.

---

## Repository Structure

This is a **pnpm workspace monorepo**.

```
agxnda/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules (auth, users, billing, ...)
│   │   │   ├── common/       # Guards, filters, interceptors, pipes
│   │   │   ├── config/       # Typed config schema
│   │   │   ├── main.ts
│   │   │   └── app.module.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── test/
│   │
│   └── web/                  # Next.js frontend
│       ├── app/              # App Router
│       ├── components/
│       ├── lib/
│       └── public/
│
├── packages/
│   ├── contracts/            # Zod schemas + TS types shared BE ↔ FE
│   ├── ui/                   # Shared UI primitives (shadcn-based)
│   ├── config/               # Shared ESLint, TS, Prettier configs
│   └── utils/                # Pure shared utilities
│
├── docs/                     # Single source of truth — read this first
├── scripts/                  # Automation scripts (DX, ops, migrations)
├── .github/
│   └── workflows/            # CI/CD pipelines
├── docker-compose.yml        # Local Postgres + Redis
├── turbo.json                # Turborepo pipeline
├── pnpm-workspace.yaml
└── package.json
```

---

## Quick Start

### Prerequisites

- Node.js `>= 20.x` (LTS)
- pnpm `>= 9.x`
- Docker + Docker Compose
- (Recommended) `direnv` for per-folder env loading

### Setup

```bash
# 1. Clone and install
git clone <repo-url> agxnda
cd agxnda
pnpm install

# 2. Boot local infrastructure (Postgres + Redis)
docker compose up -d

# 3. Bootstrap environment files
pnpm bootstrap:env

# 4. Run migrations and seed
pnpm --filter api db:migrate
pnpm --filter api db:seed

# 5. Run everything in dev
pnpm dev
```

- API → http://localhost:3001
- Web → http://localhost:3000
- Prisma Studio → `pnpm --filter api db:studio`
- OpenAPI / Swagger → http://localhost:3001/docs

### Useful scripts

```bash
pnpm lint            # ESLint + type-check everywhere
pnpm test            # Unit + integration
pnpm test:e2e        # Playwright
pnpm build           # Build everything (Turbo)
pnpm db:reset        # Drop, migrate, seed (dev only)
```

---

## Documentation Map

> Everything is in [`/docs`](./docs). Start at [`docs/README.md`](./docs/README.md).

| Document                                                          | Purpose                                       |
| ----------------------------------------------------------------- | --------------------------------------------- |
| [Architecture Overview](./docs/architecture/overview.md)          | System-level diagrams and data flow.          |
| [Backend Architecture](./docs/architecture/backend.md)            | NestJS module patterns, layering, DI.         |
| [Frontend Architecture](./docs/architecture/frontend.md)          | Next.js App Router, RSC vs client boundaries. |
| [Database & Prisma](./docs/architecture/database.md)              | Schema conventions, indexing, migrations.     |
| [API Design Conventions](./docs/conventions/api-design.md)        | REST rules, error format, versioning.         |
| [Coding Standards](./docs/conventions/coding-standards.md)        | TS rules, naming, file structure.             |
| [Git Workflow](./docs/conventions/git-workflow.md)                | Branching, commits, PRs.                      |
| [Testing Strategy](./docs/conventions/testing.md)                 | Unit / integration / E2E.                     |
| [Deployment](./docs/operations/deployment.md)                     | Environments, release strategy.               |
| [Performance Playbook](./docs/operations/performance.md)          | Budgets and tactics.                          |
| [ADR Index](./docs/adr/README.md)                                 | Every architectural decision and why.         |
| [Engineering Handbook](./docs/confluence/engineering-handbook.md) | Confluence-ready team handbook.               |
| [Onboarding](./docs/confluence/onboarding.md)                     | Day-1 to Day-30 for new engineers.            |

---

## Development Workflow

1. **Pick / open an issue** with clear acceptance criteria.
2. **Branch** off `main`: `feat/<area>-<short-name>` (see [Git Workflow](./docs/conventions/git-workflow.md)).
3. **Write the contract first** — Zod schema in `packages/contracts/`.
4. **Implement** with tests alongside the code.
5. **Update docs** — README of the touched module, ADR if architecture shifted.
6. **Open PR** — template auto-fills the checklist. CI must be green.
7. **Review + merge** — squash to `main`. Auto-deploys to `staging`.
8. **Promote** to `production` via release workflow.

---

## Quality Gates

Every PR must pass:

- ✅ TypeScript strict (`noImplicitAny`, `strictNullChecks`, etc.)
- ✅ ESLint (zero warnings policy)
- ✅ Unit + integration tests (coverage threshold: **80%** lines, **75%** branches)
- ✅ E2E smoke tests on critical paths
- ✅ Prisma schema diff reviewed (no destructive migrations without ADR)
- ✅ Bundle size budget (web): JS first-load `< 200 KB` gzipped
- ✅ API perf budget: P95 `< 200ms` on tracked endpoints
- ✅ No `console.log` in app code (use the logger)
- ✅ No `any` without `// eslint-disable-next-line` + reason

---

## Support

- **Engineering Slack:** `#eng-agxnda`
- **On-call rotation:** see [`docs/confluence/incident-response.md`](./docs/confluence/incident-response.md)
- **Status page:** [status.example.com](#)
- **Confluence space:** agxnda Engineering

---

**License:** Proprietary — © [YEAR] [COMPANY]. All rights reserved.
