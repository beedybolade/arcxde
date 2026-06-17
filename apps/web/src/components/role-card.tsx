import { CSSProperties, forwardRef, InputHTMLAttributes, PropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export interface RoleCardProps extends PropsWithoutRef<InputHTMLAttributes<HTMLInputElement>> {
  title: string;
  description: string;
  /** sm: card inside the 2-up grid · md: full-width hybrid card. */
  cardSize?: 'sm' | 'md';
}

const FONT = "'Geist', system-ui, sans-serif";

const radioStyle = (checked?: boolean): CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  flexShrink: 0,
  boxSizing: 'border-box',
  border: checked ? 'none' : '1.5px solid rgba(255,255,255,0.3)',
  background: checked ? '#f3a9c0' : 'transparent',
  boxShadow: checked ? '0 0 0 4px rgba(243,169,192,0.2)' : 'none',
  display: 'block',
  transition: 'all .15s ease',
});

export const RoleCard = forwardRef<HTMLInputElement, RoleCardProps>(
  ({ title, description, cardSize = 'sm', className, ...props }, ref) => {
    const checked = props.checked;
    const id = props.id || `role-${title.toLowerCase()}`;
    const isMd = cardSize === 'md';

    return (
      <label htmlFor={id} className="relative block w-full cursor-pointer">
        <div
          className={cn('relative flex items-center gap-4 transition-all', className)}
          style={{
            borderRadius: 22,
            padding: isMd ? '24px 28px' : 'clamp(18px, 4vw, 22px) clamp(20px, 5vw, 24px)',
            background: checked ? '#f0ece3' : 'rgba(255,255,255,0.07)',
            border: checked
              ? '1px solid rgba(243,169,192,0.55)'
              : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={radioStyle(checked)} />
          <input ref={ref} id={id} type="radio" className="sr-only" {...props} />

          <div>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 'clamp(16px, 3vw, 19px)',
                fontWeight: 500,
                lineHeight: 1.2,
                margin: 0,
                color: checked ? '#1a1917' : '#eceae5',
              }}
            >
              {title}
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 'clamp(13px, 2.5vw, 14px)',
                fontWeight: 400,
                lineHeight: 1.45,
                marginTop: 'clamp(5px, 1.5vw, 7px)',
                marginBottom: 0,
                color: checked ? 'rgba(26,25,23,0.55)' : 'rgba(255,255,255,0.42)',
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </label>
    );
  },
);

RoleCard.displayName = 'RoleCard';
