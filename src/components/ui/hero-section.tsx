import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';
import { ATCShader } from '@/components/ui/atc-shader';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HeroSectionProps {
  title?: string;
  subtitle?: {
    regular: string;
    gradient: string;
  };
  description?: string;
  badge?: React.ReactNode;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
}

/* ── Click ripple ── */
function useClickRipple(containerRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const timeoutsRef = useRef<number[]>([]);
  const idCounter = useRef(0);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = idCounter.current++;
      setRipples((prev) => [...prev, { id, x, y }]);
      const tid = window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
        timeoutsRef.current = timeoutsRef.current.filter((t) => t !== tid);
      }, 1000);
      timeoutsRef.current.push(tid);
    },
    [containerRef],
  );

  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('click', handleClick);
    return () => {
      el.removeEventListener('click', handleClick);
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [containerRef, handleClick, enabled]);

  return ripples;
}

/* ── Main hero ── */
export function HeroSection({
  title = 'Search your media with AI',
  subtitle = {
    regular: 'Upload videos, images, audio, and documents. ',
    gradient: 'Upload anything, find everything.',
  },
  description = 'Ask anything. Get answers from your own content.',
  badge,
  primaryCta,
  secondaryCta,
  className,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const ripples = useClickRipple(containerRef, !reducedMotion);

  /* Mouse-follow radial gradient */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY],
  );

  /* Word-by-word title split */
  const titleWords = title.split(' ');

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn('relative overflow-hidden bg-background', className)}
    >
      {/* WebGL shader background */}
      <ATCShader />

      {/* Mouse-follow gradient */}
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={
            {
              '--mx': springX,
              '--my': springY,
              background: `radial-gradient(600px circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), rgba(59,130,246,0.08), transparent 70%)`,
            } as React.CSSProperties
          }
        />
      )}

      {/* Click ripples */}
      {!reducedMotion &&
        ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute z-[2] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20"
            style={{
              left: r.x,
              top: r.y,
              animation: 'pulse-glow 1s ease-out forwards',
            }}
          />
        ))}

      {/* Content */}
      <section className="relative z-10 mx-auto max-w-screen-xl px-4 pt-28 pb-16 md:pt-28 md:pb-20 md:px-8">
        <div className="mx-auto max-w-5xl space-y-5 text-center leading-0 lg:leading-5">
          {/* Badge */}
          {badge && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.6 }}
            >
              {badge}
            </motion.div>
          )}

          {/* Title — word-by-word blur-in */}
          <h1 className="mx-auto text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,255,255,0.00)_202.08%)] md:text-4xl lg:text-6xl">
            {reducedMotion
              ? title
              : titleWords.map((word, i) => (
                  <motion.span
                    key={`${word}-${i}`}
                    className="inline-block"
                    initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1 * i,
                      ease: 'easeOut',
                    }}
                  >
                    {word}
                    {i < titleWords.length - 1 ? '\u00A0' : ''}
                  </motion.span>
                ))}
          </h1>

          {/* Subtitle with gradient span */}
          <motion.h2
            className="mx-auto text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,255,255,0.00)_202.08%)] md:text-3xl lg:text-5xl"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.3 }}
          >
            {subtitle.regular}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              {subtitle.gradient}
            </span>
          </motion.h2>

          {/* Description */}
          {description && (
            <motion.p
              className="mx-auto max-w-2xl text-zinc-400"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.5 }}
            >
              {description}
            </motion.p>
          )}

          {/* CTAs */}
          <motion.div
            className="flex items-center justify-center gap-x-3 space-y-3 pt-4 sm:flex sm:space-y-0"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.7 }}
          >
            {primaryCta &&
              (primaryCta.href.startsWith('#') ? (
                <a
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {primaryCta.label}
                </a>
              ) : (
                <Link
                  to={primaryCta.href}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {primaryCta.label}
                </Link>
              ))}
            {secondaryCta &&
              (secondaryCta.href.startsWith('#') ? (
                <a
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {secondaryCta.label}
                </a>
              ) : (
                <Link
                  to={secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {secondaryCta.label}
                </Link>
              ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
