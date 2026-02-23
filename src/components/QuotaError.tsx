import { isAxiosError } from 'axios';
import { Link } from 'react-router';
import type { ApiError } from '@/api/files';

function parseApiError(error: unknown): ApiError | null {
  const raw: unknown = isAxiosError(error) ? error.response?.data : null;
  if (
    raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    'error' in raw &&
    typeof (raw as Record<string, unknown>).error === 'string'
  ) {
    return raw as ApiError;
  }
  return null;
}

export function QuotaErrorBanner({ error }: { error: unknown }) {
  const data = parseApiError(error);
  const errorMsg = data?.error ?? null;
  const detail = data?.detail ?? null;

  return (
    <div role="alert" className="rounded-lg border border-amber-800 bg-amber-900/30 p-4">
      <p className="font-medium text-amber-400">
        {errorMsg ?? 'Quota exceeded'}
      </p>
      {detail && (
        <p className="mt-1 text-sm text-amber-400/80">{detail}</p>
      )}
      <Link
        to="/pricing"
        className="mt-2 inline-flex text-sm font-medium text-amber-400 underline transition-colors hover:text-amber-300"
      >
        View Plans &rarr;
      </Link>
    </div>
  );
}
