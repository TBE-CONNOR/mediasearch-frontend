export const VALID_TIERS = ['free', 'pro', 'plus', 'power'] as const;
export type Tier = (typeof VALID_TIERS)[number];

export type ProcessingStatus =
  | 'completed'
  | 'processing'
  | 'pending_upload'
  | 'failed'
  | 'rejected';
