import { MediaGalleryView } from '@/components/MediaGallery';
import { AIAnalysisView } from '@/components/search/AIAnalysisView';
import type { EnrichedSearchResponse } from '@/api/search';

export function SearchResults({
  data,
  answerOpen,
  onToggleAnswer,
  viewMode,
  onChangeViewMode,
}: {
  data: EnrichedSearchResponse;
  answerOpen: boolean;
  onToggleAnswer: () => void;
  viewMode: 'gallery' | 'analysis';
  onChangeViewMode: (mode: 'gallery' | 'analysis') => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      {/* Tab bar */}
      <div
        role="tablist"
        className="inline-flex overflow-hidden rounded-lg border border-gray-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'gallery'}
          onClick={() => onChangeViewMode('gallery')}
          className={`px-4 py-2 text-sm font-medium ${
            viewMode === 'gallery'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Media Gallery
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'analysis'}
          onClick={() => onChangeViewMode('analysis')}
          className={`px-4 py-2 text-sm font-medium ${
            viewMode === 'analysis'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          AI Analysis
        </button>
      </div>

      {viewMode === 'gallery' ? (
        <MediaGalleryView citations={data.citations} />
      ) : (
        <AIAnalysisView
          data={data}
          answerOpen={answerOpen}
          onToggleAnswer={onToggleAnswer}
        />
      )}
    </div>
  );
}
