import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  Loader2,
  Upload,
  Search,
  FolderOpen,
  CreditCard,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getSubscription } from '@/api/subscription';
import { TIER_LABELS, TIER_COLORS } from '@/config/constants';
import { TIERS } from '@/config/pricing';
import { formatAmount, formatPeriodEnd } from '@/utils/fileUtils';
import type { Tier } from '@/types/domain';
import type { LucideIcon } from 'lucide-react';

const QUICK_ACTIONS: {
  icon: LucideIcon;
  label: string;
  description: string;
  to: string;
  gradient: string;
}[] = [
  {
    icon: Upload,
    label: 'Upload',
    description: 'Drag & drop images, video, audio, or documents',
    to: '/upload',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Search,
    label: 'Search',
    description: 'Ask anything about your uploaded content',
    to: '/search',
    gradient: 'from-purple-500/20 to-blue-500/20',
  },
  {
    icon: FolderOpen,
    label: 'Files',
    description: 'Browse, download, and manage your library',
    to: '/files',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: CreditCard,
    label: 'Subscription',
    description: 'Manage your plan, billing, and usage',
    to: '/subscription',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
];

/* ── Tier gradient map for the plan badge ── */
const TIER_GRADIENTS: Record<Tier, string> = {
  free: 'from-zinc-500 to-zinc-400',
  pro: 'from-blue-500 to-blue-400',
  plus: 'from-purple-500 to-purple-400',
  power: 'from-amber-500 to-amber-400',
};

export function DashboardPage() {
  const email = useAuthStore((s) => s.email);
  const tier = useAuthStore((s) => s.tier);
  const authReady = useAuthStore((s) => s.authReady);
  const authError = useAuthStore((s) => s.authError);
  const reducedMotion = useReducedMotion();

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  const currentTier = tier ?? 'free';
  const tierConfig = TIERS.find((t) => t.id === currentTier);
  const sub = subData?.subscription;

  if (!authReady) {
    return (
      <div className="flex flex-1 items-center justify-center p-6" role="status" aria-label="Loading account">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div role="alert" className="w-full max-w-md rounded-xl border border-red-800 bg-red-900/30 p-8 text-center">
          <p className="text-sm text-red-400">Failed to load account information.</p>
          <p className="mt-1 text-xs text-red-500">{authError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Background gradient ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ── Welcome header ── */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <p className="text-sm font-medium text-zinc-500">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            {email ?? 'Your Dashboard'}
          </h1>

          {/* Tier badge */}
          <div className="mt-3 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${TIER_COLORS[currentTier]}`}>
              <Sparkles className="h-3.5 w-3.5" />
              {TIER_LABELS[currentTier]} Plan
            </span>
            {sub && (
              <span className="text-sm text-zinc-500">
                {formatAmount(sub.amount, sub.currency)}/{sub.interval}
                {' · '}
                {sub.cancel_at_period_end ? 'Cancels' : 'Renews'} {formatPeriodEnd(sub.current_period_end)}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Accent divider ── */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* ── Quick action cards ── */}
        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : 0.15 }}
        >
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.to}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.4,
                delay: reducedMotion ? 0 : 0.2 + i * 0.08,
                ease: 'easeOut',
              }}
            >
              <Link
                to={action.to}
                className="group relative flex items-start gap-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
              >
                {/* Hover gradient glow */}
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />

                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/80">
                  <action.icon className="h-5 w-5 text-blue-400" />
                </div>

                <div className="relative min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">
                      {action.label}
                    </h2>
                    <ArrowRight className="h-4 w-4 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-400" />
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Plan capabilities ── */}
        {tierConfig && (
          <motion.div
            className="mt-8"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.5 }}
          >
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
              {/* Gradient accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Your{' '}
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${TIER_GRADIENTS[currentTier]}`}>
                      {TIER_LABELS[currentTier]}
                    </span>
                    {' '}plan includes
                  </h2>
                  <Link
                    to="/pricing"
                    className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
                  >
                    {currentTier === 'free' ? 'Upgrade' : 'Compare plans'}
                  </Link>
                </div>

                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {tierConfig.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm text-zinc-300"
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
