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
      emailVerifiedAt: new Date(),
      emailVerified: true,
      registrationCompleted: true,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@acme.test' },
    update: {},
    create: {
      email: 'bob@acme.test',
      fullName: 'Bob Member',
      emailVerifiedAt: new Date(),
      emailVerified: true,
      registrationCompleted: true,
    },
  });

  const aliceIdentity = await prisma.identity.upsert({
    where: { userId_provider: { userId: alice.id, provider: 'EMAIL_PASSWORD' } },
    update: {},
    create: {
      userId: alice.id,
      provider: 'EMAIL_PASSWORD',
      passwordHash: 'sjdjkskskskksksk', // Not a real hash, but it won't be used for login in dev
      providerId: 'alice@acme.test',
    },
  });
  const bobIdentity = await prisma.identity.upsert({
    where: { userId_provider: { userId: bob.id, provider: 'EMAIL_PASSWORD' } },
    update: {},
    create: {
      userId: bob.id,
      provider: 'EMAIL_PASSWORD',
      passwordHash: 'sjdjkskskskksksk', // Not a real hash, but it won't be used for login in dev
      providerId: 'bob@acme.test',
    },
  });

  const analystQuestions = [
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
      correctAnswer: 'I use AI occasionally',
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
      correctAnswer: 'Operational or business decisions',
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
      correctAnswer: 'General business data',
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
      correctAnswer: 'Using AI more effectively',
      order: 4,
    },
  ];

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
      correctAnswer: 'AI assists with code completion or suggestions',
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
      correctAnswer: 'Model accuracy and reliability',
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
      correctAnswer: 'Building more reliable AI features',
      order: 3,
    },
  ];

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
      correctAnswer: 'We have identified a few use cases',
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
      correctAnswer: 'Revenue growth',
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
      correctAnswer: 'Building business cases for AI',
      order: 3,
    },
  ];

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
      correctAnswer: 'AI helps with ideation or brainstorming',
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
      correctAnswer: 'Building user trust',
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
      correctAnswer: 'Human‑centred AI design',
      order: 3,
    },
  ];

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
      correctAnswer: 'Some team members use AI tools',
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
      correctAnswer: 'Team skills and training',
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
      correctAnswer: 'Upskilling my team on AI',
      order: 3,
    },
  ];

  // ---- AI Literacy Assessment Questions ----
  const literacyQuestions = [
    {
      questionKey: 'ai_lit_01',
      text: 'What do foundation models generate responses from?',
      options: ['Explicit rules', 'Training data patterns', 'User instructions'],
      correctAnswer: 'B',
      order: 1,
    },
    {
      questionKey: 'ai_lit_02',
      text: 'What is the term for when an AI generates plausible-sounding but false information?',
      options: ['Bias', 'Hallucination', 'Variance'],
      correctAnswer: 'B',
      order: 2,
    },
    {
      questionKey: 'ai_lit_03',
      text: 'Why are AI outputs probabilistic rather than deterministic?',
      options: [
        'AI outputs are probabilistic by design',
        'Because of randomness in training',
        'Due to system errors',
      ],
      correctAnswer: 'A',
      order: 3,
    },
    {
      questionKey: 'ai_lit_04',
      text: 'What do AI systems fundamentally do?',
      options: [
        'Follow explicit rules',
        'Predict probable next outputs',
        'Retrieve pre-stored answers',
      ],
      correctAnswer: 'B',
      order: 4,
    },
    {
      questionKey: 'ai_lit_05',
      text: 'How can you best reduce hallucinations in AI outputs?',
      options: ['Increase temperature', 'Use structured outputs', 'Remove context'],
      correctAnswer: 'B',
      order: 5,
    },
    {
      questionKey: 'ai_lit_06',
      text: 'What is the best approach to ensure AI uses current information?',
      options: [
        'Train new models daily',
        'Retrieve from trusted systems at runtime',
        'Accept all outputs as current',
      ],
      correctAnswer: 'B',
      order: 6,
    },
    {
      questionKey: 'ai_lit_07',
      text: 'What is automation bias in the context of AI systems?',
      options: [
        'Preference for automated systems',
        'Automation bias and lack of oversight',
        'Systems becoming slower',
      ],
      correctAnswer: 'A',
      order: 7,
    },
    {
      questionKey: 'ai_lit_08',
      text: 'Which is the most important control for responsible AI deployment?',
      options: [
        'Removing all AI features',
        'Tool permissions and approval controls',
        'Never using AI',
      ],
      correctAnswer: 'B',
      order: 8,
    },
    {
      questionKey: 'ai_lit_09',
      text: 'What should developers review before deploying AI features?',
      options: ['Only code quality', 'Privacy requirements', 'Only speed metrics'],
      correctAnswer: 'B',
      order: 9,
    },
    {
      questionKey: 'ai_lit_10',
      text: 'What is the key principle for handling user data in AI systems?',
      options: [
        'Collect all available data',
        'Only provide necessary information',
        'Share all data publicly',
      ],
      correctAnswer: 'B',
      order: 10,
    },
    {
      questionKey: 'ai_lit_11',
      text: 'Why is privacy governance important for AI systems?',
      options: [
        'It is not important',
        'Privacy obligations and data rights',
        'Only for compliance',
      ],
      correctAnswer: 'B',
      order: 11,
    },
    {
      questionKey: 'ai_lit_12',
      text: 'What is a key risk when AI has access to sensitive user data?',
      options: [
        'Data becomes faster',
        'Potential exposure of sensitive information',
        'No risks exist',
      ],
      correctAnswer: 'B',
      order: 12,
    },
    {
      questionKey: 'ai_lit_13',
      text: 'What determines if an AI system is safe to deploy?',
      options: [
        'Only technical performance',
        'Accuracy alone does not determine risk',
        'Speed of responses',
      ],
      correctAnswer: 'B',
      order: 13,
    },
    {
      questionKey: 'ai_lit_14',
      text: 'What can cause AI systems to produce discriminatory outcomes?',
      options: ['Low accuracy', 'Automation bias', 'User preferences'],
      correctAnswer: 'B',
      order: 14,
    },
    {
      questionKey: 'ai_lit_15',
      text: 'How should performance disparities across user groups be addressed?',
      options: ['Ignore them', 'Investigate performance disparities', 'Document but not fix'],
      correctAnswer: 'B',
      order: 15,
    },
    {
      questionKey: 'ai_lit_16',
      text: 'Why is ongoing evaluation with production data important?',
      options: [
        'It is not important',
        'Conduct ongoing evaluation using production data',
        'Only test once',
      ],
      correctAnswer: 'B',
      order: 16,
    },
    {
      questionKey: 'ai_lit_17',
      text: 'What should be assessed when evaluating AI system risks?',
      options: ['Only technical metrics', 'What harm could occur', 'Only user feedback'],
      correctAnswer: 'B',
      order: 17,
    },
    {
      questionKey: 'ai_lit_18',
      text: 'Who ultimately bears responsibility for AI system outcomes?',
      options: ['Only the AI model', 'Deployers remain responsible', 'Only end users'],
      correctAnswer: 'B',
      order: 18,
    },
    {
      questionKey: 'ai_lit_19',
      text: 'What matters most when assessing AI system impact?',
      options: [
        'Only theoretical metrics',
        'Real-world outcomes and user impact',
        'Only model benchmarks',
      ],
      correctAnswer: 'B',
      order: 19,
    },
    {
      questionKey: 'ai_lit_20',
      text: 'What is the goal of responsible AI governance?',
      options: [
        'Eliminate all AI usage',
        'Balancing usefulness, reliability, oversight, privacy and user impact',
        'Maximize speed',
      ],
      correctAnswer: 'B',
      order: 20,
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

  const allOnboardingQuestions = [
    ...analystQuestions,
    ...developerQuestions,
    ...strategistQuestions,
    ...designerQuestions,
    ...managerQuestions,
  ];

  // Clear existing onboarding data
  await prisma.userOnboardingAnswer.deleteMany({});
  await prisma.userOnboarding.deleteMany({});
  await prisma.onboardingQuestion.deleteMany({});

  // Seed role-based onboarding questions
  for (const q of allOnboardingQuestions) {
    await prisma.onboardingQuestion.upsert({
      where: { role_questionKey: { role: q.role, questionKey: q.questionKey } },
      update: {},
      create: q,
    });
  }

  // Clear existing literary assessment data
  await prisma.userLiteraryAnswer.deleteMany({});
  await prisma.userLiteraryAssessment.deleteMany({});
  await prisma.literaryQuestion.deleteMany({});

  // Seed AI literacy assessment questions
  for (const q of literacyQuestions) {
    await prisma.literaryQuestion.upsert({
      where: { questionKey: q.questionKey },
      update: {},
      create: q,
    });
  }

  console.log('✅ Seed complete');
  console.log('   Organizations:', { acme: acme.id, lumon: lumon.id });
  console.log('   Users:        ', { alice: alice.id, bob: bob.id });
  console.log('   Onboarding questions:', allOnboardingQuestions.length);
  console.log('   Literary assessment questions:', literacyQuestions.length);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
