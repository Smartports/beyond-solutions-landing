/**
 * Beyond Solutions - Script Principal
 * Inicializa todos los componentes del sitio incluyendo el sistema de i18n
 */

import { initI18n, changeLanguage, t, isRTL } from './i18n.js';
import { initLanguageSelector } from './language-selector.js';

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
        timestamp: Date.now()
    });
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('DOM content loaded, initializing application...');

    const i18nInstance = await initI18n({
      basePath: './i18n',
      defaultLanguage: 'es',
      fallbackLanguage: 'en',
      debug: false
    });

    window.i18n = i18nInstance;

    // Notify Alpine that i18n is ready.
    Alpine.store('i18n', {
      ready: true,
      revision: (Alpine.store('i18n').revision || 0) + 1,
      timestamp: Date.now()
    });
    
    // For index.html, initialize components directly.
    // For calculator.html, initialization is handled by x-init.
    if (document.querySelector('#about')) {
      await Alpine.nextTick();
      initLanguageSelector();
      initComponents();
    }

    // Listen for subsequent language changes to trigger re-translation
    document.addEventListener('i18n:languageChanged', () => {
      Alpine.store('i18n', {
        ready: true,
        revision: (Alpine.store('i18n').revision || 0) + 1,
        timestamp: Date.now()
      });
    });

    console.log('Beyond Solutions - Initialization complete');
  } catch (error) {
    console.error('Application initialization failed:', error);
  }
});

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
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
      console.log("[main] initMutationObserver ya no es necesario aquí.");
  }
}

// Exportar funciones para uso global si se importa como módulo
export {
  initI18n,
  changeLanguage,
  t,
  isRTL
}; 