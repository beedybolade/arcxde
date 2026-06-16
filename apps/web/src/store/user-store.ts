import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  token: string | null;
  selectedRole: string | null;
  onboardingCompleted: boolean;
  hasHydrated: boolean;
  setUser: (userId: string, token: string) => void;
  setRole: (role: string) => void;
  completeOnboarding: () => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      token: null,
      selectedRole: null,
      onboardingCompleted: false,
      hasHydrated: false,
      setUser: (userId, token) => set({ userId, token }),
      setRole: (role) => set({ selectedRole: role }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      logout: () =>
        set({
          userId: null,
          token: null,
          selectedRole: null,
          onboardingCompleted: false,
        }),
      setHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      // Dynamically namespaces the storage block by domain
      name:
        typeof window !== 'undefined'
          ? `arcxde-auth:${window.location.hostname}`
          : 'arcxde-auth:fallback',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
