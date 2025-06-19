# CSS Performance Analysis Report

Date: 6/18/2025, 6:04:44 PM

## Static CSS Analysis

| File | Rules | Selectors | Color Properties | CSS Variables | Media Queries | File Size |
|------|-------|-----------|-----------------|--------------|--------------|----------|
| css/colors.css | 4 | 5 | 5 | 26 | 1 | 2.05 KB |
| css/rtl.css | 42 | 43 | 3 | 0 | 1 | 3.25 KB |
| css/language-selector.css | 37 | 43 | 24 | 20 | 5 | 5.76 KB |
| i18n/rtl.css | 24 | 24 | 4 | 0 | 0 | 1.82 KB |
| **Total** | **107** | **115** | **36** | **46** | - | **12.88 KB** |

## Dynamic CSS Usage Analysis

### index.html

#### CSS Coverage

- Total CSS: 84.56 KB
- Used CSS: 9.5 KB (11.24%)
- Unused CSS: 75.06 KB (88.76%)

#### CSS Variables Usage

- CSS Color Variables: 0
- Elements Using Variables: 0 of 398 (0.00%)

### calculator.html

#### CSS Coverage

- Total CSS: 64.75 KB
- Used CSS: 3.7 KB (5.71%)
- Unused CSS: 61.05 KB (94.29%)

#### CSS Variables Usage

- CSS Color Variables: 0
- Elements Using Variables: 0 of 150 (0.00%)

### color-palette-showcase.html

#### CSS Coverage

- Total CSS: 8.26 KB
- Used CSS: 7.05 KB (85.38%)
- Unused CSS: 1.21 KB (14.62%)

#### CSS Variables Usage

- CSS Color Variables: 0
- Elements Using Variables: 0 of 142 (0.00%)

## Recommendations

⚠️ **High amount of unused CSS detected.** Consider implementing CSS code splitting or removing unused styles.

✅ **Reasonable number of CSS variables.** The current implementation balances maintainability and performance.

✅ **CSS file size is reasonable.** The color palette implementation is efficient in terms of file size.

