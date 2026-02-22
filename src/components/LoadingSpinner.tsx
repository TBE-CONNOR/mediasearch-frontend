import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex min-h-screen items-center justify-center bg-background', className)}
    >
      <Loader2 className="h-8 w-8 motion-safe:animate-spin text-blue-500" />
    </div>
  );
}
