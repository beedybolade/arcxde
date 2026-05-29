/**
 * OnboardingService.
 *
 * Application/domain layer:
 *   - Scores each submitted answer by looking up optionWeights on the question.
 *   - Weights stay here; the controller and repository never surface them to
 *     the API consumer.
 *   - Supports a no-auth flow: if no userId is provided, a temporary user is
 *     created and the generated id is returned so the client can persist it.
 */
import { Injectable } from '@nestjs/common';

import { DomainError } from '../../common/errors/domain-error.js';

import { OnboardingRepository } from './onboarding.repository.js';

import type { OnboardingQuestion, OnboardingResult, SubmitOnboardingBody } from '@app/contracts';

@Injectable()
export class OnboardingService {
  constructor(private readonly repo: OnboardingRepository) {}

  async getQuestions(role: string): Promise<OnboardingQuestion[]> {
    return this.repo.findQuestionsForDisplay(role);
  }

  async submit(body: SubmitOnboardingBody): Promise<OnboardingResult> {
    const userId = await this.repo.findOrCreateTempUser(body.userId);

    const questions = await this.repo.findQuestionsWithWeights(body.role);
    if (questions.length === 0) {
      throw DomainError.notFound(`OnboardingQuestions for role "${body.role}"`);
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let totalScore = 0;
    let maxPossibleScore = 0;
    const answers: { questionId: string; selectedOption: string; selectedWeight: number }[] = [];

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

      const selectedWeight = question.optionWeights[idx] ?? 0;
      totalScore += question.questionWeight * selectedWeight;
      maxPossibleScore += question.questionWeight;
      answers.push({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        selectedWeight,
      });
    }

    const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const profileKey = deriveProfile(normalizedScore);

    await this.repo.saveSubmission({ userId, role: body.role, answers });
    await this.repo.upsertResult(userId, totalScore, normalizedScore, profileKey);

    return { userId, totalScore, normalizedScore, maxPossibleScore, profileKey };
  }
}

function deriveProfile(score: number): string {
  if (score < 30) return 'beginner';
  if (score < 70) return 'intermediate';
  return 'advanced';
}
