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
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
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
        className={cn(
          'pointer-events-none absolute rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 transition-opacity duration-300',
          visible || glow ? 'opacity-100' : 'opacity-0',
          className,
        )}
        style={{
          width: spread * 2,
          height: spread * 2,
          top: visible ? position.y - spread : '50%',
          left: visible ? position.x - spread : '50%',
          filter: `blur(${blur}px)`,
          transform: visible ? undefined : 'translate(-50%, -50%)',
        }}
      />
      {/* Mask inner area to show glow only on borders */}
      <div
        className="absolute inset-px z-[1] rounded-[inherit] bg-gradient-to-br from-zinc-950/95 to-zinc-900/95"
      />
    </div>
  );
}
