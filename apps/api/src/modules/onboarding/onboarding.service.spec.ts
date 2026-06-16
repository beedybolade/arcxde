import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OnboardingQuestion, OnboardingResult } from '@app/contracts';

import type { OnboardingRepository, QuestionForScoring } from './onboarding.repository.js';
import { OnboardingService } from './onboarding.service.js';

const ROLE = 'developer';
const USER_ID = 'usr_abcdefghijklmnop123456';

const displayQuestion = (overrides: Partial<OnboardingQuestion> = {}): OnboardingQuestion => ({
  id: 'obq_550e8400e29b41d4a716446655440000',
  text: 'How do you use AI?',
  description: null,
  options: ['I rarely use AI', 'I use AI occasionally', 'I use AI regularly'],
  order: 1,
  ...overrides,
});

const scoringQuestion = (overrides: Partial<QuestionForScoring> = {}): QuestionForScoring => ({
  id: 'obq_550e8400e29b41d4a716446655440000',
  options: ['I rarely use AI', 'I use AI occasionally', 'I use AI regularly'],
  ...overrides,
});

const makeRepo = (): OnboardingRepository =>
  ({
    findQuestionsForDisplay: vi.fn(),
    findQuestionsForScoring: vi.fn(),
    findOrCreateTempUser: vi.fn(),
    saveSubmission: vi.fn(),
    upsertResult: vi.fn(),
    markOnboardingComplete: vi.fn(),
  }) as unknown as OnboardingRepository;

describe('OnboardingService', () => {
  let repo: OnboardingRepository;
  let service: OnboardingService;

  beforeEach(() => {
    repo = makeRepo();
    service = new OnboardingService(repo);
  });

  describe('getQuestions', () => {
    it('returns display questions for the role', async () => {
      const questions = [displayQuestion()];
      vi.mocked(repo.findQuestionsForDisplay).mockResolvedValue(questions);

      await expect(service.getQuestions(ROLE)).resolves.toEqual(questions);
      expect(repo.findQuestionsForDisplay).toHaveBeenCalledWith(ROLE);
    });
  });

  describe('submit', () => {
    it('marks onboarding as completed when all questions are answered', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      const questions = Array.from({ length: 5 }, (_, i) => ({
        id: `obq_${i}`,
        options: ['I rarely use AI', 'I use AI occasionally', 'I use AI regularly'],
      }));
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue(questions);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedOption: 'I use AI occasionally',
      }));

      const result = await service.submit({
        role: ROLE,
        answers,
      });

      expect(result).toMatchObject<OnboardingResult>({
        userId: USER_ID,
        totalScore: 5,
        normalizedScore: 100,
        maxPossibleScore: 5,
        profileKey: 'completed',
      });
      expect(repo.markOnboardingComplete).toHaveBeenCalledWith(USER_ID);
    });

    it('completes onboarding with any valid answer', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([scoringQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      const result = await service.submit({
        role: ROLE,
        answers: [
          { questionId: 'obq_550e8400e29b41d4a716446655440000', selectedOption: 'I rarely use AI' },
        ],
      });

      expect(result.profileKey).toBe('completed');
      expect(result.normalizedScore).toBe(100); // All questions answered
    });

    it('throws NOT_FOUND when no questions exist for the role', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([]);

      await expect(
        service.submit({
          role: 'unknown',
          answers: [{ questionId: 'obq_x', selectedOption: 'I rarely use AI' }],
        }),
      ).rejects.toMatchObject({ kind: 'NOT_FOUND' });
    });

    it('throws BAD_REQUEST when questionId is not active for the role', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([scoringQuestion()]);

      await expect(
        service.submit({
          role: ROLE,
          answers: [
            { questionId: 'obq_wrong_id_12345678901234567890', selectedOption: 'I rarely use AI' },
          ],
        }),
      ).rejects.toMatchObject({ code: 'INVALID_QUESTION', kind: 'BAD_REQUEST' });
    });

    it('throws BAD_REQUEST when selectedOption is not valid', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([scoringQuestion()]);

      await expect(
        service.submit({
          role: ROLE,
          answers: [
            {
              questionId: 'obq_550e8400e29b41d4a716446655440000',
              selectedOption: 'D. Not an option',
            },
          ],
        }),
      ).rejects.toMatchObject({ code: 'INVALID_OPTION', kind: 'BAD_REQUEST' });
    });

    it('creates a temp user when userId is not provided', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([scoringQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      await service.submit({
        role: ROLE,
        answers: [
          {
            questionId: 'obq_550e8400e29b41d4a716446655440000',
            selectedOption: 'I use AI occasionally',
          },
        ],
      });

      expect(repo.findOrCreateTempUser).toHaveBeenCalledWith(undefined);
    });
  });
});
