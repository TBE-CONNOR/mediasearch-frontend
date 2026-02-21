import { api } from '@/api/axios';
import { getFile } from '@/api/files';
import type { FileItem } from '@/api/files';
import type { Tier } from '@/types/domain';

/**
 * Citation content_type is a simplified modality string
 * ("document", "image", "audio", "video") -- NOT a MIME type.
 * File-type icon logic must switch on these strings.
 */
export interface Citation {
  source_file: string;
  content_type: string;
  text_preview: string;
  retrieval_score: number;
  rerank_score: number;
  source_uri: string;
  file_id?: string;
  presigned_url?: string;
}

export interface SearchMetadata {
  chunks_retrieved: number;
  chunks_after_rerank: number;
  generation_model: string;
  rerank_model: string;
  input_tokens: number;
  output_tokens: number;
  timestamp: string;
}

export interface SearchResponse {
  query: string;
  answer: string;
  citations: Citation[];
  metadata: SearchMetadata;
  quota?: {
    tier: Tier;
    searches_used: number;
    searches_limit: number;
  };
}

export interface EnrichedCitation extends Citation {
  file: FileItem | null;
}

export interface EnrichedSearchResponse
  extends Omit<SearchResponse, 'citations'> {
  citations: EnrichedCitation[];
}

/**
 * source_file is a ULID with extension (e.g. "01KHMS3SEP6RGK4P4M4YHDRQPF.pdf").
 * Strip the extension to get the file_id for matching.
 * WARNING: matching by file_name will NEVER work -- source_file is a ULID.
 */
const stripExt = (s: string) => s.replace(/\.[^.]+$/, '');

interface SearchRequest {
  query: string;
  file_ids?: string[];
  top_k?: number;
  top_n?: number;
  rerank?: boolean;
  generate?: boolean;
}

/**
 * Fetch only the files referenced in search citations.
 * Used as a lightweight fallback when the caller does not pass `cachedFiles`.
 */
async function fetchCitationFiles(
  citations: Citation[],
): Promise<FileItem[]> {
  const uniqueIds = [...new Set(citations.map((c) => c.file_id ?? stripExt(c.source_file)))];
  const results = await Promise.allSettled(uniqueIds.map((id) => getFile(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<FileItem> => r.status === 'fulfilled')
    .map((r) => r.value);
}

/**
 * Search files and return enriched citations.
 * Pass `cachedFiles` to skip redundant file fetches when the caller
 * already has file data (e.g. from a TanStack Query cache).
 * Without `cachedFiles`, only the files referenced in citations are fetched
 * instead of the full file list — much lighter for users with many files.
 */
export async function searchFiles(
  query: string,
  options?: {
    fileIds?: string[];
    cachedFiles?: FileItem[];
    topK?: number;
    topN?: number;
    rerank?: boolean;
    generate?: boolean;
  },
): Promise<EnrichedSearchResponse> {
  const body: SearchRequest = { query };
  if (options?.fileIds?.length) body.file_ids = options.fileIds;
  if (options?.topK != null) body.top_k = options.topK;
  if (options?.topN != null) body.top_n = options.topN;
  if (options?.rerank != null) body.rerank = options.rerank;
  if (options?.generate != null) body.generate = options.generate;

  if (options?.cachedFiles) {
    // Fast path: run search and enrichment in parallel with cached data
    const searchRes = await api.post<SearchResponse>('/search', body);
    const result = searchRes.data;
    const files = options.cachedFiles;

    const enrichedCitations: EnrichedCitation[] = result.citations.map((c) => ({
      ...c,
      file: files.find((f) => f.file_id === (c.file_id ?? stripExt(c.source_file))) ?? null,
    }));

    return { ...result, citations: enrichedCitations };
  }

  // Fallback: search first, then fetch only the referenced files
  const searchRes = await api.post<SearchResponse>('/search', body);
  const result = searchRes.data;
  const files = await fetchCitationFiles(result.citations);

  const enrichedCitations: EnrichedCitation[] = result.citations.map((c) => ({
    ...c,
    file: files.find((f) => f.file_id === (c.file_id ?? stripExt(c.source_file))) ?? null,
  }));

  return { ...result, citations: enrichedCitations };
}
