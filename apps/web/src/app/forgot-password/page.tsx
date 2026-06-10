'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

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
          Forgot your password?
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
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
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          Remember your password?{' '}
          <Link href="/signup" style={{ color: '#2563eb', textDecoration: 'none' }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
