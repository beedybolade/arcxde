# agxnda — Documentation

This is the **single source of truth** for the system. Read this before code.

## How this documentation is organized

We follow a variant of the [Diátaxis](https://diataxis.fr/) framework:

| Folder                             | What lives here                                  | When to read                                  |
| ---------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| [`architecture/`](./architecture/) | System design, component diagrams, data flow     | Before designing or refactoring any subsystem |
| [`adr/`](./adr/)                   | Architecture Decision Records — _why_ we chose X | Before challenging or replacing a decision    |
| [`conventions/`](./conventions/)   | How we write code, design APIs, commit           | Day 1; reference forever                      |
| [`operations/`](./operations/)     | Deployment, performance, monitoring, runbooks    | When shipping or firefighting                 |
| [`confluence/`](./confluence/)     | Team handbook, onboarding, process docs          | When onboarding or running the team           |

## Architecture

- [System Overview](./architecture/overview.md) — start here
- [Backend Architecture (NestJS)](./architecture/backend.md)
- [Frontend Architecture (Next.js)](./architecture/frontend.md)
- [Database & Prisma](./architecture/database.md)
- [Security Architecture](./architecture/security.md)
- [Observability](./architecture/observability.md)

## Decisions

- [ADR Index](./adr/README.md)
- [ADR Template](./adr/template.md)

## Conventions

- [Coding Standards](./conventions/coding-standards.md)
- [API Design](./conventions/api-design.md)
- [Git Workflow](./conventions/git-workflow.md)
- [Testing Strategy](./conventions/testing.md)

## Operations

- [Deployment](./operations/deployment.md)
- [Performance Playbook](./operations/performance.md)
- [Monitoring & Alerting](./operations/monitoring.md)
- [Incident Response](./confluence/incident-response.md)

## Team / Confluence

- [Engineering Handbook](./confluence/engineering-handbook.md)
- [Engineer Onboarding](./confluence/onboarding.md)
- [Release Process](./confluence/release-process.md)
- [Incident Response Playbook](./confluence/incident-response.md)

---

## Documentation principles

1. **Docs ship with code.** A PR is incomplete without doc updates.
2. **Diagrams as code.** All diagrams use Mermaid so they live in version control.
3. **Decision logs are immutable.** New decision → new ADR. Old ADRs get a `Superseded by ADR-N` header, never edited.
4. **Examples over prose.** Show the code first, explain second.
5. **Owners on every doc.** Every doc has a `Maintainer:` line at the top.
