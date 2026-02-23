import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { motion } from 'motion/react';
import {
  Loader2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Check,
  ArrowRight,
  Calendar,
  Receipt,
  Activity,
  Repeat,
} from 'lucide-react';
import {
  getSubscription,
  getCustomerPortalUrl,
} from '@/api/subscription';
import type { SubscriptionInfo } from '@/api/subscription';
import { refreshSession } from '@/auth/refreshSession';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSyncSubscriptionTier } from '@/hooks/useSyncSubscriptionTier';
import { QuotaErrorBanner } from '@/components/QuotaError';
import { is429 } from '@/utils/httpUtils';
import { formatAmount, formatPeriodEnd } from '@/utils/fileUtils';
import { TIER_LABELS, TIER_COLORS } from '@/config/constants';
import { TIERS } from '@/config/pricing';
import type { Tier } from '@/types/domain';

const STATUS_CONFIG: Record<string, { style: string; label: string; dot: string }> = {
  active: { style: 'text-green-400', label: 'Active', dot: 'bg-green-400' },
  past_due: { style: 'text-red-400', label: 'Past Due', dot: 'bg-red-400' },
  canceled: { style: 'text-zinc-500', label: 'Canceled', dot: 'bg-zinc-500' },
  trialing: { style: 'text-blue-400', label: 'Trial', dot: 'bg-blue-400' },
  incomplete: { style: 'text-amber-400', label: 'Incomplete', dot: 'bg-amber-400' },
  incomplete_expired: { style: 'text-red-400', label: 'Expired', dot: 'bg-red-400' },
  unpaid: { style: 'text-red-400', label: 'Unpaid', dot: 'bg-red-400' },
  paused: { style: 'text-zinc-400', label: 'Paused', dot: 'bg-zinc-400' },
};

const TIER_GRADIENTS: Record<Tier, string> = {
  free: 'from-zinc-500 to-zinc-400',
  pro: 'from-blue-500 to-blue-400',
  plus: 'from-purple-500 to-purple-400',
  power: 'from-amber-500 to-amber-400',
};


export function SubscriptionPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'checkout_done' | 'portal_done'>('idle');

  // After Stripe Checkout redirect: poll with exponential backoff until webhook processes
  useEffect(() => {
    if (!new URLSearchParams(location.search).get('session_id')) return;
    window.history.replaceState({}, '', location.pathname);
    setSyncState('syncing');

    let cancelled = false;
    const delays = [0, 2000, 4000, 8000];

    (async () => {
      for (const delay of delays) {
        if (cancelled) return;
        if (delay > 0) await new Promise<void>((r) => setTimeout(r, delay));
        if (cancelled) return;
        await refreshSession();
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
      if (!cancelled) {
        setSyncState('checkout_done');
        setTimeout(() => { if (!cancelled) setSyncState('idle'); }, 6000);
      }
    })();

    return () => { cancelled = true; };
  }, [location.search, location.pathname, queryClient]);

  // After Stripe Customer Portal return: poll with exponential backoff for tier changes.
  // NOTE: sessionStorage removal is deferred until polling completes so that
  // React StrictMode's double-mount cycle can restart the polling on remount.
  useEffect(() => {
    const portalTs = sessionStorage.getItem('portal_pending');
    if (!portalTs) return;

    // Ignore stale flags older than 5 minutes
    const ts = parseInt(portalTs, 10);
    if (isNaN(ts) || Date.now() - ts > 5 * 60 * 1000) {
      sessionStorage.removeItem('portal_pending');
      return;
    }

    setSyncState('syncing');
    let cancelled = false;
    const delays = [0, 2000, 4000, 8000];

    (async () => {
      for (const delay of delays) {
        if (cancelled) return;
        if (delay > 0) await new Promise<void>((r) => setTimeout(r, delay));
        if (cancelled) return;
        await refreshSession();
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
      if (!cancelled) {
        sessionStorage.removeItem('portal_pending');
        setSyncState('portal_done');
        setTimeout(() => { if (!cancelled) setSyncState('idle'); }, 6000);
      }
    })();

    return () => { cancelled = true; };
  }, [queryClient]);

  const {
    data,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  useSyncSubscriptionTier(data?.tier);

  const portalMut = useMutation({
    mutationFn: () => getCustomerPortalUrl(),
    // Gotcha #7: same tab redirect, NOT window.open()
    onSuccess: ({ portal_url }) => {
      sessionStorage.setItem('portal_pending', String(Date.now()));
      window.location.href = portal_url;
    },
  });

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center" role="status" aria-label="Loading subscription">
        <Loader2 className="h-8 w-8 motion-safe:animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
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
  const tierConfig = TIERS.find((t) => t.id === tier);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ── Header ── */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <p className="text-base font-medium text-zinc-500">Account</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            Subscription
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold ${TIER_COLORS[tier]}`}>
              <Sparkles className="h-4 w-4" />
              {TIER_LABELS[tier]} Plan
            </span>
            {sub && (
              <StatusPill sub={sub} />
            )}
          </div>
        </motion.div>

        {/* ── Sync Status Banner ── */}
        {syncState !== 'idle' && (
          <div
            role="status"
            className={`mt-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
              syncState === 'syncing'
                ? 'border-blue-800 bg-blue-900/30 text-blue-300'
                : 'border-green-800 bg-green-900/30 text-green-300'
            }`}
          >
            {syncState === 'syncing' ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 motion-safe:animate-spin" />
                Updating your subscription...
              </>
            ) : syncState === 'checkout_done' ? (
              <>
                <Check className="h-4 w-4 shrink-0" />
                Payment successful! Your plan has been updated.
              </>
            ) : (
              <>
                <Check className="h-4 w-4 shrink-0" />
                Your subscription has been updated.
              </>
            )}
          </div>
        )}

        {/* Accent divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* ── Plan details card ── */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.15 }}
        >
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

            <div className="p-6 sm:p-8">
              {sub ? (
                <PaidPlanDetails
                  tier={tier}
                  sub={sub}
                  portalMut={portalMut}
                  reducedMotion={reducedMotion}
                />
              ) : (
                <FreePlanDetails
                  tierConfig={tierConfig}
                  reducedMotion={reducedMotion}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Current plan features ── */}
        {sub && tierConfig && (
          <motion.div
            className="mt-6"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.3 }}
          >
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white">
                  Your{' '}
                  <span className={`bg-gradient-to-r bg-clip-text text-transparent ${TIER_GRADIENTS[tier]}`}>
                    {TIER_LABELS[tier]}
                  </span>
                  {' '}plan includes
                </h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {tierConfig.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-base text-zinc-300"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatusPill({ sub }: { sub: SubscriptionInfo }) {
  const cfg = STATUS_CONFIG[sub.subscription_status] ?? {
    style: 'text-zinc-400',
    label: sub.subscription_status,
    dot: 'bg-zinc-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-base font-medium ${cfg.style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PaidPlanDetails({
  tier,
  sub,
  portalMut,
  reducedMotion,
}: {
  tier: Tier;
  sub: SubscriptionInfo;
  portalMut: ReturnType<typeof useMutation<{ portal_url: string; return_url: string }, Error, void>>;
  reducedMotion: boolean;
}) {
  const periodDate = formatPeriodEnd(sub.current_period_end);

  const stats = [
    {
      icon: Activity,
      label: 'Status',
      value: (STATUS_CONFIG[sub.subscription_status] ?? { label: sub.subscription_status }).label,
      valueClass: (STATUS_CONFIG[sub.subscription_status] ?? { style: 'text-white' }).style,
    },
    {
      icon: Receipt,
      label: 'Price',
      value: `${formatAmount(sub.amount, sub.currency)}/${sub.interval}`,
      valueClass: 'text-white',
    },
    {
      icon: Repeat,
      label: 'Billing Cycle',
      value: sub.interval === 'year' ? 'Annual' : 'Monthly',
      valueClass: 'text-white',
    },
    {
      icon: Calendar,
      label: sub.cancel_at_period_end ? 'Access until' : 'Renews on',
      value: periodDate,
      valueClass: sub.cancel_at_period_end ? 'text-amber-400' : 'text-white',
    },
  ];

  return (
    <>
      <h2 className="text-xl font-semibold text-white">
        {TIER_LABELS[tier]} Plan Details
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-800/30 p-4"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : 0.25 + i * 0.06 }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/80">
              <stat.icon className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <p className={`mt-0.5 text-base font-semibold ${stat.valueClass}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => portalMut.mutate()}
          disabled={portalMut.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
        >
          {portalMut.isPending ? (
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Manage Billing
        </button>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-transparent px-5 py-2.5 text-base font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Compare Plans
        </Link>
      </div>

      {portalMut.isError && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {isAxiosError(portalMut.error) &&
          portalMut.error.response?.status === 404
            ? 'No subscription found. Subscribe to a plan to manage billing.'
            : 'Failed to open billing portal. Please try again.'}
        </p>
      )}
    </>
  );
}

function FreePlanDetails({
  tierConfig,
  reducedMotion,
}: {
  tierConfig: (typeof TIERS)[number] | undefined;
  reducedMotion: boolean;
}) {
  const proTier = TIERS.find((t) => t.recommended);

  return (
    <>
      {/* Current free features */}
      <h2 className="text-xl font-semibold text-white">Free Plan</h2>
      <p className="mt-1 text-base text-zinc-500">
        You&apos;re on the free tier. Upgrade anytime to unlock more uploads and features.
      </p>

      {tierConfig && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {tierConfig.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 text-base text-zinc-400"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              </span>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Upgrade nudge */}
      {proTier && (
        <motion.div
          className="mt-6 overflow-hidden rounded-xl border border-blue-500/30 bg-blue-950/20"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.2 }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    Upgrade to {proTier.name}
                  </h3>
                  {proTier.badge && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                      {proTier.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-400">
                  Starting at{' '}
                  <span className="font-semibold text-white">
                    ${proTier.monthlyPrice?.toFixed(2)}/mo
                  </span>
                </p>
              </div>
              <Link
                to="/pricing"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                View Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {proTier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-zinc-300"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </>
  );
}
