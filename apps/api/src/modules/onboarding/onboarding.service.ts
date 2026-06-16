/**
 * OnboardingService.
 *
 * Application/domain layer:
 *   - Collects user profiling answers (no correct/incorrect answers).
 *   - Marks onboarding as completed when all questions are answered.
 *   - Supports a no-auth flow: if no userId is provided, a temporary user is
 *     created and the generated id is returned so the client can persist it.
 */
import type { OnboardingQuestion, OnboardingResult, SubmitOnboardingBody } from '@app/contracts';
import { Injectable } from '@nestjs/common';

import { DomainError } from '../../common/errors/domain-error.js';
import { OnboardingRepository } from './onboarding.repository.js';

@Injectable()
export class OnboardingService {
  constructor(private readonly repo: OnboardingRepository) {}

  async getQuestions(role: string): Promise<OnboardingQuestion[]> {
    return this.repo.findQuestionsForDisplay(role);
  }

  async submit(body: SubmitOnboardingBody): Promise<OnboardingResult> {
    const userId = await this.repo.findOrCreateTempUser(body.userId);

    const questions = await this.repo.findQuestionsForScoring(body.role);
    if (questions.length === 0) {
      throw DomainError.notFound(`OnboardingQuestions for role "${body.role}"`);
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const answers: { questionId: string; selectedOption: string }[] = [];

    for (const ans of body.answers) {
      const question = questionMap.get(ans.questionId);
      if (!question) {
        throw DomainError.badRequest(
          'INVALID_QUESTION',
          `Question "${ans.questionId}" is not active for role "${body.role}"`,
        );
      }

      const idx = question.options.indexOf(ans.selectedOption);
      if (idx === -1) {
        throw DomainError.badRequest(
          'INVALID_OPTION',
          `Option "${ans.selectedOption}" is not valid for question "${ans.questionId}"`,
        );
      }

      answers.push({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
      });
    }

    const totalQuestions = answers.length;
    const totalScore = totalQuestions;
    const normalizedScore = totalQuestions > 0 ? 100 : 0;
    const profileKey = 'completed';

    await this.repo.saveSubmission({ userId, role: body.role, answers });
    await this.repo.upsertResult(userId, totalScore, normalizedScore, profileKey);

    try {
      await this.repo.markOnboardingComplete(userId);
    } catch (err) {
      console.error('Failed to mark onboarding complete:', err);
    }

    return { userId, totalScore, normalizedScore, maxPossibleScore: totalQuestions, profileKey };
  }
}
