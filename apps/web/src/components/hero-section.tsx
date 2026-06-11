import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const FONT = "'Geist', system-ui, sans-serif";

export interface HeroSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ title, subtitle, className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      <h1
        style={{
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 450,
          lineHeight: '100%',
          color: 'white',
          marginBottom: subtitle ? 18 : 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 275,
            lineHeight: '100%',
            color: 'white',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  ),
);

HeroSection.displayName = 'HeroSection';
