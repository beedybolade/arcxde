'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

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
        // Redirect to signup (login) after 2 seconds
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
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1
            style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#991b1b' }}
          >
            Invalid Link
          </h1>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            This password reset link is invalid or has expired.
          </p>
          <a href="/forgot-password" style={{ color: '#2563eb', textDecoration: 'none' }}>
            Request a new reset link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Reset your password
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Enter your new password below. Make sure it's at least 8 characters long.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              New password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: isLoading ? 0.6 : 1,
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Confirm password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: isLoading ? 0.6 : 1,
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#09090b',
              color: 'white',
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        {message && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            {message}
            <p style={{ marginTop: '8px', fontSize: '12px' }}>Redirecting to login...</p>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
