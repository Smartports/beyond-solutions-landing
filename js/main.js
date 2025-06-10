/**
 * Beyond Solutions - Script Principal
 * Inicializa todos los componentes del sitio incluyendo el sistema de i18n
 */

import { initI18n, changeLanguage, t, isRTL } from './i18n.js';
import { initLanguageSelector } from './language-selector.js';

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Inicializar el sistema de i18n
    const i18nInstance = await initI18n({
      basePath: '/i18n',
      defaultLanguage: 'es',
      fallbackLanguage: 'en',
      debug: false // Cambiar a true para depuración
    });
    
    // Inicializar el selector de idiomas
    initLanguageSelector();
    
    // Inicializar componentes que dependan de i18n
    initComponents();
    
    // Observador para elementos dinámicos que requieran traducción
    initMutationObserver();
    
    console.log('Beyond Solutions - Inicialización completada');
  } catch (error) {
    console.error('Error durante la inicialización:', error);
  }
});

/**
 * Inicializa los componentes de la aplicación
 */
function initComponents() {
  // AOS (Animate on Scroll) debe reiniciarse después de cambios de idioma
  document.addEventListener('i18n:languageChanged', () => {
    if (window.AOS) {
      window.AOS.refresh();
    }
  });
  
  // Otros inicializadores de componentes pueden agregarse aquí
}

/**
 * Inicializa un observador de mutaciones para traducir elementos dinámicos
 */
function initMutationObserver() {
  // Observar cambios en el DOM para traducir elementos dinámicos
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          // Verificar si el nodo es un elemento y tiene atributos data-i18n
          if (node.nodeType === 1 && node.hasAttribute) {
            if (node.hasAttribute('data-i18n')) {
              const key = node.getAttribute('data-i18n');
              node.textContent = t(key, {}, node.textContent);
            }
            
            // Buscar elementos hijos con atributos data-i18n
            const childElements = node.querySelectorAll('[data-i18n]');
            childElements.forEach(el => {
              const key = el.getAttribute('data-i18n');
              el.textContent = t(key, {}, el.textContent);
            });
          }
        });
      }
    });
  });
  
  // Configurar el observador para observar todo el cuerpo del documento
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Exportar funciones para uso global
export {
  initI18n,
  changeLanguage,
  t,
  isRTL
}; 