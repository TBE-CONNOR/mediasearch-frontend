import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { motion } from 'motion/react';
import { Check, Loader2, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { createCheckoutSession } from '@/api/checkout';
import { TIERS } from '@/config/pricing';
import type { PricingTier } from '@/config/pricing';
import type { Tier } from '@/types/domain';

export function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const tier = useAuthStore((s) => s.tier);
  const reducedMotion = useReducedMotion();

  const maxSavingsPercent = useMemo(() => {
    let max = 0;
    for (const t of TIERS) {
      if (t.monthlyPrice && t.annualMonthly) {
        const pct = Math.round((1 - t.annualMonthly / t.monthlyPrice) * 100);
        if (pct > max) max = pct;
      }
    }
    return max;
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-8 text-center"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
          <p className="mt-2 text-zinc-400">
            Start free, upgrade when you need more.
          </p>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.1 }}
        >
          <BillingToggle
            annual={annual}
            onToggle={setAnnual}
            savingsPercent={maxSavingsPercent}
          />
        </motion.div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t, index) => (
            <TierCard
              key={t.id}
              tier={t}
              index={index}
              annual={annual}
              currentTier={tier}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        <motion.div
          className="mt-8 flex flex-col items-center gap-2"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.5 }}
        >
          <div className="flex items-center gap-3">
            <CardBrandLogo brand="visa" />
            <CardBrandLogo brand="mastercard" />
            <CardBrandLogo brand="amex" />
            <CardBrandLogo brand="discover" />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Lock className="h-3 w-3" />
            Payments processed securely by Stripe. Charges appear as
            &quot;MEDIASEARCH&quot; on your statement. We never store your card
            data.
          </p>
          <p className="text-xs text-zinc-500">
            Prices shown in USD. Applicable taxes may be added at checkout.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function BillingToggle({
  annual,
  onToggle,
  savingsPercent,
}: {
  annual: boolean;
  onToggle: (v: boolean) => void;
  savingsPercent: number;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className={`text-sm font-medium ${!annual ? 'text-white' : 'text-zinc-500'}`}
      >
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label="Toggle annual billing"
        onClick={() => onToggle(!annual)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none ${
          annual ? 'bg-blue-600' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
            annual ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${annual ? 'text-white' : 'text-zinc-500'}`}
      >
        Annual
      </span>
      {annual && savingsPercent > 0 && (
        <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-400">
          Save up to {savingsPercent}%
        </span>
      )}
    </div>
  );
}

function TierCard({
  tier: t,
  index,
  annual,
  currentTier,
  reducedMotion,
}: {
  tier: PricingTier;
  index: number;
  annual: boolean;
  currentTier: string | null;
  reducedMotion: boolean;
}) {
  const isCurrentPlan = currentTier === t.id;
  const isFree = t.monthlyPrice === null;

  // Free + Pro (indices 0,1) slide from left; Plus + Power (2,3) slide from right
  const fromLeft = index < 2;
  const slideX = fromLeft ? -60 : 60;
  const sideIndex = fromLeft ? index : index - 2;

  const cardClasses = t.recommended
    ? 'relative rounded-xl border-2 border-blue-500 bg-zinc-900/50 p-6 ring-1 ring-blue-500/20 lg:scale-105'
    : t.decoy
      ? 'relative rounded-xl border border-zinc-700 bg-zinc-800/50 p-6'
      : t.id === 'power'
        ? 'relative rounded-xl border border-amber-800 bg-zinc-900/50 p-6'
        : 'relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6';

  const buttonClasses = isCurrentPlan
    ? 'w-full rounded-lg px-4 py-2 text-sm font-medium bg-zinc-800 text-zinc-500 cursor-default'
    : t.recommended
      ? 'w-full rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors'
      : t.decoy
        ? 'w-full rounded-lg px-4 py-2 text-sm font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors'
        : t.id === 'power'
          ? 'w-full rounded-lg px-4 py-2 text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors'
          : 'w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors';

  const priceColor = t.decoy ? 'text-zinc-400' : 'text-white';

  const price = annual ? t.annualMonthly : t.monthlyPrice;
  const billingNote = annual
    ? `$${t.annualPrice?.toFixed(2)} billed annually · Auto-renews until canceled`
    : 'Billed monthly · Auto-renews until canceled';

  return (
    <motion.div
      className={cardClasses}
      initial={reducedMotion ? false : { opacity: 0, x: slideX }}
      whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        opacity: { duration: 0.7, ease: 'easeOut' },
        x: { duration: 0.7, delay: sideIndex * 0.12, ease: 'easeOut' },
        y: { type: 'spring', stiffness: 300, damping: 20 },
      }}
    >
      {t.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              t.recommended
                ? 'bg-blue-600 text-white'
                : 'bg-amber-900/30 text-amber-400'
            }`}
          >
            {t.badge}
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-white">{t.name}</h3>

      <div className="mt-4">
        {isFree ? (
          <p className="text-3xl font-bold text-white">Free</p>
        ) : (
          <>
            <p className={`text-3xl font-bold ${priceColor}`}>
              ${price?.toFixed(2)}
              <span className="text-base font-normal text-zinc-500">
                /mo
              </span>
              <span className="ml-1 text-xs font-normal text-zinc-500">
                USD
              </span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">{billingNote}</p>
          </>
        )}
      </div>

      <ul className="mt-6 space-y-2">
        {t.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-zinc-300"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <SubscribeButton
          tier={t}
          annual={annual}
          isCurrentPlan={isCurrentPlan}
          className={buttonClasses}
        />
      </div>
    </motion.div>
  );
}

function CardBrandLogo({ brand }: { brand: 'visa' | 'mastercard' | 'amex' | 'discover' }) {
  const shared = 'h-6 w-10 rounded border border-zinc-700 bg-zinc-900 p-0.5';

  switch (brand) {
    case 'visa':
      return (
        <svg className={shared} viewBox="0 0 48 32" fill="none" aria-label="Visa">
          <path d="M19.5 21.5h-3.2l2-12.3h3.2l-2 12.3zm13.3-12c-.6-.3-1.6-.5-2.9-.5-3.2 0-5.4 1.7-5.4 4.1 0 1.8 1.6 2.8 2.8 3.4 1.2.6 1.7 1 1.7 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-2-.2-3-.7l-.4-.2-.5 2.8c.8.4 2.2.7 3.6.7 3.4 0 5.5-1.7 5.6-4.2 0-1.4-.8-2.5-2.7-3.4-1.1-.6-1.8-1-1.8-1.5 0-.5.6-1.1 1.8-1.1 1 0 1.8.2 2.4.5l.3.1.4-2.7zm8.3-.3h-2.5c-.8 0-1.3.2-1.7 1l-4.7 11.3h3.3l.7-1.9h4.1l.4 1.9h3l-2.6-12.3zm-4 7.9l1.7-4.6.9 4.6h-2.6zM16.8 9.2l-3 8.4-.3-1.6c-.6-1.9-2.3-4-4.2-5l2.8 10.5h3.4l5.1-12.3h-3.8z" fill="#1A1F71"/>
          <path d="M11 9.2H5.9l-.1.3c4 1 6.7 3.5 7.8 6.5l-1.1-5.7c-.2-.8-.8-1-1.5-1.1z" fill="#F9A533"/>
        </svg>
      );
    case 'mastercard':
      return (
        <svg className={shared} viewBox="0 0 48 32" fill="none" aria-label="Mastercard">
          <circle cx="18" cy="16" r="9" fill="#EB001B"/>
          <circle cx="30" cy="16" r="9" fill="#F79E1B"/>
          <path d="M24 9.5a9 9 0 0 1 3.4 6.5A9 9 0 0 1 24 22.5a9 9 0 0 1-3.4-6.5A9 9 0 0 1 24 9.5z" fill="#FF5F00"/>
        </svg>
      );
    case 'amex':
      return (
        <svg className={shared} viewBox="0 0 48 32" fill="none" aria-label="American Express">
          <rect x="1" y="1" width="46" height="30" rx="3" fill="#016FD0"/>
          <text x="24" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
        </svg>
      );
    case 'discover':
      return (
        <svg className={shared} viewBox="0 0 48 32" fill="none" aria-label="Discover">
          <rect x="1" y="1" width="46" height="30" rx="3" fill="#18181b" stroke="#3f3f46"/>
          <circle cx="28" cy="16" r="7" fill="#F76F20"/>
          <text x="16" y="18" textAnchor="middle" fill="#a1a1aa" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">D</text>
        </svg>
      );
  }
}

function SubscribeButton({
  tier: t,
  annual,
  isCurrentPlan,
  className,
}: {
  tier: PricingTier;
  annual: boolean;
  isCurrentPlan: boolean;
  className: string;
}) {
  const cognitoSub = useAuthStore((s) => s.sub);
  const isFree = t.monthlyPrice === null;
  const priceId = annual ? t.annualPriceId : t.monthlyPriceId;
  const label = isCurrentPlan ? 'Current Plan' : t.cta;

  const [configError, setConfigError] = useState('');

  const checkoutMut = useMutation({
    mutationFn: () =>
      createCheckoutSession({
        price_id: priceId!,
        tier: t.id as Exclude<Tier, 'free'>,
        success_url: `${window.location.origin}/subscription?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/pricing`,
      }),
    onSuccess: ({ checkout_url }) => {
      window.location.href = checkout_url;
    },
  });

  if (isFree || isCurrentPlan) {
    return (
      <button type="button" disabled className={className}>
        {label}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!cognitoSub) {
            setConfigError('Please sign in to subscribe.');
            return;
          }
          if (!priceId) {
            setConfigError('This plan is temporarily unavailable.');
            return;
          }
          setConfigError('');
          checkoutMut.mutate();
        }}
        disabled={checkoutMut.isPending}
        className={className}
      >
        {checkoutMut.isPending ? (
          <Loader2 className="mx-auto h-4 w-4 motion-safe:animate-spin" />
        ) : (
          label
        )}
      </button>
      {configError && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {configError}
        </p>
      )}
      {checkoutMut.isError && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {isAxiosError(checkoutMut.error) &&
          checkoutMut.error.response?.status === 404
            ? 'Subscription checkout is temporarily unavailable. Please try again later.'
            : 'Something went wrong. Please try again.'}
        </p>
      )}
    </>
  );
}
