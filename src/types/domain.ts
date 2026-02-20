export const VALID_TIERS = ['free', 'plus', 'pro', 'power'] as const;
export type Tier = (typeof VALID_TIERS)[number];

export type ProcessingStatus =
  | 'completed'
  | 'processing'
  | 'pending_upload'
  | 'failed'
  | 'rejected';
