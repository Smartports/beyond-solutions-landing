# Beyond Solutions Style Guide

This style guide defines the visual language and design standards for the Beyond Solutions platform. It ensures consistency across all interfaces and brand touchpoints.

## Table of Contents

1. [Brand Colors](#brand-colors)
2. [Typography](#typography)
3. [Layout & Spacing](#layout--spacing)
4. [Components](#components)
5. [Iconography](#iconography)
6. [Imagery](#imagery)
7. [Voice & Tone](#voice--tone)
8. [Accessibility](#accessibility)

## Brand Colors

Beyond Solutions uses a sophisticated, natural color palette that reflects our focus on real estate development and architectural excellence.

### Primary Color Palette

| Shade                                                            | Hex Code | CSS Variable          | Usage                                 |
| ---------------------------------------------------------------- | -------- | --------------------- | ------------------------------------- |
| ![#192525](https://via.placeholder.com/15/192525/192525.png) 900 | #192525  | `--color-primary-900` | Dark text, dark backgrounds           |
| ![#243b44](https://via.placeholder.com/15/243b44/243b44.png) 800 | #243b44  | `--color-primary-800` | Dark UI elements, hover states        |
| ![#334b4e](https://via.placeholder.com/15/334b4e/334b4e.png) 700 | #334b4e  | `--color-primary-700` | Primary brand color, buttons, accents |
| ![#54676d](https://via.placeholder.com/15/54676d/54676d.png) 600 | #54676d  | `--color-primary-600` | Secondary UI elements                 |
| ![#68767c](https://via.placeholder.com/15/68767c/68767c.png) 500 | #68767c  | `--color-primary-500` | Medium emphasis UI elements           |
| ![#8c8f92](https://via.placeholder.com/15/8c8f92/8c8f92.png) 400 | #8c8f92  | `--color-primary-400` | Low emphasis text, borders            |
| ![#adb3b7](https://via.placeholder.com/15/adb3b7/adb3b7.png) 300 | #adb3b7  | `--color-primary-300` | Subtle UI elements, disabled states   |
| ![#bac4c3](https://via.placeholder.com/15/bac4c3/bac4c3.png) 200 | #bac4c3  | `--color-primary-200` | Light backgrounds, hover states       |
| ![#cccfcf](https://via.placeholder.com/15/cccfcf/cccfcf.png) 100 | #cccfcf  | `--color-primary-100` | Light text on dark backgrounds        |

### Accent Colors

| Name                                                                      | Hex Code | CSS Variable           | Usage                                       |
| ------------------------------------------------------------------------- | -------- | ---------------------- | ------------------------------------------- |
| ![#b1aaa0](https://via.placeholder.com/15/b1aaa0/b1aaa0.png) Accent       | #b1aaa0  | `--color-accent`       | Accent elements, highlights                 |
| ![#b9c6cd](https://via.placeholder.com/15/b9c6cd/b9c6cd.png) Accent Light | #b9c6cd  | `--color-accent-light` | Secondary accent, subtle highlights         |
| ![#525853](https://via.placeholder.com/15/525853/525853.png) Secondary    | #525853  | `--color-secondary`    | Secondary UI elements, alternative emphasis |

### Color Usage Guidelines

- **Primary Action**: Use `--color-primary-700` (#334b4e) for primary buttons and key interactive elements
- **Secondary Action**: Use `--color-primary-600` (#54676d) or `--color-secondary` (#525853)
- **Backgrounds**: Use white for main content areas and `--color-primary-200` (#bac4c3) for alternate sections
- **Text**: Use `--color-primary-900` (#192525) for body text on light backgrounds and `--color-primary-100` (#cccfcf) on dark backgrounds
- **Accents**: Use accent colors sparingly to highlight important information or create visual interest

## Typography

Beyond Solutions uses a clean, modern typography system that emphasizes readability and professionalism.

### Font Families

- **Primary Font**: "Open Sauce One", sans-serif
  - Used for headings, body text, and UI elements
- **System Fallbacks**: system-ui, -apple-system, BlinkMacSystemFont, sans-serif
  - Ensures consistent rendering across platforms

### Type Scale

| Element | Size            | Weight | Line Height | Usage                         |
| ------- | --------------- | ------ | ----------- | ----------------------------- |
| h1      | 2.5rem (40px)   | 700    | 1.2         | Main page headings            |
| h2      | 2rem (32px)     | 700    | 1.25        | Section headings              |
| h3      | 1.5rem (24px)   | 600    | 1.3         | Sub-section headings          |
| h4      | 1.25rem (20px)  | 600    | 1.4         | Card headings, feature titles |
| h5      | 1.125rem (18px) | 600    | 1.4         | Small headings                |
| h6      | 1rem (16px)     | 700    | 1.5         | Minor headings                |
| Body    | 1rem (16px)     | 400    | 1.6         | Main body text                |
| Small   | 0.875rem (14px) | 400    | 1.5         | Secondary text, captions      |
| XSmall  | 0.75rem (12px)  | 400    | 1.5         | Legal text, footnotes         |

### Typography Guidelines

- Maintain a clear hierarchy with appropriate heading levels
- Use sentence case for headings (capitalize first word only)
- Limit line length to 70-80 characters for optimal readability
- Use proper typographic punctuation (smart quotes, em dashes, etc.)
- Ensure sufficient contrast between text and background colors

## Layout & Spacing

Beyond Solutions uses a consistent spacing system based on a 4px grid to create harmonious layouts.

### Spacing Scale

| Name | Size | CSS Variable  | Usage                                |
| ---- | ---- | ------------- | ------------------------------------ |
| xs   | 4px  | `--space-xs`  | Minimal spacing, icon padding        |
| sm   | 8px  | `--space-sm`  | Tight spacing, between related items |
| md   | 16px | `--space-md`  | Standard spacing, between components |
| lg   | 24px | `--space-lg`  | Generous spacing, section padding    |
| xl   | 32px | `--space-xl`  | Section margins                      |
| 2xl  | 48px | `--space-2xl` | Large section margins                |
| 3xl  | 64px | `--space-3xl` | Page margins                         |

### Layout Guidelines

- Use a 12-column grid system for responsive layouts
- Maintain consistent spacing within and between components
- Use appropriate white space to create visual hierarchy
- Ensure layouts are responsive and adapt to different screen sizes
- Use container width constraints for optimal reading experience

## Components

Beyond Solutions uses a component-based design system to ensure consistency and efficiency.

### Button Styles

- **Primary Button**: `--color-primary-700` background with white text
- **Secondary Button**: White background with `--color-primary-700` border and text
- **Tertiary Button**: No background or border, `--color-primary-700` text
- **Disabled Button**: `--color-primary-300` background with `--color-primary-500` text

### Form Elements

- **Input Fields**: White background, `--color-primary-300` border, `--color-primary-900` text
- **Focus State**: `--color-primary-700` border with subtle box shadow
- **Error State**: `#e53e3e` border with error message below
- **Success State**: `#38a169` border with success message below
- **Dropdown Menus**: Consistent with input fields, with appropriate hover states

### Cards

- **Default Card**: White background, subtle shadow, 8px border radius
- **Interactive Card**: Hover effect with slightly larger shadow
- **Featured Card**: Subtle highlight with `--color-primary-200` background

### Navigation

- **Main Navigation**: `--color-primary-700` background with white text
- **Sub Navigation**: White background with `--color-primary-900` text
- **Mobile Navigation**: Collapsible menu with appropriate touch targets

## Iconography

Beyond Solutions uses a consistent icon system to enhance visual communication.

### Icon Guidelines

- Use SVG icons for scalability and accessibility
- Maintain consistent sizing (16px, 24px, 32px)
- Use icons to complement text, not replace it
- Ensure icons have sufficient contrast with their background
- Provide appropriate alt text or aria-labels for accessibility

## Imagery

Beyond Solutions uses high-quality imagery to showcase real estate developments and architectural excellence.

### Image Guidelines

- Use high-resolution images optimized for web
- Prefer WebP format with appropriate fallbacks
- Maintain consistent aspect ratios
- Use responsive image techniques (srcset, sizes)
- Include meaningful alt text for accessibility
- Apply subtle treatments to maintain visual consistency

## Voice & Tone

Beyond Solutions communicates with clarity, expertise, and professionalism.

### Voice Characteristics

- **Professional**: Demonstrates expertise and authority
- **Clear**: Uses straightforward language without jargon
- **Confident**: Conveys trust and reliability
- **Solution-oriented**: Focuses on benefits and outcomes

### Content Guidelines

- Use active voice and present tense when possible
- Be concise and direct, avoiding unnecessary words
- Use industry terminology appropriately, explaining complex concepts
- Maintain consistent terminology across the platform
- Address the user directly with "you" rather than "users" or "customers"

## Accessibility

Beyond Solutions is committed to creating accessible interfaces that work for everyone.

### Accessibility Standards

- Follow WCAG 2.1 AA guidelines at minimum
- Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Provide text alternatives for non-text content
- Ensure keyboard navigability for all interactive elements
- Support screen readers with appropriate ARIA attributes
- Design with various disabilities in mind (visual, motor, cognitive, etc.)

### Accessibility Checklist

- Text can be resized up to 200% without loss of content or functionality
- All interactive elements have visible focus states
- Color is not the only means of conveying information
- Form fields have associated labels
- Page structure uses proper heading hierarchy
- Dynamic content changes are announced to screen readers
- Animations can be paused or disabled

---

This style guide is a living document and will be updated as the Beyond Solutions design system evolves.
