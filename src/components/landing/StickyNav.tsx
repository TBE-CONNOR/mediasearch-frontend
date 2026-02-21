import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

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
        <Link to="/" className="text-lg font-bold text-white">
          MediaSearch
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="#pricing"
            className="px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Pricing
          </a>
          <Link
            to="/sign-in"
            className="px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
