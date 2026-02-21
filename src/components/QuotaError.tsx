import { isAxiosError } from 'axios';
import { Link } from 'react-router';
import type { ApiError } from '@/api/files';

function parseApiError(error: unknown): ApiError | null {
  const raw: unknown = isAxiosError(error) ? error.response?.data : null;
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'error' in raw) {
    return raw as ApiError;
  }
  return null;
}

export function QuotaErrorBanner({ error }: { error: unknown }) {
  const data = parseApiError(error);
  const errorMsg = data?.error ?? null;
  const detail = data?.detail ?? null;

  return (
    <div role="alert" className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
      <p className="font-medium text-yellow-800">
        {errorMsg ?? 'Quota exceeded'}
      </p>
      {detail && (
        <p className="mt-1 text-sm text-yellow-700">{detail}</p>
      )}
      <Link
        to="/pricing"
        aria-label="View pricing plans"
        className="mt-2 inline-flex text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
      >
        View Plans &rarr;
      </Link>
    </div>
  );
}
