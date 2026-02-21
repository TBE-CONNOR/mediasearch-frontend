import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]';

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 20;
      setScrolled((prev) => (prev === shouldBeScrolled ? prev : shouldBeScrolled));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled
          ? 'border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-lg'
          : 'bg-[#09090b]/40 backdrop-blur-sm',
      )}
      aria-label="Main navigation"
    >
      {/* Accent gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16">
        {/* Brand — split color wordmark */}
        <Link to="/" className={cn('flex items-center gap-2 rounded text-lg font-bold', focusRing)}>
          <span className="text-white">Media</span>
          <span className="-ml-2 text-blue-400">Search</span>
        </Link>

        {/* Nav group — pill container */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-0.5 rounded-full border border-zinc-800/60 bg-zinc-900/50 px-1 py-0.5 sm:gap-1 sm:px-1.5 sm:py-1">
            <a
              href="#pricing"
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-white sm:px-3 sm:py-1 sm:text-sm',
                focusRing,
              )}
            >
              Pricing
            </a>
            <Link
              to="/sign-in"
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-white sm:px-3 sm:py-1 sm:text-sm',
                focusRing,
              )}
            >
              Sign In
            </Link>
          </div>

          {/* CTA with glow */}
          <Link
            to="/sign-up"
            className={cn(
              'rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-blue-500 sm:px-5 sm:py-2 sm:text-sm',
              'shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.45)]',
              focusRing,
            )}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
