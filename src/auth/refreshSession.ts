import { cognitoClient } from '@/auth/CognitoClient';
import { useAuthStore } from '@/store/authStore';

/**
 * Shared utility: refresh the JWT and apply the result to the auth store.
 * Used by AuthBootstrap, ProtectedRoute, and SubscriptionPage to avoid
 * duplicating the refresh-then-apply pattern.
 *
 * On failure, cleans up Cognito SDK state and logs out.
 * Returns the refresh result on success, or null on failure.
 */
export async function refreshSession(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return false;
  try {
    const result = await cognitoClient.refresh(refreshToken);
    useAuthStore.getState().setSession(result);
    return true;
  } catch {
    cognitoClient.signOut();
    useAuthStore.getState().logout();
    return false;
  }
}
