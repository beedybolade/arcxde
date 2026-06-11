/**
 * OnboardingService.
 *
 * Application/domain layer:
 *   - Scores each submitted answer by comparing against the correct answer.
 *   - Simple correct-answer counting: 1 point per correct, total 20, passing = 18 (90%).
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

    let correctCount = 0;
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

      if (ans.selectedOption === question.correctAnswer) {
        correctCount++;
      }
      answers.push({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
      });
    }

    const totalQuestions = answers.length;
    const totalScore = correctCount;
    const normalizedScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const profileKey = deriveProfile(correctCount);

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

function deriveProfile(correctCount: number): string {
  const threshold = 18;
  if (correctCount >= threshold) {
    return 'advanced';
  }
  if (correctCount >= 10) {
    return 'intermediate';
  }
  return 'beginner';
}
