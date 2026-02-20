import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/auth/useAuth';

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

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="text-lg font-bold text-gray-900">
            MediaSearch
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive(to, location.pathname)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-blue-700">
              {tier ?? 'free'}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="hidden items-center gap-1 rounded px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-50 sm:hidden"
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
        <div className="border-t border-gray-200 sm:hidden">
          <div className="space-y-1 px-4 py-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(to, location.pathname)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
