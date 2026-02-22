import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Music, FileText } from 'lucide-react';
import type { FileItem } from '@/api/files';
import type { EnrichedCitation } from '@/api/search';
import { GALLERY_PREVIEW_LIMIT } from '@/config/constants';

type CitationWithFile = EnrichedCitation & { file: FileItem };

function hasCitationFile(c: EnrichedCitation): c is CitationWithFile {
  return c.file != null && typeof c.file.file_id === 'string';
}

export function MediaGalleryView({
  citations,
}: {
  citations: EnrichedCitation[];
}) {
  // Deduplicate: one card per file_id, highest rerank_score wins
  const uniqueCitations = useMemo(() => {
    const map = new Map<string, CitationWithFile>();
    for (const c of citations) {
      if (!hasCitationFile(c)) continue;
      const fid = c.file.file_id;
      const existing = map.get(fid);
      if (!existing || c.rerank_score > existing.rerank_score) {
        map.set(fid, c);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.rerank_score - a.rerank_score,
    );
  }, [citations]);

  if (uniqueCitations.length === 0) {
    return (
      <p className="text-base text-zinc-500">No media results to display.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {uniqueCitations.map((c) => (
        <MediaCard
          key={c.file.file_id}
          citation={c}
          mediaUrl={c.file.presigned_url || c.presigned_url}
        />
      ))}
    </div>
  );
}

function MediaPreview({
  contentType,
  mediaUrl,
  fileName,
}: {
  contentType: string;
  mediaUrl?: string;
  fileName: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (contentType === 'image' && mediaUrl && !imgError) {
    return (
      <div className="aspect-video bg-zinc-800">
        <img
          src={mediaUrl}
          alt={fileName}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (contentType === 'video' && mediaUrl) {
    return (
      <div className="aspect-video bg-black">
        {/* User-uploaded media — no caption tracks available */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={mediaUrl}
          controls
          aria-label={`Video preview of ${fileName}`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (contentType === 'audio' && mediaUrl) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-zinc-800">
        <Music className="h-10 w-10 text-zinc-500" />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          controls
          src={mediaUrl}
          aria-label={`Audio preview of ${fileName}`}
          className="w-full px-3"
        />
      </div>
    );
  }

  // Document fallback or no URL available
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-1 bg-zinc-800">
      <FileText className="h-10 w-10 text-zinc-500" />
      <span className="max-w-full truncate px-2 text-xs text-zinc-500">
        {fileName}
      </span>
    </div>
  );
}

/** Whether media type has interactive controls that conflict with a parent link */
function isInteractiveMedia(contentType: string): boolean {
  return contentType === 'video' || contentType === 'audio';
}

function MediaCard({
  citation,
  mediaUrl,
}: {
  citation: CitationWithFile;
  mediaUrl?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const fileName = citation.file.file_name ?? citation.source_file;
  const score = citation.rerank_score;
  const isLong = citation.text_preview.length > GALLERY_PREVIEW_LIMIT;
  const hasControls = isInteractiveMedia(citation.content_type);

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700">
      {/* Media preview — sits above the stretched link so controls are interactive */}
      {hasControls ? (
        <div className="relative z-10">
          <MediaPreview
            contentType={citation.content_type}
            mediaUrl={mediaUrl}
            fileName={fileName}
          />
        </div>
      ) : (
        <MediaPreview
          contentType={citation.content_type}
          mediaUrl={mediaUrl}
          fileName={fileName}
        />
      )}

      <div className="p-4">
        {/* Filename + score */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-base font-medium text-white">
            {fileName}
          </span>
          {score != null && (
            <span className="shrink-0 text-sm text-zinc-500">
              {(score * 100).toFixed(0)}%
            </span>
          )}
        </div>

        {/* Text preview */}
        <p className="mt-1.5 text-sm text-zinc-400">
          {isLong && !expanded
            ? citation.text_preview.slice(0, GALLERY_PREVIEW_LIMIT) + '...'
            : citation.text_preview}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="relative z-10 mt-1 text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Stretched link — covers the whole card but sits below interactive elements */}
      <Link
        to={`/files/${citation.file.file_id}`}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
        aria-label={`View ${fileName} details`}
      />
    </div>
  );
}
