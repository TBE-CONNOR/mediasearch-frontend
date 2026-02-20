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
    isLoading,
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
      window.open(download_url, '_blank');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <p>{error ? 'Failed to load file details.' : 'File not found.'}</p>
            {error && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-2 inline-flex items-center gap-1 font-medium text-red-700 hover:text-red-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
          </div>
          <Link
            to="/files"
            className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/files"
          className="mb-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Files
        </Link>

        <div className="rounded-lg bg-white p-6 shadow">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-gray-900">
                {file.file_name}
              </h1>
              <StatusLine status={file.processing_status} />
            </div>
          </div>

          {/* Metadata */}
          <dl className="space-y-3 text-sm">
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
              <Row
                label="Extracted Content"
                value={`${file.extracted_content_length.toLocaleString()} chars`}
              />
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
                className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {downloadMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </button>
            )}

            {/* Delete with confirmation */}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => deleteMut.mutate()}
                  disabled={deleteMut.isPending}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMut.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {downloadMut.isError && (
            <p className="mt-3 text-sm text-red-600">
              Failed to get download link. Please try again.
            </p>
          )}
          {deleteMut.isError && (
            <p className="mt-3 text-sm text-red-600">
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
      <dt className="font-medium text-gray-500">{label}</dt>
      <dd
        className={`mt-0.5 break-all ${
          error
            ? 'text-red-600'
            : mono
              ? 'font-mono text-xs text-gray-900'
              : 'text-gray-900'
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

