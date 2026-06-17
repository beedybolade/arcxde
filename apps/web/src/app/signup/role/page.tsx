'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CenteredLayout } from '@/components/layouts/centered-layout';
import { RoleCard } from '@/components/role-card';
import { useUserStore } from '@/store/user-store';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { SlantEgg } from '@/components';

const FONT = "'Geist', system-ui, sans-serif";

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
  {
    id: 'hybrid',
    title: 'Hybrid',
    description:
      'Multidisciplinary professionals working across strategy, product, design, technology and operations.',
  },
];

function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
      // Store token as cookie and remove from URL so it can't be re-used on back nav
      const secure = process.env.NODE_ENV === 'production';
      document.cookie = `access_token=${accessToken}; path=/; secure=${secure}; samesite=strict; max-age=${60 * 60 * 24 * 7}`;
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('accessToken');
      router.replace(cleanUrl.pathname + cleanUrl.search);
    }
  }, [searchParams, setUser, router]);

  return null;
}

export default function RoleSelectionPage() {
  const router = useRouter();
  const setRole = useUserStore((s) => s.setRole);
  const [selected, setSelected] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 639px)');

  const handleContinue = () => {
    if (selected) {
      setRole(selected);
      router.push(`/onboarding/questions?role=${selected}`);
    }
  };

  const continueButton = (
    <button
      onClick={handleContinue}
      disabled={!selected}
      style={{
        width: '100%',
        padding: '22px',
        borderRadius: 18,
        border: 'none',
        cursor: selected ? 'pointer' : 'default',
        fontFamily: FONT,
        fontSize: 18,
        fontWeight: 500,
        color: '#1a1917',
        background: 'linear-gradient(180deg,#fbf8f1,#ece7db)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7)',
        opacity: selected ? 1 : 0.82,
        transition: 'opacity .15s ease',
      }}
    >
      Continue
    </button>
  );

  return (
    <>
      <Suspense fallback={null}>
        <AuthCallbackHandler />
      </Suspense>

      {isMobile ? (
        /* ── Mobile: pixel-perfect from Figma ── */
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#272727',
            fontFamily: FONT,
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', left: 32, top: 67 }}>
            <SlantEgg size="sm" style={{ width: 40 }} />
          </div>

          <div
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              top: 147,
              height: 514,
              padding: 32,
              borderRadius: 32,
              outline: '2px solid #888789',
              outlineOffset: -2,
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: '#DFDDE4',
                fontSize: 18,
                fontWeight: 400,
                lineHeight: 1.4,
                flexShrink: 0,
              }}
            >
              Select the role that best reflects how you work with AI.
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                borderRadius: '32px 32px 0 0',
                scrollbarWidth: 'none',
              }}
            >
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  style={{
                    flexShrink: 0,
                    width: '100%',
                    minHeight: 110,
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingTop: 16,
                    paddingBottom: 16,
                    background: selected === role.id ? '#3a3b3c' : '#2F3031',
                    borderRadius: 24,
                    border:
                      selected === role.id ? '1.5px solid #DFDDE4' : '1.5px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      flexShrink: 0,
                      borderRadius: '50%',
                      border: selected === role.id ? '5px solid #DFDDE4' : '1.13px solid #888789',
                      transition: 'border 0.15s ease',
                    }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ color: '#DFDDE4', fontSize: 18, fontWeight: 400 }}>
                      {role.title}
                    </div>
                    <div
                      style={{ color: '#888789', fontSize: 14, fontWeight: 300, lineHeight: 1.5 }}
                    >
                      {role.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'absolute', left: 20, right: 20, top: 701 }}>
            <button
              onClick={handleContinue}
              disabled={!selected}
              style={{
                width: '100%',
                height: 64,
                borderRadius: 24,
                border: 'none',
                cursor: selected ? 'pointer' : 'default',
                fontFamily: FONT,
                fontSize: 18,
                fontWeight: 400,
                color: '#272727',
                background: '#F8F7F2',
                boxShadow:
                  '0px 6px 14.6px rgba(0,0,0,0.25) inset, 0px -8px 14.8px rgba(255,255,255,0.07) inset',
                outline: '0.8px solid #888789',
                outlineOffset: -0.8,
                opacity: selected ? 1 : 0.6,
                transition: 'opacity 0.15s ease',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        /* ── Desktop: untouched CenteredLayout ── */
        <CenteredLayout>
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 34,
              padding: 'clamp(28px, 5vw, 48px) clamp(24px, 5vw, 44px)',
            }}
          >
            <h1
              style={{
                fontFamily: FONT,
                fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 400,
                lineHeight: 1.25,
                color: '#ece9e3',
                margin: '0 0 clamp(20px, 4vw, 32px)',
              }}
            >
              Select the role that best reflects how you work with AI.
            </h1>

            <div role="group" className="grid grid-cols-1 gap-3 gap-4 md:grid-cols-2">
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
          </div>

          {continueButton}
        </CenteredLayout>
      )}
    </>
  );
}
