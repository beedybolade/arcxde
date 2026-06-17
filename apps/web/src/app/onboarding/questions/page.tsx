'use client';

import { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AssessmentQuestion } from '@/components/assessment-question';
import { useOnboardingQuestions, useSubmitOnboarding } from '@/lib/hooks/useOnboarding';
import { useUserStore } from '@/store/user-store';
import { CenteredLayout } from '@/components/layouts/centered-layout';

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

const ScreenShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="flex min-h-screen items-center justify-center"
    style={{ background: '#272727', fontFamily: FONT }}
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

  useEffect(() => {
    // 🛠️ If the store doesn't have a userId yet, ask the backend who owns this cookie
    if (hasHydrated && !userId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/me`, {
        method: 'GET',
        credentials: 'include', // 🚀 Crucial: brings the access_token along
      })
        .then((res) => {
          if (!res.ok) throw new Error('Session invalid');
          return res.json();
        })
        .then((data) => {
          // Update Zustand store memory layer with the actual user profile info
          useUserStore.setState({ userId: data.userId });
        })
        .catch((err) => {
          console.error('[AUTH] Failed to fetch session info:', err);
          // Fallback: send them back to signup if their cookie is bad or missing
          router.push('/signup/individual');
        });
    }
  }, [userId, hasHydrated, router]);

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

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      router.push('/signup/role');
    }
  };

  const handleContinue = () => {
    if (isLast) {
      if (!userId || !currentRole) {
        router.push('/signup/role');
        return;
      }
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

  if (!currentRole) {
    router.push('/signup/role');
    return null;
  }

  if (questionsError) {
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
    <CenteredLayout>
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
          onBack={handleBack}
          showHint
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
    </CenteredLayout>
  );
}

export default function OnboardingQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: '#272727' }}
        >
          <p style={{ fontFamily: FONT, color: '#ece9e3', fontSize: 18 }}>Loading...</p>
        </div>
      }
    >
      <OnboardingQuestionsContent />
    </Suspense>
  );
}
