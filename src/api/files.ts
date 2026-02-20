import { api } from '@/api/axios';
import type { ProcessingStatus } from '@/types/domain';

export type { ProcessingStatus };

/**
 * FileItem fields vary by processing_status.
 * completed_at, content_modality, extracted_content_length -- only on completed.
 * error_message -- only on failed.
 * rejection_reason -- only on rejected.
 * Keys are ABSENT (not null) on other statuses.
 */

export interface FileItem {
  file_id: string;
  file_name: string;
  processing_status: ProcessingStatus;
  content_type: string;
  upload_date: string;
  s3_key: string;
  content_modality?: string;
  completed_at?: string;
  extracted_content_length?: number;
  error_message?: string;
  rejection_reason?: string;
}

interface FilesPageResponse {
  files: FileItem[];
  count: number;
  next_token: string | null;
}

interface DownloadResponse {
  download_url: string;
  expires_in: number;
  file_id: string;
  file_name: string;
  processing_status: ProcessingStatus;
}

interface DeleteResponse {
  message: string;
  file_id: string;
  file_name: string;
  deleted: Record<string, boolean>;
}

/**
 * Fetch all user files with full pagination loop.
 *
 * DynamoDB applies page size before status filter, so a page can return
 * files:[] with a non-null next_token. Stop ONLY when next_token is null,
 * NOT when files is empty, or real files will be silently dropped.
 */
export async function listFiles(status?: string): Promise<FileItem[]> {
  const allFiles: FileItem[] = [];
  let nextToken: string | undefined;

  do {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (nextToken) params.next_token = nextToken;

    const { data } = await api.get<FilesPageResponse>('/files', { params });
    allFiles.push(...data.files);
    nextToken = data.next_token ?? undefined;
  } while (nextToken);

  return allFiles;
}

export async function getFile(fileId: string): Promise<FileItem> {
  const { data } = await api.get<{ file: FileItem }>(`/files/${fileId}`);
  return data.file;
}

export async function deleteFile(fileId: string): Promise<DeleteResponse> {
  const { data } = await api.delete<DeleteResponse>(`/files/${fileId}`);
  return data;
}

export async function getDownloadUrl(
  fileId: string,
): Promise<DownloadResponse> {
  const { data } = await api.post<DownloadResponse>('/download', {
    file_id: fileId,
  });
  return data;
}
