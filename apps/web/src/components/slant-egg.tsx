import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SlantEggProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * lg — full branding lockup: arch outline with the Arcxde® wordmark inside.
   * sm — small arch mark for the top-left corner (role / assessment / questions).
   */
  size?: 'sm' | 'lg';
  /** Show the Arcxde® wordmark. Only meaningful for size="lg". */
  showText?: boolean;
}

const FONT = "'Geist', system-ui, sans-serif";

/** Rounded-arch brand mark (matches the onboarding design). */
const ARCH_PATH = 'M11,323 L11,150 Q11,11 125,11 Q239,11 239,150 L239,323 Z';

export const SlantEgg = forwardRef<HTMLDivElement, SlantEggProps>(
  ({ size = 'lg', showText = true, className, style, ...props }, ref) => {
    if (size === 'sm') {
      return (
        <div
          ref={ref}
          className={cn('relative', className)}
          style={{ width: 62, ...style }}
          {...props}
        >
          <svg
            viewBox="0 0 250 332"
            fill="none"
            style={{ width: '100%', display: 'block' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={ARCH_PATH}
              stroke="rgba(245,242,235,0.82)"
              strokeWidth="2.4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div
            style={{ position: 'absolute', left: 0, right: 0, bottom: '13%', textAlign: 'center' }}
          >
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 300, color: '#f5f2eb' }}>
              Arcxde
            </span>
          </div>
        </div>
      );
    }

    // size === 'lg'
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        style={{ width: 228, ...style }}
        {...props}
      >
        <svg
          viewBox="0 0 250 332"
          fill="none"
          style={{ width: '100%', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={ARCH_PATH}
            stroke="rgba(245,242,235,0.82)"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {showText && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: '23%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize: 52,
                fontWeight: 300,
                letterSpacing: '-1.5px',
                color: '#f5f2eb',
                lineHeight: 1,
              }}
            >
              Arcxde
            </span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#f5f2eb', marginTop: 7 }}>
              ®
            </span>
          </div>
        )}
      </div>
    );
  },
);

SlantEgg.displayName = 'SlantEgg';
