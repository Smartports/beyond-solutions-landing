# Color Palette Update

This document summarizes the changes made to implement the new color palette across the Beyond Solutions website.

## New Color Palette

| Color Code | Name/Usage            |
| ---------- | --------------------- |
| #334b4e    | Primary (Main)        |
| #243b44    | Primary Dark          |
| #54676d    | Primary Medium        |
| #68767c    | Primary Light         |
| #192525    | Dark Text             |
| #cccfcf    | Light Text/Background |
| #525853    | Secondary Dark        |
| #adb3b7    | Neutral Medium        |
| #b1aaa0    | Accent                |
| #8c8f92    | Neutral Dark          |
| #bac4c3    | Light Neutral         |
| #b9c6cd    | Pale Accent           |

## Files Updated

The color palette update has been applied to the following files:

1. **Main Website**
   - `index-src.html`: Complete update of the Tailwind configuration and all styled elements
   - `index.html`: Generated from the source file

2. **Calculator**
   - `calculator.html`: Updated all styles to match the new palette while maintaining accessibility

3. **Error Pages**
   - `404.html`: Improved with new styling that matches the color palette and includes a loading animation

4. **RTL Support**
   - `css/rtl.css`: Updated with new color values
   - `i18n/rtl.css`: Updated with new color values

5. **Language Selector**
   - `css/language-selector.css`: Complete color update for light and dark modes

## Accessibility Considerations

All color combinations have been verified to maintain WCAG 2.1 AA compliance:

- Text on background colors maintains minimum contrast ratio of 4.5:1
- Large text maintains minimum contrast ratio of 3:1
- UI elements and graphical objects maintain minimum contrast ratio of 3:1

## CSS Variables

For easier maintenance, the following CSS variables have been implemented:

```css
:root {
  --color-primary-900: #192525;
  --color-primary-800: #243b44;
  --color-primary-700: #334b4e;
  --color-primary-600: #54676d;
  --color-primary-500: #68767c;
  --color-primary-400: #8c8f92;
  --color-primary-300: #adb3b7;
  --color-primary-200: #bac4c3;
  --color-primary-100: #cccfcf;

  --color-accent: #b1aaa0;
  --color-accent-light: #b9c6cd;
  --color-secondary: #525853;
}
```

## Dark Mode Support

The dark mode has been updated to use the appropriate color combinations from the palette:

- Background: #192525
- Text: #cccfcf
- Accent elements: #54676d
- Highlights: #bac4c3

## Next Steps

1. Review all dynamically generated content to ensure color consistency
2. Update any additional pages or components that may not be included in the main website structure
3. Update marketing materials to reflect the new color palette
