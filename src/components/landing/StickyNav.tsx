import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]';

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-lg'
          : 'bg-transparent',
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className={cn('text-lg font-bold text-white rounded', focusRing)}>
          MediaSearch
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="#pricing"
            className={cn('rounded px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white sm:px-3 sm:py-1.5 sm:text-sm', focusRing)}
          >
            Pricing
          </a>
          <Link
            to="/sign-in"
            className={cn('rounded px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white sm:px-3 sm:py-1.5 sm:text-sm', focusRing)}
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className={cn('rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 sm:px-4 sm:py-1.5 sm:text-sm', focusRing)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
