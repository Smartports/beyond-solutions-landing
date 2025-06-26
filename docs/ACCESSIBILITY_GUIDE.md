# Accessibility Implementation Guide

## Overview
This guide provides detailed instructions for implementing WCAG 2.1 AA accessibility features in the Beyond Solutions landing page.

## Quick Start

### 1. Install Accessibility Testing Tools
```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/cli

# Install pa11y for CI/CD testing
npm install --save-dev pa11y

# Add to package.json scripts
"scripts": {
  "test:a11y": "axe http://localhost:8000/dist/calculator-gamified.html",
  "test:pa11y": "pa11y http://localhost:8000/dist/calculator-gamified.html"
}
```

### 2. Basic Accessibility Checklist
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have accessible names
- [ ] Page has proper heading hierarchy
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Focus indicators are visible
- [ ] Content is keyboard accessible

## Detailed Implementation

### Keyboard Navigation

#### Skip Links
Add at the beginning of `<body>`:
```html
<div class="skip-links">
  <a href="#main-nav" class="skip-link">Skip to navigation</a>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <a href="#calculator" class="skip-link">Skip to calculator</a>
</div>

<style>
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 999;
}

.skip-link:focus {
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
  padding: 10px 20px;
  background: #000;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
}
</style>
```

#### Focus Management
```javascript
// Focus trap utility
class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select'
    );
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
    this.activate();
  }

  activate() {
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    this.firstFocusable.focus();
  }

  handleKeydown(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    }
  }

  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeydown);
  }
}

// Usage in modal
const modal = document.getElementById('myModal');
let focusTrap;

function openModal() {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  focusTrap = new FocusTrap(modal);
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  focusTrap.deactivate();
  // Return focus to trigger element
  triggerElement.focus();
}
```

### ARIA Implementation

#### Live Regions
```html
<!-- Status messages -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  <span id="status-message"></span>
</div>

<!-- Important alerts -->
<div role="alert" aria-live="assertive" aria-atomic="true" class="sr-only">
  <span id="alert-message"></span>
</div>

<!-- Progress updates -->
<div role="log" aria-live="polite" aria-relevant="additions" class="sr-only">
  <ul id="progress-log"></ul>
</div>
```

```javascript
// Announce status changes
function announceStatus(message) {
  const status = document.getElementById('status-message');
  status.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    status.textContent = '';
  }, 1000);
}

// Announce alerts
function announceAlert(message) {
  const alert = document.getElementById('alert-message');
  alert.textContent = message;
}

// Log progress
function logProgress(message) {
  const log = document.getElementById('progress-log');
  const entry = document.createElement('li');
  entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
  log.appendChild(entry);
}
```

#### Landmarks and Regions
```html
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation items -->
  </nav>
</header>

<main role="main" id="main-content">
  <section aria-labelledby="calculator-heading">
    <h1 id="calculator-heading">Solar Calculator</h1>
    <!-- Calculator content -->
  </section>
  
  <aside role="complementary" aria-labelledby="help-heading">
    <h2 id="help-heading">Help & Tips</h2>
    <!-- Help content -->
  </aside>
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

### Form Accessibility

#### Proper Labeling
```html
<!-- Explicit label -->
<label for="project-name">Project Name</label>
<input type="text" id="project-name" name="projectName" required>

<!-- Implicit label -->
<label>
  <span>Email Address</span>
  <input type="email" name="email" required>
</label>

<!-- Label with description -->
<label for="area">
  Project Area
  <span class="help-text" id="area-help">Enter the area in square meters</span>
</label>
<input type="number" 
       id="area" 
       name="area" 
       aria-describedby="area-help"
       min="100"
       max="10000"
       required>

<!-- Grouped inputs -->
<fieldset>
  <legend>Project Type</legend>
  <label>
    <input type="radio" name="type" value="residential">
    Residential
  </label>
  <label>
    <input type="radio" name="type" value="commercial">
    Commercial
  </label>
</fieldset>
```

#### Error Handling
```html
<div class="form-group" role="group">
  <label for="email">Email Address</label>
  <input type="email" 
         id="email" 
         name="email"
         aria-invalid="false"
         aria-describedby="email-error"
         required>
  <span id="email-error" 
        role="alert" 
        aria-live="polite"
        class="error-message hidden">
    Please enter a valid email address
  </span>
</div>
```

```javascript
// Accessible form validation
function validateForm(form) {
  const errors = [];
  
  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value) {
      errors.push({
        field: field,
        message: `${field.labels[0].textContent} is required`
      });
    }
  });
  
  if (errors.length > 0) {
    // Announce errors
    announceAlert(`Form has ${errors.length} errors`);
    
    // Show errors
    errors.forEach(error => {
      error.field.setAttribute('aria-invalid', 'true');
      const errorElement = document.getElementById(`${error.field.id}-error`);
      errorElement.textContent = error.message;
      errorElement.classList.remove('hidden');
    });
    
    // Focus first error
    errors[0].field.focus();
    return false;
  }
  
  return true;
}
```

### Color and Contrast

#### CSS Custom Properties for Themes
```css
:root {
  /* Light theme with AA compliant colors */
  --color-text-primary: #1F2937;    /* 12.63:1 on white */
  --color-text-secondary: #4B5563;  /* 7.04:1 on white */
  --color-text-tertiary: #6B7280;   /* 4.51:1 on white */
  
  --color-link: #2563EB;            /* 4.53:1 on white */
  --color-link-hover: #1D4ED8;     /* 5.87:1 on white */
  
  --color-success: #059669;         /* 4.54:1 on white */
  --color-warning: #D97706;         /* 3.02:1 on white - use with dark bg */
  --color-error: #DC2626;           /* 4.53:1 on white */
  
  --color-focus: #3B82F6;
  --focus-offset: 2px;
  --focus-width: 3px;
}

/* Dark theme with AA compliant colors */
[data-theme="dark"] {
  --color-text-primary: #F9FAFB;    /* 17.35:1 on #111827 */
  --color-text-secondary: #E5E7EB;  /* 13.03:1 on #111827 */
  --color-text-tertiary: #D1D5DB;   /* 10.07:1 on #111827 */
  
  --color-link: #60A5FA;            /* 7.84:1 on #111827 */
  --color-link-hover: #93BBFD;      /* 10.62:1 on #111827 */
}

/* Focus styles */
*:focus {
  outline: var(--focus-width) solid var(--color-focus);
  outline-offset: var(--focus-offset);
}

/* High contrast mode */
@media (prefers-contrast: high) {
  * {
    --focus-width: 4px;
  }
  
  button, .card, input, select, textarea {
    border: 2px solid currentColor !important;
  }
}
```

### Screen Reader Optimization

#### Hiding Decorative Content
```css
/* Hide from screen readers */
.decorative,
[aria-hidden="true"] {
  speak: none;
}

/* Visually hidden but screen reader accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Show when focused */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

#### Accessible Data Visualization
```javascript
// Make charts accessible
class AccessibleChart {
  constructor(canvas, data, options) {
    this.canvas = canvas;
    this.data = data;
    this.options = options;
    this.chart = null;
    this.init();
  }

  init() {
    // Add ARIA label
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', this.generateDescription());
    
    // Create data table alternative
    this.createDataTable();
    
    // Initialize chart
    this.chart = new Chart(this.canvas, {
      data: this.data,
      options: {
        ...this.options,
        plugins: {
          ...this.options.plugins,
          tooltip: {
            enabled: true,
            callbacks: {
              // Custom accessible tooltips
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y} (${context.label})`;
              }
            }
          }
        }
      }
    });
  }

  generateDescription() {
    const datasets = this.data.datasets;
    const description = `Chart showing ${datasets.length} data series. `;
    
    // Add summary statistics
    const summaries = datasets.map(dataset => {
      const values = dataset.data;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const avg = values.reduce((a, b) => a + b) / values.length;
      
      return `${dataset.label}: ranges from ${min} to ${max}, average ${avg.toFixed(2)}`;
    }).join('. ');
    
    return description + summaries;
  }

  createDataTable() {
    const container = document.createElement('div');
    container.className = 'sr-only';
    container.setAttribute('role', 'table');
    container.setAttribute('aria-label', 'Data table version of chart');
    
    const table = document.createElement('table');
    // ... build accessible table
    
    this.canvas.parentElement.appendChild(container);
  }
}
```

### Testing Tools and Techniques

#### Automated Testing
```javascript
// Jest + jest-axe for unit tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('calculator should be accessible', async () => {
  const container = document.createElement('div');
  container.innerHTML = calculatorHTML;
  document.body.appendChild(container);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  
  document.body.removeChild(container);
});

// Cypress + cypress-axe for E2E tests
describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/calculator-gamified.html');
    cy.injectAxe();
  });

  it('Has no detectable a11y violations on load', () => {
    cy.checkA11y();
  });

  it('Has no a11y violations after interaction', () => {
    cy.get('#start-button').click();
    cy.checkA11y();
  });
});
```

#### Manual Testing Checklist
1. **Keyboard Testing**
   - Tab through entire page
   - Verify focus indicators
   - Test keyboard shortcuts
   - Ensure no keyboard traps

2. **Screen Reader Testing**
   - Test with NVDA (Windows)
   - Test with JAWS (Windows)
   - Test with VoiceOver (macOS/iOS)
   - Test with TalkBack (Android)

3. **Visual Testing**
   - Zoom to 200%
   - Test with Windows High Contrast
   - Disable CSS
   - Test with color filters

4. **Cognitive Testing**
   - Clear instructions
   - Consistent navigation
   - Error recovery
   - No time limits

## Best Practices

### Do's
- ✅ Use semantic HTML
- ✅ Provide multiple ways to access content
- ✅ Write descriptive link text
- ✅ Include focus indicators
- ✅ Test with real users

### Don'ts
- ❌ Rely solely on color
- ❌ Use placeholder as label
- ❌ Auto-play media
- ❌ Create keyboard traps
- ❌ Ignore automated test results

## Resources

### Tools
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools
- [pa11y](https://pa11y.org/) - Command line tool
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Color contrast

### Documentation
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Quick reference
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - Design patterns
- [WebAIM](https://webaim.org/) - Resources and articles
- [A11y Project](https://www.a11yproject.com/) - Checklist and resources

## Conclusion

Implementing these accessibility features will ensure the Beyond Solutions landing page is usable by everyone, regardless of their abilities. Remember that accessibility is not a one-time task but an ongoing commitment to inclusive design. 