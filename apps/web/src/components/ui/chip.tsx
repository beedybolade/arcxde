'use client';

import React from 'react';

const FONT = "'Geist', system-ui, sans-serif";

interface ChipProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const Chip = ({ icon, children }: ChipProps) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 20,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      fontFamily: FONT,
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: 400,
    }}
  >
    {icon}
    {children}
  </div>
);
