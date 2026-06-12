'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Geist', system-ui, sans-serif";

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
  const [selected, setSelected] = useState('individual');

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row overflow-hidden"
      style={{ background: '#272727' }}
    >
      {/* LEFT: branding */}
      <div className="relative hidden lg:flex flex-1 items-center justify-center px-6">
        <SlantEgg size="lg" style={{ width: 'clamp(180px, 25vw, 228px)' }} />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 1,
            height: '69%',
            borderRight: '1px solid #6b6b6b',
          }}
        />
      </div>

      {/* RIGHT: form */}
      <div className="flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 sm:py-16">
        <div style={{ maxWidth: 492, marginBottom: 'clamp(20px, 5vh, 32px)' }}>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 450,
              lineHeight: '120%',
              color: 'white',
              marginBottom: 'clamp(12px, 3vw, 18px)',
            }}
          >
            Choose your membership type.
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: 275,
              lineHeight: '120%',
              color: 'white',
            }}
          >
            Select the option that best matches how you want to learn and participate.
          </p>
        </div>

        <div
          style={{
            borderTop: '1px solid #6b6b6b',
            marginBottom: 'clamp(20px, 5vh, 32px)',
            maxWidth: 467,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(14px, 2vw, 20px)',
            maxWidth: 467,
            marginBottom: 'clamp(28px, 5vh, 40px)',
          }}
        >
          {MEMBERSHIPS.map((m) => {
            const checked = selected === m.id;
            return (
              <label
                key={m.id}
                style={{ position: 'relative', display: 'block', cursor: 'pointer' }}
              >
                <div
                  style={{
                    borderRadius: 34.23,
                    border: '0.9px solid #6b6b6b',
                    padding: 'clamp(16px, 3vw, 21px) clamp(40px, 5vw, 56px)',
                    background: checked ? 'rgba(255,255,255,0.04)' : 'transparent',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 'clamp(16px, 3vw, 24px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '1.5px solid #626262',
                      background: checked ? '#dfdfdf' : 'transparent',
                      display: 'block',
                      transition: 'background 0.2s ease',
                    }}
                  />
                  <input
                    type="radio"
                    name="membership"
                    value={m.id}
                    checked={checked}
                    onChange={() => setSelected(m.id)}
                    className="sr-only"
                  />
                  <p
                    style={{
                      fontFamily: FONT,
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      fontWeight: 300,
                      lineHeight: '150%',
                      color: 'white',
                      margin: 0,
                    }}
                  >
                    {m.title}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT,
                      fontSize: 'clamp(13px, 2vw, 16px)',
                      fontWeight: 100,
                      lineHeight: '130%',
                      color: 'white',
                      margin: 'clamp(6px, 1.5vw, 10px) 0 0',
                    }}
                  >
                    {m.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 467 }}>
          <Link href="/signup/individual">
            <button
              style={{
                minWidth: 166,
                padding: '12px 20px',
                borderRadius: 20,
                border: '1px solid #6b6b6b',
                background: 'transparent',
                color: 'white',
                fontFamily: FONT,
                fontSize: 18,
                fontWeight: 300,
                lineHeight: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              select
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
