import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  Loader2,
  Upload,
  Search,
  CreditCard,
  ArrowRight,
  Sparkles,
  Image,
  Video,
  Music,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSearchStore } from '@/store/searchStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getSubscription } from '@/api/subscription';
import { listFiles } from '@/api/files';
import type { FileItem } from '@/api/files';
import { FileThumbnail } from '@/components/FileThumbnail';
import { MediaPreviewModal } from '@/components/MediaPreviewModal';
import { TIER_LABELS, TIER_COLORS } from '@/config/constants';
import { TIER_LIMITS, type ModalityPrefix } from '@/config/pricing';
import { cn } from '@/lib/utils';
import { formatAmount, formatPeriodEnd, formatDate, isPreviewable } from '@/utils/fileUtils';
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
    label: 'Upload files',
    description: 'Drag & drop images, video, audio, or documents',
    to: '/upload',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: CreditCard,
    label: 'Manage subscription',
    description: 'Your plan, billing, and usage details',
    to: '/subscription',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
];

const STAT_CARDS: {
  icon: LucideIcon;
  label: string;
  prefix: ModalityPrefix;
}[] = [
  { icon: Image, label: 'Images', prefix: 'image/' },
  { icon: Video, label: 'Videos', prefix: 'video/' },
  { icon: Music, label: 'Audio', prefix: 'audio/' },
  { icon: FileText, label: 'Documents', prefix: 'application/' },
];

export function DashboardPage() {
  const email = useAuthStore((s) => s.email);
  const tier = useAuthStore((s) => s.tier);
  const authReady = useAuthStore((s) => s.authReady);
  const authError = useAuthStore((s) => s.authError);
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const setStoreQuery = useSearchStore((s) => s.setQuery);
  const setPendingSearch = useSearchStore((s) => s.setPendingSearch);

  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: subData,
    error: subError,
    refetch: refetchSub,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  const {
    data: files,
    error: filesError,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ['files'],
    queryFn: () => listFiles(),
  });

  const currentTier = tier ?? 'free';
  const sub = subData?.subscription;

  const fileCounts = useMemo(() => {
    if (!files) return null;
    const counts: Record<string, number> = {};
    for (const card of STAT_CARDS) {
      counts[card.prefix] = files.filter((f) =>
        f.content_type.startsWith(card.prefix),
      ).length;
    }
    return counts;
  }, [files]);

  const recentFiles = useMemo(() => {
    if (!files || files.length === 0) return [];
    return [...files]
      .sort(
        (a, b) =>
          new Date(b.upload_date).getTime() -
          new Date(a.upload_date).getTime(),
      )
      .slice(0, 8);
  }, [files]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setStoreQuery(trimmed);
    setPendingSearch(true);
    void navigate('/search');
  };

  if (!authReady) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-6"
        role="status"
        aria-label="Loading account"
      >
        <Loader2 className="h-8 w-8 motion-safe:animate-spin text-blue-500" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div
          role="alert"
          className="w-full max-w-md rounded-xl border border-red-800 bg-red-900/30 p-8 text-center"
        >
          <p className="text-base text-red-400">
            Failed to load account information.
          </p>
          <p className="mt-1 text-sm text-red-500">{authError}</p>
        </div>
      </div>
    );
  }

  const queryError = subError || filesError;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Query error banner ── */}
      {queryError && (
        <div role="alert" className="mx-4 mt-4 rounded-lg border border-red-800 bg-red-900/30 p-4 sm:mx-6">
          <p className="text-sm text-red-400">
            {subError && filesError
              ? 'Failed to load subscription and files.'
              : subError
                ? 'Failed to load subscription details.'
                : 'Failed to load your files.'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (subError) void refetchSub();
              if (filesError) void refetchFiles();
            }}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ── Background gradient ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ── Welcome header ── */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <p className="text-base font-medium text-zinc-500">Welcome back</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            {email ?? 'Your Dashboard'}
          </h1>

          {/* Tier badge */}
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold ${TIER_COLORS[currentTier]}`}
            >
              <Sparkles className="h-4 w-4" />
              {TIER_LABELS[currentTier]} Plan
            </span>
            {sub && (
              <span className="text-base text-zinc-500">
                {formatAmount(sub.amount, sub.currency)}/{sub.interval}
                {' · '}
                {sub.cancel_at_period_end ? 'Cancels' : 'Renews'}{' '}
                {formatPeriodEnd(sub.current_period_end)}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Search bar ── */}
        <motion.div
          className="mt-8"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.4,
            delay: reducedMotion ? 0 : 0.1,
          }}
        >
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your files..."
              aria-label="Search your files"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-lg text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </form>
        </motion.div>

        {/* ── Accent divider ── */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* ── Library stats ── */}
        {fileCounts && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.3,
              delay: reducedMotion ? 0 : 0.15,
            }}
          >
            <h2 className="text-xl font-semibold text-white">Your library</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STAT_CARDS.map((card) => {
                const count = fileCounts[card.prefix];
                const tierLimits = TIER_LIMITS[currentTier];
                const limit = tierLimits.limits[card.prefix];
                const ratio = limit > 0 ? count / limit : 0;
                const isNearLimit = ratio >= 0.8;
                const isAtLimit = ratio >= 1;

                return (
                  <div
                    key={card.prefix}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <card.icon className="h-6 w-6 text-zinc-500" />
                      <span className="text-xs text-zinc-600">
                        {tierLimits.period === 'lifetime' ? 'lifetime' : '/ mo'}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">
                      {count}
                      <span className="text-lg font-normal text-zinc-500">
                        {' '}/ {limit.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-base text-zinc-400">{card.label}</p>
                    <div
                      className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemin={0}
                      aria-valuemax={limit}
                      aria-label={card.label}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          isAtLimit
                            ? 'bg-red-500'
                            : isNearLimit
                              ? 'bg-amber-500'
                              : 'bg-blue-500',
                        )}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Recent files ── */}
        <motion.div
          className="mt-10"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.4,
            delay: reducedMotion ? 0 : 0.25,
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent files</h2>
            {recentFiles.length > 0 && (
              <Link
                to="/files"
                className="inline-flex items-center gap-1 text-base font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {recentFiles.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recentFiles.map((file) => (
                <RecentFileCard key={file.file_id} file={file} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
              <p className="text-lg text-zinc-400">No files yet</p>
              <Link
                to="/upload"
                className="mt-2 inline-block text-base text-blue-400 hover:underline"
              >
                Upload something to get started
              </Link>
            </div>
          )}
        </motion.div>

        {/* ── Quick actions ── */}
        <motion.div
          className="mt-10 grid gap-4 sm:grid-cols-2"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.3,
            delay: reducedMotion ? 0 : 0.35,
          }}
        >
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group relative flex items-start gap-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* Hover gradient glow */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
              />

              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/80">
                <action.icon className="h-7 w-7 text-blue-400" />
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {action.label}
                  </h2>
                  <ArrowRight className="h-5 w-5 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-400" />
                </div>
                <p className="mt-1 text-base text-zinc-500">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Recent file card (thumbnail + name) ── */
function RecentFileCard({ file }: { file: FileItem }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const canPreview = isPreviewable(file);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700">
        {canPreview ? (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="block w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-inset"
            aria-label={`Preview ${file.file_name}`}
          >
            <FileThumbnail file={file} />
          </button>
        ) : (
          <Link to={`/files/${file.file_id}`} aria-label={`View ${file.file_name} details`}>
            <FileThumbnail file={file} />
          </Link>
        )}

        <Link
          to={`/files/${file.file_id}`}
          className="block p-3 transition-colors hover:bg-zinc-800/50"
        >
          <p className="truncate text-base font-medium text-white">
            {file.file_name}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            {formatDate(file.upload_date)}
          </p>
        </Link>
      </div>

      {canPreview && (
        <MediaPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          contentType={file.content_type}
          mediaUrl={file.presigned_url}
          fileName={file.file_name}
        />
      )}
    </>
  );
}

