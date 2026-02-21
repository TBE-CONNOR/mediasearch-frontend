import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Clock,
} from 'lucide-react';
import type { ProcessingStatus } from '@/types/domain';

export interface StatusInfo {
  label: string;
  Icon: LucideIcon;
  animate?: boolean;
  color: string;
  bgColor: string;
}

export const STATUS_CONFIG: Record<ProcessingStatus, StatusInfo> = {
  completed: { label: 'Completed', Icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-900/30 text-green-400' },
  processing: { label: 'Processing', Icon: Loader2, animate: true, color: 'text-blue-400', bgColor: 'bg-blue-900/30 text-blue-400' },
  pending_upload: { label: 'Pending Upload', Icon: Clock, color: 'text-zinc-500', bgColor: 'bg-zinc-800 text-zinc-400' },
  failed: { label: 'Failed', Icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-900/30 text-red-400' },
  rejected: { label: 'Rejected', Icon: AlertTriangle, color: 'text-amber-400', bgColor: 'bg-amber-900/30 text-amber-400' },
};

export function getStatusInfo(status: string): StatusInfo {
  // Unknown statuses fall back to a neutral style so the UI never breaks
  return (
    STATUS_CONFIG[status as ProcessingStatus] ?? {
      label: status,
      Icon: Clock,
      color: 'text-zinc-500',
      bgColor: 'bg-zinc-800 text-zinc-400',
    }
  );
}
