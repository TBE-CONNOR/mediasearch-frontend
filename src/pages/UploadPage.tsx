import { Link } from 'react-router';
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Clock,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import type { UploadItem } from '@/hooks/useUploadQueue';

const ACCEPT: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/x-matroska': ['.mkv'],
  'video/webm': ['.webm'],
  'audio/flac': ['.flac'],
  'audio/mp4': ['.m4a'],
  'audio/mpeg': ['.mp3'],
  'audio/ogg': ['.ogg'],
  'audio/wav': ['.wav'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
  'image/tiff': ['.tiff', '.tif'],
};

export function UploadPage() {
  const { uploads, onDrop } = useUploadQueue();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
  });

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Upload Files</h1>

        <div
          {...getRootProps()}
          aria-label="File upload area — drag and drop or click to browse"
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-600/10'
              : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mb-3 h-10 w-10 text-zinc-500" />
          {isDragActive ? (
            <p className="text-blue-400">Drop files here...</p>
          ) : (
            <>
              <p className="text-zinc-400">
                Drag & drop files here, or click to browse
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Images, video, audio, documents (HEIC auto-converted)
              </p>
            </>
          )}
        </div>

        {uploads.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploads.map((item) => (
              <UploadItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UploadItemRow({ item }: { item: UploadItem }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-3">
        <StatusIcon stage={item.stage} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {item.fileName}
          </p>
          <StatusText item={item} />
        </div>
      </div>

      {item.stage === 'uploading' && (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={item.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Uploading ${item.fileName}`}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-200"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatusIcon({ stage }: { stage: UploadItem['stage'] }) {
  switch (stage) {
    case 'queued':
      return <Clock className="h-5 w-5 shrink-0 text-zinc-500" />;
    case 'preparing':
    case 'uploading':
    case 'processing':
      return (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-500" />
      );
    case 'completed':
      return <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />;
    case 'failed':
      return <XCircle className="h-5 w-5 shrink-0 text-red-400" />;
    case 'rejected':
      return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />;
  }
}

function StatusText({ item }: { item: UploadItem }) {
  switch (item.stage) {
    case 'queued':
      return <p className="text-xs text-zinc-500">Waiting...</p>;
    case 'preparing':
      return <p className="text-xs text-zinc-500">Preparing...</p>;
    case 'uploading':
      return (
        <p className="text-xs text-zinc-500">Uploading... {item.progress}%</p>
      );
    case 'processing':
      return <p className="text-xs text-zinc-500">Processing...</p>;
    case 'completed':
      return <p className="text-xs text-green-400">Ready</p>;
    case 'failed':
      return (
        <p className="text-xs text-red-400">
          {item.error || 'Processing failed'}
          {item.quotaExceeded && (
            <>
              {' '}
              <Link
                to="/pricing"
                className="font-medium underline hover:text-red-300"
              >
                View Plans &rarr;
              </Link>
            </>
          )}
        </p>
      );
    case 'rejected':
      return (
        <p className="text-xs text-amber-400">
          {item.error || 'File rejected'}
        </p>
      );
  }
}
