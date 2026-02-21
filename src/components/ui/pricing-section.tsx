import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import type { PricingTier } from '@/config/pricing';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PricingSectionProps {
  tiers: readonly PricingTier[];
  className?: string;
}

export function PricingSection({ tiers, className }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <div className={cn('mx-auto max-w-6xl', className)}>
      <div className="mb-12 space-y-3 text-center">
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
          Choose Your Plan
        </h2>
        <p className="text-base text-zinc-400 md:text-lg">
          Start free, upgrade when you need more.
        </p>
      </div>

      {/* Monthly / Annual toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span
          className={cn(
            'text-sm font-medium',
            !annual ? 'text-white' : 'text-zinc-500',
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
          onClick={() => setAnnual(!annual)}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            annual ? 'bg-blue-600' : 'bg-zinc-700',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform',
              annual ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </button>
        <span
          className={cn(
            'text-sm font-medium',
            annual ? 'text-white' : 'text-zinc-500',
          )}
        >
          Annual
        </span>
        {annual && (
          <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-400">
            Save up to 23%
          </span>
        )}
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier, index) => (
          <TierCard key={tier.id} tier={tier} annual={annual} index={index} />
        ))}
      </div>
    </div>
  );
}

function TierCard({
  tier,
  annual,
  index,
}: {
  tier: PricingTier;
  annual: boolean;
  index: number;
}) {
  const isFree = tier.monthlyPrice === null;
  const price = annual ? tier.annualMonthly : tier.monthlyPrice;
  const isRecommended = tier.recommended;
  const reducedMotion = useReducedMotion();

  const ctaHref = isFree
    ? '/sign-up'
    : `/sign-up?plan=${tier.id}`;

  // Left two (0,1) slide from left, right two (2,3) slide from right
  const fromLeft = index < 2;
  const slideX = fromLeft ? -140 : 140;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, x: slideX }}
      whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
      whileHover={reducedMotion ? undefined : { y: -8, scale: 1.02 }}
      viewport={reducedMotion ? undefined : { once: false, amount: 0.2 }}
      transition={reducedMotion ? undefined : {
        opacity: { duration: 0.7, ease: 'easeOut' },
        x: { duration: 0.7, delay: (fromLeft ? index : index - 2) * 0.12, ease: 'easeOut' },
        y: { type: 'spring', stiffness: 300, damping: 20 },
        scale: { type: 'spring', stiffness: 300, damping: 20 },
      }}
    >
      <div
        className={cn(
          'relative h-full w-full overflow-hidden rounded-xl border',
          'bg-gradient-to-br from-zinc-950/50 to-zinc-900/80',
          isRecommended
            ? 'border-blue-500/50 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]'
            : 'border-zinc-800',
        )}
      >
        <GlowingEffect
          spread={120}
          glow={isRecommended}
        />
        {/* Content wrapper — z-[2] lifts above GlowingEffect mask */}
        <div className="relative z-[2] p-6">
          {/* Badge */}
          {tier.badge && (
            <div className="absolute -top-px right-4">
              <span
                className={cn(
                  'inline-block rounded-b-lg px-3 py-1 text-xs font-semibold',
                  isRecommended
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-700 text-zinc-300',
                )}
              >
                {tier.badge}
              </span>
            </div>
          )}

          {/* Tier name */}
          <div className="flex flex-col items-center border-b border-zinc-800 pb-6">
            <span className="mb-6 inline-block text-lg font-medium text-zinc-100">
              {tier.name}
            </span>

            {/* Price with NumberFlow animation */}
            {isFree ? (
              <span className="mb-3 inline-block text-4xl font-bold text-white">
                Free
              </span>
            ) : (
              <>
                <span className="mb-3 inline-flex items-baseline text-4xl font-bold text-white">
                  $
                  <NumberFlow
                    value={price ?? 0}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                    transformTiming={{ duration: 500, easing: 'ease-out' }}
                    spinTiming={{ duration: 500, easing: 'ease-out' }}
                  />
                  <span className="ml-1 text-base font-normal text-zinc-500">
                    /mo
                  </span>
                </span>
                {annual && tier.annualPrice && (
                  <span className="text-xs text-zinc-500">
                    ${tier.annualPrice.toFixed(2)} billed annually
                  </span>
                )}
              </>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3 py-6">
            {tier.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="grid h-4 w-4 shrink-0 place-content-center rounded-full bg-blue-600/20 text-sm text-blue-400">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to={ctaHref}
            className={cn(
              'block w-full rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors',
              isRecommended
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
            )}
          >
            {isFree ? 'Sign Up Free' : tier.cta}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
