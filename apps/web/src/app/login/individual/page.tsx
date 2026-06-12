'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth-layout';
import { GoogleButton } from '@/components/google-button';
import { FormInput } from '@/components/form-input';
import { useGoogleAuth } from '@/lib/hooks/useAuth';

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

export default function IndividualLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { redirectToGoogle, isRedirecting } = useGoogleAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      brandText="Welcome back"
      brandDescription="Sign in to your account to access your learning platform and continue your progress."
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
          Sign in
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 'clamp(13px, 2vw, 15px)',
            fontWeight: 400,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            margin: '16px auto 0',
            maxWidth: 420,
          }}
        >
          Sign in with your Google account or email address to access your workspace.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 20px' }}>
          <GoogleButton
            onClick={redirectToGoogle}
            disabled={isRedirecting}
            label={isRedirecting ? 'Connecting...' : 'Sign In with Google'}
            isLoading={isRedirecting}
          />
        </div>

        <div
          style={{
            textAlign: 'center',
            fontFamily: FONT,
            fontSize: 14,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 20,
          }}
        >
          OR
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginBottom: 24 }} />

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormInput
            label="Work email"
            type="email"
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            showLabel={false}
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            showLabel={false}
          />

          <div style={{ textAlign: 'right' }}>
            <Link
              href="/forgot-password"
              style={{
                fontFamily: FONT,
                fontSize: 14,
                color: '#f3a9c0',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <p style={{ fontFamily: FONT, fontSize: 14, color: '#ff8a8a', margin: 0 }}>{error}</p>
          )}

          <p
            style={{
              fontFamily: FONT,
              fontSize: 13.5,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              margin: '16px 0 0',
            }}
          >
            By continuing you agree to our{' '}
            <a href="#" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'underline' }}>
              Terms &amp; Conditions
            </a>
            {' & '}
            <a href="#" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'underline' }}>
              Privacy Policy
            </a>
          </p>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            style={continueBtnStyle(!!email && !!password && !isLoading)}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p
        style={{
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/signup/individual"
          style={{
            color: '#f3a9c0',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
