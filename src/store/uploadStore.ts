import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UploadItem {
  id: string;
  fileName: string;
  stage:
    | 'queued'
    | 'preparing'
    | 'uploading'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'rejected';
  progress: number;
  error?: string;
  quotaExceeded?: boolean;
  fileId?: string;
  completedAt?: number;
}

/** Stages where the live upload process is gone after rehydration. */
const INTERRUPTED_STAGES = new Set(['queued', 'preparing', 'uploading']);

interface UploadState {
  uploads: UploadItem[];
  kbSyncPending: boolean;
  addUpload: (item: UploadItem) => void;
  updateUpload: (id: string, patch: Partial<UploadItem>) => void;
  setKbSyncPending: (pending: boolean) => void;
  clearAll: () => void;
}

export const useUploadStore = create<UploadState>()(
  persist(
    (set) => ({
      uploads: [],
      kbSyncPending: false,

      addUpload: (item) =>
        set((state) => ({ uploads: [...state.uploads, item] })),

      updateUpload: (id, patch) =>
        set((state) => ({
          uploads: state.uploads.map((u) =>
            u.id === id ? { ...u, ...patch } : u,
          ),
        })),

      setKbSyncPending: (pending) => set({ kbSyncPending: pending }),

      clearAll: () => set({ uploads: [], kbSyncPending: false }),
    }),
    {
      name: 'mediasearch-uploads',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        uploads: state.uploads,
        kbSyncPending: state.kbSyncPending,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Mark uploads whose live process is gone as failed
        const patched = state.uploads.map((u) =>
          INTERRUPTED_STAGES.has(u.stage)
            ? { ...u, stage: 'failed' as const, error: 'Upload interrupted — please retry' }
            : u,
        );
        if (patched.some((u, i) => u !== state.uploads[i])) {
          useUploadStore.setState({ uploads: patched });
        }
      },
    },
  ),
);
