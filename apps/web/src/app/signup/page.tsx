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
    <div className="min-h-screen bg-[#222] overflow-hidden flex">
      {/* ── LEFT: branding ─────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center">
        <SlantEgg size="lg" showText />

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

      {/* ── RIGHT: form ────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-16 py-16">
        <div style={{ maxWidth: 492, marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 32,
              fontWeight: 450,
              lineHeight: '100%',
              color: 'white',
              marginBottom: 18,
            }}
          >
            Choose your membership type.
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 24,
              fontWeight: 275,
              lineHeight: '100%',
              color: 'white',
            }}
          >
            Select the option that best matches how you want to learn and participate.
          </p>
        </div>

        {/* Separator */}
        <div style={{ borderTop: '1px solid #6b6b6b', marginBottom: 32, maxWidth: 467 }} />

        {/* Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            maxWidth: 467,
            marginBottom: 40,
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
                    padding: '21px 56px',
                    background: checked ? 'rgba(255,255,255,0.04)' : 'transparent',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 24,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '1.5px solid #626262',
                      background: checked ? '#dfdfdf' : 'transparent',
                      display: 'block',
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
                      fontSize: 28,
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
                      fontSize: 16,
                      fontWeight: 100,
                      lineHeight: '100%',
                      color: 'white',
                      margin: 0,
                    }}
                  >
                    {m.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Select button — 166×38, radius 20 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 467 }}>
          <Link href="/signup/individual">
            <button
              style={{
                width: 166,
                height: 38,
                borderRadius: 20,
                border: '1px solid #6b6b6b',
                background: 'transparent',
                color: 'white',
                fontFamily: FONT,
                fontSize: 18,
                fontWeight: 300,
                lineHeight: '100%',
                cursor: 'pointer',
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
