import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { cognitoClient } from '@/auth/CognitoClient';
import { useAuthStore } from '@/store/authStore';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const exchangedRef = useRef(false);

  const code = searchParams.get('code');

  useEffect(() => {
    // Guard against double-invoke in StrictMode
    if (exchangedRef.current) return;
    if (!code) return;
    exchangedRef.current = true;

    void (async () => {
      try {
        const result = await cognitoClient.exchangeOAuthCode(code);
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
        await navigate('/dashboard', { replace: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Authentication failed';
        setExchangeError(message);
      }
    })();
  }, [code, navigate]);

  // Missing code — show error immediately (no effect needed)
  if (!code) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div role="alert" className="w-full max-w-sm rounded-xl border border-red-800 bg-red-900/30 p-8 text-center">
          <p className="text-sm font-medium text-red-400">Sign-in failed</p>
          <p className="mt-2 text-xs text-red-500">
            Missing authorization code. Please try signing in again.
          </p>
          <a
            href="/sign-in"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (exchangeError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div role="alert" className="w-full max-w-sm rounded-xl border border-red-800 bg-red-900/30 p-8 text-center">
          <p className="text-sm font-medium text-red-400">Sign-in failed</p>
          <p className="mt-2 text-xs text-red-500">{exchangeError}</p>
          <a
            href="/sign-in"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Completing sign-in">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-sm text-zinc-400">Completing sign-in...</p>
      </div>
    </div>
  );
}
