import { useRef } from 'react';
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
  const galleryTabRef = useRef<HTMLButtonElement>(null);
  const analysisTabRef = useRef<HTMLButtonElement>(null);

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = viewMode === 'gallery' ? 'analysis' : 'gallery';
      onChangeViewMode(next);
      (next === 'gallery' ? galleryTabRef : analysisTabRef).current?.focus();
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Tab bar */}
      {/* Roving tabIndex on child tabs — container not directly focusable per WAI-ARIA tabs pattern */}
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div
        role="tablist"
        aria-label="Search results view"
        onKeyDown={handleTabKeyDown}
        className="inline-flex overflow-hidden rounded-lg border border-zinc-800"
      >
        <button
          ref={galleryTabRef}
          type="button"
          role="tab"
          id="tab-gallery"
          aria-selected={viewMode === 'gallery'}
          aria-controls="tabpanel-gallery"
          tabIndex={viewMode === 'gallery' ? 0 : -1}
          onClick={() => onChangeViewMode('gallery')}
          className={`px-5 py-2.5 text-base font-medium transition-colors ${
            viewMode === 'gallery'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          Media Gallery
        </button>
        <button
          ref={analysisTabRef}
          type="button"
          role="tab"
          id="tab-analysis"
          aria-selected={viewMode === 'analysis'}
          aria-controls="tabpanel-analysis"
          tabIndex={viewMode === 'analysis' ? 0 : -1}
          onClick={() => onChangeViewMode('analysis')}
          className={`px-5 py-2.5 text-base font-medium transition-colors ${
            viewMode === 'analysis'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          AI Analysis
        </button>
      </div>

      <div
        role="tabpanel"
        id="tabpanel-gallery"
        aria-labelledby="tab-gallery"
        tabIndex={0}
        hidden={viewMode !== 'gallery'}
      >
        <MediaGalleryView citations={data.citations} />
      </div>
      <div
        role="tabpanel"
        id="tabpanel-analysis"
        aria-labelledby="tab-analysis"
        tabIndex={0}
        hidden={viewMode !== 'analysis'}
      >
        <AIAnalysisView
          data={data}
          answerOpen={answerOpen}
          onToggleAnswer={onToggleAnswer}
        />
      </div>
    </div>
  );
}
