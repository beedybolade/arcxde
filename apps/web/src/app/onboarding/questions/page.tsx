'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlantEgg } from '@/components/slant-egg';
import { AssessmentQuestion } from '@/components/assessment-question';
import { useOnboardingQuestions, useSubmitOnboarding } from '@/lib/hooks/useOnboarding';
import { useUserStore } from '@/store/user-store';

const FONT = "'Geist', system-ui, sans-serif";

const continueBtnStyle = (enabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '22px',
  borderRadius: 18,
  border: 'none',
  cursor: enabled ? 'pointer' : 'default',
  fontFamily: FONT,
  fontSize: 18,
  fontWeight: 500,
  color: '#1a1917',
  background: 'linear-gradient(180deg,#fbf8f1,#ece7db)',
  boxShadow: '0 12px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7)',
  opacity: enabled ? 1 : 0.82,
  transition: 'opacity .15s ease',
});

const BackArrow = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ScreenShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="flex min-h-screen items-center justify-center"
    style={{ background: '#1a1918', fontFamily: FONT }}
  >
    {children}
  </div>
);

interface Question {
  id: string;
  text: string;
  description: string | null;
  options: string[];
  order: number;
}

function OnboardingQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const userId = useUserStore((s) => s.userId);
  const selectedRole = useUserStore((s) => s.selectedRole);
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  const currentRole = role || selectedRole;

  const {
    data: questionsResponse,
    isLoading,
    error: questionsError,
  } = useOnboardingQuestions(currentRole);
  const {
    mutate: submitOnboarding,
    isPending: isSubmitting,
    error: submitError,
  } = useSubmitOnboarding();

  const questions = (questionsResponse?.data || []) as Question[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Wait for Zustand rehydrate before rendering content that needs persisted state
  if (!hasHydrated) {
    return (
      <ScreenShell>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>Loading...</p>
      </ScreenShell>
    );
  }

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isAnswered = !!answers[q?.id];

  const handleSelect = (answerId: string) => {
    if (q) {
      setAnswers((prev) => ({ ...prev, [q.id]: answerId }));
    }
  };

  const handleContinue = () => {
    if (isLast && userId && currentRole) {
      const formattedAnswers = Object.entries(answers).map(([questionId, answerIdx]) => {
        const question = questions.find((q) => q.id === questionId);
        const selectedOption = question?.options[parseInt(answerIdx)] || answerIdx;
        return {
          questionId,
          selectedOption,
        };
      });

      submitOnboarding(
        {
          userId,
          role: currentRole,
          answers: formattedAnswers,
        },
        {
          onSuccess: () => {
            router.push('/dashboard');
          },
        },
      );
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (isLoading) {
    return (
      <ScreenShell>
        <p style={{ color: '#ece9e3', fontSize: 18 }}>Loading questions...</p>
      </ScreenShell>
    );
  }

  if (questionsError || !currentRole || !userId) {
    return (
      <ScreenShell>
        <p style={{ color: '#ff8a8a', fontSize: 18 }}>
          {questionsError?.message || 'Error loading questions'}
        </p>
      </ScreenShell>
    );
  }

  if (questions.length === 0) {
    return (
      <ScreenShell>
        <p style={{ color: '#ece9e3', fontSize: 18 }}>No questions found</p>
      </ScreenShell>
    );
  }

  return (
    <div
      className="flex min-h-screen justify-center px-11 py-16"
      style={{ background: '#1a1918', fontFamily: FONT }}
    >
      <div className="flex w-full max-w-[940px] flex-col gap-[30px]">
        <SlantEgg size="sm" className="self-start" />

        <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start' }}>
          <Link
            href="/signup/role"
            aria-label="Back"
            style={{ marginTop: 8, color: '#ece9e3', display: 'flex', textDecoration: 'none' }}
          >
            <BackArrow />
          </Link>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 500,
              letterSpacing: '-0.5px',
              lineHeight: 1.25,
              color: '#ece9e3',
              margin: 0,
            }}
          >
            Answer just {questions.length} questions to help us personalise your Arcxde experience.
          </h1>
        </div>

        {q && (
          <AssessmentQuestion
            questionNumber={currentIndex + 1}
            roleContext={currentRole}
            question={q.text}
            answers={q.options.map((opt, idx) => ({ id: String(idx), text: opt }))}
            selectedAnswerId={answers[q.id]}
            onAnswerSelect={handleSelect}
            currentQuestion={currentIndex + 1}
            totalQuestions={questions.length}
          />
        )}

        {submitError && (
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#ff8a8a', margin: 0 }}>
            {submitError.message || 'Error submitting answers'}
          </p>
        )}

        <button
          disabled={!isAnswered || isSubmitting}
          onClick={handleContinue}
          style={continueBtnStyle(isAnswered && !isSubmitting)}
        >
          {isSubmitting ? 'Submitting...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default function OnboardingQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: '#1a1918' }}
        >
          <p style={{ fontFamily: FONT, color: '#ece9e3', fontSize: 18 }}>Loading...</p>
        </div>
      }
    >
      <OnboardingQuestionsContent />
    </Suspense>
  );
}
