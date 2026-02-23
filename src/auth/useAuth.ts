import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cognitoClient } from '@/auth/CognitoClient';
import { useAuthStore } from '@/store/authStore';
import { cleanupUploads } from '@/hooks/useUploadQueue';
import { useSearchStore } from '@/store/searchStore';
import { deleteAccount as deleteAccountApi } from '@/api/account';

async function withAuthState<T>(fn: () => Promise<T>): Promise<T> {
  const { setAuthLoading, setAuthError } = useAuthStore.getState();
  setAuthLoading(true);
  setAuthError(null);
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Operation failed';
    setAuthError(message);
    throw err;
  } finally {
    setAuthLoading(false);
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const loading = useAuthStore((s) => s.authLoading);
  const error = useAuthStore((s) => s.authError);

  const signIn = useCallback(
    (email: string, password: string) =>
      withAuthState(async () => {
        const result = await cognitoClient.signIn(email, password);
        useAuthStore.getState().setTokens({
          idToken: result.idToken,
          expiresAt: result.expiresAt,
          refreshToken: result.refreshToken,
        });
        useAuthStore.getState().setUser({
          email: result.email,
          sub: result.sub,
          tier: result.tier,
        });
      }),
    [],
  );

  const signUp = useCallback(
    (email: string, password: string) =>
      withAuthState(() => cognitoClient.signUp(email, password)),
    [],
  );

  const confirmSignUp = useCallback(
    (email: string, code: string) =>
      withAuthState(() => cognitoClient.confirmSignUp(email, code)),
    [],
  );

  const resendCode = useCallback(
    (email: string) =>
      withAuthState(() => cognitoClient.resendConfirmationCode(email)),
    [],
  );

  const changePassword = useCallback(
    (oldPassword: string, newPassword: string) =>
      withAuthState(() => cognitoClient.changePassword(oldPassword, newPassword)),
    [],
  );

  const forgotPassword = useCallback(
    (email: string) =>
      withAuthState(() => cognitoClient.forgotPassword(email)),
    [],
  );

  const confirmForgotPassword = useCallback(
    (email: string, code: string, newPassword: string) =>
      withAuthState(() =>
        cognitoClient.confirmForgotPassword(email, code, newPassword),
      ),
    [],
  );

  const deleteAccount = useCallback(async () => {
    await deleteAccountApi();
    cleanupUploads();
    useSearchStore.getState().clear();
    cognitoClient.signOut();
    useAuthStore.getState().logout();
    queryClient.clear();
    window.location.href = '/';
  }, [queryClient]);

  const signOut = useCallback(() => {
    // Check for OAuth logout URL BEFORE signOut clears the flag
    const oauthLogoutUrl = cognitoClient.getOAuthLogoutUrl();
    cleanupUploads();
    useSearchStore.getState().clear();
    cognitoClient.signOut();
    useAuthStore.getState().logout();
    queryClient.clear();
    // Hard redirect — ProtectedRoute's <Navigate to="/sign-in"> races with
    // React Router's navigate() when auth state is cleared synchronously.
    // A full page navigation is actually ideal for sign-out: it guarantees
    // a clean slate (no stale component state, no leaked subscriptions).
    // For OAuth sessions: redirect to Cognito /logout to clear hosted UI cookies,
    // which then redirects back to appUrl. Without this, Cognito auto-re-authenticates.
    window.location.href = oauthLogoutUrl ?? '/';
  }, [queryClient]);

  return {
    signIn,
    signUp,
    confirmSignUp,
    resendCode,
    changePassword,
    forgotPassword,
    confirmForgotPassword,
    deleteAccount,
    signOut,
    loading,
    error,
  };
}
