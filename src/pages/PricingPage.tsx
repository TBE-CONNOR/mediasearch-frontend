import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Check, Loader2, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createCheckoutSession } from '@/api/checkout';
import { TIERS } from '@/config/pricing';
import type { PricingTier } from '@/config/pricing';

export function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const tier = useAuthStore((s) => s.tier);

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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="mt-2 text-gray-600">
            Start free, upgrade when you need more.
          </p>
        </div>

        <BillingToggle
          annual={annual}
          onToggle={setAnnual}
          savingsPercent={maxSavingsPercent}
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <TierCard key={t.id} tier={t} annual={annual} currentTier={tier} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <CardBrandLogo brand="visa" />
            <CardBrandLogo brand="mastercard" />
            <CardBrandLogo brand="amex" />
            <CardBrandLogo brand="discover" />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock className="h-3 w-3" />
            Payments processed securely by Stripe. Charges appear as
            &quot;MEDIASEARCH&quot; on your statement. We never store your card
            data.
          </p>
          <p className="text-xs text-gray-400">
            Prices shown in USD. Applicable taxes may be added at checkout.
          </p>
        </div>
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
        className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-500'}`}
      >
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label="Toggle annual billing"
        onClick={() => onToggle(!annual)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          annual ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
            annual ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-500'}`}
      >
        Annual
      </span>
      {annual && savingsPercent > 0 && (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          Save up to {savingsPercent}%
        </span>
      )}
    </div>
  );
}

function TierCard({
  tier: t,
  annual,
  currentTier,
}: {
  tier: PricingTier;
  annual: boolean;
  currentTier: string | null;
}) {
  const isCurrentPlan = currentTier === t.id;
  const isFree = t.monthlyPrice === null;

  const cardClasses = t.recommended
    ? 'relative rounded-lg border-2 border-blue-500 bg-white p-6 shadow-lg ring-1 ring-blue-500/20 lg:scale-105'
    : t.decoy
      ? 'relative rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm'
      : t.id === 'power'
        ? 'relative rounded-lg border border-amber-200 bg-white p-6 shadow-sm'
        : 'relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm';

  const buttonClasses = isCurrentPlan
    ? 'w-full rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-500 cursor-default'
    : t.recommended
      ? 'w-full rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
      : t.decoy
        ? 'w-full rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200'
        : t.id === 'power'
          ? 'w-full rounded-md px-4 py-2 text-sm font-medium bg-amber-600 text-white hover:bg-amber-700'
          : 'w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50';

  const priceColor = t.decoy ? 'text-gray-600' : 'text-gray-900';

  const price = annual ? t.annualMonthly : t.monthlyPrice;
  const billingNote = annual
    ? `$${t.annualPrice?.toFixed(2)} billed annually · Auto-renews until canceled`
    : 'Billed monthly · Auto-renews until canceled';

  return (
    <div className={cardClasses}>
      {t.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              t.recommended
                ? 'bg-blue-600 text-white'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {t.badge}
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">{t.name}</h3>

      <div className="mt-4">
        {isFree ? (
          <p className="text-3xl font-bold text-gray-900">Free</p>
        ) : (
          <>
            <p className={`text-3xl font-bold ${priceColor}`}>
              ${price?.toFixed(2)}
              <span className="text-base font-normal text-gray-500">
                /mo
              </span>
              <span className="ml-1 text-xs font-normal text-gray-400">
                USD
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">{billingNote}</p>
          </>
        )}
      </div>

      <ul className="mt-6 space-y-2">
        {t.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
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
    </div>
  );
}

function CardBrandLogo({ brand }: { brand: 'visa' | 'mastercard' | 'amex' | 'discover' }) {
  const shared = 'h-6 w-10 rounded border border-gray-200 bg-white p-0.5';

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
          <rect x="1" y="1" width="46" height="30" rx="3" fill="#fff" stroke="#E5E7EB"/>
          <circle cx="28" cy="16" r="7" fill="#F76F20"/>
          <text x="16" y="18" textAnchor="middle" fill="#1A1F36" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">D</text>
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

  const checkoutMut = useMutation({
    mutationFn: () =>
      createCheckoutSession({
        price_id: priceId!,
        tier: t.id,
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
          if (priceId && cognitoSub) checkoutMut.mutate();
        }}
        disabled={checkoutMut.isPending}
        className={className}
      >
        {checkoutMut.isPending ? (
          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        ) : (
          label
        )}
      </button>
      {checkoutMut.isError && (
        <p className="mt-2 text-xs text-red-600">
          {isAxiosError(checkoutMut.error) &&
          checkoutMut.error.response?.status === 404
            ? 'Subscription checkout is temporarily unavailable. Please try again later.'
            : 'Something went wrong. Please try again.'}
        </p>
      )}
    </>
  );
}
