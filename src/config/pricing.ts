import type { Tier } from '@/types/domain';

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

// Stripe price IDs from env vars — swap .env values when going live
function priceEnv(key: string): string | null {
  return (import.meta.env[key] as string | undefined) || null;
}

export const TIERS: PricingTier[] = [
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
    annualMonthly: 9.99,
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
    annualMonthly: 15.39,
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
    annualMonthly: 26.99,
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
