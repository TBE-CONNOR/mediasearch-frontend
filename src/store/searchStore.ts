import { create } from 'zustand';
import type { EnrichedSearchResponse } from '@/api/search';

interface SearchState {
  query: string;
  selectedFileIds: string[];
  lastResult: EnrichedSearchResponse | null;
  pendingSearch: boolean;
  setQuery: (q: string) => void;
  setSelectedFileIds: (ids: string[]) => void;
  setLastResult: (data: EnrichedSearchResponse | null) => void;
  setPendingSearch: (pending: boolean) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  selectedFileIds: [],
  lastResult: null,
  pendingSearch: false,

  setQuery: (query) => set({ query }),
  setSelectedFileIds: (selectedFileIds) => set({ selectedFileIds }),
  setLastResult: (lastResult) => set({ lastResult }),
  setPendingSearch: (pendingSearch) => set({ pendingSearch }),
  clear: () => set({ query: '', selectedFileIds: [], lastResult: null, pendingSearch: false }),
}));
