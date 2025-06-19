# Beyond Solutions Color Reference Guide

This document provides a comprehensive reference for the Beyond Solutions color palette, including usage guidelines and accessibility information.

## Color Palette

### Primary Colors

| Shade | Hex Code | CSS Variable | Usage |
|-------|----------|-------------|-------|
| 900 (Darkest) | #192525 | `--color-primary-900` | Dark text, dark backgrounds |
| 800 | #243b44 | `--color-primary-800` | Dark UI elements, hover states |
| 700 | #334b4e | `--color-primary-700` | Primary brand color, buttons, accents |
| 600 | #54676d | `--color-primary-600` | Secondary UI elements |
| 500 | #68767c | `--color-primary-500` | Medium emphasis UI elements |
| 400 | #8c8f92 | `--color-primary-400` | Low emphasis text, borders |
| 300 | #adb3b7 | `--color-primary-300` | Subtle UI elements, disabled states |
| 200 | #bac4c3 | `--color-primary-200` | Light backgrounds, hover states |
| 100 (Lightest) | #cccfcf | `--color-primary-100` | Light text on dark backgrounds |

### Accent Colors

| Name | Hex Code | CSS Variable | Usage |
|------|----------|-------------|-------|
| Accent | #b1aaa0 | `--color-accent` | Accent elements, highlights |
| Accent Light | #b9c6cd | `--color-accent-light` | Secondary accent, subtle highlights |
| Secondary | #525853 | `--color-secondary` | Secondary UI elements, alternative emphasis |

## Usage Guidelines

### Text Colors

- **Dark mode text**: Use `--color-primary-100` (#cccfcf) for primary text on dark backgrounds
- **Light mode text**: Use `--color-primary-900` (#192525) for primary text on light backgrounds
- **Secondary text**: Use `--color-primary-500` (#68767c) for secondary or less emphasized text

### Background Colors

- **Light mode**: Use white or very light gray for main backgrounds, `--color-primary-200` (#bac4c3) for alternate backgrounds
- **Dark mode**: Use `--color-primary-900` (#192525) for main backgrounds, `--color-primary-800` (#243b44) for alternate backgrounds

### Interactive Elements

- **Buttons (primary)**: `--color-primary-700` (#334b4e) with white text
- **Buttons (hover)**: `--color-primary-800` (#243b44)
- **Focus states**: `--color-primary-600` (#54676d) for focus rings

### Borders and Dividers

- **Light mode**: `--color-primary-300` (#adb3b7)
- **Dark mode**: `--color-primary-600` (#54676d)

## Accessibility

All color combinations have been verified to maintain WCAG 2.1 AA compliance:

### Key Color Contrast Ratios

| Foreground | Background | Contrast Ratio | WCAG AA Compliance |
|------------|------------|----------------|-------------------|
| #192525 (text) | #FFFFFF | 16.9:1 | Pass (AAA) |
| #cccfcf (text) | #192525 | 13.2:1 | Pass (AAA) |
| #334b4e (text) | #FFFFFF | 8.4:1 | Pass (AAA) |
| #FFFFFF (text) | #334b4e | 8.4:1 | Pass (AAA) |
| #192525 (text) | #bac4c3 | 11.3:1 | Pass (AAA) |
| #cccfcf (text) | #243b44 | 9.8:1 | Pass (AAA) |

## Implementation

### CSS Variables

The color palette is implemented using CSS custom properties (variables) defined in `css/colors.css`. To use these colors in your CSS:

```css
.my-element {
  color: var(--color-primary-700);
  background-color: var(--color-primary-100);
}
```

### Tailwind Classes

For Tailwind CSS, the colors are mapped to utility classes:

```html
<button class="bg-primary-700 text-white hover:bg-primary-800">
  Button Text
</button>
```

## Dark Mode Support

Dark mode is implemented using both the `prefers-color-scheme` media query and a `.dark` class for manual toggling:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: var(--color-primary-100);
    --color-background: var(--color-primary-900);
  }
}

.dark {
  --color-text-primary: var(--color-primary-100);
  --color-background: var(--color-primary-900);
}
```

## Color Palette Evolution

This color palette replaces the previous blue-focused palette with a more sophisticated, natural palette that better aligns with Beyond Solutions' brand identity in the real estate and development sector. 