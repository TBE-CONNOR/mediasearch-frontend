# Subscription Page Polish + Pricing Page Animations

## Subscription Page (SubscriptionPage.tsx)

### Layout
Full-width centered (max-w-4xl), background gradient, Framer Motion entrance animations with useReducedMotion.

### Sections

1. **Header** — "Subscription" title + tier badge (TIER_COLORS/TIER_LABELS). Paid: status pill, price, renewal inline. Free: "No active subscription" subtext.

2. **Plan details card** — rounded-xl, border-zinc-800, gradient accent line.
   - Paid: 2-column stat grid (Status, Price, Billing cycle, Renewal date). Manage Billing + Compare Plans buttons.
   - Free: Current features list from TIERS config + highlighted comparison card showing Pro tier with features/price and "Upgrade to Pro" CTA to /pricing.

3. **Animations** — Staggered fade-up (opacity: 0, y: 16) matching Dashboard pattern.

### Data sources
- `getSubscription()` returns `{ tier, subscription: { tier, interval, amount, currency, subscription_status, current_period_end, cancel_at_period_end, subscription_id } | null }`
- `TIERS` config for feature lists
- `TIER_LABELS`, `TIER_COLORS` for display

## Pricing Page (PricingPage.tsx)

### Animations
- Free/Pro (indices 0,1): slide from left `x: -60`
- Plus/Power (indices 2,3): slide from right `x: 60`
- Stagger delay: `index * 0.12` per side
- `whileInView` with `viewport={{ once: true, amount: 0.2 }}`
- Header and billing toggle: fade-up entrance
- Cards: `whileHover={{ y: -4 }}` spring
- useReducedMotion throughout
