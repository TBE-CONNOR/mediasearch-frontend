import type { ProcessingStatus } from '@/types/domain';
import { Image, Video, Music, FileText } from 'lucide-react';
import {
  IMAGE_MAX_BYTES,
  GENERAL_MAX_BYTES,
  VIDEO_MAX_DURATION_S,
  AUDIO_MAX_DURATION_S,
  POLLING_TIMEOUT_MS,
  POLLING_FAST_MS,
  POLLING_FAST_UNTIL_MS,
  POLLING_MEDIUM_MS,
  POLLING_MEDIUM_UNTIL_MS,
  POLLING_SLOW_MS,
  MEDIA_DURATION_TIMEOUT_MS,
} from '@/config/constants';

export function isHeic(file: File): boolean {
  return /\.heic$/i.test(file.name);
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any');
  const blob = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92,
  });
  const jpegBlob = Array.isArray(blob) ? blob[0] : blob;
  const newName = file.name.replace(/\.heic$/i, '.jpg');
  return new File([jpegBlob], newName, { type: 'image/jpeg' });
}

export const TERMINAL_STATUSES: readonly ProcessingStatus[] = [
  'completed',
  'failed',
  'rejected',
];

export function isTerminalStatus(status: string): boolean {
  return (TERMINAL_STATUSES as readonly string[]).includes(status);
}

/**
 * Returns polling interval in ms based on elapsed time, or false to stop.
 * 2s for first 30s, 5s up to 5min, 15s up to 15min, then stop.
 */
export function getPollingInterval(elapsedMs: number): number | false {
  if (elapsedMs > POLLING_TIMEOUT_MS) return false;
  if (elapsedMs <= POLLING_FAST_UNTIL_MS) return POLLING_FAST_MS;
  if (elapsedMs <= POLLING_MEDIUM_UNTIL_MS) return POLLING_MEDIUM_MS;
  return POLLING_SLOW_MS;
}

/** Date only (e.g. "Jan 15, 2026") */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Date + time (e.g. "Jan 15, 2026, 02:30 PM") */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Currency amount in cents → display string (e.g. 2999 → "$29.99").
 *  Hardcoded to en-US because all prices are USD via Stripe. */
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/** Unix timestamp in seconds → human-readable date (e.g. "January 15, 2026") */
export function formatPeriodEnd(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Map MIME content type to a lucide icon component */
export function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return Image;
  if (contentType.startsWith('video/')) return Video;
  if (contentType.startsWith('audio/')) return Music;
  return FileText;
}

/**
 * Map simplified modality string to a lucide icon component.
 * Citation content_type uses "document", "image", "audio", "video" — NOT MIME types.
 */
export function getModalityIcon(contentType: string) {
  switch (contentType) {
    case 'image':
      return Image;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    case 'document':
    default:
      return FileText;
  }
}

/** Whether a file has a previewable media type with a URL available */
export function isPreviewable(file: {
  processing_status: string;
  presigned_url?: string;
  content_type: string;
}): boolean {
  if (file.processing_status !== 'completed') return false;
  if (!file.presigned_url) return false;
  return (
    file.content_type.startsWith('image/') ||
    file.content_type.startsWith('video/') ||
    file.content_type.startsWith('audio/')
  );
}

// ─── File validation ───────────────────────────────────────────────

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || isHeic(file);
}

function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Load a media file into an HTML5 element and read its duration.
 * Returns duration in seconds, or null if metadata cannot be read.
 * Times out after 10 seconds to avoid hanging on corrupt files.
 */
function getMediaDuration(
  file: File,
  elementType: 'video' | 'audio',
): Promise<number | null> {
  return new Promise((resolve) => {
    const el = document.createElement(elementType);
    const url = URL.createObjectURL(file);

    const finish = (result: number | null) => {
      clearTimeout(timer);
      el.removeAttribute('src');
      el.load();
      URL.revokeObjectURL(url);
      resolve(result);
    };

    const timer = setTimeout(() => finish(null), MEDIA_DURATION_TIMEOUT_MS);

    el.addEventListener(
      'loadedmetadata',
      () => finish(Number.isFinite(el.duration) ? el.duration : null),
      { once: true },
    );

    el.addEventListener('error', () => finish(null), { once: true });

    el.preload = 'metadata';
    el.src = url;
  });
}

/**
 * Validate a single file against per-type size and duration limits.
 * Returns null if valid, or a user-friendly error message string if rejected.
 */
export async function validateFile(file: File): Promise<string | null> {
  if (isImageFile(file)) {
    if (file.size > IMAGE_MAX_BYTES) {
      return `Image exceeds 5 MB limit (got ${formatFileSize(file.size)})`;
    }
    return null;
  }

  if (file.size > GENERAL_MAX_BYTES) {
    return `File exceeds 500 MB limit (got ${formatFileSize(file.size)})`;
  }

  if (isVideoFile(file)) {
    const duration = await getMediaDuration(file, 'video');
    if (duration !== null && duration > VIDEO_MAX_DURATION_S) {
      return `Video exceeds 2-minute limit (got ${formatDuration(duration)})`;
    }
  }

  if (isAudioFile(file)) {
    const duration = await getMediaDuration(file, 'audio');
    if (duration !== null && duration > AUDIO_MAX_DURATION_S) {
      return `Audio exceeds 5-minute limit (got ${formatDuration(duration)})`;
    }
  }

  return null;
}
