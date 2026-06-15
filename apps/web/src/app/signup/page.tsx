'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { RoleCard } from '@/components/role-card';

const FONT = "'Geist', system-ui, sans-serif";

const continueBtnStyle = (enabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '22px',
  borderRadius: 18,
  border: 'none',
  cursor: enabled ? 'pointer' : 'default',
  fontFamily: FONT,
  fontSize: 18,
  fontWeight: 500,
  color: '#1a1917',
  background: 'linear-gradient(180deg,#fbf8f1,#ece7db)',
  boxShadow: '0 12px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7)',
  opacity: enabled ? 1 : 0.82,
  transition: 'opacity .15s ease',
});

const MEMBERSHIPS = [
  {
    id: 'individual',
    title: 'Individual',
    description:
      'For motivated self-starters who want to achieve AI literacy and improve their AI skills.',
  },
  {
    id: 'team',
    title: 'Team',
    description:
      'For functional teams seeking shared knowledge and understanding around AI literacy.',
  },
  {
    id: 'organisation',
    title: 'Organisation',
    description:
      'For organisations looking to ensure they meet the requirements of Article 4 of the EU AI Act.',
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected === 'individual') router.push('/signup/individual');
    else if (selected === 'team') router.push('/signup/team');
    else if (selected === 'organisation') router.push('/signup/organisation');
  };

  return (
    <AuthLayout>
      {/* Card */}
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 34,
          padding: 'clamp(28px, 6vw, 48px) clamp(24px, 6vw, 44px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Heading + subtitle */}
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: 400,
            lineHeight: 1.25,
            color: '#ece9e3',
            margin: '0 0 10px',
            textAlign: 'center',
          }}
        >
          Choose your membership type.
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 14,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
            margin: '0 0 clamp(20px, 4vw, 32px)',
          }}
        >
          Select the option that best matches how you want to learn and participate.
        </p>

        {/* Membership cards — stacked single column */}
        <div role="group" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MEMBERSHIPS.map((m) => (
            <RoleCard
              key={m.id}
              title={m.title}
              description={m.description}
              name="membership"
              value={m.id}
              checked={selected === m.id}
              onChange={() => setSelected(m.id)}
              cardSize="md"
            />
          ))}
        </div>
      </div>

      {/* Continue button */}
      <button onClick={handleContinue} disabled={!selected} style={continueBtnStyle(!!selected)}>
        Continue
      </button>
    </AuthLayout>
  );
}
