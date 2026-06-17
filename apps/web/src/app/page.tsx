/**
 * Landing page.
 *
 * Does three things at once:
 *   1. Demonstrates the editorial aesthetic (Instrument Serif italic accent,
 *      warm palette, staggered reveal on load).
 *   2. Verifies the backend is reachable — calls /health server-side and
 *      renders a status card with the result.
 *   3. Showcases the UI primitives so any new engineer can see what they
 *      have to work with in one place.
 */
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  CircleAlert,
  Info,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Spinner,
} from '@/components/ui';
import { fetchApiHealth } from '@/lib/api-client';
import Link from 'next/link';

// Server-side health probe with sensible fallback.
async function getApiStatus(): Promise<
  { ok: true; uptime: number } | { ok: false; reason: string }
> {
  try {
    const data = await fetchApiHealth();
    return { ok: true, uptime: data.uptime };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'unknown' };
  }
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

export default async function HomePage() {
  const status = await getApiStatus();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      {/* ---------- NAVBAR ---------- */}
      <nav className="reveal flex items-center justify-between" style={{ animationDelay: '0ms' }}>
        <Link href="/" className="flex items-center gap-2 text-lg tracking-tight">
          <span className="font-semibold">arc</span>
          <span className="font-serif italic text-primary">x</span>
          <span className="font-semibold">de</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="http://localhost:3001/docs" target="_blank" rel="noreferrer">
              API docs
            </a>
          </Button>
          <Button variant="outline" size="sm">
            Sign in
          </Button>
          <Button size="sm">
            Get started
            <ArrowRight />
          </Button>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="mt-20 grid gap-10 sm:mt-28 sm:grid-cols-12">
        <div className="reveal sm:col-span-8" style={{ animationDelay: '80ms' }}>
          <Badge variant="outline" className="mb-6 gap-1.5">
            <Sparkles className="size-3" />
            New
          </Badge>
          <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl">
            A learning platform
            <br />
            for teams who
            <br />
            <span className="font-serif italic text-primary">actually</span> want to learn.
          </h1>
          <p className="mt-8 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
            Courses, lessons, quizzes, awards, tokens. Built for organizations who treat learning as
            infrastructure — not a checkbox.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button size="lg">
              Start a course
              <ArrowRight />
            </Button>
            <Button size="lg" variant="ghost">
              <BookOpenText />
              Browse catalog
            </Button>
          </div>
        </div>

        {/* ---------- STATUS CARD ---------- */}
        <div className="reveal sm:col-span-4" style={{ animationDelay: '180ms' }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  System status
                </CardTitle>
                {status.ok ? (
                  <Badge variant="success">
                    <span className="size-1.5 rounded-full bg-current" />
                    Operational
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <span className="size-1.5 rounded-full bg-current" />
                    Down
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">API</span>
                <span className="font-mono text-sm">{status.ok ? 'reachable' : 'unreachable'}</span>
              </div>
              {status.ok && (
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="font-mono text-sm">{formatUptime(status.uptime)}</span>
                </div>
              )}
              <Separator />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Probed at request time from{' '}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">/health</code>.
                Auto-refreshes on every page load.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-20 sm:my-28" />

      {/* ---------- COMPONENT SHOWCASE ---------- */}
      <section className="reveal" style={{ animationDelay: '260ms' }}>
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Design system
          </p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight">
            What you have to <span className="font-serif italic text-primary">work with</span>
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every primitive lives in{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              src/components/ui
            </code>
            . Composable, accessible, themed off CSS variables in{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">globals.css</code>.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Six variants, four sizes, plus loading state.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button disabled>
                <Spinner />
                Loading
              </Button>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Form fields</CardTitle>
              <CardDescription>
                Label + Input with focus, disabled, and error states.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="demo-email">Email</Label>
                <Input id="demo-email" type="email" placeholder="you@agxnda.io" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo-error">Slug</Label>
                <Input id="demo-error" defaultValue="acme inc" invalid />
                <p className="text-xs text-destructive">
                  Slug can only contain lowercase letters and hyphens.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>For status indicators, tags, and counters.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Trial</Badge>
              <Badge variant="destructive">Suspended</Badge>
              <Badge variant="info">Beta</Badge>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Inline notifications. Tinted, not screaming.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert variant="info">
                <Info />
                <AlertTitle>New release</AlertTitle>
                <AlertDescription>Version 0.2 is rolling out gradually.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <CheckCircle2 />
                <AlertTitle>Saved</AlertTitle>
                <AlertDescription>Your changes are live.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <TriangleAlert />
                <AlertTitle>Trial ending</AlertTitle>
                <AlertDescription>Three days left on your trial.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Payment failed</AlertTitle>
                <AlertDescription>We couldn&apos;t charge your card.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer
        className="reveal mt-24 border-t pt-10 text-sm text-muted-foreground"
        style={{ animationDelay: '360ms' }}
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p>
            arc<span className="font-serif italic text-foreground">x</span>de — internal preview
          </p>
          <div className="flex gap-6">
            <a
              href="http://localhost:3001/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Swagger
            </a>
            <a
              href="http://localhost:3001/health"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Health
            </a>
            <a
              href="http://localhost:3001/ready"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Ready
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
