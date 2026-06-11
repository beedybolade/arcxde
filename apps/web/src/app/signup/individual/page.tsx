'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SlantEgg } from '@/components/slant-egg';
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

const GoogleLogo = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

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

export default function IndividualSignupPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');

  const { redirectToGoogle, isRedirecting } = useGoogleAuth();
  const sendVerificationEmailMutation = useSendVerificationEmail();

  // Action 1: Handle Email Submission
  const handleSendEmail = () => {
    sendVerificationEmailMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setStep('code'); // Clean page change to the code input screen
        },
      },
    );
  };

  if (step === 'code') {
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
              Check your email
            </h1>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.55)',
                textAlign: 'center',
                margin: '20px auto 0',
                maxWidth: 460,
              }}
            >
              We&apos;ve sent a verification link to{' '}
              <strong style={{ color: '#ece9e3' }}>{email}</strong>. Click the link in the email to
              verify your account and continue.
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                margin: '28px auto 0',
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
                margin: '28px auto 0',
              }}
            >
              Already have an account?{' '}
              <Link
                href="/login/individual"
                style={{
                  color: '#f3a9c0',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canContinue = !!email && !sendVerificationEmailMutation.isPending;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-11 py-16"
      style={{ background: '#1a1918', fontFamily: FONT }}
    >
      <div className="grid w-full max-w-[1180px] grid-cols-1 items-center gap-20 lg:grid-cols-2">
        <BrandPanel />

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
              Create an individual account
            </h1>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                margin: '20px auto 0',
                maxWidth: 420,
              }}
            >
              Sign up with the Google account you use for work or with your work email address.
            </p>

            {/* Google button */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '34px 0 28px' }}>
              <button
                onClick={redirectToGoogle}
                disabled={isRedirecting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  borderRadius: 12,
                  background: '#fff',
                  border: 'none',
                  padding: '16px 30px',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.28)',
                  cursor: isRedirecting ? 'default' : 'pointer',
                }}
              >
                <GoogleLogo />
                <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 500, color: '#1f1f1f' }}>
                  {isRedirecting ? 'Connecting...' : 'Sign Up with Google'}
                </span>
              </button>
            </div>

            {/* OR divider */}
            <div
              style={{
                textAlign: 'center',
                fontFamily: FONT,
                fontSize: 14,
                letterSpacing: 1,
                color: 'rgba(255,255,255,0.45)',
                marginBottom: 22,
              }}
            >
              OR
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginBottom: 30 }} />

            {/* Email input */}
            <input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sendVerificationEmailMutation.isPending}
              style={{
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
              }}
            />

            {sendVerificationEmailMutation.isError && (
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#ff8a8a', margin: '16px 0 0' }}>
                {sendVerificationEmailMutation.error?.message ||
                  'Failed to send verification email. Please try again.'}
              </p>
            )}

            {/* Legal */}
            <p
              style={{
                fontFamily: FONT,
                fontSize: 13.5,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.45)',
                textAlign: 'center',
                margin: '30px 0 0',
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

          {/* Continue */}
          <button
            disabled={!canContinue}
            onClick={handleSendEmail}
            style={continueBtnStyle(canContinue)}
          >
            {sendVerificationEmailMutation.isPending ? 'Sending...' : 'Continue'}
          </button>

          {/* Sign in link */}
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
              style={{
                color: '#f3a9c0',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
