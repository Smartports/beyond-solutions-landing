/**
 * Phase 6 Integration Script
 * Connects accessibility and mobile optimization features to the calculator
 */

// Import modules
import AccessibilityManager from './accessibility.js';
import MobileOptimizer from './mobile-optimization.js';

// Wait for DOM and Alpine.js to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize accessibility and mobile features
  const a11y = new AccessibilityManager();
  const mobile = new MobileOptimizer();

  // Wait for Alpine to initialize
  if (window.Alpine) {
    initializePhase6Features(a11y, mobile);
  } else {
    document.addEventListener('alpine:init', () => {
      initializePhase6Features(a11y, mobile);
    });
  }
});

// Track retry attempts to prevent infinite loops
let retryCount = 0;
const MAX_RETRIES = 100; // Maximum 10 seconds (100 * 100ms)
let initializationComplete = false;

function initializePhase6Features(a11y, mobile) {
  // Prevent multiple initializations
  if (initializationComplete) {
    return;
  }

  // Detect current page type
  const currentPage = detectPageType();
  console.log(`🔧 Phase 6 initializing on page: ${currentPage}`);

  // Initialize based on page type
  switch (currentPage) {
    case 'calculator-gamified':
      initializeGamifiedCalculator(a11y, mobile);
      break;
    case 'calculator':
      initializeStandardCalculator(a11y, mobile);
      break;
    case 'dashboard':
      initializeDashboard(a11y, mobile);
      break;
    case 'wizard':
      initializeWizard(a11y, mobile);
      break;
    default:
      initializeGenericPage(a11y, mobile);
      break;
  }
}

function detectPageType() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';

  if (filename.includes('calculator-gamified')) return 'calculator-gamified';
  if (filename.includes('calculator')) return 'calculator';
  if (filename.includes('dashboard')) return 'dashboard';
  if (filename.includes('wizard')) return 'wizard';
  if (filename.includes('test-phase6')) return 'test-phase6';

  return 'generic';
}

function initializeGamifiedCalculator(a11y, mobile) {
  // Check if Alpine.js is loaded first
  if (!window.Alpine) {
    console.log('⏳ Waiting for Alpine.js to load...');
    setTimeout(() => initializeGamifiedCalculator(a11y, mobile), 100);
    return;
  }

  // Wait for Alpine to be initialized
  const initializeWhenReady = () => {
    const calculatorElement = document.querySelector('[x-data="calculatorGamified"]');
    
    if (!calculatorElement) {
      console.log('⏳ Waiting for calculator element...');
      setTimeout(() => initializeGamifiedCalculator(a11y, mobile), 100);
      return;
    }

    // For CSP build, we can't access __x directly
    // Instead, we'll check if the element has been processed by Alpine
    const isAlpineInitialized = calculatorElement.hasAttribute('x-id') || 
                                 calculatorElement._x_dataStack || 
                                 calculatorElement.__x;

    if (!isAlpineInitialized) {
      console.log('⏳ Waiting for Alpine component to initialize...');
      
      // Set a timeout to prevent infinite waiting
      if (!window._phase6InitTimeout) {
        window._phase6InitTimeout = setTimeout(() => {
          console.warn(
            '⚠️ Alpine component initialization timeout. Initializing generic features only.',
          );
          initializeGenericPage(a11y, mobile);
        }, 10000);
      }
      
      setTimeout(() => initializeGamifiedCalculator(a11y, mobile), 100);
      return;
    }

    // Clear timeout if we got here
    if (window._phase6InitTimeout) {
      clearTimeout(window._phase6InitTimeout);
      delete window._phase6InitTimeout;
    }

    // Get calculator data - for CSP build, we can't directly access the data
    // So we'll work with the DOM elements instead
    const calculator = calculatorElement.__x ? calculatorElement.__x.data : null;

    // Initialize all gamified calculator features
    enhancePhaseNavigation(a11y);
    setupGameAnnouncements(a11y, calculator);
    enhance3DViewer(mobile);
    makeChartsAccessible(a11y);
    enhanceForms(a11y);
    setupMobileFeatures(mobile, calculator);

    initializationComplete = true;
    console.log('✅ Phase 6 features initialized for gamified calculator!');
  };

  // Start the initialization process
  initializeWhenReady();
}

function initializeStandardCalculator(a11y, mobile) {
  // Standard calculator doesn't need gamification features
  enhancePhaseNavigation(a11y);
  makeChartsAccessible(a11y);
  enhanceForms(a11y);
  setupGenericMobileFeatures(mobile);

  initializationComplete = true;
  console.log('✅ Phase 6 features initialized for standard calculator!');
}

function initializeDashboard(a11y, mobile) {
  // Dashboard-specific features
  enhanceForms(a11y);
  setupGenericMobileFeatures(mobile);
  enhanceProjectCards(a11y);

  initializationComplete = true;
  console.log('✅ Phase 6 features initialized for dashboard!');
}

function initializeWizard(a11y, mobile) {
  // Wizard-specific features
  enhancePhaseNavigation(a11y);
  enhanceForms(a11y);
  setupGenericMobileFeatures(mobile);

  initializationComplete = true;
  console.log('✅ Phase 6 features initialized for wizard!');
}

function initializeGenericPage(a11y, mobile) {
  // Generic page features (landing page, etc.)
  enhanceForms(a11y);
  setupGenericMobileFeatures(mobile);

  initializationComplete = true;
  console.log('✅ Phase 6 features initialized for generic page!');
}

function setupGenericMobileFeatures(mobile) {
  // Generic mobile features that don't require calculator context

  // Optimize images based on connection
  document.addEventListener('connection:slow', () => {
    document.querySelectorAll('img[data-low-src]').forEach((img) => {
      img.src = img.dataset.lowSrc;
    });
  });

  // Add native share for results
  const shareButton = document.querySelector('[data-share-results]');
  if (shareButton && navigator.share) {
    shareButton.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: 'Beyond Solutions - Real Estate Calculator',
          text: 'Check out this amazing real estate calculator',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or not supported');
      }
    });
  }

  console.log('✅ Generic mobile features setup complete');
}

function enhanceProjectCards(a11y) {
  // Enhance project cards on dashboard
  const projectCards = document.querySelectorAll(
    '[x-data*="dashboardData"] .project-card, .project-item',
  );

  projectCards.forEach((card, index) => {
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Project ${index + 1}`);

    // Add keyboard navigation
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const button = card.querySelector('button, a');
        if (button) button.click();
      }
    });
  });

  console.log('✅ Project cards enhanced with accessibility features');
}

// Enhance phase navigation with keyboard support
function enhancePhaseNavigation(a11y) {
  const phaseButtons = document.querySelectorAll('.phase-indicator, [x-on\\:click*="goToPhase"]');

  phaseButtons.forEach((button, index) => {
    // Add ARIA labels
    const phaseName = button.getAttribute('title') || `Phase ${index + 1}`;
    button.setAttribute('aria-label', `Navigate to ${phaseName}`);
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');

    // Add keyboard navigation
    button.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          button.click();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          const nextButton = phaseButtons[index + 1] || phaseButtons[0];
          nextButton.focus();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          const prevButton = phaseButtons[index - 1] || phaseButtons[phaseButtons.length - 1];
          prevButton.focus();
          break;
        case 'Home':
          e.preventDefault();
          phaseButtons[0].focus();
          break;
        case 'End':
          e.preventDefault();
          phaseButtons[phaseButtons.length - 1].focus();
          break;
      }
    });
  });

  // Add phase navigation shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      const phaseIndex = parseInt(e.key) - 1;
      if (phaseButtons[phaseIndex]) {
        phaseButtons[phaseIndex].click();
        phaseButtons[phaseIndex].focus();
      }
    }
  });
}

// Setup game announcements
function setupGameAnnouncements(a11y, calculator) {
  // Add safety check for calculator
  if (!calculator) {
    console.warn('⚠️ Calculator context not available for game announcements');
    return;
  }

  try {
    // Watch for XP changes
    let lastXP = calculator.currentXP || 0;

    const xpWatcher = setInterval(() => {
      try {
        if (calculator.currentXP !== lastXP) {
          const gained = calculator.currentXP - lastXP;
          if (gained > 0) {
            a11y.announceStatus(`You gained ${gained} experience points!`);
          }
          lastXP = calculator.currentXP;
        }
      } catch (error) {
        console.warn('Error in XP watcher:', error);
        clearInterval(xpWatcher);
      }
    }, 100);

    // Watch for level changes
    let lastLevel = calculator.playerLevel || 1;

    const levelWatcher = setInterval(() => {
      try {
        if (calculator.playerLevel !== lastLevel) {
          a11y.announceAlert(`Congratulations! You reached level ${calculator.playerLevel}!`);
          lastLevel = calculator.playerLevel;
        }
      } catch (error) {
        console.warn('Error in level watcher:', error);
        clearInterval(levelWatcher);
      }
    }, 100);

    // Watch for badge unlocks
    const unlockedBadges = new Set();
    if (calculator.recentBadges && Array.isArray(calculator.recentBadges)) {
      calculator.recentBadges.forEach((badge) => {
        if (badge && badge.id) {
          unlockedBadges.add(badge.id);
        }
      });
    }

    const badgeWatcher = setInterval(() => {
      try {
        if (calculator.recentBadges && Array.isArray(calculator.recentBadges)) {
          calculator.recentBadges.forEach((badge) => {
            if (badge && badge.id && badge.name && !unlockedBadges.has(badge.id)) {
              a11y.announceAlert(`Achievement unlocked: ${badge.name}!`);
              unlockedBadges.add(badge.id);
            }
          });
        }
      } catch (error) {
        console.warn('Error in badge watcher:', error);
        clearInterval(badgeWatcher);
      }
    }, 100);

    // Announce phase changes
    let currentPhase = calculator.currentPhase || 0;

    const phaseWatcher = setInterval(() => {
      try {
        if (calculator.currentPhase !== currentPhase) {
          const phase = calculator.phases && calculator.phases[calculator.currentPhase];
          if (phase && phase.name) {
            a11y.announceStatus(`Now in ${phase.name} phase`);
          }
          currentPhase = calculator.currentPhase;
        }
      } catch (error) {
        console.warn('Error in phase watcher:', error);
        clearInterval(phaseWatcher);
      }
    }, 100);

    console.log('✅ Game announcements setup complete');
  } catch (error) {
    console.error('Error setting up game announcements:', error);
  }
}

// Enhance 3D viewer with mobile controls
function enhance3DViewer(mobile) {
  // Wait for 3D viewer to be initialized
  const check3DViewer = setInterval(() => {
    const canvas = document.querySelector(
      '#viewer3d-canvas, #immersive-canvas, canvas[id*="babylon"]',
    );

    if (canvas) {
      clearInterval(check3DViewer);

      // Add mobile touch controls
      mobile.setup3DViewerTouch(canvas);

      // Add keyboard controls for desktop
      const keyControls = {
        ArrowUp: () => {
          if (window.viewer3DModule && window.viewer3DModule.camera) {
            window.viewer3DModule.camera.beta = Math.max(
              0.1,
              window.viewer3DModule.camera.beta - 0.1,
            );
          }
        },
        ArrowDown: () => {
          if (window.viewer3DModule && window.viewer3DModule.camera) {
            window.viewer3DModule.camera.beta = Math.min(
              Math.PI / 2 - 0.1,
              window.viewer3DModule.camera.beta + 0.1,
            );
          }
        },
        ArrowLeft: () => {
          if (window.viewer3DModule && window.viewer3DModule.camera) {
            window.viewer3DModule.camera.alpha -= 0.1;
          }
        },
        ArrowRight: () => {
          if (window.viewer3DModule && window.viewer3DModule.camera) {
            window.viewer3DModule.camera.alpha += 0.1;
          }
        },
        '+': () => {
          if (window.viewer3DModule && window.viewer3DModule.camera) {
            window.viewer3DModule.camera.radius *= 0.9;
          }
        },
        '-': () => {
          if (window.viewer3DModule && window.viewer3DModule.camera) {
            window.viewer3DModule.camera.radius *= 1.1;
          }
        },
        r: () => {
          if (window.viewer3DModule && typeof window.viewer3DModule.resetCamera === 'function') {
            window.viewer3DModule.resetCamera();
          }
        },
        d: () => {
          if (window.viewer3DModule && typeof window.viewer3DModule.toggleDayNight === 'function') {
            window.viewer3DModule.toggleDayNight();
          }
        },
        s: () => {
          if (
            window.viewer3DModule &&
            typeof window.viewer3DModule.enableSolarAnalysis === 'function'
          ) {
            window.viewer3DModule.enableSolarAnalysis();
          }
        },
        w: () => {
          if (
            window.viewer3DModule &&
            typeof window.viewer3DModule.enableWindAnalysis === 'function'
          ) {
            window.viewer3DModule.enableWindAnalysis();
          }
        },
      };

      canvas.setAttribute('tabindex', '0');
      canvas.setAttribute('role', 'application');
      canvas.setAttribute(
        'aria-label',
        '3D terrain viewer. Use arrow keys to rotate, plus/minus to zoom, R to reset, D for day/night, S for solar analysis, W for wind analysis',
      );

      canvas.addEventListener('keydown', (e) => {
        if (keyControls[e.key]) {
          e.preventDefault();
          keyControls[e.key]();
        }
      });

      console.log('✅ 3D viewer enhanced with mobile and keyboard controls');
    }
  }, 100);

  // Stop checking after 10 seconds
  setTimeout(() => clearInterval(check3DViewer), 10000);
}

// Make charts accessible
function makeChartsAccessible(a11y) {
  // Wait for charts to be rendered
  setTimeout(() => {
    const charts = document.querySelectorAll(
      'canvas[id*="chart"], .chart-container canvas, #projection-chart',
    );

    charts.forEach((canvas, index) => {
      // Add ARIA labels
      const chartType = canvas.id.includes('roi')
        ? 'ROI projection'
        : canvas.id.includes('cash')
          ? 'Cash flow'
          : canvas.id.includes('projection')
            ? 'Financial projection'
            : 'Financial data';

      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${chartType} chart. Press T to view as table.`);

      // Add keyboard handler to show data table
      canvas.setAttribute('tabindex', '0');
      canvas.addEventListener('keydown', (e) => {
        if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          showChartAsTable(canvas);
        }
      });

      // Add button to view as table
      const existingButton = canvas.parentElement.querySelector('.chart-table-button');
      if (!existingButton) {
        const button = document.createElement('button');
        button.className =
          'chart-table-button mt-2 text-sm text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer';
        button.textContent = 'View as table';
        button.onclick = () => showChartAsTable(canvas);

        canvas.parentElement.appendChild(button);
      }
    });

    console.log('✅ Charts enhanced with accessibility features');
  }, 1000);
}

// Show chart data as accessible table
function showChartAsTable(canvas) {
  // Get chart instance
  const chart = Chart.getChart?.(canvas);
  if (!chart) {
    // Fallback for when Chart.js is not available or chart not found
    showFallbackTable(canvas);
    return;
  }

  // Create table HTML
  const data = chart.data;
  const tableHTML = `
    <div class="chart-table-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chart Data Table</h2>
        <table class="w-full border-collapse" role="table">
          <caption class="sr-only">${canvas.getAttribute('aria-label')} data</caption>
          <thead>
            <tr>
              <th scope="col" class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">Period</th>
              ${data.datasets.map((ds) => `<th scope="col" class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">${ds.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.labels
              .map(
                (label, i) => `
              <tr>
                <th scope="row" class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">${label}</th>
                ${data.datasets.map((ds) => `<td class="border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white">${ds.data[i] || 'N/A'}</td>`).join('')}
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
        <button class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onclick="this.closest('.chart-table-modal').remove()">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', tableHTML);

  // Focus management
  const modal = document.querySelector('.chart-table-modal');
  const closeButton = modal.querySelector('button');
  closeButton.focus();

  // Trap focus
  if (window.accessibilityManager) {
    window.accessibilityManager.createFocusTrap(modal.firstElementChild);
  }

  // Close on escape
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      if (window.accessibilityManager) {
        window.accessibilityManager.deactivateFocusTrap();
      }
      canvas.focus();
    }
  });
}

function showFallbackTable(canvas) {
  const tableHTML = `
    <div class="chart-table-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chart Data</h2>
        <p class="text-gray-700 dark:text-gray-300 mb-4">Chart data is not available in table format at this time.</p>
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onclick="this.closest('.chart-table-modal').remove()">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', tableHTML);

  const modal = document.querySelector('.chart-table-modal');
  const closeButton = modal.querySelector('button');
  closeButton.focus();
}

// Enhance forms
function enhanceForms(a11y) {
  // Enhance all forms in the calculator
  const forms = document.querySelectorAll(
    '.calculator-form, form, [role="form"], [x-data*="calculator"]',
  );

  forms.forEach((form) => {
    // Add form landmark if missing
    if (!form.hasAttribute('role')) {
      form.setAttribute('role', 'form');
    }

    // Enhance inputs
    const inputs = form.querySelectorAll('input, select, textarea, button[type="button"]');
    inputs.forEach((input) => {
      // Add labels if missing
      if (!input.labels || input.labels.length === 0) {
        if (input.placeholder) {
          input.setAttribute('aria-label', input.placeholder);
        } else if (input.textContent && input.tagName === 'BUTTON') {
          input.setAttribute('aria-label', input.textContent.trim());
        }
      }

      // Add error message containers for inputs only
      if (input.tagName !== 'BUTTON' && !input.getAttribute('aria-describedby')) {
        const errorId = `${input.id || input.name || 'input'}-error-${Date.now()}`;
        const errorSpan = document.createElement('span');
        errorSpan.id = errorId;
        errorSpan.className = 'error-message text-red-600 text-sm mt-1 hidden';
        errorSpan.setAttribute('role', 'alert');
        errorSpan.setAttribute('aria-live', 'polite');

        input.setAttribute('aria-describedby', errorId);

        // Insert after the input or its immediate parent
        const insertAfter = input.parentElement.querySelector('.form-group')
          ? input.parentElement
          : input;
        insertAfter.parentElement.insertBefore(errorSpan, insertAfter.nextSibling);
      }
    });
  });

  console.log('✅ Forms enhanced with accessibility features');
}

// Setup mobile-specific features
function setupMobileFeatures(mobile, calculator) {
  // Only set up calculator-specific features if calculator is available
  if (calculator) {
    // Handle swipe gestures for phase navigation
    document.addEventListener('swipe:left', () => {
      if (calculator.phases && calculator.currentPhase !== undefined) {
        const nextPhase = calculator.currentPhase + 1;
        if (nextPhase < calculator.phases.length) {
          if (typeof calculator.goToPhase === 'function') {
            calculator.goToPhase(nextPhase);
          } else {
            calculator.currentPhase = nextPhase;
          }
        }
      }
    });

    document.addEventListener('swipe:right', () => {
      if (calculator.currentPhase !== undefined && calculator.currentPhase > 0) {
        const prevPhase = calculator.currentPhase - 1;
        if (typeof calculator.goToPhase === 'function') {
          calculator.goToPhase(prevPhase);
        } else {
          calculator.currentPhase = prevPhase;
        }
      }
    });
  }

  // Setup generic mobile features
  setupGenericMobileFeatures(mobile);

  console.log('✅ Mobile features setup complete');
}

// Export for testing
export { enhancePhaseNavigation, setupGameAnnouncements, enhance3DViewer, makeChartsAccessible };
