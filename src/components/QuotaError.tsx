import { isAxiosError } from 'axios';
import { Link } from 'react-router';

export function QuotaErrorBanner({ error }: { error: unknown }) {
  const raw: unknown = isAxiosError(error) ? error.response?.data : null;
  const data =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : null;
  const errorMsg = typeof data?.error === 'string' ? data.error : null;
  const detail = typeof data?.detail === 'string' ? data.detail : null;

  return (
    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
      <p className="font-medium text-yellow-800">
        {errorMsg ?? 'Quota exceeded'}
      </p>
      {detail && (
        <p className="mt-1 text-sm text-yellow-700">{detail}</p>
      )}
      <Link
        to="/pricing"
        className="mt-2 inline-flex text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
      >
        View Plans &rarr;
      </Link>
    </div>
  );
}
