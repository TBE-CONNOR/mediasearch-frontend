import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
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
  const { confirmSignUp, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    useAuthStore.getState().setAuthError(null);
  }, []);

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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Verify Your Email
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600">
            Enter the verification code sent to your email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="confirm-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="confirm-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:outline-none"
              />
              {!emailFromState && (
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email address you used to sign up.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="confirm-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:outline-none"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            <Link to="/sign-in" className="text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
