import { forwardRef, HTMLAttributes } from 'react';
import Image from 'next/image';
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

export const SlantEgg = forwardRef<HTMLDivElement, SlantEggProps>(
  ({ size = 'lg', className, style, ...props }, ref) => {
    const width = size === 'sm' ? 62 : 228;
    const height = (width / 250) * 332;

    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        style={{ width, height, ...style }}
        {...props}
      >
        <Image
          src="/arcxde-logo.svg"
          alt="Arcxde logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    );
  },
);

SlantEgg.displayName = 'SlantEgg';
