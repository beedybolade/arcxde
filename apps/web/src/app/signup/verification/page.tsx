'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifySignupToken } from '@/lib/hooks/useAuth';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Geist', system-ui, sans-serif";

const VERIFICATION_COPY = {
  LOADING: {
    title: 'Checking your link...',
    description: 'Please wait while we validate your secure access credentials.',
    buttonText: 'Processing...',
  },
  NEW_USER: {
    title: 'Verify your email address',
    description:
      'Click the button below to confirm your account creation and continue setting up your profile workspace.',
    buttonText: 'Confirm & Create Account',
  },
  RETURNING_USER: {
    title: 'Confirm your secure login',
    description:
      'Click the button below to complete your secure sign-in and jump back into your workspace.',
    buttonText: 'Confirm & Sign In',
  },
};

function VerifyLandingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const verifyTokenMutation = useVerifySignupToken();

  // Cache response properties in local component state to handle the delayed button redirection
  const [verificationStatus, setVerificationStatus] = useState<
    'NEW_USER' | 'PENDING_ONBOARDING' | 'PENDING_REGISTRATION' | 'EXISTING_USER' | null
  >(null);
  const [cachedRegToken, setCachedRegToken] = useState<string>('');

  // 1. 🚀 Automatically verify the link on mount to determine user status
  useEffect(() => {
    if (!token) return;

    verifyTokenMutation.mutate(
      { token },
      {
        onSuccess: (response: {
          email: string;
          registrationToken: string;
          status: 'NEW_USER' | 'PENDING_ONBOARDING' | 'PENDING_REGISTRATION' | 'EXISTING_USER';
        }) => {
          // Commit parameters to component state instead of routing instantly!
          setVerificationStatus(response.status);
          setCachedRegToken(response.registrationToken);
        },
      },
    );
    // Explicitly disabling exhaustive-deps so it runs exactly once when token is loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 2. 🎯 Let the button click execute the actual routing track
  const handleProceedRouting = () => {
    if (!verificationStatus) return;

    if (verificationStatus === 'EXISTING_USER') {
      router.push('/dashboard');
    } else if (verificationStatus === 'PENDING_ONBOARDING') {
      router.push(`/signup/role?token=${cachedRegToken}`);
    } else if (verificationStatus === 'PENDING_REGISTRATION' || verificationStatus === 'NEW_USER') {
      router.push(`/signup/registration?token=${cachedRegToken}&status=${verificationStatus}`);
    }
  };

  // 3. Resolve display text layouts dynamically based on state
  let currentCopy = VERIFICATION_COPY.LOADING;

  if (verificationStatus === 'NEW_USER' || verificationStatus === 'PENDING_REGISTRATION') {
    currentCopy = VERIFICATION_COPY.NEW_USER;
  } else if (
    verificationStatus === 'PENDING_ONBOARDING' ||
    verificationStatus === 'EXISTING_USER'
  ) {
    currentCopy = VERIFICATION_COPY.RETURNING_USER;
  }

  // Disable button if token is missing, request is flying, or we haven't resolved status yet
  const isButtonDisabled = !token || verifyTokenMutation.isPending || !verificationStatus;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: '#1a1918', fontFamily: FONT }}
    >
      <div style={{ marginBottom: 44 }}>
        <SlantEgg size="lg" showText />
      </div>

      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: '-0.5px',
            color: '#ece9e3',
            marginBottom: 16,
          }}
        >
          {currentCopy.title}
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.55,
            marginBottom: 32,
          }}
        >
          {currentCopy.description}
        </p>

        <button
          disabled={isButtonDisabled}
          onClick={handleProceedRouting}
          style={{
            minWidth: 260,
            padding: '18px 32px',
            borderRadius: 16,
            border: 'none',
            background: 'linear-gradient(180deg,#fbf8f1,#ece7db)',
            color: '#1a1917',
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 500,
            cursor: !isButtonDisabled ? 'pointer' : 'default',
            opacity: !isButtonDisabled ? 1 : 0.5,
            boxShadow: '0 12px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7)',
            transition: 'opacity 0.2s ease',
          }}
        >
          {verifyTokenMutation.isPending ? 'Processing...' : currentCopy.buttonText}
        </button>

        {verifyTokenMutation.isError && (
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#ff8a8a', marginTop: 24 }}>
            {verifyTokenMutation.error?.message ||
              'This verification link is invalid or has expired.'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyLandingPage() {
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
      <VerifyLandingContent />
    </Suspense>
  );
}
