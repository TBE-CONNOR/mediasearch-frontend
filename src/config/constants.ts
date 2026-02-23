import type { Tier } from '@/types/domain';

// ─── Text preview limits ──────────────────────────────────
export const GALLERY_PREVIEW_LIMIT = 150;
export const CITATION_PREVIEW_LIMIT = 300;

// ─── Upload ───────────────────────────────────────────────
export const UPLOAD_MAX_CONCURRENT = 5;

// ─── File validation ──────────────────────────────────────
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB (BDA limit)
export const GENERAL_MAX_BYTES = 500 * 1024 * 1024; // 500 MB
export const VIDEO_MAX_DURATION_S = 2 * 60; // 2 minutes
export const AUDIO_MAX_DURATION_S = 5 * 60; // 5 minutes

// ─── Auth ─────────────────────────────────────────────────
export const TOKEN_REFRESH_BUFFER_MS = 5 * 60_000; // 5 minutes — matches API_DOCS recommendation

// ─── Polling / refetch intervals ──────────────────────────
export const FILES_REFETCH_INTERVAL_MS = 10_000;
export const FILE_DETAIL_REFETCH_INTERVAL_MS = 3_000;
export const KB_SYNC_GRACE_PERIOD_MS = 2 * 60_000; // 2 minutes — matches EventBridge KB sync schedule
export const POLLING_TIMEOUT_MS = 15 * 60_000; // stop polling after 15 minutes
export const POLLING_FAST_MS = 2_000; // first 30 s
export const POLLING_FAST_UNTIL_MS = 30_000;
export const POLLING_MEDIUM_MS = 5_000; // 30 s – 5 min
export const POLLING_MEDIUM_UNTIL_MS = 5 * 60_000;
export const POLLING_SLOW_MS = 15_000; // 5 – 15 min
export const MEDIA_DURATION_TIMEOUT_MS = 10_000;

// ─── Quota thresholds ────────────────────────────────────
export const QUOTA_WARNING_THRESHOLD = 0.8;

// ─── Search ───────────────────────────────────────────────
export const LOW_CONFIDENCE_TOKEN_THRESHOLD = 20;

// ─── Contact ─────────────────────────────────────────────
export const CONTACT_EMAIL = 'boetigsolutions@gmail.com';
export const CONTACT_PHONE = '(443) 333-0998';
export const CONTACT_PHONE_HREF = 'tel:+14433330998';

// ─── Tier display ─────────────────────────────────────────
export const TIER_LABELS: Record<Tier, string> = {
  free: 'Free',
  pro: 'Pro',
  plus: 'Plus',
  power: 'Power',
};

export const TIER_COLORS: Record<Tier, string> = {
  free: 'bg-zinc-800 text-zinc-300',
  pro: 'bg-blue-900/40 text-blue-400',
  plus: 'bg-purple-900/40 text-purple-400',
  power: 'bg-amber-900/40 text-amber-400',
};
