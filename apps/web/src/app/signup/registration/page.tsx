'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useFinalizeSignup } from '../../../lib/hooks/useAuth';
import { AuthLayout } from '@/components/auth-layout';
import { FormInput } from '@/components/form-input';

const FONT = "'Geist', system-ui, sans-serif";

function FinalizeSignupContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const status = searchParams.get('status');

  const isLinkFlow = status === 'PENDING_REGISTRATION';

  const { finalizeSignup, isFinalizing, finalizeError, clearFinalizeError } = useFinalizeSignup();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearFinalizeError();

    const isPasswordInvalid = !form.password || !form.confirmPassword;
    const isNameInvalid = !isLinkFlow && (!form.firstName.trim() || !form.lastName.trim());

    if (isPasswordInvalid || isNameInvalid) {
      setLocalError('All fields are required. Please fill in all missing information.');
      return;
    }
    if (!token) {
      setLocalError('Registration token missing. Please re-verify your email address link.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const payload: {
      token: string;
      password: string;
      confirmPassword: string;
      firstName?: string;
      lastName?: string;
    } = {
      token,
      password: form.password,
      confirmPassword: form.confirmPassword,
    };
    if (!isLinkFlow) {
      payload.firstName = form.firstName;
      payload.lastName = form.lastName;
    }
    finalizeSignup(payload);
  };

  const activeDisplayError = finalizeError || localError;

  return (
    <AuthLayout
      brandText={isLinkFlow ? 'Secure your account' : 'Complete your profile'}
      brandDescription={
        isLinkFlow
          ? 'Add email access to your account by choosing a secure password.'
          : 'Please provide your details below to activate your account.'
      }
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
          {isLinkFlow ? 'Create a password' : 'Complete your profile'}
        </h1>

        {activeDisplayError && (
          <div
            style={{
              padding: 12,
              marginBottom: 22,
              marginTop: 16,
              fontSize: 14,
              color: '#ff8a8a',
              background: 'rgba(255,80,80,0.08)',
              borderRadius: 12,
              border: '1px solid rgba(255,80,80,0.25)',
            }}
          >
            {activeDisplayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          {!isLinkFlow && (
            <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-4 gap-4">
              <FormInput
                label="First Name"
                type="text"
                required
                disabled={isFinalizing}
                placeholder="John"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
              <FormInput
                label="Last Name"
                type="text"
                required
                disabled={isFinalizing}
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          )}

          <FormInput
            label="Password"
            type="password"
            required
            minLength={8}
            disabled={isFinalizing}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            required
            disabled={isFinalizing}
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />

          <button
            type="submit"
            disabled={isFinalizing}
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
              cursor: isFinalizing ? 'default' : 'pointer',
              opacity: isFinalizing ? 0.5 : 1,
              boxShadow: '0 12px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7)',
              transition: 'opacity .15s ease',
            }}
          >
            {isFinalizing
              ? isLinkFlow
                ? 'Linking identity track...'
                : 'Setting up account...'
              : isLinkFlow
                ? 'Link Account & Sign In'
                : 'Complete Registration'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function FinalizeSignupPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: '#272727' }}
        >
          <p style={{ fontFamily: FONT, color: '#ece9e3', fontSize: 18 }}>Loading...</p>
        </div>
      }
    >
      <FinalizeSignupContent />
    </Suspense>
  );
}
