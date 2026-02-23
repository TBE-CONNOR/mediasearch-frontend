import { useState, createElement } from 'react';
import { FileText } from 'lucide-react';
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

  if (file.content_type === 'application/pdf') {
    return (
      <div className="flex aspect-video items-center justify-center bg-zinc-800/50">
        <div className="flex flex-col items-center gap-1">
          <FileText className="h-10 w-10 text-red-400" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
            PDF
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center bg-zinc-800/50">
      {createElement(getFileIcon(file.content_type), {
        className: 'h-10 w-10 text-zinc-600',
        'aria-hidden': true,
      })}
    </div>
  );
}
