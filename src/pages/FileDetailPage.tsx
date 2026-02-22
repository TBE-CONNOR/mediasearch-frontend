import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Download,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { getFile, deleteFile, getDownloadUrl } from '@/api/files';
import type { ProcessingStatus } from '@/types/domain';
import { isTerminalStatus, formatDateTime, getPollingInterval } from '@/utils/fileUtils';
import { getStatusInfo } from '@/utils/statusConfig';

export function FileDetailPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mountTime = useRef(0);

  useEffect(() => {
    mountTime.current = Date.now();
  }, []);

  const {
    data: file,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['file', fileId],
    queryFn: () => getFile(fileId ?? ''),
    enabled: !!fileId,
    refetchInterval: (query) => {
      const status = query.state.data?.processing_status;
      if (!status || isTerminalStatus(status)) return false;
      const elapsed = Date.now() - mountTime.current;
      return getPollingInterval(elapsed) || false;
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteFile(fileId ?? ''),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['files'] });
      void navigate('/files', { replace: true });
    },
  });

  const downloadMut = useMutation({
    mutationFn: () => getDownloadUrl(fileId ?? ''),
    onSuccess: ({ download_url }) => {
      const a = document.createElement('a');
      a.href = download_url;
      a.download = '';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
  });

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center" role="status" aria-label="Loading file details">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const is404 = error && isAxiosError(error) && error.response?.status === 404;

  if (error || !file) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <div role="alert" className="rounded-lg border border-red-800 bg-red-900/30 p-4 text-base text-red-400">
            <p>
              {is404
                ? 'File not found. It may have been deleted.'
                : error
                  ? 'Failed to load file details.'
                  : 'File not found.'}
            </p>
            {error && !is404 && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-2 inline-flex items-center gap-1 font-medium text-red-400 hover:text-red-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
          </div>
          <Link
            to="/files"
            className="mt-4 inline-flex items-center gap-1 text-base text-blue-400 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/files"
          className="mb-4 inline-flex items-center gap-1 text-base text-blue-400 hover:underline"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Files
        </Link>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold text-white">
                {file.file_name}
              </h1>
              <StatusLine status={file.processing_status} />
            </div>
          </div>

          {/* Metadata */}
          <dl className="space-y-3 text-base">
            <Row label="File ID" value={file.file_id} mono />
            <Row label="Content Type" value={file.content_type} />
            <Row label="Uploaded" value={formatDateTime(file.upload_date)} />

            {/* Completed-only fields */}
            {file.content_modality && (
              <Row label="Modality" value={file.content_modality} />
            )}
            {file.completed_at && (
              <Row label="Completed" value={formatDateTime(file.completed_at)} />
            )}
            {file.extracted_content_length != null && (
              <div>
                <dt className="font-medium text-zinc-500">Extracted Content</dt>
                <dd className="mt-0.5">
                  <p className="text-white">
                    {file.extracted_content_length.toLocaleString()} characters extracted
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    This content is indexed and searchable. Use{' '}
                    <Link
                      to="/search"
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      Search
                    </Link>
                    {' '}to find information within this file.
                  </p>
                </dd>
              </div>
            )}

            {/* Failed-only: display as raw string (gotcha #10 -- Java-style, never JSON.parse) */}
            {file.error_message && (
              <Row label="Error" value={file.error_message} error />
            )}

            {/* Rejected-only */}
            {file.rejection_reason && (
              <Row label="Rejection Reason" value={file.rejection_reason} error />
            )}
          </dl>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Download: only when completed (CloudFront 404s for other statuses) */}
            {file.processing_status === 'completed' && (
              <button
                type="button"
                onClick={() => downloadMut.mutate()}
                disabled={downloadMut.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] disabled:opacity-50"
              >
                {downloadMut.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                Download
              </button>
            )}

            {/* Delete with confirmation */}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-800 px-5 py-2.5 text-base font-medium text-red-400 transition-colors hover:bg-red-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => deleteMut.mutate()}
                  disabled={deleteMut.isPending}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:opacity-50"
                >
                  {deleteMut.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-zinc-700 px-5 py-2.5 text-base font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {downloadMut.isError && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              Failed to get download link. Please try again.
            </p>
          )}
          {deleteMut.isError && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              Failed to delete file. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  error,
}: {
  label: string;
  value: string;
  mono?: boolean;
  error?: boolean;
}) {
  return (
    <div>
      <dt className="font-medium text-zinc-500">{label}</dt>
      <dd
        className={`mt-0.5 break-all ${
          error
            ? 'text-red-400'
            : mono
              ? 'font-mono text-xs text-zinc-300'
              : 'text-white'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusLine({ status }: { status: ProcessingStatus }) {
  const info = getStatusInfo(status);
  return (
    <p className={`mt-1 inline-flex items-center gap-1 text-sm font-medium ${info.color}`}>
      <info.Icon className={`h-4 w-4 ${info.animate ? 'animate-spin' : ''}`} />
      {info.label}
    </p>
  );
}

