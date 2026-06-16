'use client';

import { useState, useEffect } from 'react';
import { Chip } from './chip';

interface CountdownProps {
  initialSeconds: number;
  onElapse?: () => void;
}

const ClockIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const Countdown = ({ initialSeconds, onElapse }: CountdownProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onElapse?.();
      return;
    }

    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds, onElapse]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <Chip icon={<ClockIcon />}>
      <span style={{ color: seconds <= 60 ? '#f3a9c0' : 'inherit' }}>
        {mins}:{secs}
      </span>
    </Chip>
  );
};
