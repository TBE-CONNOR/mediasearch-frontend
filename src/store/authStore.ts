import { create } from 'zustand';
import type { Tier } from '@/types/domain';

export type { Tier };

interface AuthState {
  idToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  tier: Tier | null;
  email: string | null;
  sub: string | null;
  authLoading: boolean;
  authError: string | null;
  authReady: boolean;
  setTokens: (tokens: {
    idToken: string;
    expiresAt: number;
    refreshToken?: string;
  }) => void;
  setUser: (user: { email: string; sub: string; tier: Tier }) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setAuthReady: (ready: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  idToken: null,
  refreshToken: null,
  expiresAt: null,
  tier: null,
  email: null,
  sub: null,
  authLoading: false,
  authError: null,
  authReady: false,

  setTokens: (tokens) =>
    set((state) => ({
      idToken: tokens.idToken,
      expiresAt: tokens.expiresAt,
      // Gotcha #5: Cognito refresh never returns a new RefreshToken -- keep original
      refreshToken: tokens.refreshToken ?? state.refreshToken,
    })),

  setUser: (user) =>
    set({ email: user.email, sub: user.sub, tier: user.tier }),

  setAuthLoading: (loading) => set({ authLoading: loading }),
  setAuthError: (error) => set({ authError: error }),
  setAuthReady: (authReady) => set({ authReady }),

  logout: () =>
    set({
      idToken: null,
      refreshToken: null,
      expiresAt: null,
      tier: null,
      email: null,
      sub: null,
      authLoading: false,
      authError: null,
      authReady: true,
    }),
}));
