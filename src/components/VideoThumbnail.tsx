import { useState, useRef, useCallback, createElement } from 'react';
import { getFileIcon, getModalityIcon } from '@/utils/fileUtils';

interface VideoThumbnailProps {
  url: string;
  /** MIME type for 'card' fallback, modality string for 'citation' fallback */
  contentType?: string;
  className?: string;
  /** 'card' = aspect-video (FilesPage), 'citation' = h-8 w-8 (CitationCard) */
  size?: 'card' | 'citation';
}

export function VideoThumbnail({
  url,
  contentType = 'video/mp4',
  className,
  size = 'card',
}: VideoThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedData = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(0.5, video.duration * 0.1);
  }, []);

  if (failed) {
    const IconComponent =
      size === 'citation' ? getModalityIcon(contentType) : getFileIcon(contentType);

    if (size === 'citation') {
      return createElement(IconComponent, {
        className: 'h-5 w-5 shrink-0 text-zinc-500',
      });
    }
    return (
      <div className={`flex aspect-video items-center justify-center bg-zinc-800/50 ${className ?? ''}`}>
        {createElement(IconComponent, {
          className: 'h-10 w-10 text-zinc-600',
        })}
      </div>
    );
  }

  if (size === 'citation') {
    return (
      <video
        ref={videoRef}
        src={url}
        preload="metadata"
        muted
        playsInline
        onLoadedData={handleLoadedData}
        onError={() => setFailed(true)}
        className="h-8 w-8 shrink-0 rounded object-cover"
      />
    );
  }

  return (
    <div className={`aspect-video bg-zinc-800 ${className ?? ''}`}>
      <video
        ref={videoRef}
        src={url}
        preload="metadata"
        muted
        playsInline
        onLoadedData={handleLoadedData}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover pointer-events-none"
      />
    </div>
  );
}
