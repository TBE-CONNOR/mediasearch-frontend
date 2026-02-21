import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { listFiles } from '@/api/files';
import { searchFiles } from '@/api/search';
import { QuotaErrorBanner } from '@/components/QuotaError';
import { FileFilter } from '@/components/search/FileFilter';
import { SearchResults } from '@/components/search/SearchResults';
import { is429 } from '@/utils/httpUtils';
import { isTerminalStatus } from '@/utils/fileUtils';
import { useSearchStore } from '@/store/searchStore';
import { useUploadStore } from '@/store/uploadStore';
import { FILES_REFETCH_INTERVAL_MS } from '@/config/constants';

export function SearchPage() {
  const savedQuery = useSearchStore((s) => s.query);
  const savedFileIds = useSearchStore((s) => s.selectedFileIds);
  const setStoreQuery = useSearchStore((s) => s.setQuery);
  const setStoreFileIds = useSearchStore((s) => s.setSelectedFileIds);
  const setStoreLastResult = useSearchStore((s) => s.setLastResult);
  const lastResult = useSearchStore((s) => s.lastResult);

  const hasActiveUploads = useUploadStore((s) =>
    s.uploads.some(
      (u) =>
        u.stage === 'queued' ||
        u.stage === 'preparing' ||
        u.stage === 'uploading' ||
        u.stage === 'processing',
    ),
  );

  const kbSyncPending = useUploadStore((s) => s.kbSyncPending);

  const [query, setQuery] = useState(savedQuery);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(
    savedFileIds,
  );
  const [answerOpen, setAnswerOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'gallery' | 'analysis'>('gallery');

  const { data: files } = useQuery({
    queryKey: ['files'],
    queryFn: () => listFiles(),
    refetchInterval: hasActiveUploads
      ? FILES_REFETCH_INTERVAL_MS
      : (q) => {
          const data = q.state.data;
          if (!data) return false;
          const hasNonTerminal = data.some(
            (f) => !isTerminalStatus(f.processing_status),
          );
          return hasNonTerminal ? FILES_REFETCH_INTERVAL_MS : false;
        },
  });

  const searchMut = useMutation({
    mutationFn: (params: { query: string; fileIds?: string[] }) =>
      searchFiles(params.query, {
        fileIds: params.fileIds,
        cachedFiles: files,
      }),
    onSuccess: (data) => {
      setStoreQuery(query);
      setStoreFileIds(selectedFileIds);
      setStoreLastResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setAnswerOpen(true);
    searchMut.mutate({
      query: trimmed,
      fileIds: selectedFileIds.length > 0 ? selectedFileIds : undefined,
    });
  };

  const completedFiles = useMemo(
    () => (files ?? []).filter((f) => f.processing_status === 'completed'),
    [files],
  );

  const hasProcessingFiles = useMemo(
    () => (files ?? []).some((f) => !isTerminalStatus(f.processing_status)),
    [files],
  );

  // Show fresh mutation data if available, otherwise fall back to cached store result
  const displayResult = searchMut.data ?? lastResult;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Search</h1>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your files..."
            aria-label="Search your files"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- primary action on a dedicated search page
            autoFocus
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={searchMut.isPending || !query.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {searchMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </form>

        {/* File filter */}
        {completedFiles.length > 0 && (
          <FileFilter
            files={completedFiles}
            selected={selectedFileIds}
            onChange={setSelectedFileIds}
          />
        )}

        {/* Processing awareness banner — two phases */}
        {(hasProcessingFiles || hasActiveUploads) && (
          <div
            role="status"
            className="mt-4 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-amber-500" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            <p className="text-sm text-amber-800">
              Your files are still being indexed &mdash; results may be
              incomplete. This usually takes under a minute.
            </p>
          </div>
        )}

        {/* KB sync grace period banner — shows after processing completes */}
        {!hasProcessingFiles && !hasActiveUploads && kbSyncPending && (
          <div
            role="status"
            className="mt-4 flex items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 p-4"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-blue-500" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
            </span>
            <p className="text-sm text-blue-800">
              Files processed &mdash; updating search index. New results
              available within 2 minutes.
            </p>
          </div>
        )}

        {/* 429 quota error */}
        {searchMut.isError && is429(searchMut.error) && (
          <div className="mt-6">
            <QuotaErrorBanner error={searchMut.error} />
          </div>
        )}

        {/* Generic error (non-429) */}
        {searchMut.isError && !is429(searchMut.error) && (
          <div role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Search failed. Please try again.
          </div>
        )}

        {/* Loading */}
        {searchMut.isPending && (
          <div role="status" className="mt-8 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Searching your files...
          </div>
        )}

        {/* Results */}
        {displayResult && !searchMut.isPending && (
          <SearchResults
            data={displayResult}
            answerOpen={answerOpen}
            onToggleAnswer={() => setAnswerOpen((o) => !o)}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
          />
        )}

        {/* Empty state */}
        {!displayResult && !searchMut.isPending && (
          <div className="mt-12 text-center text-gray-400">
            <Search className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm">Search your files with natural language</p>
          </div>
        )}
      </div>
    </div>
  );
}
