'use client';

import React from 'react';

const FONT = "'Geist', system-ui, sans-serif";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showLabel?: boolean;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: FONT,
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px 18px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'transparent',
  color: '#ece9e3',
  fontFamily: FONT,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
};

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, showLabel = true, style, ...props }, ref) => {
    return (
      <div>
        {showLabel && label && <label style={labelStyle}>{label}</label>}
        <input
          ref={ref}
          style={{ ...inputStyle, ...style }}
          {...props}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
            props.onBlur?.(e);
          }}
        />
      </div>
    );
  },
);

FormInput.displayName = 'FormInput';
