import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Loader2, ExternalLink, CreditCard, RefreshCw } from 'lucide-react';
import {
  getSubscription,
  getCustomerPortalUrl,
} from '@/api/subscription';
import type { SubscriptionInfo } from '@/api/subscription';
import { cognitoClient } from '@/auth/CognitoClient';
import { useAuthStore } from '@/store/authStore';
import { QuotaErrorBanner } from '@/components/QuotaError';
import { is429 } from '@/utils/httpUtils';
import { formatAmount, formatPeriodEnd } from '@/utils/fileUtils';
import { TIER_LABELS, TIER_COLORS } from '@/config/constants';
import type { Tier } from '@/types/domain';

const STATUS_CONFIG: Record<string, { style: string; label: string }> = {
  active: { style: 'text-green-400', label: 'Active' },
  past_due: { style: 'text-red-400', label: 'Past Due' },
  canceled: { style: 'text-zinc-500', label: 'Canceled' },
  trialing: { style: 'text-blue-400', label: 'Trial' },
};

export function SubscriptionPage() {
  const location = useLocation();
  const queryClient = useQueryClient();

  // After Stripe Checkout redirect: refresh JWT to pick up new tier, then refetch subscription
  useEffect(() => {
    if (!new URLSearchParams(location.search).get('session_id')) return;
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      void cognitoClient
        .refresh(refreshToken)
        .then((result) => {
          useAuthStore.getState().setTokens({
            idToken: result.idToken,
            expiresAt: result.expiresAt,
          });
          useAuthStore.getState().setUser({
            email: result.email,
            sub: result.sub,
            tier: result.tier,
          });
        })
        .catch(() => {
          // Token refresh failed — subscription query will still work with current token
        })
        .then(() => {
          // Invalidate after refresh so the query fires with the updated token/tier
          void queryClient.invalidateQueries({ queryKey: ['subscription'] });
        });
    } else {
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
    }
  }, [location.search, queryClient]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  const portalMut = useMutation({
    mutationFn: () => getCustomerPortalUrl(),
    // Gotcha #7: same tab redirect, NOT window.open()
    onSuccess: ({ portal_url }) => {
      window.location.href = portal_url;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center" role="status" aria-label="Loading subscription">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg">
          {is429(error) ? (
            <QuotaErrorBanner error={error} />
          ) : (
            <div role="alert" className="rounded-lg border border-red-800 bg-red-900/30 p-4 text-sm text-red-400">
              <p>Failed to load subscription details.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-2 inline-flex items-center gap-1 font-medium text-red-400 hover:text-red-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const tier = data?.tier ?? 'free';
  const sub = data?.subscription;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-white">Subscription</h1>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          {/* Plan header */}
          <div className="flex items-center gap-3">
            <TierBadge tier={tier} />
            <div>
              <h2 className="text-lg font-semibold text-white">
                {TIER_LABELS[tier] ?? tier} Plan
              </h2>
              {sub && (
                <p className="text-sm text-zinc-400">
                  {formatAmount(sub.amount, sub.currency)}/{sub.interval}
                </p>
              )}
            </div>
          </div>

          {/* Subscription details */}
          {sub ? (
            <SubscriptionDetails sub={sub} />
          ) : (
            <div className="mt-4">
              <p className="text-sm text-zinc-500">
                No active subscription. You are on the free plan.
              </p>
              <Link
                to="/pricing"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
              >
                View Plans
              </Link>
            </div>
          )}

          {/* Manage Billing button -- only for subscribed users */}
          {sub && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => portalMut.mutate()}
                disabled={portalMut.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] disabled:opacity-50"
              >
                {portalMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Manage Billing
              </button>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
              >
                Compare Plans
              </Link>
            </div>
          )}

          {portalMut.isError && (
            <p className="mt-3 text-sm text-red-400">
              {isAxiosError(portalMut.error) &&
              portalMut.error.response?.status === 404
                ? 'No subscription found. Subscribe to a plan to manage billing.'
                : 'Failed to open billing portal. Please try again.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  const color = TIER_COLORS[tier] ?? TIER_COLORS.free;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${color}`}
    >
      <CreditCard className="h-4 w-4" />
      {(TIER_LABELS[tier] ?? tier).toUpperCase()}
    </span>
  );
}

function SubscriptionDetails({ sub }: { sub: SubscriptionInfo }) {
  const statusCfg = STATUS_CONFIG[sub.subscription_status] ?? {
    style: 'text-zinc-400',
    label: sub.subscription_status,
  };

  const periodDate = formatPeriodEnd(sub.current_period_end);

  return (
    <dl className="mt-4 space-y-3 text-sm">
      <div>
        <dt className="font-medium text-zinc-500">Status</dt>
        <dd className={`font-medium ${statusCfg.style}`}>{statusCfg.label}</dd>
      </div>
      <div>
        <dt className="font-medium text-zinc-500">
          {sub.cancel_at_period_end ? 'Cancels on' : 'Renews on'}
        </dt>
        <dd className="text-white">{periodDate}</dd>
      </div>
    </dl>
  );
}
