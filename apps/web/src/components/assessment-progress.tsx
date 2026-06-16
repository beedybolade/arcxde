import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface AssessmentProgressProps extends HTMLAttributes<HTMLDivElement> {
  currentQuestion: number;
  totalQuestions: number;
}

/** Horizontal pill progress. Active segments are pink; pills flex to share the row. */
export const AssessmentProgress = forwardRef<HTMLDivElement, AssessmentProgressProps>(
  ({ currentQuestion, totalQuestions, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex w-full gap-[10px]', className)} {...props}>
      {Array.from({ length: totalQuestions }).map((_, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            maxWidth: 64,
            height: 6,
            borderRadius: 99,
            background: i < currentQuestion ? '#f3a9c0' : 'rgba(255,255,255,0.14)',
            display: 'inline-block',
            transition: 'background 0.2s',
          }}
          aria-label={`Question ${i + 1} of ${totalQuestions}`}
        />
      ))}
    </div>
  ),
);

AssessmentProgress.displayName = 'AssessmentProgress';
