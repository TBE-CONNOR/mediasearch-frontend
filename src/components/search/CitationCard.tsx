import { useState, createElement } from 'react';
import { Link } from 'react-router';
import { CITATION_PREVIEW_LIMIT } from '@/config/constants';
import { getModalityIcon } from '@/utils/fileUtils';
import type { EnrichedCitation } from '@/api/search';

export function CitationCard({ citation }: { citation: EnrichedCitation }) {
  const [expanded, setExpanded] = useState(false);
  const fileName = citation.file?.file_name ?? citation.source_file;
  const score = citation.rerank_score;
  const isLong = citation.text_preview.length > CITATION_PREVIEW_LIMIT;

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {/* createElement avoids eslint react-hooks false positive on dynamic component */}
          {createElement(getModalityIcon(citation.content_type), {
            className: 'h-5 w-5 shrink-0 text-gray-400',
          })}
          {citation.file ? (
            <Link
              to={`/files/${citation.file.file_id}`}
              className="truncate text-sm font-medium text-blue-600 hover:underline"
            >
              {fileName}
            </Link>
          ) : (
            <span className="truncate text-sm font-medium text-gray-700">
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
              className="h-1.5 w-16 rounded-full bg-gray-200"
            >
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.round(score * 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600">
        {isLong && !expanded
          ? citation.text_preview.slice(0, CITATION_PREVIEW_LIMIT) + '...'
          : citation.text_preview}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-xs text-blue-600 hover:text-blue-800"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
