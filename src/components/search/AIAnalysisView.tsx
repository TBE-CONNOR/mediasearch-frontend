import { ChevronDown, ChevronUp } from 'lucide-react';
import { LOW_CONFIDENCE_TOKEN_THRESHOLD } from '@/config/constants';
import { CitationCard } from '@/components/search/CitationCard';
import type { EnrichedSearchResponse } from '@/api/search';

export function AIAnalysisView({
  data,
  answerOpen,
  onToggleAnswer,
}: {
  data: EnrichedSearchResponse;
  answerOpen: boolean;
  onToggleAnswer: () => void;
}) {
  const isLowConfidence =
    data.metadata.output_tokens < LOW_CONFIDENCE_TOKEN_THRESHOLD;

  return (
    <>
      {/* AI Answer (collapsible) */}
      <div className="rounded-lg bg-white shadow-sm">
        <button
          type="button"
          onClick={onToggleAnswer}
          aria-expanded={answerOpen}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-gray-700">AI Answer</span>
          {answerOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>
        {answerOpen && (
          <div className="border-t border-gray-100 px-4 pb-4 pt-3">
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {data.answer}
            </p>
            {isLowConfidence && (
              <p className="mt-2 text-xs text-gray-500">
                No strong matches found in your files.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Citations */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-gray-700">
          Sources ({data.citations.length})
        </h2>
        <div className="space-y-3">
          {data.citations.map((c, i) => (
            <CitationCard key={c.source_uri || `${c.source_file}-${i}`} citation={c} />
          ))}
        </div>
      </div>
    </>
  );
}
