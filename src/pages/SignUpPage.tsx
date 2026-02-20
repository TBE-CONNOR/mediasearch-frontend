import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Footer } from '@/components/Footer';

export function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    useAuthStore.getState().setAuthError(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      try {
        await signUp(email, password);
        await navigate('/confirm-email', { state: { email } });
      } catch {
        // error state set by hook
      }
    })();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:outline-none"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/legal#terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/legal#privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
