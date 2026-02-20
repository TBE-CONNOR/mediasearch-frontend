import type { Tier } from '@/types/domain';

const required = [
  'VITE_AWS_REGION',
  'VITE_COGNITO_USER_POOL_ID',
  'VITE_COGNITO_CLIENT_ID',
  'VITE_API_BASE_URL',
  'VITE_API_KEY_FREE',
  'VITE_API_KEY_PRO',
  'VITE_API_KEY_PLUS',
  'VITE_API_KEY_POWER',
] as const;

const missing = required.filter((k) => !import.meta.env[k]);
if (missing.length) {
  throw new Error(
    `Missing required env vars: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill in all values.',
  );
}

function env(key: string): string {
  return import.meta.env[key] as string;
}

export const AWS_CONFIG = {
  region: env('VITE_AWS_REGION'),
  userPoolId: env('VITE_COGNITO_USER_POOL_ID'),
  userPoolClientId: env('VITE_COGNITO_CLIENT_ID'),
  apiBaseUrl: env('VITE_API_BASE_URL'),
};

// Public rate-limiting keys — NOT secrets. Safe to expose in client bundle.
export const TIER_API_KEYS: Record<Tier, string> = {
  free: env('VITE_API_KEY_FREE'),
  pro: env('VITE_API_KEY_PRO'),
  plus: env('VITE_API_KEY_PLUS'),
  power: env('VITE_API_KEY_POWER'),
};
