/**
 * Onboarding domain contracts.
 *
 * Weights are server-side only — the GET /questions response exposes only
 * display fields. The POST /submit body accepts a userId (optional for
 * no-auth flows) and returns the computed readiness profile.
 */
import { z } from 'zod';

// ---- Question (display shape — no weights exposed to client) ----
export const onboardingQuestionSchema = z.object({
  id: z.string().min(5),
  text: z.string(),
  description: z.string().nullable(),
  options: z.array(z.string()),
  order: z.number().int(),
});
export type OnboardingQuestion = z.infer<typeof onboardingQuestionSchema>;

// ---- GET /questions query ----
export const getOnboardingQuestionsQuerySchema = z.object({
  role: z.string().min(1).max(50),
});
export type GetOnboardingQuestionsQuery = z.infer<typeof getOnboardingQuestionsQuerySchema>;

// ---- POST /submit body ----
export const submitAnswerSchema = z.object({
  questionId: z.string().min(5),
  selectedOption: z.string().min(1).max(255),
});
export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;

export const submitOnboardingBodySchema = z.object({
  userId: z.string().min(1).optional(),
  role: z.string().min(1).max(50),
  answers: z.array(submitAnswerSchema).min(1),
});
export type SubmitOnboardingBody = z.infer<typeof submitOnboardingBodySchema>;

// ---- POST /submit response ----
export const onboardingResultSchema = z.object({
  userId: z.string(),
  totalScore: z.number(),
  normalizedScore: z.number(),
  maxPossibleScore: z.number(),
  profileKey: z.string(),
});
export type OnboardingResult = z.infer<typeof onboardingResultSchema>;
