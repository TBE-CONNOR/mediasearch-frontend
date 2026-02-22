import { useState, createElement } from 'react';
import { VideoThumbnail } from '@/components/VideoThumbnail';
import { getFileIcon } from '@/utils/fileUtils';
import type { FileItem } from '@/api/files';

export function FileThumbnail({ file }: { file: FileItem }) {
  const [imgError, setImgError] = useState(false);
  const isImage = file.content_type.startsWith('image/');
  const isVideo = file.content_type.startsWith('video/');
  const isCompleted = file.processing_status === 'completed';

  if (isImage && !!file.presigned_url && isCompleted && !imgError) {
    return (
      <div className="aspect-video bg-zinc-800">
        <img
          src={file.presigned_url}
          alt={file.file_name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (isVideo && isCompleted && file.presigned_url) {
    return (
      <VideoThumbnail url={file.presigned_url} contentType={file.content_type} />
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center bg-zinc-800/50">
      {createElement(getFileIcon(file.content_type), {
        className: 'h-10 w-10 text-zinc-600',
      })}
    </div>
  );
}
