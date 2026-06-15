'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth-layout';
import { GoogleButton } from '@/components/google-button';
import { FormInput } from '@/components/form-input';
import { useGoogleAuth, useSendVerificationEmail } from '@/lib/hooks/useAuth';

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

export default function IndividualSignupPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');

  const { redirectToGoogle, isRedirecting } = useGoogleAuth();
  const sendVerificationEmailMutation = useSendVerificationEmail();

  const handleSendEmail = () => {
    sendVerificationEmailMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setStep('code');
        },
      },
    );
  };

  if (step === 'code') {
    return (
      <AuthLayout>
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 34,
            padding: 'clamp(32px, 5vw, 46px) clamp(24px, 5vw, 42px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2
            style={{
              fontFamily: FONT,
              fontSize: 'clamp(20px, 4vw, 26px)',
              fontWeight: 400,
              color: '#d9d6d0',
              margin: '0 0 12px',
              textAlign: 'center',
            }}
          >
            Check your email
          </h2>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              margin: '0 auto 20px',
              maxWidth: 460,
            }}
          >
            We&apos;ve sent a verification link to {email}. Click the link in the email to verify
            your account and continue.
          </p>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              margin: '0 auto',
              maxWidth: 460,
            }}
          >
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setStep('email')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f3a9c0',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 14,
              }}
            >
              try again
            </button>
            .
          </p>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              margin: '20px auto 0',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/login/individual"
              style={{ color: '#f3a9c0', textDecoration: 'none', fontWeight: 500 }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  const canContinue = !!email && !sendVerificationEmailMutation.isPending;

  return (
    <AuthLayout>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 34,
          padding: 'clamp(32px, 5vw, 46px) clamp(24px, 5vw, 42px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <h2
          style={{
            fontFamily: FONT,
            fontSize: 'clamp(20px, 4vw, 26px)',
            fontWeight: 400,
            color: '#d9d6d0',
            margin: '0 0 10px',
            textAlign: 'center',
          }}
        >
          Create an individual account
        </h2>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 14,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
            margin: '0 0 24px',
          }}
        >
          Sign up with the Google account you use for work or with your work email address.
        </p>

        {/* Google button — centered, auto width */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <GoogleButton
            onClick={redirectToGoogle}
            disabled={isRedirecting}
            label={isRedirecting ? 'Connecting...' : 'Sign Up with Google'}
            isLoading={isRedirecting}
          />
        </div>

        {/* OR inline divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
          <span
            style={{
              fontFamily: FONT,
              fontSize: 14,
              letterSpacing: 1,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            OR
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        <FormInput
          label="Work email"
          type="email"
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sendVerificationEmailMutation.isPending}
          showLabel={false}
        />

        {sendVerificationEmailMutation.isError && (
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#ff8a8a', margin: '12px 0 0' }}>
            {sendVerificationEmailMutation.error?.message ||
              'Failed to send verification email. Please try again.'}
          </p>
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
      </div>

      <button
        disabled={!canContinue}
        onClick={handleSendEmail}
        style={continueBtnStyle(canContinue)}
      >
        {sendVerificationEmailMutation.isPending ? 'Sending...' : 'Continue'}
      </button>

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
        Already have an account?{' '}
        <Link
          href="/login/individual"
          style={{ color: '#f3a9c0', textDecoration: 'none', fontWeight: 500 }}
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
