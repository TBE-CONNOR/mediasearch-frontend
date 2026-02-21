import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]';

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      toggleRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      firstLinkRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  const close = () => setOpen(false);

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

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-2">
          <a
            href="#pricing"
            className={cn('rounded px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white', focusRing)}
          >
            Pricing
          </a>
          <Link
            to="/sign-in"
            className={cn('rounded px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white', focusRing)}
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className={cn('rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700', focusRing)}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className={cn('sm:hidden rounded p-2 text-zinc-400 transition-colors hover:text-white', focusRing)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-zinc-800 bg-[#09090b]/95 backdrop-blur-lg px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            <a
              ref={firstLinkRef}
              href="#pricing"
              onClick={close}
              className={cn('rounded px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white hover:bg-zinc-800', focusRing)}
            >
              Pricing
            </a>
            <Link
              to="/sign-in"
              onClick={close}
              className={cn('rounded px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white hover:bg-zinc-800', focusRing)}
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              onClick={close}
              className={cn('rounded-md bg-blue-600 px-3 py-2.5 text-sm font-medium text-white text-center transition-colors hover:bg-blue-700', focusRing)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
