'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlantEgg } from '@/components/slant-egg';
import { RoleCard } from '@/components/role-card';
import { useUserStore } from '@/store/user-store';

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

const ROLES = [
  {
    id: 'developer',
    title: 'Developer',
    description: 'Those building AI-enabled products, systems and technical workflows.',
  },
  {
    id: 'strategist',
    title: 'Strategist',
    description: 'Those shaping AI direction, opportunities and organisational priorities.',
  },
  {
    id: 'designer',
    title: 'Designer',
    description: 'Those designing AI-enabled experiences, interfaces and interactions.',
  },
  {
    id: 'manager',
    title: 'Manager',
    description: 'Those leading teams, delivery and the operational use of AI.',
  },
  {
    id: 'analyst',
    title: 'Analyst',
    description: 'Those using AI to interpret data, generate insight and support decision-making.',
  },
  {
    id: 'executive',
    title: 'Executive',
    description: 'Senior leaders responsible for AI governance, oversight and business impact.',
  },
];

const HYBRID = {
  id: 'hybrid',
  title: 'Hybrid',
  description:
    'Multidisciplinary professionals working across strategy, product, design, technology and operations.',
};

function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (payload.sub) {
          setUser(payload.sub, accessToken);
        }
      } catch {
        // ignore decode errors
      }
    }
  }, [searchParams, setUser]);

  return null;
}

export default function RoleSelectionPage() {
  const router = useRouter();
  const setRole = useUserStore((s) => s.setRole);
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      setRole(selected);
      router.push(`/onboarding/questions?role=${selected}`);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <AuthCallbackHandler />
      </Suspense>

      <div
        className="flex min-h-screen justify-center px-11 py-16"
        style={{ background: '#1a1918', fontFamily: FONT }}
      >
        <div className="flex w-full max-w-[940px] flex-col gap-[30px]">
          <SlantEgg size="sm" className="self-start" />

          <div
            style={{
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 34,
              padding: '48px 44px',
            }}
          >
            <h1
              style={{
                fontFamily: FONT,
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: '-0.5px',
                lineHeight: 1.25,
                color: '#ece9e3',
                margin: 0,
              }}
            >
              Select the role that best reflects how you work with AI.
            </h1>

            <div
              role="group"
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
              style={{ marginTop: 38 }}
            >
              {ROLES.map((role) => (
                <RoleCard
                  key={role.id}
                  title={role.title}
                  description={role.description}
                  name="role"
                  value={role.id}
                  checked={selected === role.id}
                  onChange={() => setSelected(role.id)}
                  cardSize="sm"
                />
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <RoleCard
                title={HYBRID.title}
                description={HYBRID.description}
                name="role"
                value={HYBRID.id}
                checked={selected === HYBRID.id}
                onChange={() => setSelected(HYBRID.id)}
                cardSize="md"
              />
            </div>
          </div>

          <button
            disabled={!selected}
            onClick={handleContinue}
            style={continueBtnStyle(!!selected)}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
