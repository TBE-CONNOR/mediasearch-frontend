import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Loader2, FileText, Upload, RefreshCw } from 'lucide-react';
import { createElement } from 'react';
import { listFiles } from '@/api/files';
import type { FileItem, ProcessingStatus } from '@/api/files';
import { QuotaErrorBanner } from '@/components/QuotaError';
import { is429 } from '@/utils/httpUtils';
import { formatDate, getFileIcon, isTerminalStatus } from '@/utils/fileUtils';
import { getStatusInfo } from '@/utils/statusConfig';
import { FILES_REFETCH_INTERVAL_MS } from '@/config/constants';

export function FilesPage() {
  const {
    data: files,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['files'],
    queryFn: () => listFiles(),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasNonTerminal = data.some(
        (f) => !isTerminalStatus(f.processing_status),
      );
      return hasNonTerminal ? FILES_REFETCH_INTERVAL_MS : false;
    },
  });

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Link>
        </div>

        {isPending && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {error && is429(error) && <QuotaErrorBanner error={error} />}

        {error && !is429(error) && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <p>Failed to load files.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 inline-flex items-center gap-1 font-medium text-red-700 hover:text-red-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {files && files.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-600">No files yet.</p>
            <Link
              to="/upload"
              className="mt-2 inline-block text-sm text-blue-600 hover:underline"
            >
              Upload your first file
            </Link>
          </div>
        )}

        {files && files.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <FileCard key={file.file_id} file={file} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FileCard({ file }: { file: FileItem }) {
  return (
    <Link
      to={`/files/${file.file_id}`}
      aria-label={`${file.file_name} — ${getStatusInfo(file.processing_status).label}`}
      className="block rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        {/* createElement avoids eslint react-hooks false positive on dynamic component */}
        {createElement(getFileIcon(file.content_type), {
          className: 'h-8 w-8 shrink-0 text-gray-400',
        })}
        <StatusBadge status={file.processing_status} />
      </div>
      <p className="truncate text-sm font-medium text-gray-900">
        {file.file_name}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {formatDate(file.upload_date)}
      </p>
    </Link>
  );
}

function StatusBadge({ status }: { status: ProcessingStatus }) {
  const info = getStatusInfo(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${info.bgColor}`}
    >
      <info.Icon
        className={`h-3 w-3 ${info.animate ? 'animate-spin' : ''}`}
      />
      {info.label}
    </span>
  );
}

