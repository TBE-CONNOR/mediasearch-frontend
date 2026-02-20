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
  completed: { label: 'Completed', Icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100 text-green-700' },
  processing: { label: 'Processing', Icon: Loader2, animate: true, color: 'text-blue-600', bgColor: 'bg-blue-100 text-blue-700' },
  pending_upload: { label: 'Pending Upload', Icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100 text-gray-600' },
  failed: { label: 'Failed', Icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 text-red-700' },
  rejected: { label: 'Rejected', Icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100 text-yellow-700' },
};

export function getStatusInfo(status: string): StatusInfo {
  // Unknown statuses fall back to a neutral style so the UI never breaks
  return (
    STATUS_CONFIG[status as ProcessingStatus] ?? {
      label: status,
      Icon: Clock,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 text-gray-600',
    }
  );
}
