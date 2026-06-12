'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth-layout';
import { FormInput } from '@/components/form-input';

const FONT = "'Geist', system-ui, sans-serif";

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
    <AuthLayout
      brandText="Reset your password"
      brandDescription="Enter your email address and we'll send you a link to reset your password."
    >
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 34,
          padding: 'clamp(32px, 5vw, 46px) clamp(24px, 5vw, 42px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 'clamp(24px, 5vw, 34px)',
            fontWeight: 500,
            letterSpacing: '-0.5px',
            color: '#ece9e3',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Forgot your password?
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}
        >
          <FormInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
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
        <Link href="/login/individual" style={{ color: '#f3a9c0', textDecoration: 'underline' }}>
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
