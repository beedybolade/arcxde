# @app/web

agxnda web app — Next.js 15 App Router, Tailwind v4, Radix primitives.

## Design system

The aesthetic is **editorial-refined**: warm off-white background, deep ink foreground, terracotta accent. Distinct from default shadcn-neutrality.

| Layer        | Choice                           |
| ------------ | -------------------------------- |
| Display font | Instrument Serif (italic accent) |
| UI font      | Geist Sans                       |
| Mono         | Geist Mono                       |
| Primary      | Terracotta `hsl(18 62% 42%)`     |
| Background   | Warm off-white `hsl(36 30% 97%)` |
| Foreground   | Warm ink `hsl(30 10% 12%)`       |

All tokens live as CSS variables in `src/app/globals.css`. Change them there; Tailwind utilities re-read them automatically via the `@theme` block.

## Components

Everything is in `src/components/ui/`. Import from the barrel:

```tsx
import { Button, Card, CardHeader, Input, Label, Badge } from '@/components/ui';
```

Available primitives:

- `Button` — 6 variants × 4 sizes, supports `asChild`
- `Input` — with `invalid` prop for error state
- `Label` — Radix Label for proper a11y wiring
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Badge` — 7 variants
- `Alert`, `AlertTitle`, `AlertDescription` — 5 variants
- `Separator` — Radix
- `Spinner` — accessible SVG loader

## Adding a new component

1. Create `src/components/ui/<name>.tsx`. Follow the existing pattern: `cn()` for class merging, `cva` if it has variants, `forwardRef` if it wraps a real DOM element.
2. Style with Tailwind utilities that reference the design tokens (`bg-primary`, `text-foreground`, `border-input`), not raw color values.
3. Export from `src/components/ui/index.ts`.

When you reach for a component shadcn ships (Dialog, Tooltip, Select, etc.), grab the Radix primitive and follow the same pattern — keep the Tailwind classes consistent with what's already here.

## Running

From the **repo root** (not this folder):

```bash
pnpm install              # if you haven't already
pnpm dev                  # runs api + web in parallel via Turbo
```

Then visit:

- http://localhost:3000 — the web app
- http://localhost:3001/health — API health
- http://localhost:3001/docs — Swagger
