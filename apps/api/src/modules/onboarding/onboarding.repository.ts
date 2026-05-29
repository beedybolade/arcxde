/**
 * OnboardingRepository.
 *
 * The ONLY file in this module that touches Prisma directly.
 * Keeps weights internal — the service computes the score; the controller
 * never sees optionWeights.
 */
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import type { OnboardingQuestion } from '@app/contracts';

export interface QuestionWithWeights {
  id: string;
  options: string[];
  optionWeights: number[];
  questionWeight: number;
}

export interface AnswerRecord {
  questionId: string;
  selectedOption: string;
  selectedWeight: number;
}

export interface SaveSubmissionParams {
  userId: string;
  role: string;
  answers: AnswerRecord[];
}

@Injectable()
export class OnboardingRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns questions suitable for display — no weights included. */
  async findQuestionsForDisplay(role: string): Promise<OnboardingQuestion[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const rows = await this.prisma.onboardingQuestion.findMany({
      where: { role, isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, text: true, description: true, options: true, order: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return rows.map(
      (r: {
        id: string;
        text: string;
        description: string | null;
        options: unknown;
        order: number;
      }) => ({
        id: r.id,
        text: r.text,
        description: r.description,
        options: r.options as string[],
        order: r.order,
      }),
    );
  }

  /** Returns questions with weights — for internal score computation only. */
  async findQuestionsWithWeights(role: string): Promise<QuestionWithWeights[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const rows = await this.prisma.onboardingQuestion.findMany({
      where: { role, isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, options: true, optionWeights: true, questionWeight: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return rows.map(
      (r: { id: string; options: unknown; optionWeights: unknown; questionWeight: number }) => ({
        id: r.id,
        options: r.options as string[],
        optionWeights: r.optionWeights as number[],
        questionWeight: r.questionWeight,
      }),
    );
  }

  /**
   * Finds an existing user by id, or creates a temporary one.
   * Returns the resolved user id.
   */
  async findOrCreateTempUser(userId?: string): Promise<string> {
    if (userId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (user) return user.id as string;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const created = await this.prisma.user.create({
      data: {
        email: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@onboarding.internal`,
        fullName: 'Onboarding User',
      },
      select: { id: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return created.id as string;
  }

  /** Persists the onboarding session and all answers. */
  async saveSubmission(params: SaveSubmissionParams): Promise<void> {
    const { userId, role, answers } = params;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const onboarding = await this.prisma.userOnboarding.upsert({
      where: { userId },
      update: { role, completedAt: new Date() },
      create: { userId, role },
      select: { id: true },
    });

    for (const ans of answers) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.prisma.userOnboardingAnswer.upsert({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where: {
          onboardingId_questionId: {
            onboardingId: onboarding.id as string,
            questionId: ans.questionId,
          },
        },
        update: { selectedOption: ans.selectedOption, selectedWeight: ans.selectedWeight },
        create: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          onboardingId: onboarding.id as string,
          questionId: ans.questionId,
          selectedOption: ans.selectedOption,
          selectedWeight: ans.selectedWeight,
        },
      });
    }
  }

  /** Persists the computed onboarding result for the user. */
  async upsertResult(
    userId: string,
    totalScore: number,
    normalizedScore: number,
    profileKey: string,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.prisma.userOnboardingResult.upsert({
      where: { userId },
      update: { totalScore, normalizedScore, profileKey, computedAt: new Date() },
      create: { userId, totalScore, normalizedScore, profileKey },
    });
  }
}
