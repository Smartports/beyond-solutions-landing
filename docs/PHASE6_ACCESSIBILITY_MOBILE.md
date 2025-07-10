# Phase 6: Accessibility & Mobile Optimization Plan

## Overview

This document outlines the implementation plan for the final 5% of the Beyond Solutions project, focusing on WCAG 2.1 AA compliance and mobile optimization.

## 1. Accessibility Implementation (WCAG 2.1 AA)

### 1.1 Keyboard Navigation

**Priority: HIGH**

#### Current Issues:

- 3D viewer lacks keyboard controls
- Modal dialogs don't trap focus
- Tab order is not logical in some sections
- Skip links are missing

#### Implementation Tasks:

```javascript
// 1. Add skip links to calculator-gamified.html
<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>
<a href="#calculator" class="sr-only focus:not-sr-only">Skip to calculator</a>

// 2. Implement focus trap for modals
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  );
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// 3. Add keyboard controls to 3D viewer
const keyboardControls = {
  'ArrowUp': () => camera.position.y += 10,
  'ArrowDown': () => camera.position.y -= 10,
  'ArrowLeft': () => camera.alpha += 0.1,
  'ArrowRight': () => camera.alpha -= 0.1,
  '+': () => camera.radius -= 10,
  '-': () => camera.radius += 10,
  'r': () => resetCamera(),
  'h': () => showKeyboardHelp()
};
```

### 1.2 ARIA Labels and Live Regions

**Priority: HIGH**

#### Implementation:

```javascript
// 1. Add ARIA labels to all interactive elements
<button aria-label="Calculate solar savings" aria-describedby="calc-help">
  Calculate
</button>

// 2. Implement live regions for dynamic updates
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  <span id="calculation-status"></span>
</div>

// 3. Add ARIA attributes to custom components
<div role="progressbar"
     aria-valuenow="75"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Experience points progress">
  <div class="progress-fill" style="width: 75%"></div>
</div>

// 4. Announce phase changes
function announcePhaseChange(phase) {
  const liveRegion = document.getElementById('phase-announcer');
  liveRegion.textContent = `Now in ${phase.name}. ${phase.description}`;
}
```

### 1.3 Color Contrast Improvements

**Priority: MEDIUM**

#### Issues to Fix:

- Gray text on white background (3.8:1 ratio, needs 4.5:1)
- Blue links on dark backgrounds
- Disabled button states

#### CSS Updates:

```css
/* Update text colors for better contrast */
.text-gray-500 {
  color: #4b5563;
} /* Changed from #6B7280 */
.text-gray-400 {
  color: #374151;
} /* Changed from #9CA3AF */

/* Fix link colors on dark backgrounds */
.dark a {
  color: #60a5fa;
} /* Light blue with 4.6:1 ratio */

/* Improve disabled states */
button:disabled {
  background-color: #e5e7eb;
  color: #374151;
  border: 2px dashed #9ca3af;
}

/* Add focus indicators */
*:focus {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid currentColor;
  }
  .button {
    border: 2px solid currentColor;
  }
}
```

### 1.4 Screen Reader Optimization

**Priority: HIGH**

#### Implementation:

```javascript
// 1. Add descriptive text for complex UI elements
<div role="img" aria-label="3D terrain visualization showing a 5000m² plot with 15° slope facing south">
  <canvas id="babylon-canvas"></canvas>
</div>

// 2. Provide text alternatives for charts
<div id="financial-chart" role="img" aria-label="Financial projection chart showing ROI of 25% over 5 years">
  <canvas></canvas>
  <button onclick="showChartData()">View as table</button>
</div>

// 3. Create accessible data tables
function createAccessibleTable(data) {
  return `
    <table role="table" aria-label="Financial projections">
      <caption>5-year financial projection for solar installation</caption>
      <thead>
        <tr>
          <th scope="col">Year</th>
          <th scope="col">Investment</th>
          <th scope="col">Savings</th>
          <th scope="col">ROI</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <th scope="row">${row.year}</th>
            <td>${formatCurrency(row.investment)}</td>
            <td>${formatCurrency(row.savings)}</td>
            <td>${formatPercent(row.roi)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
```

## 2. Mobile Optimization

### 2.1 Touch Controls for 3D Viewer

**Priority: HIGH**

```javascript
// Implement touch gestures
let touchStartX = 0;
let touchStartY = 0;
let initialDistance = 0;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    initialDistance = getDistance(e.touches[0], e.touches[1]);
  }
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (e.touches.length === 1) {
    // Rotate camera
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    camera.alpha += deltaX * 0.01;
    camera.beta += deltaY * 0.01;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    // Pinch to zoom
    const distance = getDistance(e.touches[0], e.touches[1]);
    const scale = distance / initialDistance;

    camera.radius = Math.max(50, Math.min(500, camera.radius / scale));
    initialDistance = distance;
  }
});

// Add touch-friendly controls
const mobileControls = `
  <div class="fixed bottom-4 right-4 flex flex-col gap-2 md:hidden">
    <button onclick="zoomIn()" class="p-4 bg-blue-500 rounded-full">
      <svg><!-- Zoom in icon --></svg>
    </button>
    <button onclick="zoomOut()" class="p-4 bg-blue-500 rounded-full">
      <svg><!-- Zoom out icon --></svg>
    </button>
    <button onclick="resetView()" class="p-4 bg-gray-500 rounded-full">
      <svg><!-- Reset icon --></svg>
    </button>
  </div>
`;
```

### 2.2 Responsive Layout Improvements

**Priority: MEDIUM**

```css
/* Mobile-first responsive design */
@media (max-width: 640px) {
  /* Stack phases vertically on mobile */
  .phases-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  /* Full-width cards */
  .card {
    margin: 0;
    border-radius: 0;
  }

  /* Larger touch targets */
  button,
  a,
  input,
  select {
    min-height: 44px;
    min-width: 44px;
  }

  /* Simplified navigation */
  .desktop-nav {
    display: none;
  }
  .mobile-nav {
    display: block;
  }

  /* Optimized charts for mobile */
  .chart-container {
    height: 250px;
    overflow-x: auto;
  }

  /* Stack financial KPIs */
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  .phases-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .sidebar {
    position: static;
    width: 100%;
  }
}
```

### 2.3 Performance Optimization for Mobile

**Priority: HIGH**

```javascript
// 1. Lazy load heavy modules on mobile
if (window.innerWidth < 768) {
  // Defer 3D viewer loading
  const load3DViewer = () => {
    import('./modules/viewer3d.js').then((module) => {
      module.init({ lowQuality: true });
    });
  };

  // Load on user interaction
  document.getElementById('show-3d').addEventListener('click', load3DViewer, { once: true });
}

// 2. Reduce texture quality on mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const textureQuality = isMobile ? 'low' : 'high';

// 3. Implement adaptive loading
const getOptimalImageFormat = () => {
  if (!supportsWebP()) return 'jpg';
  if (connection.effectiveType === '2g') return 'jpg';
  return 'webp';
};

// 4. Reduce particle count on mobile
const particleCount = isMobile ? 50 : 200;
```

### 2.4 Mobile-Specific Features

**Priority: LOW**

```javascript
// 1. Add haptic feedback
function vibrateOnAction() {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

// 2. Implement pull-to-refresh
let pullDistance = 0;
const pullThreshold = 100;

document.addEventListener('touchmove', (e) => {
  if (window.scrollY === 0 && e.touches[0].clientY > 0) {
    pullDistance = e.touches[0].clientY;
    if (pullDistance > pullThreshold) {
      showRefreshIndicator();
    }
  }
});

// 3. Add native share functionality
async function shareResults() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Solar Project Analysis',
        text: `ROI: ${roi}%, Payback: ${payback} years`,
        url: window.location.href,
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  }
}
```

## 3. Implementation Timeline

### Week 1: Accessibility Foundation

- [ ] Day 1-2: Implement keyboard navigation
- [ ] Day 3-4: Add ARIA labels and live regions
- [ ] Day 5: Fix color contrast issues

### Week 2: Mobile Optimization

- [ ] Day 1-2: Implement touch controls for 3D viewer
- [ ] Day 3-4: Responsive layout improvements
- [ ] Day 5: Performance optimization for mobile

### Week 3: Testing and Polish

- [ ] Day 1-2: Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Day 3: Mobile device testing
- [ ] Day 4: Cross-browser testing
- [ ] Day 5: Final adjustments and documentation

## 4. Testing Checklist

### Accessibility Testing

- [ ] Keyboard navigation works for all interactive elements
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] No keyboard traps
- [ ] Error messages are announced
- [ ] Form labels are associated correctly

### Mobile Testing

- [ ] Touch gestures work smoothly
- [ ] Tap targets are at least 44x44px
- [ ] Content is readable without horizontal scrolling
- [ ] Pinch-to-zoom works
- [ ] Performance is acceptable on 3G
- [ ] Forms are easy to fill on mobile
- [ ] Modals are properly sized

### Device Testing Matrix

- [ ] iPhone 12/13/14 (Safari)
- [ ] Samsung Galaxy S21/S22 (Chrome)
- [ ] iPad Pro (Safari)
- [ ] Android Tablet (Chrome)
- [ ] Desktop Chrome/Firefox/Safari/Edge

## 5. Success Metrics

### Accessibility

- [ ] WAVE tool shows 0 errors
- [ ] axe DevTools shows 0 violations
- [ ] Lighthouse Accessibility score > 95
- [ ] Manual screen reader testing passes

### Mobile

- [ ] Lighthouse Mobile Performance > 90
- [ ] Touch interactions feel native
- [ ] No horizontal scrolling
- [ ] All features work on mobile

## 6. Documentation Updates

### Files to Update:

1. `README.md` - Add accessibility features section
2. `docs/ACCESSIBILITY_GUIDE.md` - Create comprehensive guide
3. `docs/MOBILE_OPTIMIZATION.md` - Document mobile features
4. `docs/KEYBOARD_SHORTCUTS.md` - List all keyboard controls

### Code Comments:

- Add inline comments for accessibility features
- Document touch gesture calculations
- Explain performance optimizations

## Conclusion

Completing Phase 6 will bring the Beyond Solutions project to 100% completion with:

- Full WCAG 2.1 AA compliance
- Excellent mobile user experience
- Native-like touch interactions
- Optimal performance on all devices

Estimated time to complete: 3 weeks
Final project completion: 100% 🎉
