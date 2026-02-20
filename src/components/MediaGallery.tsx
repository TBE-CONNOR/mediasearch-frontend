import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Music, FileText } from 'lucide-react';
import { getDownloadUrl } from '@/api/files';
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
  const [mediaUrls, setMediaUrls] = useState<Map<string, string>>(
    () => new Map(),
  );
  const fetchedRef = useRef(new Set<string>());

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

  // Fetch signed CloudFront URLs for all unique files
  useEffect(() => {
    const newIds = uniqueCitations
      .map((c) => c.file.file_id)
      .filter((fid) => !fetchedRef.current.has(fid));

    if (newIds.length === 0) return;

    let cancelled = false;
    for (const fid of newIds) fetchedRef.current.add(fid);

    void Promise.allSettled(
      newIds.map(async (fid) => {
        const res = await getDownloadUrl(fid);
        return [fid, res.download_url] as const;
      }),
    ).then((results) => {
      if (cancelled) return;
      setMediaUrls((prev) => {
        const next = new Map(prev);
        for (const r of results) {
          if (r.status === 'fulfilled') {
            next.set(r.value[0], r.value[1]);
          }
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [uniqueCitations]);

  // Derive loading state from data — avoids synchronous setState in effect
  const urlsLoading = uniqueCitations.some(
    (c) => !mediaUrls.has(c.file.file_id),
  );

  if (uniqueCitations.length === 0) {
    return (
      <p className="text-sm text-gray-500">No media results to display.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {uniqueCitations.map((c) => (
        <MediaCard
          key={c.file.file_id}
          citation={c}
          mediaUrl={mediaUrls.get(c.file.file_id)}
          loading={urlsLoading && !mediaUrls.has(c.file.file_id)}
        />
      ))}
    </div>
  );
}

function MediaPreview({
  contentType,
  mediaUrl,
  fileName,
  loading,
}: {
  contentType: string;
  mediaUrl?: string;
  fileName: string;
  loading: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  // Loading skeleton
  if (loading || (!mediaUrl && !imgError && contentType !== 'document')) {
    return (
      <div className="flex aspect-video items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (contentType === 'image' && mediaUrl && !imgError) {
    return (
      <div className="aspect-video bg-gray-100">
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
      <div
        className="aspect-video bg-black"
        onClick={(e) => e.preventDefault()}
      >
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
      <div
        className="flex aspect-video flex-col items-center justify-center gap-3 bg-gray-100"
        onClick={(e) => e.preventDefault()}
      >
        <Music className="h-10 w-10 text-gray-400" />
        <audio
          controls
          src={mediaUrl}
          aria-label={`Audio preview of ${fileName}`}
          className="w-full px-3"
        />
      </div>
    );
  }

  // Document fallback or failed media
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-1 bg-gray-100">
      <FileText className="h-10 w-10 text-gray-400" />
      <span className="max-w-full truncate px-2 text-xs text-gray-500">
        {fileName}
      </span>
    </div>
  );
}

function MediaCard({
  citation,
  mediaUrl,
  loading,
}: {
  citation: CitationWithFile;
  mediaUrl?: string;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const fileName = citation.file.file_name ?? citation.source_file;
  const score = citation.rerank_score;
  const isLong = citation.text_preview.length > GALLERY_PREVIEW_LIMIT;

  return (
    <Link
      to={`/files/${citation.file.file_id}`}
      className="block overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <MediaPreview
        contentType={citation.content_type}
        mediaUrl={mediaUrl}
        fileName={fileName}
        loading={loading}
      />

      <div className="p-3">
        {/* Filename + score */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-gray-900">
            {fileName}
          </span>
          {score != null && (
            <span className="shrink-0 text-xs text-gray-500">
              {(score * 100).toFixed(0)}%
            </span>
          )}
        </div>

        {/* Text preview */}
        <p className="mt-1.5 text-xs text-gray-600">
          {isLong && !expanded
            ? citation.text_preview.slice(0, GALLERY_PREVIEW_LIMIT) + '...'
            : citation.text_preview}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setExpanded((v) => !v);
            }}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </Link>
  );
}
