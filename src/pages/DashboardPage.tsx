import { Link } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { TIER_LABELS } from '@/config/constants';

export function DashboardPage() {
  const email = useAuthStore((s) => s.email);
  const tier = useAuthStore((s) => s.tier);
  const sub = useAuthStore((s) => s.sub);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Account</h1>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Email</dt>
            <dd className="text-gray-900">{email}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Tier</dt>
            <dd className="text-gray-900">
              {TIER_LABELS[tier ?? 'free'] ?? tier}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">User ID</dt>
            <dd className="break-all text-gray-900">{sub}</dd>
          </div>
        </dl>

        <Link
          to="/pricing"
          className="mt-6 inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View Plans
        </Link>
      </div>
    </div>
  );
}
