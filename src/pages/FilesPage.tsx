import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Loader2, FileText, Upload, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { FileThumbnail } from '@/components/FileThumbnail';
import { listFiles } from '@/api/files';
import type { FileItem, ProcessingStatus } from '@/api/files';
import { QuotaErrorBanner } from '@/components/QuotaError';
import { is429 } from '@/utils/httpUtils';
import { formatDate, isTerminalStatus, isPreviewable } from '@/utils/fileUtils';
import { getStatusInfo } from '@/utils/statusConfig';
import { MediaPreviewModal } from '@/components/MediaPreviewModal';
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
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Files</h1>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Upload className="h-5 w-5" />
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
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-16 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
            <p className="text-lg text-zinc-400">No files yet.</p>
            <Link
              to="/upload"
              className="mt-2 inline-block text-base text-blue-400 hover:underline"
            >
              Upload your first file
            </Link>
          </div>
        )}

        {files && files.length > 0 && (
          <>
            <p className="mb-4 text-base text-zinc-500">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const canPreview = isPreviewable(file);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700">
        {canPreview ? (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="block w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-inset"
            aria-label={`Preview ${file.file_name}`}
          >
            <FileThumbnail file={file} />
          </button>
        ) : (
          <Link to={`/files/${file.file_id}`} aria-label={`View ${file.file_name} details`}>
            <FileThumbnail file={file} />
          </Link>
        )}

        <Link
          to={`/files/${file.file_id}`}
          className="block p-4 transition-colors hover:bg-zinc-800/50"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-base font-medium text-white">
              {file.file_name}
            </p>
            <StatusBadge status={file.processing_status} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {formatDate(file.upload_date)}
          </p>
        </Link>
      </div>

      {canPreview && (
        <MediaPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          contentType={file.content_type}
          mediaUrl={file.presigned_url}
          fileName={file.file_name}
        />
      )}
    </>
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
