import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Check, Minus } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ATCShader } from '@/components/ui/atc-shader';
import { Footer } from '@/components/Footer';
import { getGoogleAuthUrl } from '@/utils/authUtils';
import { TIER_LIMITS } from '@/config/pricing';
import { GoogleIcon } from '@/components/GoogleIcon';

const passwordRules = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading, error } = useAuth();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const idToken = useAuthStore((s) => s.idToken);
  const authReady = useAuthStore((s) => s.authReady);

  const allValid = passwordRules.every((r) => r.test(password));

  useEffect(() => {
    useAuthStore.getState().setAuthError(null);
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading">
        <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
      </div>
    );
  }

  if (idToken) return <Navigate to="/dashboard" replace />;

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
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1">
        {/* ── Left brand panel — desktop only ── */}
        {isDesktop && (
          <div className="relative flex w-1/2 items-center justify-center overflow-hidden">
            <ATCShader />
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
                Start with {TIER_LIMITS.free.limits['image/']} free images. Search your media in seconds with AI.
              </p>
            </motion.div>
          </div>
        )}

        {/* ── Right form panel ── */}
        <div className="relative flex flex-1 items-center justify-center px-4 py-12">
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
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

              <div className="p-8">
                <h1 className="mb-6 text-center text-2xl font-bold text-white">
                  Create Account
                </h1>

                {/* Google Sign-Up */}
                <a
                  href={getGoogleAuthUrl()}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Continue with Google
                </a>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-zinc-900/60 px-3 text-xs text-zinc-500">or create account with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-zinc-300">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-zinc-300">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    />
                    {password.length > 0 && (
                      <ul aria-live="polite" aria-label="Password requirements" className="mt-2 space-y-1">
                        {passwordRules.map((rule) => {
                          const passes = rule.test(password);
                          return (
                            <li
                              key={rule.label}
                              className={`flex items-center gap-1.5 text-xs ${passes ? 'text-green-400' : 'text-zinc-500'}`}
                            >
                              {passes ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              {rule.label}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !allValid}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                  >
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </button>
                </form>

                <p className="mt-3 text-center text-xs text-zinc-500">
                  By creating an account, you agree to our{' '}
                  <Link to="/legal#terms" className="text-blue-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/legal#privacy" className="text-blue-400 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <p className="mt-4 text-center text-sm text-zinc-400">
                  Already have an account?{' '}
                  <Link to="/sign-in" className="text-blue-400 transition-colors hover:text-blue-300 hover:underline">
                    Sign In
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
