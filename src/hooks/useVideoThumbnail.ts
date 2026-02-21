import { useState, useEffect } from 'react';

/**
 * Extracts a thumbnail frame from a video URL using a hidden <video> + <canvas>.
 * Returns a data URL string on success, null on failure/loading.
 *
 * CORS note: If the S3 presigned URL doesn't include CORS headers,
 * the canvas draw will be tainted and toDataURL will throw. In that
 * case we fall back gracefully to null (icon fallback in UI).
 */
export function useVideoThumbnail(url: string | undefined): {
  thumbnail: string | null;
} {
  const [result, setResult] = useState<{
    url: string;
    thumbnail: string;
  } | null>(null);

  useEffect(() => {
    if (!url) return;

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    let cancelled = false;

    const cleanup = () => {
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.src = '';
      video.load();
    };

    const onError = () => {
      if (cancelled) return;
      cleanup();
    };

    const onSeeked = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setResult({ url, thumbnail: canvas.toDataURL('image/jpeg', 0.8) });
        }
      } catch {
        // CORS tainted canvas — fall back to icon
      }
      cleanup();
    };

    const onLoaded = () => {
      if (cancelled) return;
      // Seek to 2s or 10% of duration, whichever is smaller
      const seekTo = Math.min(2, video.duration * 0.1);
      video.currentTime = seekTo;
    };

    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.src = url;

    // Timeout: if extraction takes > 8s, give up
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        cancelled = true;
        cleanup();
      }
    }, 8000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cleanup();
    };
  }, [url]);

  // Only return thumbnail if it matches the current URL
  const thumbnail = result !== null && result.url === url ? result.thumbnail : null;

  return { thumbnail };
}
