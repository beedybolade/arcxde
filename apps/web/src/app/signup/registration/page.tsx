'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useFinalizeSignup } from '../../../lib/hooks/useAuth';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Geist', system-ui, sans-serif";

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px 18px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'transparent',
  color: '#ece9e3',
  fontFamily: FONT,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: FONT,
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
  marginBottom: 8,
};

const BrandPanel = () => (
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
);

function FinalizeSignupContent() {
  const searchParams = useSearchParams();

  // Grab parameters out of the URL string
  const token = searchParams.get('token');
  const status = searchParams.get('status');

  // Check if the user track is strictly account linking (e.g., OAuth returning user adding a password)
  const isLinkFlow = status === 'PENDING_REGISTRATION';

  // Consume the custom authentication hook capabilities
  const { finalizeSignup, isFinalizing, finalizeError, clearFinalizeError } = useFinalizeSignup();

  // Keep local UI form state minimal
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

    // Update validation criteria based on active user context track
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
    <div
      className="flex min-h-screen items-center justify-center px-11 py-16"
      style={{ background: '#1a1918', fontFamily: FONT }}
    >
      <div className="grid w-full max-w-[1180px] grid-cols-1 items-center gap-20 lg:grid-cols-2">
        <BrandPanel />

        <div
          style={{
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 34,
            padding: '46px 42px',
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
            {isLinkFlow ? 'Create a password' : 'Complete your profile'}
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 15,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              margin: '18px auto 34px',
              maxWidth: 420,
            }}
          >
            {isLinkFlow
              ? 'Add email access to your account by choosing a secure password.'
              : 'Please provide your details below to activate your account.'}
          </p>

          {activeDisplayError && (
            <div
              style={{
                padding: 12,
                marginBottom: 22,
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Hide profile collection fields on account links */}
            {!isLinkFlow && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    required
                    disabled={isFinalizing}
                    placeholder="John"
                    style={inputStyle}
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    required
                    disabled={isFinalizing}
                    placeholder="Doe"
                    style={inputStyle}
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                required
                minLength={8}
                disabled={isFinalizing}
                placeholder="••••••••"
                style={inputStyle}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                required
                disabled={isFinalizing}
                placeholder="••••••••"
                style={inputStyle}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

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
      </div>
    </div>
  );
}

export default function FinalizeSignupPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: '#1a1918' }}
        >
          <p style={{ fontFamily: FONT, color: '#ece9e3', fontSize: 18 }}>Loading...</p>
        </div>
      }
    >
      <FinalizeSignupContent />
    </Suspense>
  );
}
