import { CSSProperties, forwardRef, InputHTMLAttributes, PropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export interface RoleCardProps extends PropsWithoutRef<InputHTMLAttributes<HTMLInputElement>> {
  title: string;
  description: string;
  /** sm: card inside the 2-up grid · md: full-width hybrid card. */
  cardSize?: 'sm' | 'md';
}

const FONT = "'Geist', system-ui, sans-serif";

/** Pink-when-selected radio dot with a soft halo. */
const radioStyle = (checked?: boolean): CSSProperties => ({
  marginTop: 5,
  width: 18,
  height: 18,
  borderRadius: '50%',
  flexShrink: 0,
  boxSizing: 'border-box',
  border: checked ? 'none' : '1.5px solid rgba(255,255,255,0.35)',
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
          className={cn('relative flex items-start gap-4 transition-all', className)}
          style={{
            borderRadius: 22,
            padding: isMd ? '22px 26px' : '22px 24px',
            background: checked ? 'rgba(255,255,255,0.085)' : 'rgba(255,255,255,0.04)',
            border: checked ? '1px solid rgba(243,169,192,0.55)' : '1px solid transparent',
            color: '#e9e7e3',
          }}
        >
          <span style={radioStyle(checked)} />
          <input ref={ref} id={id} type="radio" className="sr-only" {...props} />

          <div>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 22,
                fontWeight: 500,
                lineHeight: 1.2,
                margin: 0,
                color: '#eceae5',
              }}
            >
              {title}
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1.45,
                marginTop: 9,
                marginBottom: 0,
                color: 'rgba(255,255,255,0.42)',
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
