import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ATCShader } from '@/components/ui/atc-shader';

/** Desktop left-panel for auth pages (shader + brand text). */
export function AuthDesktopPanel({ subtitle }: { subtitle: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative flex w-1/2 items-center justify-center overflow-hidden">
      <ATCShader />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-background/80" />

      <motion.div
        className="relative z-10 px-12 text-center"
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.7 }}
      >
        <Link
          to="/"
          className="inline-flex text-5xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          <span className="text-white">Media</span>
          <span className="text-blue-400">Search</span>
        </Link>
        <p className="mt-4 text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          Upload anything, find everything.
        </p>
        <p className="mt-3 max-w-xs mx-auto text-sm text-zinc-400">
          {subtitle}
        </p>
      </motion.div>
    </div>
  );
}

/** Mobile logo header for auth pages. */
export function AuthMobileHeader() {
  return (
    <div className="mb-8 text-center">
      <Link
        to="/"
        className="inline-flex text-3xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
      >
        <span className="text-white">Media</span>
        <span className="text-blue-400">Search</span>
      </Link>
    </div>
  );
}
