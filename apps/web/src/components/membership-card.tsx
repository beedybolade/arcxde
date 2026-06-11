import { CSSProperties, forwardRef, InputHTMLAttributes, PropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export interface MembershipCardProps extends PropsWithoutRef<
  InputHTMLAttributes<HTMLInputElement>
> {
  title: string;
  description: string;
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

export const MembershipCard = forwardRef<HTMLInputElement, MembershipCardProps>(
  ({ title, description, className, ...props }, ref) => {
    const checked = props.checked;
    const id = props.id || `membership-${title.toLowerCase()}`;

    return (
      <label htmlFor={id} className="relative block cursor-pointer">
        <div
          className={cn('relative flex items-start gap-[18px] transition-all', className)}
          style={{
            borderRadius: 24,
            padding: '24px 28px',
            background: checked ? '#f4f0e7' : 'rgba(255,255,255,0.045)',
            color: checked ? '#1a1917' : '#e9e7e3',
            boxShadow: checked ? '0 16px 46px rgba(0,0,0,0.42)' : 'none',
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
              }}
            >
              {title}
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 14.5,
                fontWeight: 400,
                lineHeight: 1.45,
                marginTop: 9,
                marginBottom: 0,
                maxWidth: 540,
                color: checked ? 'rgba(26,25,23,0.62)' : 'rgba(255,255,255,0.46)',
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

MembershipCard.displayName = 'MembershipCard';
