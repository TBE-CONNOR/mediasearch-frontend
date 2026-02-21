import { useCallback, useEffect } from 'react';
import { is429 } from '@/utils/httpUtils';
import type { FileRejection } from 'react-dropzone';
import {
  isHeic,
  convertHeicToJpeg,
  getPollingInterval,
  validateFile,
} from '@/utils/fileUtils';
import { getPresignedUrl, uploadToS3 } from '@/api/upload';
import type { UploadResponse } from '@/api/upload';
import { getFile } from '@/api/files';
import { useUploadStore } from '@/store/uploadStore';
import type { UploadItem } from '@/store/uploadStore';
import { queryClient } from '@/config/queryClient';
import {
  UPLOAD_MAX_CONCURRENT,
  KB_SYNC_GRACE_PERIOD_MS,
} from '@/config/constants';

export type { UploadItem };

// Module-level side-effect tracking (survives component unmount)
const timeoutIds = new Set<ReturnType<typeof setTimeout>>();
const activeAborts = new Set<() => void>();

// KB sync grace period timer — resets on each upload completion
let kbSyncTimerId: ReturnType<typeof setTimeout> | undefined;

// Concurrency pool — limits simultaneous presigned-URL + S3-PUT operations

const pendingQueue: Array<() => void> = [];
let activeCount = 0;

function acquireSlot(): Promise<void> {
  if (activeCount < UPLOAD_MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    pendingQueue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function releaseSlot() {
  activeCount--;
  const next = pendingQueue.shift();
  if (next) next();
}

function updateUpload(id: string, patch: Partial<UploadItem>) {
  useUploadStore.getState().updateUpload(id, patch);
}

function startPolling(id: string, fileId: string) {
  const startTime = Date.now();

  const poll = async () => {
    try {
      const file = await getFile(fileId);
      const s = file.processing_status;
      if (s === 'completed' || s === 'failed' || s === 'rejected') {
        updateUpload(id, {
          stage: s,
          error: file.error_message || file.rejection_reason,
          ...(s === 'completed' && { completedAt: Date.now() }),
        });
        if (s === 'completed') {
          // Start/reset KB sync grace period (counts from LAST completion)
          useUploadStore.getState().setKbSyncPending(true);
          if (kbSyncTimerId) clearTimeout(kbSyncTimerId);
          kbSyncTimerId = setTimeout(() => {
            useUploadStore.getState().setKbSyncPending(false);
            kbSyncTimerId = undefined;
          }, KB_SYNC_GRACE_PERIOD_MS);
        }
        void queryClient.invalidateQueries({ queryKey: ['files'] });
        return;
      }
    } catch {
      // 404 expected during S3 → DynamoDB gap; keep polling
    }

    const elapsed = Date.now() - startTime;
    const interval = getPollingInterval(elapsed);
    if (interval === false) {
      updateUpload(id, {
        stage: 'failed',
        error: 'Processing is taking longer than expected',
      });
      return;
    }
    const tid = setTimeout(() => {
      timeoutIds.delete(tid);
      void poll();
    }, interval);
    timeoutIds.add(tid);
  };

  void poll();
}

async function handleUpload(rawFile: File) {
  const id = crypto.randomUUID();

  // Immediately visible in UI as queued
  useUploadStore
    .getState()
    .addUpload({ id, fileName: rawFile.name, stage: 'queued', progress: 0 });

  // Wait for a concurrency slot
  await acquireSlot();

  // Hoist res above try so it's in scope after finally for startPolling
  let file = rawFile;
  let res: UploadResponse | undefined;
  try {
    updateUpload(id, { stage: 'preparing' });

    // HEIC → JPEG conversion (transparent to user)
    if (isHeic(file)) {
      try {
        file = await convertHeicToJpeg(file);
        updateUpload(id, { fileName: file.name });
      } catch {
        updateUpload(id, {
          stage: 'failed',
          error: 'Failed to convert HEIC to JPEG',
        });
        return;
      }
    }

    // Step 1: Get presigned URL
    updateUpload(id, { stage: 'uploading', progress: 0 });
    try {
      res = await getPresignedUrl(file.name);
      updateUpload(id, { fileId: res.file_id });
    } catch (err) {
      if (is429(err)) {
        const body =
          err.response?.data != null &&
          typeof err.response.data === 'object'
            ? (err.response.data as Record<string, unknown>)
            : {};
        const detail =
          typeof body.detail === 'string' ? body.detail : undefined;
        const errorMsg =
          typeof body.error === 'string' ? body.error : undefined;
        updateUpload(id, {
          stage: 'failed',
          error: detail || errorMsg || 'Upload quota exceeded',
          quotaExceeded: true,
        });
      } else {
        updateUpload(id, {
          stage: 'failed',
          error:
            err instanceof Error ? err.message : 'Failed to get upload URL',
        });
      }
      return;
    }

    // Step 2: Upload to S3 (XHR for progress)
    let abortUpload: (() => void) | undefined;
    try {
      const { headers } = res.upload_instructions;
      const upload = uploadToS3(
        res.presigned_url,
        file,
        headers['Content-Type'],
        headers['Content-Disposition'],
        (percent) => updateUpload(id, { progress: percent }),
      );
      abortUpload = upload.abort;
      activeAborts.add(abortUpload);
      await upload.promise;
      activeAborts.delete(abortUpload);
    } catch (err) {
      if (abortUpload) activeAborts.delete(abortUpload);
      updateUpload(id, {
        stage: 'failed',
        error: err instanceof Error ? err.message : 'Upload to S3 failed',
      });
      return;
    }
  } finally {
    releaseSlot();
  }

  // Step 3: Poll processing status — slot already released
  updateUpload(id, { stage: 'processing', progress: 100 });
  if (!res) return; // All failure paths return early; guard for type safety
  startPolling(id, res.file_id);
}

/** Cancel all in-flight uploads, stop all polling, drain queue, and clear state. Call on logout. */
export function cleanupUploads() {
  activeAborts.forEach((abort) => abort());
  activeAborts.clear();
  timeoutIds.forEach(clearTimeout);
  timeoutIds.clear();
  if (kbSyncTimerId) {
    clearTimeout(kbSyncTimerId);
    kbSyncTimerId = undefined;
  }
  pollingResumed.clear();
  pendingQueue.length = 0;
  activeCount = 0;
  useUploadStore.getState().clearAll();
}

async function validateAndUpload(file: File) {
  const error = await validateFile(file);
  if (error) {
    useUploadStore.getState().addUpload({
      id: crypto.randomUUID(),
      fileName: file.name,
      stage: 'rejected',
      progress: 0,
      error,
    });
    return;
  }
  void handleUpload(file);
}

// Track which processing items already have active polling
const pollingResumed = new Set<string>();

export function useUploadQueue() {
  const uploads = useUploadStore((s) => s.uploads);

  // Resume polling for any 'processing' items rehydrated from sessionStorage
  useEffect(() => {
    const orphaned = useUploadStore
      .getState()
      .uploads.filter(
        (u): u is UploadItem & { fileId: string } =>
          u.stage === 'processing' && typeof u.fileId === 'string' && !pollingResumed.has(u.id),
      );
    for (const item of orphaned) {
      pollingResumed.add(item.id);
      startPolling(item.id, item.fileId);
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      for (const { file, errors } of fileRejections) {
        useUploadStore.getState().addUpload({
          id: crypto.randomUUID(),
          fileName: file.name,
          stage: 'rejected',
          progress: 0,
          error:
            errors[0]?.code === 'file-invalid-type'
              ? 'File type not supported'
              : errors[0]?.message || 'File rejected',
        });
      }

      acceptedFiles.forEach((f) => void validateAndUpload(f));
    },
    [],
  );

  return { uploads, onDrop };
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanupUploads();
  });
}
