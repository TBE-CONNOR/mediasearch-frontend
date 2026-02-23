import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut, Menu, X } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrolled } from '@/hooks/useScrolled';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/auth/useAuth';
import { TIER_LABELS, TIER_COLORS } from '@/config/constants';

const PRIMARY_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/search', label: 'Search' },
  { to: '/upload', label: 'Upload' },
] as const;

const SECONDARY_LINKS = [
  { to: '/files', label: 'Files' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/subscription', label: 'Subscription' },
] as const;

function isActive(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(to + '/');
}

export function NavBar() {
  const { signOut } = useAuth();
  const tier = useAuthStore((s) => s.tier);
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  // Focus trap + Escape handler for mobile menu
  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const getFocusable = () =>
      menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');

    const initial = getFocusable();
    if (initial.length > 0) initial[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = getFocusable();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled
          ? 'border-b border-zinc-800/80 bg-background/80 backdrop-blur-lg'
          : 'bg-background/40 backdrop-blur-sm',
      )}
      aria-label="Main navigation"
    >
      {/* Accent gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.5rem]">
        {/* Brand — split color wordmark */}
        <Link to="/" className={cn('flex items-center gap-2 rounded text-xl font-bold sm:text-2xl', focusRing)}>
          <span className="text-white">Media</span>
          <span className="-ml-2 text-blue-400">Search</span>
        </Link>

        {/* Nav group — pill container */}
        <div className="flex items-center gap-1 rounded-full border border-zinc-800/60 bg-zinc-900/50 px-1.5 py-1 sm:gap-1.5 sm:px-2 sm:py-1.5">
          {/* Primary links — always visible */}
          {PRIMARY_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to, location.pathname) ? 'page' : undefined}
              className={cn(
                'rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-base',
                isActive(to, location.pathname)
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white',
                focusRing,
              )}
            >
              {label}
            </Link>
          ))}

          {/* Secondary links — desktop only, inside same pill */}
          {SECONDARY_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to, location.pathname) ? 'page' : undefined}
              className={cn(
                'hidden rounded-full px-4 py-1.5 text-base font-medium transition-colors sm:inline-flex',
                isActive(to, location.pathname)
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white',
                focusRing,
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tier badge */}
          <span className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase sm:px-3 sm:text-sm',
            TIER_COLORS[tier ?? 'free'],
          )}>
            {TIER_LABELS[tier ?? 'free']}
          </span>

          {/* Sign Out — desktop only */}
          <button
            type="button"
            onClick={signOut}
            className={cn(
              'hidden items-center gap-1 rounded-full px-2.5 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-800/80 hover:text-zinc-300 sm:inline-flex',
              focusRing,
            )}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>

          {/* Mobile hamburger */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            className={cn(
              'rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-white sm:hidden',
              focusRing,
            )}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile overflow menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="More navigation options"
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className={cn(
              'overflow-hidden border-t border-zinc-800/60 sm:hidden',
              scrolled
                ? 'bg-background/80 backdrop-blur-lg'
                : 'bg-background/90 backdrop-blur-md',
            )}
          >
            <div className="space-y-1 px-4 py-2">
              {SECONDARY_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMobileMenu}
                  aria-current={isActive(to, location.pathname) ? 'page' : undefined}
                  className={cn(
                    'block rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    isActive(to, location.pathname)
                      ? 'bg-blue-600/10 text-blue-400'
                      : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white',
                    focusRing,
                  )}
                >
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={signOut}
                className={cn(
                  'flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/30',
                  focusRing,
                )}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
