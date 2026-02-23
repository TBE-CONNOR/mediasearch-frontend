import { useState } from 'react';
import { Link } from 'react-router';
import { FileThumbnail } from '@/components/FileThumbnail';
import { MediaPreviewModal } from '@/components/MediaPreviewModal';
import { isPreviewable } from '@/utils/fileUtils';
import type { FileItem } from '@/api/files';

interface FileCardProps {
  file: FileItem;
  children: React.ReactNode;
}

export function FileCard({ file, children }: FileCardProps) {
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

        {children}
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
