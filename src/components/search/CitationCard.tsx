import { useState, createElement } from 'react';
import { Link } from 'react-router';
import { CITATION_PREVIEW_LIMIT } from '@/config/constants';
import { getModalityIcon } from '@/utils/fileUtils';
import { VideoThumbnail } from '@/components/VideoThumbnail';
import { MediaPreviewModal } from '@/components/MediaPreviewModal';
import type { EnrichedCitation } from '@/api/search';

export function CitationCard({ citation }: { citation: EnrichedCitation }) {
  const [expanded, setExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileName = citation.file?.file_name ?? citation.source_file;
  const score = citation.rerank_score;
  const isLong = citation.text_preview.length > CITATION_PREVIEW_LIMIT;
  const mediaUrl = citation.file?.presigned_url || citation.presigned_url;
  const canPreview =
    (citation.content_type === 'image' || citation.content_type === 'video') &&
    !!mediaUrl;

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {mediaUrl && citation.content_type === 'image' ? (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="shrink-0 cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                aria-label={`Preview ${fileName}`}
              >
                <img
                  src={mediaUrl}
                  alt=""
                  className="h-8 w-8 rounded object-cover"
                />
              </button>
            ) : mediaUrl && citation.content_type === 'video' ? (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="shrink-0 cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                aria-label={`Preview ${fileName}`}
              >
                <VideoThumbnail
                  url={mediaUrl}
                  contentType="video"
                  size="citation"
                />
              </button>
            ) : (
              /* createElement avoids eslint react-hooks false positive on dynamic component */
              createElement(getModalityIcon(citation.content_type), {
                className: 'h-5 w-5 shrink-0 text-zinc-500',
              })
            )}
            {citation.file ? (
              <Link
                to={`/files/${citation.file.file_id}`}
                className="truncate text-base font-medium text-blue-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                {fileName}
              </Link>
            ) : (
              <span className="truncate text-base font-medium text-zinc-300">
                {fileName}
              </span>
            )}
          </div>

          {score != null && (
            <div className="flex shrink-0 items-center gap-1.5">
              <div
                role="meter"
                aria-valuenow={Math.round(score * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Relevance score"
                className="h-1.5 w-16 rounded-full bg-zinc-800"
              >
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.round(score * 100)}%` }}
                />
              </div>
              <span className="text-sm text-zinc-500">
                {(score * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        <p className="mt-2 text-base text-zinc-400">
          {isLong && !expanded
            ? citation.text_preview.slice(0, CITATION_PREVIEW_LIMIT) + '...'
            : citation.text_preview}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="mt-1 text-sm text-blue-400 transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {canPreview && citation.file && (
        <MediaPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          contentType={citation.file.content_type}
          mediaUrl={mediaUrl}
          fileName={fileName}
        />
      )}
    </>
  );
}
