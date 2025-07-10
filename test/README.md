# Beyond Solutions Accessibility Testing

This directory contains automated accessibility tests for the Beyond Solutions website, with a focus on ensuring the new color palette meets WCAG 2.1 AA standards.

## Test Structure

- `axe-tests/`: Contains test scripts using axe-core for accessibility testing
  - `axe-calculator.js`: Tests for the calculator component
  - `axe-color-palette.js`: Tests specifically for the new color palette
- `axe-reports/`: Output directory for test reports

## Running Tests

### Prerequisites

Make sure you have all dependencies installed:

```bash
npm install
```

### Running Color Palette Tests

To test the accessibility of the new color palette across the site:

```bash
npm run test:a11y
```

This will:

1. Launch a headless browser
2. Test each page in both light and dark mode
3. Generate detailed reports in the `axe-reports` directory

### Running Component-Specific Tests

To test the accessibility of the calculator component:

```bash
npm run test:a11y:components
```

## Understanding Test Results

The tests generate two types of output:

1. A JSON file with detailed results
2. A Markdown summary file highlighting:
   - Total violations
   - Color contrast violations
   - Page-by-page breakdown

### Interpreting Results

- ✅ No color contrast issues: The color palette is WCAG 2.1 AA compliant
- ❌ Color contrast issues found: Review the detailed report and make adjustments

## Manual Testing

While automated tests are valuable, they should be supplemented with manual testing:

1. Test with screen readers (VoiceOver, NVDA, JAWS)
2. Test keyboard navigation
3. Test with different color vision deficiencies
4. Test at different zoom levels (up to 200%)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
