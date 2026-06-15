'use client';

import React from 'react';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Geist', system-ui, sans-serif";

interface CenteredLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const CenteredLayout = ({ children, maxWidth = 896 }: CenteredLayoutProps) => {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-[clamp(16px,4vw,40px)] py-[clamp(24px,4vw,56px)]"
      style={{
        background: '#272727',
        fontFamily: FONT,
      }}
    >
      {/* Logo: on mobile it's part of flow (top), on larger screens it's absolute at top-left */}
      <div className="relative mb-6 w-full sm:absolute sm:top-[clamp(24px,4vw,49px)] sm:left-[clamp(16px,4vw,71px)] sm:mb-0 sm:w-auto">
        <SlantEgg size="sm" style={{ width: 'clamp(44px, 6vw, 52px)' }} />
      </div>

      {/* Card + button — centered */}
      <div
        className="flex w-full max-w-[896px] flex-col gap-5 sm:pt-[clamp(80px,10vw,120px)]"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
};
