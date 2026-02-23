import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { Tier } from '@/types/domain';

/**
 * Syncs the subscription tier from the API response into the auth store,
 * ensuring the NavBar badge and quota limits reflect the real tier even
 * when the JWT hasn't caught up yet (e.g. post-checkout webhook delay).
 */
export function useSyncSubscriptionTier(tier: Tier | undefined) {
  useEffect(() => {
    if (!tier) return;
    const storeTier = useAuthStore.getState().tier;
    if (tier !== storeTier) {
      useAuthStore.getState().setTier(tier);
    }
  }, [tier]);
}
