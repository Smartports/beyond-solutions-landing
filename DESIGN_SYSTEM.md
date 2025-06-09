# Visual Guide & Tokens · Beyond Solutions

> _"Minimalist futurism, transparency, and sustainability."_  
> This guide covers the MVP phase (static landing) and lays consistent foundations for the future platform.

---

## 1 · Identity and principles

| Pillar | Description |
|-------|-------------|
| **Clarity** | Clean interface, focus on the message; without visual noise. |
| **Discrete futurism** | Controlled use of 3D and micro-animations (anime.js) to evoke innovation, without overwhelming. |
| **Accessibility** | Minimum AA contrast, keyboard navigation, `prefers-reduced-motion`. |
| **Transparency** | Inclusive language and content that highlights sustainability where appropriate. |

---

## 2 · Official palette

| Token | Hex | RGB | Main use | Contrast (on white) |
|-------|-----|-----|---------------|--------------------------|
| `primary-900` | **#192c64** | 25, 44, 100 | Header/footer backgrounds | 10.5:1 ✔ AAA |
| `primary-700` | **#243f8f** | 36, 63, 143 | Buttons, links | 8.0:1 ✔ AAA |
| `accent-300` | **#bdc5dd** | 189, 197, 221 | Card backgrounds, borders | 2.0:1 |
| `accent-100` | **#e9ebf3** | 233, 235, 243 | Alternate sections, hover | 1.2:1 |
| `white` | **#ffffff** | 255, 255, 255 | Dark text / light backgrounds | N/A |

> **Contrast note:** text on `accent-300/100` should use `primary-900` to meet AA.

### Snippet `tailwind.config.cjs`

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { 900: '#192c64', 700: '#243f8f' },
        accent: { 300: '#bdc5dd', 100: '#e9ebf3' },
      },
      fontFamily: {
        display: ['"Open Sauce One"', 'sans-serif'],
        body: ['"Open Sauce One"', 'sans-serif'],
        aux: ['Muli', 'sans-serif'], // punctual use only
      },
    },
  },
};
```

---

## 3 · Typography

| Role | Font | Weight | Base size (rem) | Tracking |
|-----|--------|------|-------------------|----------|
| Display / H1-H2 | Open Sauce One | 600 | 2.25 – 1.875 | -0.02 em |
| Body | Open Sauce One | 400 | 1 – 1.125 | 0 |
| Auxiliary (micro labels) | Muli | 400 | 0.875 | 0.01 em |

Limit Muli to contextual aids ≤ 14 px (for example, card meta-data).

---

## 4 · Layout & grid

- Max. content width: 1200 px (clamp between 90% w and 1200 px).
- 12-column grid (grid-cols-12); fluid gutters (gap-x 4-6).
- Spacing scale (Tailwind) → 2, 4, 6, 8, 12, 16, 24, 32, 48 px.

```
╭──────────────── 1200 px ────────────────╮
│  col-1  col-2 … col-12                 │
╰─────────────────────────────────────────╯
```

---

## 5 · Component tokens

| Component | Base Tailwind classes | Variants |
|------------|----------------------|-----------|
| Primary button | inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-primary-700 hover:bg-primary-900 transition | disabled:opacity-50 |
| Card | rounded-xl bg-white/5 backdrop-blur border border-accent-300 p-6 shadow-sm | hover:shadow-md |
| CTA banner | flex flex-col md:flex-row items-center justify-between bg-primary-700 text-white rounded-lg p-8 gap-4 | — |
| Form Input | w-full rounded-md border border-accent-300 bg-white/80 px-4 py-3 focus:ring-2 focus:ring-primary-700 | invalid:border-red-500 |

---

## 6 · Real Estate Development Process Visualization

Special components for visualizing the real estate development lifecycle from DECK_CONTEXT.md:

| Component | Purpose | Styling |
|-----------|---------|---------|
| ProcessTimeline | Show progression through development stages | flex justify-between w-full py-8 relative before:absolute before:h-1 before:bg-accent-300 before:w-full before:top-1/2 |
| LandVisualization | Interactive map/satellite view | relative rounded-lg overflow-hidden h-[400px] shadow-lg |
| MaterialCard | Display sustainable materials | grid grid-cols-2 md:grid-cols-3 gap-4 bg-accent-100 p-4 rounded-lg |
| ArchitectureModel | 3D building visualization | w-full aspect-video bg-black rounded-lg overflow-hidden |
| RegulationChart | Compliance visualization | flex flex-col space-y-2 p-4 border border-accent-300 rounded-lg |
| ConstructionProgress | Build timeline with stages | w-full h-12 bg-accent-100 rounded-full overflow-hidden relative |
| CommercializationChart | Market segmentation | max-w-md mx-auto h-[300px] |
| OperationDashboard | Building management preview | grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 |

---

## 7 · Iconography & art

- Vector line-based icons (Stroke 1.5 px; rounded edges).
- Hero illustrations repository in /public/illustrations.
- All images must have descriptive alt text.

---

## 8 · Icons for Real Estate Lifecycle

Each real estate lifecycle stage from DECK_CONTEXT.md requires a specific icon set:

| Stage | Icon Style | Colors |
|-------|-----------|--------|
| Land & Materials | Topographic maps, material swatches | primary-700 + earth tones |
| Architecture & Design | Building outlines, compass, ruler | primary-900 + accent-300 |
| Regulatory & Legal | Documents, checkmarks, shield | primary-700 + gray scale |
| Construction & Development | Construction equipment, crane | primary-900 + accent-300 |
| Commercialization | Charts, user segments, handshake | primary-700 + green/blue gradient |
| Operation | Gears, dashboard, analytics | primary-900 + accent-100 |

---

## 9 · Accessibility

| Guide | Key rules |
|------|--------------|
| Contrast | WCAG 2.1 AA minimum. See palette table. |
| Navigation | Logical tabindex order. |
| Animations | Respect prefers-reduced-motion; anime.js should pause / reduce. |
| ARIA | Use appropriate roles (role="button" on interactive spans). |

### Automated checks
- axe-playwright in e2e.
- Lighthouse-CI budget: A11y ≥ 90.

---

## 10 · Motion (summary)

Extensive details in MOTION_GUIDELINES.md.

| Type | Duration | Easing | Example |
|------|----------|--------|---------|
| Hero fade-in | 500 ms | easeOutQuad | Logo, heading |
| CTA hover | 200 ms | easeOutSine | Button elevation |
| Section scroll-reveal | 600 ms | easeOutCubic | Image + text |
| Real Estate Process Animation | 800 ms | easeInOutQuad | Stage transition in process timeline |

---

## 11 · Usage examples

```html
<!-- Primary button -->
<button class="btn-primary">
  <span>Join the Waitlist</span>
</button>

<!-- Hero heading -->
<h1 class="text-4xl md:text-6xl font-semibold text-white tracking-tight">
  Building the future of real estate <br /> with AI and big data
</h1>

<!-- Process stage card -->
<div class="process-stage-card">
  <div class="stage-icon">
    <svg><!-- Architecture icon --></svg>
  </div>
  <h3 class="text-xl font-semibold text-primary-900">Architecture & Design</h3>
  <p class="text-sm text-gray-700">Innovative proposals with high-value design and art integration.</p>
</div>
```

btn-primary maps to the token described above via @apply or plugin classes.

---

## 12 · Design governance

| Process | Tool | Frequency |
|---------|-------------|--------------|
| UI ↔ Dev review | Figma → Storybook snapshots | Each feature PR |
| Manual a11y audit | NVDA + VoiceOver | End of sprint |
| Token updates | tailwind.config.cjs + tokens.css | On-demand |

For major changes, record decisions in ADR and update this file.

---

_Last updated: June 5, 2025_
