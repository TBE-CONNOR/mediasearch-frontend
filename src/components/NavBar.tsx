import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/auth/useAuth';
import { TIER_LABELS, TIER_COLORS } from '@/config/constants';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/files', label: 'Files' },
  { to: '/search', label: 'Search' },
  { to: '/upload', label: 'Upload' },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Focus trap + Escape handler for mobile menu
  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableEls = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    if (focusableEls.length > 0) focusableEls[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        return;
      }
      if (e.key !== 'Tab' || focusableEls.length === 0) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
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
    <nav aria-label="Main navigation" className="border-b border-zinc-800 bg-[#09090b]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="text-lg font-bold text-white">
            MediaSearch
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to, location.pathname) ? 'page' : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(to, location.pathname)
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${TIER_COLORS[tier ?? 'free']}`}>
              {TIER_LABELS[tier ?? 'free']}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="hidden items-center gap-1 rounded px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            {/* Mobile menu button */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white sm:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div ref={menuRef} role="dialog" aria-label="Mobile navigation menu" className="border-t border-zinc-800 bg-[#09090b] sm:hidden">
          <div className="space-y-1 px-4 py-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobileMenu}
                aria-current={isActive(to, location.pathname) ? 'page' : undefined}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(to, location.pathname)
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
