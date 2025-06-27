/**
 * Accessibility Module
 * Implements WCAG 2.1 AA compliance features
 */

class AccessibilityManager {
  constructor() {
    this.focusTrap = null;
    this.announcer = null;
    this.keyboardNav = null;
    this.init();
  }

  init() {
    this.createAnnouncer();
    this.setupKeyboardNavigation();
    this.enhanceFormsAccessibility();
    this.setupSkipLinks();
    this.initializeColorScheme();
  }

  // Create live region announcer
  createAnnouncer() {
    // Status announcer
    const statusAnnouncer = document.createElement('div');
    statusAnnouncer.setAttribute('role', 'status');
    statusAnnouncer.setAttribute('aria-live', 'polite');
    statusAnnouncer.setAttribute('aria-atomic', 'true');
    statusAnnouncer.className = 'sr-only';
    statusAnnouncer.id = 'status-announcer';
    document.body.appendChild(statusAnnouncer);

    // Alert announcer
    const alertAnnouncer = document.createElement('div');
    alertAnnouncer.setAttribute('role', 'alert');
    alertAnnouncer.setAttribute('aria-live', 'assertive');
    alertAnnouncer.setAttribute('aria-atomic', 'true');
    alertAnnouncer.className = 'sr-only';
    alertAnnouncer.id = 'alert-announcer';
    document.body.appendChild(alertAnnouncer);

    this.announcer = {
      status: statusAnnouncer,
      alert: alertAnnouncer
    };
  }

  // Announce status messages
  announceStatus(message) {
    this.announcer.status.textContent = message;
    setTimeout(() => {
      this.announcer.status.textContent = '';
    }, 1000);
  }

  // Announce alerts
  announceAlert(message) {
    this.announcer.alert.textContent = message;
  }

  // Setup keyboard navigation
  setupKeyboardNavigation() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Skip to main content (Alt + M)
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const main = document.querySelector('#main-content, main, [role="main"]');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Skip to calculator (Alt + C)
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        const calculator = document.querySelector('#calculator, .calculator-container');
        if (calculator) {
          calculator.focus();
          calculator.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Help dialog (Alt + H)
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        this.showKeyboardHelp();
      }
    });

    // Enhance tab navigation
    this.enhanceTabNavigation();
  }

  // Enhance tab navigation order
  enhanceTabNavigation() {
    // Set proper tabindex for interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, [role="button"], [tabindex]'
    );

    interactiveElements.forEach(element => {
      // Skip disabled elements
      if (element.disabled || element.getAttribute('aria-disabled') === 'true') {
        element.setAttribute('tabindex', '-1');
      }

      // Ensure buttons and links are keyboard accessible
      if ((element.tagName === 'A' || element.tagName === 'BUTTON') && !element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
    });
  }

  // Setup skip links
  setupSkipLinks() {
    const skipLinksHTML = `
      <div class="skip-links">
        <a href="#main-nav" class="skip-link">Skip to navigation</a>
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <a href="#calculator" class="skip-link">Skip to calculator</a>
      </div>
    `;

    // Insert at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', skipLinksHTML);

    // Add CSS if not exists
    if (!document.querySelector('#skip-links-style')) {
      const style = document.createElement('style');
      style.id = 'skip-links-style';
      style.textContent = `
        .skip-link {
          position: absolute;
          left: -9999px;
          z-index: 9999;
          padding: 0.5rem 1rem;
          background-color: #000;
          color: #fff;
          text-decoration: none;
          border-radius: 0 0 0.25rem 0.25rem;
        }

        .skip-link:focus {
          left: 0;
          top: 0;
        }

        /* Ensure focus is visible */
        *:focus {
          outline: 3px solid #3B82F6 !important;
          outline-offset: 2px !important;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          *:focus {
            outline-width: 4px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Enhance forms accessibility
  enhanceFormsAccessibility() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Add ARIA labels to inputs without labels
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        // Check if input has a label
        if (!input.labels || input.labels.length === 0) {
          // Try to find label by placeholder or name
          const placeholder = input.placeholder;
          const name = input.name;
          
          if (placeholder) {
            input.setAttribute('aria-label', placeholder);
          } else if (name) {
            input.setAttribute('aria-label', name.replace(/([A-Z])/g, ' $1').trim());
          }
        }

        // Add aria-required for required fields
        if (input.required) {
          input.setAttribute('aria-required', 'true');
        }

        // Add aria-invalid for validation
        input.addEventListener('blur', () => {
          if (input.validity && !input.validity.valid) {
            input.setAttribute('aria-invalid', 'true');
          } else {
            input.setAttribute('aria-invalid', 'false');
          }
        });
      });

      // Enhance form submission
      form.addEventListener('submit', (e) => {
        const isValid = this.validateForm(form);
        if (!isValid) {
          e.preventDefault();
        }
      });
    });
  }

  // Validate form with accessibility feedback
  validateForm(form) {
    const errors = [];
    const inputs = form.querySelectorAll('[required], [aria-required="true"]');

    inputs.forEach(input => {
      if (!input.value || (input.validity && !input.validity.valid)) {
        errors.push({
          field: input,
          message: this.getErrorMessage(input)
        });
      }
    });

    if (errors.length > 0) {
      // Announce errors
      this.announceAlert(`Form has ${errors.length} error${errors.length > 1 ? 's' : ''}`);

      // Show errors
      errors.forEach(error => {
        error.field.setAttribute('aria-invalid', 'true');
        
        // Create or update error message
        let errorId = error.field.id + '-error';
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
          errorElement = document.createElement('span');
          errorElement.id = errorId;
          errorElement.className = 'error-message text-red-600 text-sm mt-1';
          errorElement.setAttribute('role', 'alert');
          error.field.parentElement.appendChild(errorElement);
        }
        
        errorElement.textContent = error.message;
        error.field.setAttribute('aria-describedby', errorId);
      });

      // Focus first error
      errors[0].field.focus();
      return false;
    }

    return true;
  }

  // Get appropriate error message
  getErrorMessage(input) {
    const label = input.labels?.[0]?.textContent || input.getAttribute('aria-label') || input.name;
    
    if (input.validity) {
      if (input.validity.valueMissing) {
        return `${label} is required`;
      }
      if (input.validity.typeMismatch) {
        return `Please enter a valid ${input.type}`;
      }
      if (input.validity.tooShort) {
        return `${label} must be at least ${input.minLength} characters`;
      }
      if (input.validity.tooLong) {
        return `${label} must be no more than ${input.maxLength} characters`;
      }
      if (input.validity.rangeUnderflow) {
        return `${label} must be at least ${input.min}`;
      }
      if (input.validity.rangeOverflow) {
        return `${label} must be no more than ${input.max}`;
      }
      if (input.validity.patternMismatch) {
        return `${label} format is invalid`;
      }
    }
    
    return `${label} is invalid`;
  }

  // Focus trap for modals
  createFocusTrap(element) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    const focusableElements = element.querySelectorAll(focusableSelectors.join(','));
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Store current focus
    const previouslyFocused = document.activeElement;

    // Focus first element
    firstFocusable?.focus();

    // Handle tab key
    const handleKeydown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      } else if (e.key === 'Escape') {
        this.deactivateFocusTrap();
      }
    };

    element.addEventListener('keydown', handleKeydown);

    this.focusTrap = {
      element,
      handleKeydown,
      previouslyFocused
    };
  }

  // Deactivate focus trap
  deactivateFocusTrap() {
    if (this.focusTrap) {
      this.focusTrap.element.removeEventListener('keydown', this.focusTrap.handleKeydown);
      this.focusTrap.previouslyFocused?.focus();
      this.focusTrap = null;
    }
  }

  // Show keyboard help dialog
  showKeyboardHelp() {
    const helpDialog = document.createElement('div');
    helpDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    helpDialog.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" role="dialog" aria-labelledby="help-title">
        <h2 id="help-title" class="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
        <ul class="space-y-2">
          <li><kbd class="px-2 py-1 bg-gray-200 rounded">Alt + M</kbd> - Skip to main content</li>
          <li><kbd class="px-2 py-1 bg-gray-200 rounded">Alt + C</kbd> - Skip to calculator</li>
          <li><kbd class="px-2 py-1 bg-gray-200 rounded">Alt + H</kbd> - Show this help</li>
          <li><kbd class="px-2 py-1 bg-gray-200 rounded">Tab</kbd> - Navigate forward</li>
          <li><kbd class="px-2 py-1 bg-gray-200 rounded">Shift + Tab</kbd> - Navigate backward</li>
          <li><kbd class="px-2 py-1 bg-gray-200 rounded">Enter</kbd> - Activate buttons/links</li>
          <li><kbd class="px-2 py-1 bg-gray-200 rounded">Space</kbd> - Check/uncheck boxes</li>
          <li><kbd class="px-2 py-1 bg-gray-200 rounded">Esc</kbd> - Close dialogs</li>
        </ul>
        <button class="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onclick="this.closest('.fixed').remove()">
          Close
        </button>
      </div>
    `;

    document.body.appendChild(helpDialog);
    this.createFocusTrap(helpDialog.firstElementChild);

    // Remove on click outside
    helpDialog.addEventListener('click', (e) => {
      if (e.target === helpDialog) {
        helpDialog.remove();
        this.deactivateFocusTrap();
      }
    });
  }

  // Initialize color scheme preferences
  initializeColorScheme() {
    // Check for user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    // Apply appropriate theme
    if (prefersHighContrast) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    } else if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Listen for changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!document.documentElement.hasAttribute('data-theme-manual')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  // Make element accessible
  makeAccessible(element, options = {}) {
    const {
      role,
      label,
      description,
      live,
      atomic,
      relevant
    } = options;

    if (role) element.setAttribute('role', role);
    if (label) element.setAttribute('aria-label', label);
    if (description) element.setAttribute('aria-describedby', description);
    if (live) element.setAttribute('aria-live', live);
    if (atomic !== undefined) element.setAttribute('aria-atomic', atomic);
    if (relevant) element.setAttribute('aria-relevant', relevant);

    return element;
  }
}

// Initialize accessibility features when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
  });
} else {
  window.accessibilityManager = new AccessibilityManager();
}

// Export for use in other modules
export default AccessibilityManager; 