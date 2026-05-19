/**
 * Database seed script.
 *
 * Run with: pnpm db:seed
 *
 * Properties:
 *   - Idempotent — safe to re-run; uses upsert by stable natural keys (slug, email).
 *   - Dev-only — refuses to run in production (extra guard on top of CI policy).
 *   - Small — enough to log in and click around. Heavy fixtures live in tests, not here.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed in production');
  }

  console.log('🌱 Seeding...');

  // ---- Organizations ----
  const acme = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Inc',
      slug: 'acme',
      plan: 'growth',
      billingEmail: 'billing@acme.test',
    },
  });

  const lumon = await prisma.organization.upsert({
    where: { slug: 'lumon' },
    update: {},
    create: {
      name: 'Lumon Industries',
      slug: 'lumon',
      plan: 'enterprise',
      billingEmail: 'ap@lumon.test',
    },
  });

  // ---- Users ----
  // Password hash is intentionally null — seeded users use a magic-link login flow
  // in dev. If you need a password-able test user, hash with Argon2 in a separate
  // script and use the team password manager for the credentials.
  const alice = await prisma.user.upsert({
    where: { email: 'alice@acme.test' },
    update: {},
    create: {
      email: 'alice@acme.test',
      fullName: 'Alice Admin',
      emailVerified: new Date(),
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@acme.test' },
    update: {},
    create: {
      email: 'bob@acme.test',
      fullName: 'Bob Member',
      emailVerified: new Date(),
    },
  });

  const analystQuestions = [
    // Analyst questions
    {
      role: 'analyst',
      questionKey: 'ai_usage',
      text: 'How do you currently use AI in your work?',
      options: [
        'I rarely use AI today',
        'I use AI occasionally',
        'I use AI regularly',
        'AI is central to my workflow',
        'I help shape AI-enabled products or workflows',
      ],
      order: 1,
    },
    {
      role: 'analyst',
      questionKey: 'decision_type',
      text: 'What kind of decisions or outcomes do your insights influence?',
      options: [
        'Internal team decisions',
        'Operational or business decisions',
        'Customer-facing decisions',
        'Financial or regulated outcomes',
        'High-impact or sensitive decisions',
      ],
      order: 2,
    },
    {
      role: 'analyst',
      questionKey: 'data_type',
      text: 'What type of data do you typically work with?',
      options: [
        'General business data',
        'Customer or behavioural data',
        'Financial or regulated data',
        'Health or sensitive personal data',
        'Mixed or multiple data types',
      ],
      order: 3,
    },
    {
      role: 'analyst',
      questionKey: 'improvement_goal',
      text: 'What are you hoping to improve most?',
      options: [
        'Understanding AI risks and limitations',
        'Using AI more effectively',
        'Responsible AI decision-making',
        'AI governance and oversight',
        'Building better AI-enabled products',
        'Career development',
      ],
      order: 4,
    },
  ];

  // ---- Developer questions ----
  const developerQuestions = [
    {
      role: 'developer',
      questionKey: 'ai_integration',
      text: 'How is AI currently integrated into your development work?',
      options: [
        'I rarely use AI tools',
        'AI assists with code completion or suggestions',
        'AI generates code or tests for me',
        'I build features that use AI/ML',
        'I architect AI-powered systems',
      ],
      order: 1,
    },
    {
      role: 'developer',
      questionKey: 'ai_challenges',
      text: "What's your biggest challenge with AI development?",
      options: [
        'Understanding AI limitations',
        'Model accuracy and reliability',
        'Integration with existing systems',
        'Cost and performance',
        'Ethical and responsible AI',
      ],
      order: 2,
    },
    {
      role: 'developer',
      questionKey: 'improvement_goal',
      text: 'What are you hoping to improve most?',
      options: [
        'Writing better AI prompts',
        'Building more reliable AI features',
        'Deploying AI in production',
        'Evaluating AI model outputs',
        'AI security and safety',
      ],
      order: 3,
    },
  ];

  // ---- Strategist questions ----
  const strategistQuestions = [
    {
      role: 'strategist',
      questionKey: 'ai_opportunity',
      text: 'How are you identifying AI opportunities?',
      options: [
        "I'm still exploring possibilities",
        'We have identified a few use cases',
        'We have a roadmap but not yet implemented',
        'We are actively piloting AI initiatives',
        'AI is central to our strategy',
      ],
      order: 1,
    },
    {
      role: 'strategist',
      questionKey: 'decision_factors',
      text: 'What drives your AI investment decisions?',
      options: [
        'Cost reduction',
        'Revenue growth',
        'Customer experience',
        'Competitive pressure',
        'Risk and compliance',
      ],
      order: 2,
    },
    {
      role: 'strategist',
      questionKey: 'improvement_goal',
      text: 'What are you hoping to improve most?',
      options: [
        'Identifying viable AI use cases',
        'Building business cases for AI',
        'Measuring AI ROI',
        'AI governance and strategy',
        'Keeping up with AI trends',
      ],
      order: 3,
    },
  ];

  // ---- Designer questions ----
  const designerQuestions = [
    {
      role: 'designer',
      questionKey: 'ai_in_design',
      text: 'How do you currently use AI in your design workflow?',
      options: [
        'I rarely use AI tools',
        'AI helps with ideation or brainstorming',
        'AI generates UI elements or content',
        'I design AI-powered interfaces',
        'I prototype with AI-generated assets',
      ],
      order: 1,
    },
    {
      role: 'designer',
      questionKey: 'ai_ux_challenge',
      text: "What's your biggest challenge designing for AI?",
      options: [
        'Explaining AI limitations to users',
        'Handling uncertainty and errors',
        'Building user trust',
        'Measuring user experience',
        'Integrating AI feedback loops',
      ],
      order: 2,
    },
    {
      role: 'designer',
      questionKey: 'improvement_goal',
      text: 'What are you hoping to improve most?',
      options: [
        'Human‑centred AI design',
        'Better AI interaction patterns',
        'User trust in AI systems',
        'Evaluating AI-powered UX',
        'Accessibility in AI products',
      ],
      order: 3,
    },
  ];

  // ---- Manager questions ----
  const managerQuestions = [
    {
      role: 'manager',
      questionKey: 'team_ai_usage',
      text: 'How is your team currently using AI?',
      options: [
        'We are not using AI yet',
        'Individual experimentation only',
        'Some team members use AI tools',
        'AI is integrated into our workflows',
        'We build AI‑enabled products',
      ],
      order: 1,
    },
    {
      role: 'manager',
      questionKey: 'management_concern',
      text: "What's your biggest concern about AI adoption?",
      options: [
        'Team skills and training',
        'Data privacy and security',
        'Cost and budget',
        'Measuring productivity gains',
        'Ethical and legal risks',
      ],
      order: 2,
    },
    {
      role: 'manager',
      questionKey: 'improvement_goal',
      text: 'What are you hoping to improve most?',
      options: [
        'Upskilling my team on AI',
        'AI adoption and change management',
        'Measuring AI impact on KPIs',
        'Creating AI policies and guidelines',
        'Budgeting for AI tools',
      ],
      order: 3,
    },
  ];

  // ---- Memberships ----
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: alice.id, organizationId: acme.id } },
    update: {},
    create: { userId: alice.id, organizationId: acme.id, role: 'owner' },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: bob.id, organizationId: acme.id } },
    update: {},
    create: { userId: bob.id, organizationId: acme.id, role: 'member' },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: alice.id, organizationId: lumon.id } },
    update: {},
    create: { userId: alice.id, organizationId: lumon.id, role: 'admin' },
  });

  // Upsert all questions
  const allQuestions = [
    ...analystQuestions,
    ...developerQuestions,
    ...strategistQuestions,
    ...designerQuestions,
    ...managerQuestions,
  ];

  for (const q of allQuestions) {
    await prisma.onboardingQuestion.upsert({
      where: { role_questionKey: { role: q.role, questionKey: q.questionKey } },
      update: {},
      create: q,
    });
  }

  console.log('✅ Seed complete');
  console.log('   Organizations:', { acme: acme.id, lumon: lumon.id });
  console.log('   Users:        ', { alice: alice.id, bob: bob.id });
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
