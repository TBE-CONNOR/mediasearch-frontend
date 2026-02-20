import { api } from '@/api/axios';
import { listFiles } from '@/api/files';
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
}

/**
 * Search files and return enriched citations.
 * Pass `cachedFiles` to skip the redundant listFiles() call when the caller
 * already has file data (e.g. from a TanStack Query cache).
 */
export async function searchFiles(
  query: string,
  options?: { fileIds?: string[]; cachedFiles?: FileItem[] },
): Promise<EnrichedSearchResponse> {
  const body: SearchRequest = { query };
  if (options?.fileIds?.length) body.file_ids = options.fileIds;

  const [searchRes, files] = await Promise.all([
    api.post<SearchResponse>('/search', body),
    options?.cachedFiles ? Promise.resolve(options.cachedFiles) : listFiles(),
  ]);

  const result = searchRes.data;

  const enrichedCitations: EnrichedCitation[] = result.citations.map((c) => ({
    ...c,
    file: files.find((f) => f.file_id === stripExt(c.source_file)) ?? null,
  }));

  return { ...result, citations: enrichedCitations };
}
