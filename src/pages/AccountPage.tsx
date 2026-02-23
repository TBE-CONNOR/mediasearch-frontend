import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Loader2,
  Mail,
  Shield,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TIER_LABELS, TIER_COLORS } from '@/config/constants';

const OAUTH_SESSION_KEY = 'mediasearch_oauth_session';

const passwordRules = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function AccountPage() {
  const email = useAuthStore((s) => s.email);
  const tier = useAuthStore((s) => s.tier);
  const reducedMotion = useReducedMotion();
  const { changePassword } = useAuth();

  const isOAuthUser = !!localStorage.getItem(OAUTH_SESSION_KEY);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <p className="text-sm text-zinc-400">Settings</p>
          <h1 className="text-3xl font-bold text-white">Account</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Section 1: Account Information */}
          <motion.div
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.4,
              delay: reducedMotion ? 0 : 0.1,
            }}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="text-sm text-white">{email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 shrink-0 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Plan</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TIER_COLORS[tier ?? 'free']}`}
                  >
                    {TIER_LABELS[tier ?? 'free']}
                  </span>
                </div>
              </div>
              {isOAuthUser && (
                <div className="flex items-center gap-3">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-zinc-500">Sign-in method</p>
                    <p className="text-sm text-white">Google</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 border-t border-zinc-800 pt-4">
              <Link
                to="/subscription"
                className="inline-flex items-center gap-1 text-sm text-blue-400 transition-colors hover:text-blue-300"
              >
                Manage Subscription
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Section 2: Change Password */}
          <motion.div
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.4,
              delay: reducedMotion ? 0 : 0.2,
            }}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              Password
            </h2>
            {isOAuthUser ? (
              <p className="text-sm text-zinc-400">
                Your account uses Google Sign-In. Password is managed through
                your{' '}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google account
                </a>
                .
              </p>
            ) : (
              <ChangePasswordForm changePassword={changePassword} />
            )}
          </motion.div>

          {/* Section 3: Danger Zone */}
          <motion.div
            className="rounded-xl border border-red-900/50 bg-zinc-900/50 p-6"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.4,
              delay: reducedMotion ? 0 : 0.3,
            }}
          >
            <h2 className="mb-2 text-lg font-semibold text-red-400">
              Danger Zone
            </h2>
            <p className="mb-4 text-sm text-zinc-400">
              Permanently delete your account and all associated data. This
              includes all uploaded files, search history, and subscription. This
              action cannot be undone.
            </p>
            <DeleteAccountSection />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordForm({
  changePassword,
}: {
  changePassword: (oldPw: string, newPw: string) => Promise<void>;
}) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const allValid = passwordRules.every((r) => r.test(newPw));
  const passwordsMatch = newPw === confirmPw;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwError(null);
    setPwSuccess(false);
    setSaving(true);
    void (async () => {
      try {
        await changePassword(currentPw, newPw);
        setPwSuccess(true);
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      } catch (err) {
        setPwError(
          err instanceof Error ? err.message : 'Failed to change password.',
        );
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="current-password"
          className="block text-sm font-medium text-zinc-300"
        >
          Current Password
        </label>
        <input
          id="current-password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPw}
          onChange={(e) => {
            setCurrentPw(e.target.value);
            setPwSuccess(false);
          }}
          className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </div>

      <div>
        <label
          htmlFor="new-password"
          className="block text-sm font-medium text-zinc-300"
        >
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          required
          autoComplete="new-password"
          value={newPw}
          onChange={(e) => {
            setNewPw(e.target.value);
            setPwSuccess(false);
          }}
          className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        {newPw.length > 0 && (
          <ul
            aria-live="polite"
            aria-label="Password requirements"
            className="mt-2 space-y-1"
          >
            {passwordRules.map((rule) => {
              const passes = rule.test(newPw);
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
          htmlFor="confirm-new-password"
          className="block text-sm font-medium text-zinc-300"
        >
          Confirm New Password
        </label>
        <input
          id="confirm-new-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPw}
          onChange={(e) => {
            setConfirmPw(e.target.value);
            setPwSuccess(false);
          }}
          className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        {confirmPw.length > 0 && !passwordsMatch && (
          <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
        )}
      </div>

      {pwError && (
        <p role="alert" className="text-sm text-red-400">
          {pwError}
        </p>
      )}
      {pwSuccess && (
        <p role="status" className="flex items-center gap-1.5 text-sm text-green-400">
          <Check className="h-4 w-4" />
          Password changed successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !allValid || !passwordsMatch || !currentPw}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
            Changing...
          </span>
        ) : (
          'Change Password'
        )}
      </button>
    </form>
  );
}

function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/50"
      >
        <Trash2 className="h-4 w-4" />
        Delete Account
      </button>

      {showModal && (
        <DeleteAccountModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isConfirmed = confirmText === 'DELETE';

  const handleDelete = () => {
    if (!isConfirmed) return;
    setDeleting(true);
    setDeleteError(null);
    void (async () => {
      try {
        await deleteAccount();
        // On success, deleteAccount() redirects to / via window.location.href
      } catch (err) {
        setDeleteError(
          err instanceof Error ? err.message : 'Account deletion failed. Please try again.',
        );
        setDeleting(false);
      }
    })();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !deleting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="mx-4 w-full max-w-md rounded-xl border border-red-900/50 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-950/50">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3
            id="delete-modal-title"
            className="text-lg font-semibold text-white"
          >
            Delete Your Account?
          </h3>
        </div>

        <div className="mb-4 space-y-2 text-sm text-zinc-400">
          <p>This will permanently delete:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>All uploaded files and search data</li>
            <li>Your subscription and billing history</li>
            <li>Your account and login credentials</li>
          </ul>
          <p className="font-medium text-red-400">
            This action cannot be undone.
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="delete-confirm"
            className="block text-sm font-medium text-zinc-300"
          >
            Type <span className="font-mono font-bold text-red-400">DELETE</span>{' '}
            to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            autoComplete="off"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
            className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-base text-white placeholder-zinc-500 sm:text-sm transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50"
            placeholder="DELETE"
          />
        </div>

        {deleteError && (
          <p role="alert" className="mb-4 text-sm text-red-400">
            {deleteError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || deleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {deleting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                Deleting...
              </span>
            ) : (
              'Delete My Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
