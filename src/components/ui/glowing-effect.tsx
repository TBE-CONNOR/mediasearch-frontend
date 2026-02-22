import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface GlowingEffectProps {
  spread?: number;
  blur?: number;
  glow?: boolean;
  className?: string;
}

export function GlowingEffect({
  spread = 120,
  blur = 12,
  glow = false,
  className,
}: GlowingEffectProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!glowRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowRef.current.style.top = `${y}px`;
      glowRef.current.style.left = `${x}px`;
    },
    [],
  );

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="pointer-events-auto absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <div
        ref={glowRef}
        className={cn(
          'pointer-events-none absolute rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 transition-opacity duration-300',
          visible || glow ? 'opacity-100' : 'opacity-0',
          className,
        )}
        style={{
          width: spread * 2,
          height: spread * 2,
          top: '50%',
          left: '50%',
          filter: `blur(${blur}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Mask inner area to show glow only on borders */}
      <div
        className="absolute inset-px z-[1] rounded-[inherit] bg-gradient-to-br from-zinc-950/95 to-zinc-900/95"
      />
    </div>
  );
}
