/**
 * Beyond Solutions - Script Principal
 * Inicializa todos los componentes del sitio incluyendo el sistema de i18n
 */

import { initI18n, changeLanguage, t, isRTL } from './i18n.js';
import { initLanguageSelector } from './language-selector.js';
import i18nService from './modules/i18n.js';
import ThemeService from './modules/theme.js';
import A11yEnhancements from './modules/a11y-enhancements.js';
import NavigationTiming from './modules/navigation-timing.js';
import Security from './modules/security.js';

// Expose functions globally for Alpine.js and inline scripts
window.t = t;
window.changeLanguage = changeLanguage;
window.isRTL = isRTL;
window.initLanguageSelector = initLanguageSelector;
window.initComponents = initComponents;

// Initialize the i18n state store for Alpine.js
document.addEventListener('alpine:init', () => {
  Alpine.store('i18n', {
    ready: false,
    revision: 0,
    timestamp: Date.now(),
  });
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('DOM content loaded, initializing application...');

    // Mark as initializing if the global flag doesn't exist yet
    if (typeof window.i18nInitializing === 'undefined') {
      window.i18nInitializing = true;
    }

    const i18nInstance = await initI18n({
      basePath: './i18n',
      defaultLanguage: 'es',
      fallbackLanguage: 'en',
      debug: false,
    });

    window.i18n = i18nInstance;

    // Replace placeholder functions with real ones
    window.t = i18nInstance.t;

    // Update theme color meta tag for mobile browsers
    updateThemeColorMeta();

    // Mark initialization as complete and dispatch ready event
    setTimeout(() => {
      // Signal that i18n is fully initialized
      window.i18nInitializing = false;
      window.i18nFullyInitialized = true;
      window.i18n = i18nInstance; // Ensure i18n is available globally

      // Notify Alpine that i18n is ready
      Alpine.store('i18n', {
        ready: true,
        revision: (Alpine.store('i18n').revision || 0) + 1,
        timestamp: Date.now(),
      });

      console.log('[main.js] i18n fully initialized, dispatching ready event');

      // Dispatch the i18n:ready event
      document.dispatchEvent(
        new CustomEvent('i18n:ready', {
          detail: {
            language: i18nInstance.getCurrentLanguage(),
            isInitialLoad: true,
          },
        }),
      );
    }, 100); // Short delay to ensure everything is processed

    // For index.html, initialize components directly.
    // For calculator.html, initialization is handled by x-init.
    if (document.querySelector('#about')) {
      await Alpine.nextTick();
      initLanguageSelector();
      initComponents();
    } else {
      // For other pages, ensure language selector is still initialized
      await Alpine.nextTick();
      initLanguageSelector();
    }

    // Listen for subsequent language changes to trigger re-translation
    document.addEventListener('i18n:languageChanged', () => {
      Alpine.store('i18n', {
        ready: true,
        revision: (Alpine.store('i18n').revision || 0) + 1,
        timestamp: Date.now(),
      });
    });

    console.log('Beyond Solutions - Initialization complete');
  } catch (error) {
    console.error('Application initialization failed:', error);

    // Ensure we don't stay in initializing state if there was an error
    window.i18nInitializing = false;
  }
});

/**
 * Updates the theme-color meta tag based on the current color scheme
 */
function updateThemeColorMeta() {
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }

  // Set theme color based on current color scheme
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  themeColorMeta.content = isDarkMode ? '#192525' : '#334b4e';

  // Add event listener for color scheme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    themeColorMeta.content = e.matches ? '#192525' : '#334b4e';
  });
}

/**
 * Inicializa los componentes de la aplicación
 */
function initComponents() {
  // Initialize AOS (Animate on Scroll)
  if (window.AOS) {
    AOS.init({
      once: true,
      duration: 600,
      offset: 100,
      delay: 0,
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
  }

  // Refresh AOS on language change because content dimensions might change
  document.addEventListener('i18n:languageChanged', () => {
    if (window.AOS) {
      window.AOS.refresh();
    }
  });
}

/**
 * Inicializa un observador de mutaciones para traducir elementos dinámicos
 */
function initMutationObserver() {
  // La lógica ahora está en i18n.js y se llama desde initI18n
  if (options.debug) {
    console.log('[main] initMutationObserver ya no es necesario aquí.');
  }
}

// Exportar funciones para uso global si se importa como módulo
export { initI18n, changeLanguage, t, isRTL };

// Initialize i18n service
i18nService.init();

// Expose i18n globally for Alpine components
window.i18n = i18nService;
window.t = i18nService.t.bind(i18nService);

// Initialize navigation timing
window.navigationTiming = new NavigationTiming();
window.navigationTiming.init();

// Initialize security features
window.Security = Security;

// Theme toggle functionality
// ... existing code ...
