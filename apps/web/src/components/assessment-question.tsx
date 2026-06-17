'use client';

import { CSSProperties, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { AssessmentProgress } from './assessment-progress';
import { BackButton } from './ui/back-button';

export interface Answer {
  id: string;
  text: string;
}

export interface AssessmentQuestionProps extends HTMLAttributes<HTMLDivElement> {
  questionNumber: number;
  question: string;
  answers: Answer[];
  selectedAnswerId?: string;
  onAnswerSelect: (answerId: string) => void;
  // Role header + back (onboarding/questions only)
  roleContext?: string;
  onBack?: () => void;
  // Progress bar (assessment only)
  currentQuestion?: number;
  totalQuestions?: number;
  showProgress?: boolean;
  // Hint (onboarding/questions only)
  showHint?: boolean;
}

const FONT = "'Geist', system-ui, sans-serif";

const radioStyle = (checked: boolean): CSSProperties => ({
  width: 18,
  height: 18,
  borderRadius: '50%',
  flexShrink: 0,
  boxSizing: 'border-box',
  border: checked ? 'none' : '1.5px solid rgba(255,255,255,0.35)',
  background: checked ? '#f3a9c0' : 'transparent',
  boxShadow: checked ? '0 0 0 4px rgba(243,169,192,0.2)' : 'none',
  display: 'inline-block',
  transition: 'all .15s ease',
});

export const AssessmentQuestion = forwardRef<HTMLDivElement, AssessmentQuestionProps>(
  (
    {
      questionNumber,
      roleContext,
      question,
      answers,
      selectedAnswerId,
      onAnswerSelect,
      currentQuestion,
      totalQuestions,
      showProgress = false,
      showHint = false,
      onBack,
      className,
      ...props
    },
    ref,
  ) => (
    <div ref={ref} className={cn('', className)} {...props}>
      <div
        style={{
          borderRadius: 34,
          border: '1px solid rgba(255,255,255,0.16)',
          padding: '46px 44px',
          background: 'transparent',
          minHeight: 440,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Role header + back arrow — onboarding/questions only */}
        {(onBack || roleContext) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 34,
            }}
          >
            {onBack && <BackButton onClick={onBack} />}
            {roleContext && (
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.7)',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                In your role as {/^[aeiou]/i.test(roleContext) ? 'an' : 'a'}{' '}
                <span style={{ textTransform: 'capitalize' }}>{roleContext}</span>
              </p>
            )}
          </div>
        )}

        {/* Progress bar — assessment only */}
        {showProgress &&
          typeof currentQuestion === 'number' &&
          typeof totalQuestions === 'number' && (
            <div style={{ marginBottom: 34 }}>
              <AssessmentProgress
                currentQuestion={currentQuestion}
                totalQuestions={totalQuestions}
              />
            </div>
          )}

        {/* Numbered question */}
        <h2
          className="text-[18px] md:text-[32px] font-medium leading-tight text-[#e6e3dd] mt-0 mb-6"
          style={{
            fontFamily: FONT,
          }}
        >
          {questionNumber}. {question}
        </h2>

        {/* Answer options — 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
          {answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            return (
              <label
                key={answer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderRadius: 16,
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={radioStyle(isSelected)} />
                <input
                  type="radio"
                  name={`question-${questionNumber}`}
                  value={answer.id}
                  checked={isSelected}
                  onChange={() => onAnswerSelect(answer.id)}
                  className="sr-only"
                />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 15,
                    color: isSelected ? '#f4f1ea' : 'rgba(255,255,255,0.7)',
                    lineHeight: 1.4,
                  }}
                >
                  {answer.text}
                </span>
              </label>
            );
          })}
        </div>

        {/* Hint — onboarding/questions only */}
        {showHint && typeof totalQuestions === 'number' && (
          <p
            style={{
              fontFamily: FONT,
              fontSize: 13,
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              margin: 'auto 0 0',
              paddingTop: 32,
            }}
          >
            Answer just {totalQuestions} questions to help us personalise your Agxnda experience.
          </p>
        )}
      </div>
    </div>
  ),
);

AssessmentQuestion.displayName = 'AssessmentQuestion';
