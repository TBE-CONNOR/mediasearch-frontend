import { create } from 'zustand';
import type { EnrichedSearchResponse } from '@/api/search';

interface SearchState {
  query: string;
  selectedFileIds: string[];
  lastResult: EnrichedSearchResponse | null;
  setQuery: (q: string) => void;
  setSelectedFileIds: (ids: string[]) => void;
  setLastResult: (data: EnrichedSearchResponse | null) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  selectedFileIds: [],
  lastResult: null,

  setQuery: (query) => set({ query }),
  setSelectedFileIds: (selectedFileIds) => set({ selectedFileIds }),
  setLastResult: (lastResult) => set({ lastResult }),
  clear: () => set({ query: '', selectedFileIds: [], lastResult: null }),
}));
