'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth-layout';
import { FormInput } from '@/components/form-input';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Geist', system-ui, sans-serif";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setPassword('');
        setConfirm('');
        setTimeout(() => router.push('/signup'), 2000);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6 py-16"
        style={{ background: '#272727' }}
      >
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <SlantEgg size="lg" style={{ margin: '0 auto 44px', width: 228 }} />
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 500,
              color: '#ff8a8a',
              marginBottom: 16,
            }}
          >
            Invalid Link
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              color: 'rgba(255,255,255,0.55)',
              marginBottom: 32,
            }}
          >
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            style={{
              fontFamily: FONT,
              fontSize: 15,
              color: '#f3a9c0',
              textDecoration: 'underline',
            }}
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      brandText="Reset your password"
      brandDescription="Enter your new password below. Make sure it's at least 8 characters long."
    >
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 34,
          padding: 'clamp(32px, 5vw, 46px) clamp(24px, 5vw, 42px)',
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
          Create a new password
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}
        >
          <FormInput
            label="New password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.6 : 1 }}
          />

          <FormInput
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.6 : 1 }}
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
              <p style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>Redirecting to sign in...</p>
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
