# MediaSearch Design System

Reference for redesigning authenticated pages to match the landing page. Every page should feel like it belongs to the same product.

---

## Color Palette

### Backgrounds
| Token | Value | Usage |
|-------|-------|-------|
| `page-bg` | `bg-[#09090b]` | Page-level background |
| `surface` | `bg-zinc-900/50` | Cards, containers, panels |
| `surface-elevated` | `bg-zinc-800` | Hover states, active items, dropdowns |
| `surface-input` | `bg-zinc-900 border-zinc-700` | Form inputs, textareas, selects |
| `surface-overlay` | `bg-[#09090b]/80 backdrop-blur-lg` | Nav bar (scrolled), modals |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| `text-primary` | `text-white` | Headings, important content |
| `text-secondary` | `text-zinc-400` | Body text, descriptions |
| `text-muted` | `text-zinc-500` | Help text, timestamps, meta |
| `text-accent` | `text-blue-400` | Links, highlighted values |

### Borders
| Token | Value | Usage |
|-------|-------|-------|
| `border-default` | `border-zinc-800` | Card edges, dividers |
| `border-input` | `border-zinc-700` | Form input borders |
| `border-focus` | `ring-blue-500/50` | Focus rings on inputs/buttons |
| `border-accent` | `border-blue-500/50` | Featured/highlighted cards |

### Accent Colors
| Token | Value | Usage |
|-------|-------|-------|
| `accent-primary` | `bg-blue-600` | Primary buttons, active toggles |
| `accent-hover` | `bg-blue-700` | Primary button hover |
| `accent-subtle` | `bg-blue-600/10` | Icon containers, soft highlights |
| `accent-gradient` | `from-blue-400 to-cyan-300` | Gradient text, special emphasis |

### Status Colors (on dark backgrounds)
| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Success | `bg-green-900/30` | `text-green-400` | `border-green-800` |
| Error | `bg-red-900/30` | `text-red-400` | `border-red-800` |
| Warning | `bg-amber-900/30` | `text-amber-400` | `border-amber-800` |
| Info | `bg-blue-900/30` | `text-blue-400` | `border-blue-800` |

---

## Typography

### Headings
- **Page title (h1):** `text-2xl font-bold text-white` (app pages)
- **Section heading (h2):** `text-lg font-semibold text-white`
- **Card heading (h3):** `text-base font-medium text-white`

### Body
- **Primary:** `text-sm text-zinc-400`
- **Small/Meta:** `text-xs text-zinc-500`
- **Labels:** `text-sm font-medium text-zinc-300`

---

## Components

### Cards / Containers
```
rounded-xl border border-zinc-800 bg-zinc-900/50 p-6
```
No shadow (dark theme relies on borders, not shadows). Use `shadow` sparingly only for elevated dropdowns.

### Buttons

**Primary:**
```
rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]
```

**Secondary:**
```
rounded-lg border border-zinc-700 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]
```

**Danger:**
```
rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50
```

**Ghost (icon buttons, subtle actions):**
```
rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white
```

### Form Inputs
```
w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50
```

### Nav Bar (authenticated)
```
border-b border-zinc-800 bg-[#09090b]
```
- Active link: `bg-blue-600/10 text-blue-400`
- Inactive link: `text-zinc-400 hover:bg-zinc-800 hover:text-white`
- Brand text: `text-lg font-bold text-white`

### Badges / Pills
**Tier badge:** Keep existing TIER_COLORS but adapt for dark bg:
```
rounded-full px-3 py-1 text-xs font-semibold
```

**Status badge:**
```
rounded-full px-2 py-0.5 text-xs font-medium
```
Use status colors from palette above.

### Icon Containers
```
flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10
// Icon: h-5 w-5 text-blue-400
```

### Alert Banners
```
rounded-lg border border-{color}-800 bg-{color}-900/30 p-4 text-sm text-{color}-400
```
Where `{color}` is `red`, `amber`, `green`, or `blue`.

### Dropdowns / Popovers
```
rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg
```

### Tabs (ARIA tab pattern)
- Container: `rounded-lg border border-zinc-800 bg-zinc-900/50`
- Active tab: `bg-blue-600 text-white`
- Inactive tab: `text-zinc-400 hover:bg-zinc-800 hover:text-white`

### Progress Bars
```
// Track
h-2 w-full rounded-full bg-zinc-800
// Fill
h-full rounded-full bg-blue-600 transition-all
```

### Empty States
```
text-center text-zinc-500
// Icon: h-10 w-10 text-zinc-600 mx-auto
// Text: mt-3 text-sm
```

---

## Layout

### Page Structure (authenticated)
```tsx
<div className="min-h-screen bg-[#09090b] text-white">
  <NavBar />
  <main className="mx-auto max-w-6xl px-4 py-8">
    {/* Page content */}
  </main>
  <Footer />
</div>
```

### Container Widths
- Full pages (files grid, search): `max-w-6xl`
- Focused pages (dashboard, subscription, auth forms): `max-w-lg` or `max-w-md`

### Spacing
- Between sections: `space-y-8` or `mt-8`
- Card padding: `p-6`
- Card grid gaps: `gap-6`
- Form field gaps: `space-y-4`

---

## Animations (App Pages)

Keep it subtle for app pages — the landing page can be flashy, but app pages are for getting work done.

- **Page entrance:** Optional subtle fade-in (`opacity 0→1, y 10→0, 300ms`)
- **Card hover:** `transition-colors` only (no scale/shadow transforms)
- **Loading spinners:** `animate-spin text-blue-500`
- **Status transitions:** `transition-colors duration-200`
- **No WebGL, no parallax, no word-by-word** on app pages

Always respect `useReducedMotion()`.

---

## Dark Theme Conversion Cheat Sheet

Quick find-and-replace reference for converting light → dark:

| Light (current) | Dark (target) |
|-----------------|---------------|
| `bg-gray-50` | `bg-[#09090b]` |
| `bg-white` | `bg-zinc-900/50` |
| `bg-gray-100` | `bg-zinc-800` |
| `text-gray-900` | `text-white` |
| `text-gray-700` | `text-zinc-300` |
| `text-gray-600` | `text-zinc-400` |
| `text-gray-500` | `text-zinc-500` |
| `text-gray-400` | `text-zinc-500` |
| `border-gray-200` | `border-zinc-800` |
| `border-gray-300` | `border-zinc-700` |
| `bg-red-50 text-red-700` | `bg-red-900/30 text-red-400 border-red-800` |
| `bg-amber-50 text-amber-800` | `bg-amber-900/30 text-amber-400 border-amber-800` |
| `bg-blue-50 text-blue-800` | `bg-blue-900/30 text-blue-400 border-blue-800` |
| `bg-green-50 text-green-700` | `bg-green-900/30 text-green-400 border-green-800` |
| `shadow-sm` / `shadow` | Remove (use borders instead) |
| `hover:shadow-md` | `hover:border-zinc-700` |
| `hover:bg-gray-50` | `hover:bg-zinc-800` |
| `placeholder-gray-500` | `placeholder-zinc-500` |
| `focus:ring-blue-500` | `focus:ring-blue-500/50` |

---

## What NOT to Do

- Don't add WebGL/shader backgrounds to app pages
- Don't add word-by-word text animations to app pages
- Don't add parallax scroll effects to app pages
- Don't use `backdrop-blur` on cards (only on nav/modals)
- Don't use gradient text on regular content (reserve for special emphasis)
- Don't change any component logic, state management, or API calls
- Don't break accessibility — preserve all ARIA attributes, focus management, keyboard navigation
