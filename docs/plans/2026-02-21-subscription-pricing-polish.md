# Subscription & Pricing Page Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish SubscriptionPage into a complete account page and add entrance animations to PricingPage.

**Architecture:** Modify two existing page components. SubscriptionPage gets a full layout redesign using existing API data and TIERS config. PricingPage gets Framer Motion animations matching the landing page pattern.

**Tech Stack:** React 19, Framer Motion (motion/react), Tailwind v4, TanStack Query v5

---

### Task 1: Rewrite SubscriptionPage

**Files:**
- Modify: `src/pages/SubscriptionPage.tsx`

**Step 1: Rewrite SubscriptionPage with full layout**

Add imports: `motion` from `motion/react`, `useReducedMotion`, `TIERS`, `Sparkles`, `ArrowRight`, `Check`.

Redesign layout:
- max-w-4xl centered with background gradient (matching Dashboard)
- Framer Motion fade-up entrance animations with useReducedMotion
- Header: title + animated tier badge (reuse TIER_COLORS/TIER_LABELS pattern from Dashboard)
- Plan details card with gradient accent line:
  - Paid users: 2x2 stat grid (Status, Price, Billing Cycle, Next Renewal), then Manage Billing + Compare Plans buttons
  - Free users: current plan features from TIERS config, plus a highlighted upgrade nudge card showing Pro tier features/price with CTA to /pricing
- Preserve all existing logic: session_id handling, Stripe portal mutation, error states, 429 handling

**Step 2: Verify build**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/pages/SubscriptionPage.tsx
git commit -m "Polish SubscriptionPage with full account layout and upgrade nudge"
```

---

### Task 2: Add Framer Motion animations to PricingPage

**Files:**
- Modify: `src/pages/PricingPage.tsx`

**Step 1: Add entrance animations to PricingPage**

Add imports: `motion` from `motion/react`, `useReducedMotion`.

Animations:
- Header + billing toggle: fade-up `initial={{ opacity: 0, y: 20 }}`
- Tier cards: Free/Pro slide from left (x: -60), Plus/Power slide from right (x: 60)
- Stagger: index * 0.12 delay per side
- `whileInView` with `viewport={{ once: true, amount: 0.2 }}`
- `whileHover={{ y: -4 }}` spring on cards
- All wrapped in useReducedMotion checks

**Step 2: Verify build**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/pages/PricingPage.tsx
git commit -m "Add entrance animations to PricingPage tier cards"
```

---

### Task 3: Visual verification

**Step 1:** Run Playwright screenshots at desktop width for both /subscription and /pricing pages.
**Step 2:** Check for visual issues, fix any found.
**Step 3:** Final build verification: `npm run build`
