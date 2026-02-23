import { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router';
import { Loader2, ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Footer } from '@/components/Footer';

const passwordRules = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

type Step = 'email' | 'code';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { forgotPassword, confirmForgotPassword, loading, error } = useAuth();
  const idToken = useAuthStore((s) => s.idToken);
  const authReady = useAuthStore((s) => s.authReady);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useAuthStore.getState().setAuthError(null);
  }, []);

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  if (!authReady) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-label="Loading"
      >
        <Loader2 className="h-8 w-8 motion-safe:animate-spin text-blue-500" />
      </div>
    );
  }

  if (idToken) return <Navigate to="/dashboard" replace />;

  const allValid = passwordRules.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    void (async () => {
      try {
        await forgotPassword(email);
        setStep('code');
      } catch {
        // error state set by hook
      }
    })();
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!passwordsMatch) {
      setLocalError('Passwords do not match.');
      return;
    }
    void (async () => {
      try {
        await confirmForgotPassword(email, code, newPassword);
        setSuccess(true);
      } catch {
        // error state set by hook
      }
    })();
  };

  const handleResend = () => {
    setResendMsg(null);
    void (async () => {
      try {
        await forgotPassword(email);
        setResendMsg('A new code has been sent to your email.');
      } catch {
        // error state set by hook
      }
    })();
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-900/30">
              <Check className="h-6 w-6 text-green-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">
              Password Reset
            </h1>
            <p className="mb-6 text-sm text-zinc-400">
              Your password has been reset successfully. You can now sign in with
              your new password.
            </p>
            <Link
              to="/sign-in"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          {step === 'email' ? (
            <>
              <h1 className="mb-2 text-center text-2xl font-bold text-white">
                Reset Password
              </h1>
              <p className="mb-6 text-center text-sm text-zinc-400">
                Enter your email and we&apos;ll send you a verification code.
              </p>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-center text-2xl font-bold text-white">
                Set New Password
              </h1>
              <p className="mb-6 text-center text-sm text-zinc-400">
                Enter the code sent to{' '}
                <span className="font-medium text-zinc-300">{email}</span> and
                your new password.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-code"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Verification Code
                  </label>
                  <input
                    ref={codeRef}
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    New Password
                  </label>
                  <input
                    id="reset-new-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                  {newPassword.length > 0 && (
                    <ul
                      aria-live="polite"
                      aria-label="Password requirements"
                      className="mt-2 space-y-1"
                    >
                      {passwordRules.map((rule) => {
                        const passes = rule.test(newPassword);
                        return (
                          <li
                            key={rule.label}
                            className={`flex items-center gap-1.5 text-xs ${passes ? 'text-green-400' : 'text-zinc-500'}`}
                          >
                            {passes ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1 text-xs text-red-400">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {(error || localError) && (
                  <p role="alert" className="text-sm text-red-400">
                    {localError ?? error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !allValid || !passwordsMatch}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-4 space-y-2 text-center text-sm">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResend}
                  className="text-blue-400 hover:underline disabled:opacity-50"
                >
                  Didn&apos;t receive a code? Resend
                </button>
                {resendMsg && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-sm text-green-400"
                  >
                    {resendMsg}
                  </p>
                )}
              </div>
            </>
          )}

          <p className="mt-4 text-center text-sm text-zinc-400">
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-1 text-blue-400 transition-colors hover:text-blue-300 hover:underline"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
