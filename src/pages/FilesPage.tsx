import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Loader2, FileText, Upload, RefreshCw } from 'lucide-react';
import { createElement, useState } from 'react';
import { VideoThumbnail } from '@/components/VideoThumbnail';
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
          <h1 className="text-2xl font-bold text-white">My Files</h1>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Link>
        </div>

        {isPending && (
          <div role="status" aria-label="Loading files" className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {error && is429(error) && <QuotaErrorBanner error={error} />}

        {error && !is429(error) && (
          <div role="alert" className="rounded-lg border border-red-800 bg-red-900/30 p-4 text-sm text-red-400">
            <p>Failed to load files.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 inline-flex items-center gap-1 font-medium text-red-400 transition-colors hover:text-red-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {files && files.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
            <p className="text-zinc-400">No files yet.</p>
            <Link
              to="/upload"
              className="mt-2 inline-block text-sm text-blue-400 hover:underline"
            >
              Upload your first file
            </Link>
          </div>
        )}

        {files && files.length > 0 && (
          <>
            <p className="mb-4 text-sm text-zinc-500">
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
      className="block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
    >
      <FileThumbnail file={file} />
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-white">
            {file.file_name}
          </p>
          <StatusBadge status={file.processing_status} />
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {formatDate(file.upload_date)}
        </p>
      </div>
    </Link>
  );
}

function FileThumbnail({ file }: { file: FileItem }) {
  const [imgError, setImgError] = useState(false);
  const isImage = file.content_type.startsWith('image/');
  const isVideo = file.content_type.startsWith('video/');
  const isCompleted = file.processing_status === 'completed';

  // Image thumbnail
  if (isImage && !!file.presigned_url && isCompleted && !imgError) {
    return (
      <div className="aspect-video bg-zinc-800">
        <img
          src={file.presigned_url}
          alt=""
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Video thumbnail via native <video> element (no CORS needed)
  if (isVideo && isCompleted && file.presigned_url) {
    return (
      <VideoThumbnail url={file.presigned_url} contentType={file.content_type} />
    );
  }

  // Fallback icon
  return (
    <div className="flex aspect-video items-center justify-center bg-zinc-800/50">
      {/* createElement avoids eslint react-hooks false positive on dynamic component */}
      {createElement(getFileIcon(file.content_type), {
        className: 'h-10 w-10 text-zinc-600',
      })}
    </div>
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
