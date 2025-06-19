# Cross-Browser Testing Report

Date: 6/18/2025, 6:00:44 PM

## Summary

| Feature | Chromium | Firefox | WebKit |
|---------|----------|---------|--------|
| CSS Variables | ✅ | ✅ | ❌ |
| Dark Mode | ✅ | ✅ | ❌ |
| RTL Support | ✅ | ✅ | ❌ |

## Color Consistency

### Chromium

✅ **Colors are consistent across all viewports and pages.**

### Firefox

✅ **Colors are consistent across all viewports and pages.**

### Webkit

✅ **Colors are consistent across all viewports and pages.**

## Light vs Dark Mode

### Chromium

❌ **Dark mode inconsistencies detected:**

#### 404

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | color | rgb(0, 0, 0) | rgb(0, 0, 0) | Mobile |
| body | color | rgb(0, 0, 0) | rgb(0, 0, 0) | Tablet |
| body | color | rgb(0, 0, 0) | rgb(0, 0, 0) | Desktop |

#### index

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Mobile |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Tablet |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Desktop |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Desktop |

#### calculator

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Mobile |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Tablet |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Desktop |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Desktop |

#### component-examples

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Mobile |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Mobile |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Tablet |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Desktop |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |

#### color-palette-showcase

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Mobile |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Desktop |

### Firefox

❌ **Dark mode inconsistencies detected:**

#### 404

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| button | backgroundColor | oklch(0.55 0.24 260) | oklch(0.76 0.14 205) | Mobile |
| button | backgroundColor | oklch(0.55 0.24 260) | oklch(0.76 0.14 205) | Tablet |
| button | backgroundColor | oklch(0.55 0.24 260) | oklch(0.76 0.14 205) | Desktop |

#### index

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Mobile |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Tablet |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Desktop |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Desktop |

#### calculator

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Mobile |
| button | backgroundColor | rgb(249, 250, 251) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Tablet |
| button | backgroundColor | rgb(249, 250, 251) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Desktop |
| button | backgroundColor | rgb(249, 250, 251) | rgb(51, 75, 78) | Desktop |

#### component-examples

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Mobile |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Mobile |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Tablet |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Desktop |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |

#### color-palette-showcase

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Mobile |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Desktop |

### Webkit

❌ **Dark mode inconsistencies detected:**

#### index

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Mobile |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Tablet |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Desktop |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Desktop |

#### calculator

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Mobile |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Tablet |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(255, 255, 255) | rgb(24, 24, 27) | Desktop |
| button | backgroundColor | rgb(186, 196, 195) | rgb(51, 75, 78) | Desktop |

#### component-examples

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Mobile |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Mobile |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Tablet |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| body | color | rgb(25, 37, 37) | rgb(25, 37, 37) | Desktop |
| body | backgroundColor | rgb(249, 250, 251) | rgb(249, 250, 251) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |

#### color-palette-showcase

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Mobile |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Desktop |

## Conclusion

❌ **The color palette implementation has issues that need to be addressed:**

- Some features are not supported in all browsers
- Dark mode implementation is inconsistent
