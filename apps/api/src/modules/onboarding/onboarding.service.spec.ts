import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OnboardingQuestion, OnboardingResult } from '@app/contracts';

import type { OnboardingRepository, QuestionWithWeights } from './onboarding.repository.js';
import { OnboardingService } from './onboarding.service.js';

const ROLE = 'analyst';
const USER_ID = 'usr_abcdefghijklmnop123456';

const displayQuestion = (overrides: Partial<OnboardingQuestion> = {}): OnboardingQuestion => ({
  id: 'obq_550e8400e29b41d4a716446655440000',
  text: 'How do you use AI?',
  description: null,
  options: ['Never', 'Sometimes', 'Always'],
  order: 1,
  ...overrides,
});

const weightedQuestion = (overrides: Partial<QuestionWithWeights> = {}): QuestionWithWeights => ({
  id: 'obq_550e8400e29b41d4a716446655440000',
  options: ['Never', 'Sometimes', 'Always'],
  optionWeights: [0, 0.5, 1.0],
  questionWeight: 2.0,
  ...overrides,
});

const makeRepo = (): OnboardingRepository =>
  ({
    findQuestionsForDisplay: vi.fn(),
    findQuestionsWithWeights: vi.fn(),
    findOrCreateTempUser: vi.fn(),
    saveSubmission: vi.fn(),
    upsertResult: vi.fn(),
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
    it('computes totalScore, normalizedScore and profileKey correctly', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([weightedQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      const result = await service.submit({
        role: ROLE,
        answers: [{ questionId: 'obq_550e8400e29b41d4a716446655440000', selectedOption: 'Always' }],
      });

      // selectedWeight 1.0, questionWeight 2.0 → totalScore = 2.0, max = 2.0 → normalized = 100
      expect(result).toMatchObject<OnboardingResult>({
        userId: USER_ID,
        totalScore: 2.0,
        normalizedScore: 100,
        maxPossibleScore: 2.0,
        profileKey: 'advanced',
      });
    });

    it('assigns "beginner" profile for low scores', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([weightedQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      const result = await service.submit({
        role: ROLE,
        answers: [{ questionId: 'obq_550e8400e29b41d4a716446655440000', selectedOption: 'Never' }],
      });

      expect(result.profileKey).toBe('beginner');
      expect(result.normalizedScore).toBe(0);
    });

    it('throws NOT_FOUND when no questions exist for the role', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([]);

      await expect(
        service.submit({
          role: 'unknown',
          answers: [{ questionId: 'obq_x', selectedOption: 'Never' }],
        }),
      ).rejects.toMatchObject({ kind: 'NOT_FOUND' });
    });

    it('throws BAD_REQUEST when questionId is not active for the role', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([weightedQuestion()]);

      await expect(
        service.submit({
          role: ROLE,
          answers: [{ questionId: 'obq_wrong_id_12345678901234567890', selectedOption: 'Never' }],
        }),
      ).rejects.toMatchObject({ code: 'INVALID_QUESTION', kind: 'BAD_REQUEST' });
    });

    it('throws BAD_REQUEST when selectedOption is not valid', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([weightedQuestion()]);

      await expect(
        service.submit({
          role: ROLE,
          answers: [
            { questionId: 'obq_550e8400e29b41d4a716446655440000', selectedOption: 'Not an option' },
          ],
        }),
      ).rejects.toMatchObject({ code: 'INVALID_OPTION', kind: 'BAD_REQUEST' });
    });

    it('creates a temp user when userId is not provided', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([weightedQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      await service.submit({
        role: ROLE,
        answers: [
          { questionId: 'obq_550e8400e29b41d4a716446655440000', selectedOption: 'Sometimes' },
        ],
      });

      expect(repo.findOrCreateTempUser).toHaveBeenCalledWith(undefined);
    });
  });
});
