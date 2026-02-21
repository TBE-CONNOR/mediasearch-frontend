import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Footer } from '@/components/Footer';

export function ConfirmEmailPage() {
  const location = useLocation();
  const state = location.state as Record<string, unknown> | null;
  const emailFromState =
    state && typeof state.email === 'string' ? state.email : '';
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const { confirmSignUp, resendCode, loading, error } = useAuth();
  const navigate = useNavigate();
  const idToken = useAuthStore((s) => s.idToken);
  const authReady = useAuthStore((s) => s.authReady);

  useEffect(() => {
    useAuthStore.getState().setAuthError(null);
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]" role="status" aria-label="Loading">
        <Loader2 className="h-8 w-8 motion-safe:animate-spin text-blue-500" />
      </div>
    );
  }

  if (idToken) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      try {
        await confirmSignUp(email, code);
        await navigate('/sign-in', { replace: true });
      } catch {
        // error state set by hook
      }
    })();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h1 className="mb-2 text-center text-2xl font-bold text-white">
            Verify Your Email
          </h1>
          <p className="mb-6 text-center text-sm text-zinc-400">
            Enter the verification code sent to your email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="confirm-email" className="block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                id="confirm-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              {!emailFromState && (
                <p className="mt-1 text-xs text-zinc-500">
                  Enter the email address you used to sign up.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-code" className="block text-sm font-medium text-zinc-300">
                Verification Code
              </label>
              <input
                id="confirm-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            <button
              type="button"
              disabled={loading || !email}
              onClick={() => {
                setResendMsg(null);
                void (async () => {
                  try {
                    await resendCode(email);
                    setResendMsg('A new code has been sent to your email.');
                  } catch {
                    // error state set by hook
                  }
                })();
              }}
              className="text-blue-400 hover:underline disabled:opacity-50"
            >
              Didn&apos;t receive a code? Resend
            </button>
            {resendMsg && (
              <p role="status" className="text-sm text-green-400">{resendMsg}</p>
            )}
            <p className="text-zinc-400">
              <Link to="/sign-in" className="text-blue-400 hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
