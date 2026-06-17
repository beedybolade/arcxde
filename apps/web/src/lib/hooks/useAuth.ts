import { useMutation } from '@tanstack/react-query';
import { api } from '../api-client';
import { useUserStore } from '../../store/user-store';
import { useState } from 'react';
import { FinalizeRegistrationDto } from '@app/contracts';
import { useRouter } from 'next/navigation';

interface FinalizeSignupResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  accessToken: string;
}

interface LoginResponse {
  data: {
    user: {
      id: string;
      email: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

// Initial hit: Triggers the email dispatch
export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => api.post('/signup/email', data),
  });
};

// New hook: Verifies the magic link and returns a temporary token or session
export const useVerifySignupToken = () => {
  return useMutation({
    mutationFn: (data: { token: string }) =>
      api.post<{
        email: string;
        registrationToken: string;
        status: 'NEW_USER' | 'PENDING_ONBOARDING' | 'PENDING_REGISTRATION' | 'EXISTING_USER';
      }>('/signup/verify-link', data),
  });
};
export const useLoginWithEmailAndPassword = () => {
  // Pull your auth store's direct state setter engine
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<LoginResponse>('/auth/login', data),
    onSuccess: (response) => {
      const { accessToken, user } = response.data;

      // 1. DROP ROUTE GUARD COOKIE FOR THE NEXT.JS MIDDLEWARE
      document.cookie = `access_token=${accessToken}; path=/; secure=${
        process.env.NODE_ENV === 'production' ? 'true' : 'false'
      }; samesite=strict`;

      // 2.  HYDRATE ZUSTAND AUTH STORE
      setUser(user.id, accessToken);
    },
  });
};

export const useFinalizeSignup = () => {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: FinalizeRegistrationDto) => {
      try {
        const response = await api.post<FinalizeSignupResponse>(
          '/signup/finalize-registration',
          payload,
        );

        return response;
      } catch (networkError: unknown) {
        const err = networkError as {
          response?: { status?: number; statusText?: string; data?: unknown };
          message?: string;
        };
        console.error(' Network Request Failed Directly inside mutationFn:', {
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data,
          message: err?.message,
        });
        throw networkError;
      }
    },
    onSuccess: (data) => {
      try {
        setError(null);

        // Resolve data layer safely based on what your API client wraps
        const raw = data as unknown as {
          data?: { user: { id: string }; accessToken: string };
          user?: { id: string };
          accessToken?: string;
        };
        const actualData =
          raw.data && !raw.user ? raw.data : (raw as { user: { id: string }; accessToken: string });
        setUser(actualData.user.id, actualData.accessToken);

        // Redirect to the onboarding step after successful registration finalization
        router.push('/signup/role');
      } catch (jsError: unknown) {
        const errMsg = jsError instanceof Error ? jsError.message : 'Unknown error';
        console.error(
          '[useFinalizeSignup] error in onSuccess:',
          errMsg,
          jsError instanceof Error ? jsError.stack : undefined,
        );
        setError(`Client formatting error: ${errMsg}`);
      }
    },
    onError: (err: unknown) => {
      const errorObj = err as {
        message?: string;
        response?: { data?: { message?: string }; status?: number };
      };
      console.error('Mutation onError Handler triggered:', {
        message: errorObj?.message,
        serverResponseData: errorObj?.response?.data,
        status: errorObj?.response?.status,
      });

      setError(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          'Failed to complete registration profile.',
      );
    },
  });

  return {
    finalizeSignup: mutation.mutate,
    isFinalizing: mutation.isPending,
    finalizeError: error,
    clearFinalizeError: () => setError(null),
  };
};

export const useGoogleAuth = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectToGoogle = () => {
    setIsRedirecting(true);

    // Pull from environment variables, fallback to local if not defined
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    // Trigger the full browser navigation to break out of CORS
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return {
    redirectToGoogle,
    isRedirecting,
  };
};

/**
 * Unified client-side session revocation worker
 */
export async function logout(): Promise<boolean> {
  try {
    // 1. Pull the bearer token — check Zustand store first (Google OAuth, magic link),
    // then fall back to localStorage (legacy email/password login)
    const storeToken = useUserStore.getState().token;
    const token = storeToken || localStorage.getItem('access_token');

    if (token) {
      // 2. Alert the NestJS backend to revoke the sessionId record
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // CRITICAL: Tells the browser to include cookies (access_token/refresh_token)
        // in this cross-origin request so NestJS knows whose session to destroy.
        credentials: 'include',
        body: JSON.stringify({}),
      });
    }
  } catch (err) {
    // Fail silently on the network layer so the user isn't trapped in a broken UI loop
    console.error('[AUTH_CLIENT] Failed to notify backend of session teardown:', err);
  } finally {
    // If you use cookies for route guards or session context, clear them here:
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    // We update only the identity keys. Zustand automatically syncs this to disk.
    useUserStore.setState({
      userId: null,
      token: null,
      // selectedRole and onboardingCompleted remain completely untouched here!
    });

    // 4. Force a hard break out of client-side cache space to the authorization gateway
    window.location.href = '/signup/individual';
  }
  return true;
}
