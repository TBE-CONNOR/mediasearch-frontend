import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { TIER_LABELS } from '@/config/constants';

export function DashboardPage() {
  const email = useAuthStore((s) => s.email);
  const tier = useAuthStore((s) => s.tier);
  const sub = useAuthStore((s) => s.sub);
  const authReady = useAuthStore((s) => s.authReady);
  const authError = useAuthStore((s) => s.authError);

  if (!authReady) {
    return (
      <div className="flex flex-1 items-center justify-center p-6" role="status" aria-label="Loading account">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div role="alert" className="w-full max-w-md rounded-xl border border-red-800 bg-red-900/30 p-8 text-center">
          <p className="text-sm text-red-400">Failed to load account information.</p>
          <p className="mt-1 text-xs text-red-500">{authError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Account</h1>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-500">Email</dt>
            <dd className="text-white">{email ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Tier</dt>
            <dd className="text-white">
              {TIER_LABELS[tier ?? 'free'] ?? tier}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">User ID</dt>
            <dd className="break-all text-white">{sub ?? '—'}</dd>
          </div>
        </dl>

        <Link
          to="/pricing"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          View Plans
        </Link>
      </div>
    </div>
  );
}
