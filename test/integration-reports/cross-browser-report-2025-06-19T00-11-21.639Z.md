# Cross-Browser Testing Report

Date: 6/18/2025, 6:11:21 PM

## Summary

| Feature | Chromium | Firefox | WebKit |
|---------|----------|---------|--------|
| CSS Variables | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ |
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
| heading | color | not found | not found | Mobile |
| heading | backgroundColor | not found | not found | Mobile |
| paragraph | color | not found | not found | Mobile |
| paragraph | backgroundColor | not found | not found | Mobile |
| link | color | not found | not found | Mobile |
| link | backgroundColor | not found | not found | Mobile |
| button | color | not found | not found | Mobile |
| button | backgroundColor | not found | not found | Mobile |
| body | color | rgb(0, 0, 0) | rgb(0, 0, 0) | Tablet |
| heading | color | not found | not found | Tablet |
| heading | backgroundColor | not found | not found | Tablet |
| paragraph | color | not found | not found | Tablet |
| paragraph | backgroundColor | not found | not found | Tablet |
| link | color | not found | not found | Tablet |
| link | backgroundColor | not found | not found | Tablet |
| button | color | not found | not found | Tablet |
| button | backgroundColor | not found | not found | Tablet |
| body | color | rgb(0, 0, 0) | rgb(0, 0, 0) | Desktop |
| heading | color | not found | not found | Desktop |
| heading | backgroundColor | not found | not found | Desktop |
| paragraph | color | not found | not found | Desktop |
| paragraph | backgroundColor | not found | not found | Desktop |
| link | color | not found | not found | Desktop |
| link | backgroundColor | not found | not found | Desktop |
| button | color | not found | not found | Desktop |
| button | backgroundColor | not found | not found | Desktop |

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
| link | color | not found | not found | Mobile |
| link | backgroundColor | not found | not found | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| link | color | not found | not found | Tablet |
| link | backgroundColor | not found | not found | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| link | color | not found | not found | Desktop |
| link | backgroundColor | not found | not found | Desktop |
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
| link | color | not found | not found | Mobile |
| link | backgroundColor | not found | not found | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| link | color | not found | not found | Tablet |
| link | backgroundColor | not found | not found | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| link | color | not found | not found | Desktop |
| link | backgroundColor | not found | not found | Desktop |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Desktop |

### Webkit

❌ **Dark mode inconsistencies detected:**

#### 404

| Element | Property | Light Mode | Dark Mode | Viewport |
|---------|----------|------------|-----------|----------|
| body | color | not found | not found | Mobile |
| body | backgroundColor | not found | not found | Mobile |
| heading | color | not found | not found | Mobile |
| heading | backgroundColor | not found | not found | Mobile |
| paragraph | color | not found | not found | Mobile |
| paragraph | backgroundColor | not found | not found | Mobile |
| link | color | not found | not found | Mobile |
| link | backgroundColor | not found | not found | Mobile |
| button | color | not found | not found | Mobile |
| button | backgroundColor | not found | not found | Mobile |
| body | color | not found | not found | Tablet |
| body | backgroundColor | not found | not found | Tablet |
| heading | color | not found | not found | Tablet |
| heading | backgroundColor | not found | not found | Tablet |
| paragraph | color | not found | not found | Tablet |
| paragraph | backgroundColor | not found | not found | Tablet |
| link | color | not found | not found | Tablet |
| link | backgroundColor | not found | not found | Tablet |
| button | color | not found | not found | Tablet |
| button | backgroundColor | not found | not found | Tablet |
| body | color | not found | not found | Desktop |
| body | backgroundColor | not found | not found | Desktop |
| heading | color | not found | not found | Desktop |
| heading | backgroundColor | not found | not found | Desktop |
| paragraph | color | not found | not found | Desktop |
| paragraph | backgroundColor | not found | not found | Desktop |
| link | color | not found | not found | Desktop |
| link | backgroundColor | not found | not found | Desktop |
| button | color | not found | not found | Desktop |
| button | backgroundColor | not found | not found | Desktop |

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
| link | color | not found | not found | Mobile |
| link | backgroundColor | not found | not found | Mobile |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Mobile |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Mobile |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Tablet |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| link | color | not found | not found | Tablet |
| link | backgroundColor | not found | not found | Tablet |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Tablet |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Tablet |
| body | backgroundColor | rgb(248, 249, 250) | rgb(25, 37, 37) | Desktop |
| heading | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| paragraph | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| link | color | not found | not found | Desktop |
| link | backgroundColor | not found | not found | Desktop |
| button | color | rgb(255, 255, 255) | rgb(255, 255, 255) | Desktop |
| button | backgroundColor | rgb(51, 75, 78) | rgb(51, 75, 78) | Desktop |

## Conclusion

❌ **The color palette implementation has issues that need to be addressed:**

- Some features are not supported in all browsers
- Dark mode implementation is inconsistent
