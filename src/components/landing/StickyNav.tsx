import { Link } from 'react-router';
import { cn, focusRing } from '@/lib/utils';
import { useScrolled } from '@/hooks/useScrolled';

export function StickyNav() {
  const scrolled = useScrolled();

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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-0.5 rounded-full border border-zinc-800/60 bg-zinc-900/50 px-1.5 py-1 sm:gap-1 sm:px-2 sm:py-1.5">
            <a
              href="#pricing"
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-white sm:px-4 sm:py-1.5',
                focusRing,
              )}
            >
              Pricing
            </a>
            <Link
              to="/sign-in"
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-white sm:px-4 sm:py-1.5',
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
              'rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 sm:px-6 sm:py-2.5 sm:text-base',
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
