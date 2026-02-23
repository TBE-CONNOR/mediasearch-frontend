import type { Tier } from '@/types/domain';

const monthly = (annual: number) => parseFloat((annual / 12).toFixed(2));

export interface PricingTier {
  id: Tier;
  name: string;
  monthlyPrice: number | null;
  /** Must match Stripe prices — update together with annualPriceId when switching to live mode */
  annualPrice: number | null;
  annualMonthly: number | null;
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  features: string[];
  cta: string;
  badge: string | null;
  recommended: boolean;
  decoy: boolean;
}

// Stripe price IDs from env vars — swap .env values when going live.
// Returns null for missing vars (free tier has no prices).
// Dev warning logged once per missing key so checkout failures are diagnosable.
const warnedKeys = new Set<string>();
function priceEnv(key: string): string | null {
  const val = (import.meta.env[key] as string | undefined) || null;
  if (!val && import.meta.env.DEV && !warnedKeys.has(key)) {
    warnedKeys.add(key);
    console.warn(`[pricing] Missing env var ${key} — checkout for this plan will be unavailable`);
  }
  return val;
}

export type ModalityPrefix = 'image/' | 'video/' | 'audio/' | 'application/';

export interface TierLimits {
  limits: Record<ModalityPrefix, number>;
  period: 'lifetime' | 'month';
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    limits: { 'image/': 25, 'video/': 5, 'audio/': 2, 'application/': 2 },
    period: 'lifetime',
  },
  pro: {
    limits: { 'image/': 500, 'video/': 60, 'audio/': 10, 'application/': 3 },
    period: 'month',
  },
  plus: {
    limits: { 'image/': 750, 'video/': 90, 'audio/': 15, 'application/': 4 },
    period: 'month',
  },
  power: {
    limits: { 'image/': 2500, 'video/': 250, 'audio/': 25, 'application/': 10 },
    period: 'month',
  },
};

export const TIERS: readonly PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: null,
    annualPrice: null,
    annualMonthly: null,
    monthlyPriceId: null,
    annualPriceId: null,
    features: [
      '25 images (lifetime)',
      '5 videos (lifetime)',
      '2 audio files (lifetime)',
      '2 documents (lifetime)',
      '50 searches per month',
    ],
    cta: 'Current Plan',
    badge: null,
    recommended: false,
    decoy: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 12.99,
    annualPrice: 119.88,
    annualMonthly: monthly(119.88),
    monthlyPriceId: priceEnv('VITE_STRIPE_PRICE_PRO_MONTHLY'),
    annualPriceId: priceEnv('VITE_STRIPE_PRICE_PRO_ANNUAL'),
    features: [
      '500 images per month',
      '60 videos per month',
      '10 audio files per month',
      '3 documents per month',
      'Unlimited searches',
    ],
    cta: 'Get Pro',
    badge: 'Best Value',
    recommended: true,
    decoy: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    monthlyPrice: 19.99,
    annualPrice: 184.68,
    annualMonthly: monthly(184.68),
    monthlyPriceId: priceEnv('VITE_STRIPE_PRICE_PLUS_MONTHLY'),
    annualPriceId: priceEnv('VITE_STRIPE_PRICE_PLUS_ANNUAL'),
    features: [
      '750 images per month',
      '90 videos per month',
      '15 audio files per month',
      '4 documents per month',
      'Unlimited searches',
    ],
    cta: 'Get Plus',
    badge: null,
    recommended: false,
    decoy: true,
  },
  {
    id: 'power',
    name: 'Power',
    monthlyPrice: 34.99,
    annualPrice: 323.88,
    annualMonthly: monthly(323.88),
    monthlyPriceId: priceEnv('VITE_STRIPE_PRICE_POWER_MONTHLY'),
    annualPriceId: priceEnv('VITE_STRIPE_PRICE_POWER_ANNUAL'),
    features: [
      '2,500 images per month',
      '250 videos per month',
      '25 audio files per month',
      '10 documents per month',
      'Unlimited searches',
    ],
    cta: 'Get Power',
    badge: 'For Heavy Users',
    recommended: false,
    decoy: false,
  },
];

// Fail production builds if any paid tier is missing Stripe price IDs.
// Catches misconfigured .env before deploy rather than at runtime.
if (import.meta.env.PROD) {
  for (const tier of TIERS) {
    if (tier.monthlyPrice !== null && (!tier.monthlyPriceId || !tier.annualPriceId)) {
      throw new Error(
        `[pricing] Missing Stripe price ID for "${tier.id}" tier. Check VITE_STRIPE_PRICE_* env vars.`,
      );
    }
  }
}
