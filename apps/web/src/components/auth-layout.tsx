'use client';

import React from 'react';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Geist', system-ui, sans-serif";

interface AuthLayoutProps {
  children: React.ReactNode;
  brandText?: string;
  brandDescription?: string;
}

export const AuthLayout = ({
  children,
  brandText = 'Welcome',
  brandDescription = 'Sign in to your account to access your learning platform.',
}: AuthLayoutProps) => {
  return (
    // <div
    //   className="flex min-h-screen items-stretch justify-center px-4 py-12 sm:px-11 sm:py-16 lg:items-center"
    //   style={{ background: '#272727', fontFamily: FONT }}
    // >
    <div
      className="flex min-h-screen items-start justify-center px-4 py-12 sm:px-11 sm:py-16 lg:items-center"
      style={{ background: '#272727', fontFamily: FONT }}
    >
      <div className="grid w-full max-w-[1180px] grid-cols-1 items-start gap-8 sm:gap-12 lg:items-center lg:gap-20 lg:grid-cols-2">
        {/* Logo on mobile, Brand Panel on desktop */}
        <div className="lg:hidden mb-4">
          <SlantEgg size="sm" style={{ width: 'clamp(50px, 12vw, 62px)' }} />
        </div>

        {/* Brand Panel - Desktop only */}
        <div className="hidden lg:flex flex-col items-center text-center">
          <SlantEgg
            size="lg"
            style={{ marginBottom: 'clamp(20px, 5vw, 34px)', width: 'clamp(180px, 25vw, 228px)' }}
          />
          <h2
            style={{
              fontFamily: FONT,
              fontSize: 'clamp(24px, 5vw, 34px)',
              fontWeight: 400,
              color: '#d9d6d0',
              margin: '0 0 24px',
            }}
          >
            {brandText}
          </h2>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: 520,
              margin: 0,
            }}
          >
            {brandDescription}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex flex-col gap-7">{children}</div>
      </div>
    </div>
  );
};
