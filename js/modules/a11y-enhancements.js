/**
 * Accessibility Enhancements Module
 * @module A11yEnhancements
 */

class A11yEnhancements {
  constructor() {
    this.focusTrapStack = [];
    this.announcer = null;
  }
  
  init() {
    // Create screen reader announcer
    this.createAnnouncer();
    
    // Add skip links
    this.addSkipLinks();
    
    // Enhance keyboard navigation
    this.enhanceKeyboardNav();
    
    // Add focus indicators
    this.enhanceFocusIndicators();
    
    // Initialize ARIA live regions
    this.initializeLiveRegions();
  }
  
  createAnnouncer() {
    this.announcer = document.createElement('div');
    this.announcer.className = 'sr-only';
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.announcer);
  }
  
  announce(message, priority = 'polite') {
    if (this.announcer) {
      this.announcer.setAttribute('aria-live', priority);
      this.announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        this.announcer.textContent = '';
      }, 1000);
    }
  }
  
  addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'sr-only focus:not-sr-only absolute top-0 left-0 bg-primary-800 text-white p-2 m-2 rounded';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  enhanceKeyboardNav() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt + 1: Go to main content
      if (e.altKey && e.key === '1') {
        const main = document.querySelector('main');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        const event = new CustomEvent('escapePressed');
        window.dispatchEvent(event);
      }
    });
  }
  
  enhanceFocusIndicators() {
    // Add focus-visible polyfill behavior
    document.addEventListener('keydown', () => {
      document.body.classList.add('keyboard-nav');
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }
  
  initializeLiveRegions() {
    // Find all elements with aria-live and ensure they're properly configured
    const liveRegions = document.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => {
      if (!region.hasAttribute('aria-atomic')) {
        region.setAttribute('aria-atomic', 'true');
      }
    });
  }
  
  // Focus trap management
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    const trapHandler = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', trapHandler);
    this.focusTrapStack.push({ element, handler: trapHandler });
    
    // Focus first element
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
  
  releaseFocus() {
    const trap = this.focusTrapStack.pop();
    if (trap) {
      trap.element.removeEventListener('keydown', trap.handler);
    }
  }
}

export default A11yEnhancements; 