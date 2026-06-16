'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardCard, type ContentType } from '@/components/dashboard-card';

const FONT = "'Geist', system-ui, sans-serif";

const SIGNALS = [
  { id: '1', title: 'Anthropic reaches $900b valuation' },
  { id: '2', title: "Governments can't agree on what AI actually is" },
  { id: '3', title: 'OpenAI launches Deployment Company' },
  { id: '4', title: 'How AI reshapes skills and work in Europe' },
];

const COURSES: { id: string; title: string; contentType: ContentType }[] = [
  { id: '1', title: 'What are AI systems?', contentType: 'podcast' },
  { id: '2', title: 'How probabilistic outputs work.', contentType: 'article' },
  { id: '3', title: 'The problem with AI certainty', contentType: 'video' },
  { id: '4', title: 'How to explain recommendations', contentType: 'video' },
  { id: '5', title: 'The limitations of predictive systems', contentType: 'podcast' },
  { id: '6', title: 'AI disclosure patterns', contentType: 'article' },
];

const COMMUNITY = [
  { id: '1', title: 'Read a premium OpenClaw brief' },
  { id: '2', title: 'Join a Google AI Roundtable' },
  { id: '3', title: 'Review frontier models with Andrew Ng' },
  { id: '4', title: 'Watch a live Opus v.X teardown' },
  { id: '5', title: 'Party with Foward Deployed Engineers' },
];

/**
 *   Sidebar divider at x=244
 *   Top divider (after nav header) at y=257
 *   Bottom divider at y=1115
 *   Signals section: top 78, left 273
 *   Courses section: top 334, left 388
 *   Community section: top 1186, left 273
 *   Section labels: 16px / 300 / uppercase
 */
export default function DashboardPage() {
  return (
    <div
      className="bg-[#1a1918]"
      style={{ minHeight: 1402, position: 'relative', overflow: 'hidden' }}
    >
      <DashboardSidebar />

      {/* Main content — starts after sidebar (x=244) */}
      <div style={{ marginLeft: 244, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 257,
            left: 0,
            right: 0,
            borderTop: '1px solid #3e3e3e',
          }}
        />

        {/* ── SIGNALS ── top 24 (relative to content), label at y=24 */}
        <section style={{ position: 'absolute', top: 24, left: 29 }}>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 300,
              lineHeight: '150%',
              textTransform: 'uppercase',
              color: 'white',
              margin: '0 0 12px',
            }}
          >
            Signals
          </p>
          <div
            style={{
              display: 'flex',
              gap: 26.5,
              overflowX: 'auto',
              maxWidth: 'calc(100vw - 273px)',
            }}
          >
            {SIGNALS.map((s) => (
              <DashboardCard key={s.id} title={s.title} variant="signal" />
            ))}
          </div>
        </section>

        {/* ── YOUR COURSES ── top 289 (relative to content), label y=289 */}
        <section
          style={{ position: 'absolute', top: 289, left: 144, maxWidth: 'calc(100vw - 388px)' }}
        >
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 300,
              lineHeight: '150%',
              textTransform: 'uppercase',
              color: 'white',
              margin: '0 0 20px',
            }}
          >
            Your Courses
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26.5 }}>
            {COURSES.map((c) => (
              <DashboardCard
                key={c.id}
                title={c.title}
                contentType={c.contentType}
                variant="course"
                size="compact"
              />
            ))}
          </div>
        </section>

        <div
          style={{
            position: 'absolute',
            top: 1115,
            left: 0,
            right: 0,
            borderTop: '1px solid #3e3e3e',
          }}
        />

        {/* ── COMMUNITY ── top 1142 relative to content */}
        <section style={{ position: 'absolute', top: 1142, left: 29 }}>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 300,
              lineHeight: '150%',
              textTransform: 'uppercase',
              color: 'white',
              margin: '0 0 16px',
            }}
          >
            Community
          </p>
          <div
            style={{
              display: 'flex',
              gap: 20.5,
              overflowX: 'auto',
              maxWidth: 'calc(100vw - 273px)',
            }}
          >
            {COMMUNITY.map((c) => (
              <DashboardCard key={c.id} title={c.title} variant="community" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
