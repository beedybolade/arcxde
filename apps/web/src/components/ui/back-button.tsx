'use client';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      color: 'rgba(255,255,255,0.7)',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  </button>
);
