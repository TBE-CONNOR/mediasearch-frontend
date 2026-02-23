import { api } from '@/api/axios';
import type { Tier } from '@/types/domain';

export interface UploadResponse {
  presigned_url: string;
  file_id: string;
  file_name: string;
  s3_key: string;
  content_type: string;
  expires_in_seconds: number;
  quota: {
    tier: Tier;
    modality: string;
    used: number;
    limit: number;
  };
  upload_instructions: {
    method: string;
    headers: {
      'Content-Type': string;
      'Content-Disposition': string;
    };
    note: string;
  };
}

/** Step 1: Request a presigned upload URL from the backend */
export async function getPresignedUrl(
  fileName: string,
): Promise<UploadResponse> {
  const { data } = await api.post<UploadResponse>('/upload', {
    file_name: fileName,
  });
  return data;
}

export interface S3Upload {
  promise: Promise<void>;
  abort: () => void;
}

/**
 * Step 2: Upload file directly to S3 via XHR (for progress events).
 * Gotcha #2: BOTH Content-Type AND Content-Disposition headers required.
 * Gotcha #3: NO Authorization or x-api-key -- presigned URL has creds.
 *
 * Returns { promise, abort } so callers can cancel in-flight uploads.
 */
export function uploadToS3(
  presignedUrl: string,
  file: File,
  contentType: string,
  contentDisposition: string,
  onProgress?: (percent: number) => void,
): S3Upload {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<void>((resolve, reject) => {
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.setRequestHeader('Content-Disposition', contentDisposition);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.min(Math.round((e.loaded / e.total) * 100), 99));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () =>
      reject(new Error('Network error during upload')),
    );
    xhr.addEventListener('abort', () =>
      reject(new Error('Upload was aborted')),
    );

    xhr.send(file);
  });

  return { promise, abort: () => xhr.abort() };
}

