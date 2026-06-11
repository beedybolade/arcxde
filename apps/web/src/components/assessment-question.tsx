import { CSSProperties, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { AssessmentProgress } from './assessment-progress';

export interface Answer {
  id: string;
  text: string;
}

export interface AssessmentQuestionProps extends HTMLAttributes<HTMLDivElement> {
  questionNumber: number;
  roleContext: string;
  question: string;
  answers: Answer[];
  selectedAnswerId?: string;
  onAnswerSelect: (answerId: string) => void;
  /** When both are provided, the pill progress renders at the top of the card. */
  currentQuestion?: number;
  totalQuestions?: number;
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
        }}
      >
        {typeof currentQuestion === 'number' && typeof totalQuestions === 'number' && (
          <div style={{ marginBottom: 34 }}>
            <AssessmentProgress currentQuestion={currentQuestion} totalQuestions={totalQuestions} />
          </div>
        )}

        {/* Role context */}
        <p style={{ fontFamily: FONT, fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          In your role as {roleContext}:
        </p>

        {/* Numbered question */}
        <h2
          style={{
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.25,
            color: '#e6e3dd',
            marginTop: 26,
            marginBottom: 24,
          }}
        >
          {questionNumber}. {question}
        </h2>

        {/* Answer options with custom radio dots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            return (
              <label
                key={answer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '13px 2px',
                  cursor: 'pointer',
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
                    fontSize: 17,
                    color: isSelected ? '#f4f1ea' : 'rgba(255,255,255,0.8)',
                  }}
                >
                  {answer.text}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  ),
);

AssessmentQuestion.displayName = 'AssessmentQuestion';
