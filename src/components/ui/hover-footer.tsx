import { useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export function TextHoverEffect({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) {
  const scopeId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  const svgRect = svgRef.current?.getBoundingClientRect();
  const maskPosition =
    cursor.x !== 0 && cursor.y !== 0 && svgRect
      ? {
          cx: `${((cursor.x - svgRect.left) / svgRect.width) * 100}%`,
          cy: `${((cursor.y - svgRect.top) / svgRect.height) * 100}%`,
        }
      : { cx: '50%', cy: '50%' };

  // Reduced motion: render static outline text only
  if (prefersReduced) {
    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 100"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('select-none uppercase', className)}
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth="0.3"
          className="fill-transparent stroke-[#3b82f6] font-[helvetica] text-7xl font-bold"
          strokeDashoffset="0"
          strokeDasharray="1000"
        >
          {text}
        </text>
      </svg>
    );
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn('cursor-pointer select-none uppercase', className)}
    >
      <defs>
        <linearGradient
          id={`textGradient-${scopeId}`}
          gradientUnits="userSpaceOnUse"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#80eeb4" />
              <stop offset="75%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id={`revealMask-${scopeId}`}
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: '50%', cy: '50%' }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: 'easeOut' }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={`textMask-${scopeId}`}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#revealMask-${scopeId})`} />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-800 font-[helvetica] text-7xl font-bold"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-[#3b82f6] font-[helvetica] text-7xl font-bold"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke={`url(#textGradient-${scopeId})`}
        strokeWidth="0.3"
        mask={`url(#textMask-${scopeId})`}
        className="fill-transparent font-[helvetica] text-7xl font-bold"
      >
        {text}
      </text>
    </svg>
  );
}

export function FooterBackgroundGradient() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          'radial-gradient(125% 125% at 50% 10%, #09090b66 50%, #3b82f633 100%)',
      }}
    />
  );
}
