import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '@/auth/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ATCShader } from '@/components/ui/atc-shader';
import { Footer } from '@/components/Footer';
import { getGoogleAuthUrl } from '@/utils/authUtils';

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const idToken = useAuthStore((s) => s.idToken);
  const authReady = useAuthStore((s) => s.authReady);
  const from = (location.state as { from?: string })?.from || '/dashboard';

  useEffect(() => {
    useAuthStore.getState().setAuthError(null);
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
      </div>
    );
  }

  if (idToken) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      try {
        await signIn(email, password);
        await navigate(from, { replace: true });
      } catch {
        // error state set by hook
      }
    })();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1">
        {/* ── Left brand panel — desktop only ── */}
        {isDesktop && (
          <div className="relative flex w-1/2 items-center justify-center overflow-hidden">
            <ATCShader />
            {/* Gradient overlay to soften shader edges */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-background/80" />

            <motion.div
              className="relative z-10 px-12 text-center"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7 }}
            >
              <Link
                to="/"
                className="inline-flex text-5xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              >
                <span className="text-white">Media</span>
                <span className="text-blue-400">Search</span>
              </Link>
              <p className="mt-4 text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Upload anything, find everything.
              </p>
              <p className="mt-3 max-w-xs mx-auto text-sm text-zinc-400">
                AI-powered semantic search across all your images, videos, audio, and documents.
              </p>
            </motion.div>
          </div>
        )}

        {/* ── Right form panel ── */}
        <div className="relative flex flex-1 items-center justify-center px-4 py-12">
          {/* Mobile gradient background */}
          {!isDesktop && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_60%)]" />
          )}

          <motion.div
            className="relative w-full max-w-sm"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.1 }}
          >
            {/* Mobile brand header */}
            {!isDesktop && (
              <div className="mb-8 text-center">
                <Link
                  to="/"
                  className="inline-flex text-3xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
                >
                  <span className="text-white">Media</span>
                  <span className="text-blue-400">Search</span>
                </Link>
              </div>
            )}

            {/* Card */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
              {/* Gradient accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

              <div className="p-8">
                <h1 className="mb-6 text-center text-2xl font-bold text-white">
                  Sign In
                </h1>

                {/* Google Sign-In */}
                <a
                  href={getGoogleAuthUrl()}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </a>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-zinc-900/60 px-3 text-xs text-zinc-500">or sign in with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="signin-email" className="block text-sm font-medium text-zinc-300">
                      Email
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="signin-password" className="block text-sm font-medium text-zinc-300">
                      Password
                    </label>
                    <input
                      id="signin-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-zinc-400">
                  Don't have an account?{' '}
                  <Link to="/sign-up" className="text-blue-400 transition-colors hover:text-blue-300 hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
