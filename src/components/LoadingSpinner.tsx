import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-screen items-center justify-center bg-gray-50"
    >
      <Loader2 className="h-8 w-8 motion-safe:animate-spin text-blue-500" />
    </div>
  );
}
