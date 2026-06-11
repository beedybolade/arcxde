'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Geist', system-ui, sans-serif";

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '20px 22px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'transparent',
  color: '#ece9e3',
  fontFamily: FONT,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-11 py-16"
      style={{ background: '#1a1918', fontFamily: FONT }}
    >
      <div className="grid w-full max-w-[1180px] grid-cols-1 items-center gap-20 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="flex flex-col items-center text-center">
          <SlantEgg size="lg" showText style={{ marginBottom: 34 }} />
          <h2
            style={{
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 400,
              color: '#d9d6d0',
              margin: '0 0 24px',
            }}
          >
            Lorem ipsum dolor sit amet
          </h2>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: 520,
              margin: 0,
            }}
          >
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
            dolore eu fugiat nulla pariatur.
          </p>
        </div>

        {/* Form panel */}
        <div className="flex flex-col gap-7">
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 34,
              padding: '46px 42px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h1
              style={{
                fontFamily: FONT,
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: '-0.5px',
                color: '#ece9e3',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Forgot your password?
            </h1>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                margin: '20px auto 34px',
                maxWidth: 420,
              }}
            >
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={inputStyle}
              />

              {message && (
                <div
                  style={{
                    padding: 12,
                    fontSize: 14,
                    color: '#6ee7b7',
                    background: 'rgba(110,231,183,0.08)',
                    borderRadius: 12,
                    border: '1px solid rgba(110,231,183,0.25)',
                  }}
                >
                  {message}
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: 12,
                    fontSize: 14,
                    color: '#ff8a8a',
                    background: 'rgba(255,80,80,0.08)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,80,80,0.25)',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '20px',
                  borderRadius: 18,
                  border: 'none',
                  background: 'linear-gradient(180deg,#fbf8f1,#ece7db)',
                  color: '#1a1917',
                  fontFamily: FONT,
                  fontSize: 17,
                  fontWeight: 500,
                  cursor: isLoading ? 'default' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7)',
                  transition: 'opacity .15s ease',
                }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>

          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Remember your password?{' '}
            <Link href="/signup" style={{ color: '#f3a9c0', textDecoration: 'underline' }}>
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
