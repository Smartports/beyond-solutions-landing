/**
 * Componente Selector de Idiomas para Beyond Solutions
 * Permite a los usuarios cambiar entre los idiomas disponibles
 */

import { changeLanguage } from './i18n.js';

// Elemento contenedor global
let container = null;

/**
 * Inicializa el selector de idiomas
 * @param {Object} options - Opciones de configuración
 */
export function initLanguageSelector(options = {}) {
  // Configuración por defecto
  const settings = {
    containerSelector: '.language-selector',
    flagsPath: './i18n/flags/',
    ariaLabel: 'Seleccionar idioma',
    languages: [
      { code: 'es', name: 'Español', flag: 'es.svg' },
      { code: 'en', name: 'English', flag: 'en.svg' },
      { code: 'fr', name: 'Français', flag: 'fr.svg' },
      { code: 'de', name: 'Deutsch', flag: 'de.svg' },
      { code: 'it', name: 'Italiano', flag: 'it.svg' },
      { code: 'pt', name: 'Português', flag: 'pt.svg' },
      { code: 'zh', name: '中文', flag: 'cn.svg' },
      { code: 'ja', name: '日本語', flag: 'jp.svg' },
      { code: 'ko', name: '한국어', flag: 'kr.svg' },
      { code: 'ru', name: 'Русский', flag: 'ru.svg' },
      { code: 'ar', name: 'العربية', flag: 'ae.svg' },
      { code: 'sv', name: 'Svenska', flag: 'se.svg' },
      { code: 'nl', name: 'Nederlands', flag: 'nl.svg' },
      { code: 'pl', name: 'Polski', flag: 'pl.svg' },
      { code: 'tr', name: 'Türkçe', flag: 'tr.svg' },
      { code: 'hi', name: 'हिन्दी', flag: 'in.svg' },
      { code: 'vi', name: 'Tiếng Việt', flag: 'vn.svg' },
      { code: 'el', name: 'Ελληνικά', flag: 'gr.svg' }
    ],
    ...options
  };
  
  // Encontrar el contenedor
  container = document.querySelector(settings.containerSelector);
  if (!container) {
    console.error('Selector de idiomas: No se encontró el contenedor', settings.containerSelector);
    return;
  }
  
  console.log('[language-selector] Initializing language selector');
  
  // Renderizar el selector
  renderSelector(container, settings);
  
  // Agregar event listeners
  setupEventListeners(container, settings);
  
  // Actualizar el selector cuando cambie el idioma
  document.addEventListener('i18n:languageChanged', (e) => {
    console.log(`[language-selector] Language changed event received with language: ${e.detail?.newLanguage}`);
    updateSelectedLanguage(container, e.detail?.newLanguage || window.i18n?.getCurrentLanguage?.() || localStorage.getItem('beyondLocale'), settings);
  });
  
  // Also handle the i18n:ready event
  document.addEventListener('i18n:ready', (e) => {
    console.log('[language-selector] i18n:ready event received');
    const currentLang = window.i18n?.getCurrentLanguage?.() || localStorage.getItem('beyondLocale') || 'es';
    updateSelectedLanguage(container, currentLang, settings);
  });
  
  // Force update the selected language on initialization
  setTimeout(() => {
    const currentLang = window.i18n?.getCurrentLanguage?.() || localStorage.getItem('beyondLocale') || 'es';
    console.log(`[language-selector] Force updating language selector to: ${currentLang}`);
    updateSelectedLanguage(container, currentLang, settings);
  }, 500);
  
  return {
    getContainer: () => container,
    updateLanguages: (languages) => {
      settings.languages = languages;
      renderSelector(container, settings);
    },
    refreshLanguage: () => {
      const currentLang = window.i18n?.getCurrentLanguage?.() || localStorage.getItem('beyondLocale') || 'es';
      updateSelectedLanguage(container, currentLang, settings);
    }
  };
}

/**
 * Renderiza el selector de idiomas
 * @param {HTMLElement} container - Elemento contenedor
 * @param {Object} settings - Configuración del selector
 */
function renderSelector(container, settings) {
  // Determinar el idioma actual
  const currentLang = window.i18n?.getCurrentLanguage?.() || 
                     localStorage.getItem('beyondLocale') || 
                     document.documentElement.lang || 
                     'es';
  
  console.log(`[language-selector] Rendering selector with current language: ${currentLang}`);
  
  // Encontrar los datos del idioma actual
  const currentLanguage = settings.languages.find(lang => lang.code === currentLang) || 
                         settings.languages.find(lang => lang.code === 'es');
  
  // Crear el HTML del selector
  container.innerHTML = `
    <button 
      id="language-dropdown-toggle"
      class="flex items-center gap-2 px-3 py-2 rounded bg-gray-50 dark:bg-primary-800 hover:bg-gray-100 dark:hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-700"
      aria-haspopup="true"
      aria-expanded="false"
      aria-controls="language-dropdown"
      aria-label="${settings.ariaLabel}"
    >
      <span class="flex items-center gap-2">
        <img src="${settings.flagsPath}${currentLanguage.flag}" width="20" height="15" alt="Flag of ${currentLanguage.name} (${currentLanguage.code})" class="rounded-sm">
        <span class="hidden sm:inline">${currentLanguage.name}</span>
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    <div 
      id="language-dropdown"
      class="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-primary-900 ring-1 ring-black ring-opacity-5 focus:outline-none p-2 space-y-1 hidden"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="language-dropdown-toggle"
    >
      <ul class="py-1">
        ${settings.languages.map(lang => `
          <li>
            <button 
              type="button"
              class="w-full text-left px-4 py-2 text-sm rounded-md flex items-center gap-2 ${lang.code === currentLang ? 'bg-primary-100 dark:bg-primary-800 font-medium' : 'hover:bg-gray-50 dark:hover:bg-primary-800'}"
              role="menuitem"
              data-lang="${lang.code}"
              aria-current="${lang.code === currentLang ? 'true' : 'false'}"
            >
              <img src="${settings.flagsPath}${lang.flag}" width="20" height="15" alt="" class="rounded-sm">
              <span>${lang.name}</span>
            </button>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

/**
 * Configura los event listeners para el selector de idiomas
 * @param {HTMLElement} container - Elemento contenedor
 * @param {Object} settings - Configuración del selector
 */
function setupEventListeners(container, settings) {
  const toggle = container.querySelector('#language-dropdown-toggle');
  const dropdown = container.querySelector('#language-dropdown');
  
  if (!toggle || !dropdown) return;
  
  // Abrir/cerrar el menú desplegable
  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    dropdown.classList.toggle('hidden', isExpanded);
    
    if (!isExpanded) {
      // Enfocar el primer elemento al abrir
      const firstItem = dropdown.querySelector('button');
      if (firstItem) firstItem.focus();
    }
  });
  
  // Cambiar de idioma al hacer clic en una opción
  dropdown.addEventListener('click', async (e) => {
    const langButton = e.target.closest('[data-lang]');
    if (langButton) {
      const langCode = langButton.getAttribute('data-lang');
      console.log(`[language-selector] Language change requested to: ${langCode}`);
      
      try {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'language-loading-indicator';
        loadingIndicator.className = 'fixed top-0 left-0 w-full h-1 bg-primary-700 dark:bg-primary-500';
        loadingIndicator.style.cssText = 'z-index: 9999; animation: language-loading 2s infinite linear;';
        document.body.appendChild(loadingIndicator);
        
        // Add animation style if not exists
        if (!document.querySelector('#language-loading-style')) {
          const style = document.createElement('style');
          style.id = 'language-loading-style';
          style.textContent = `
            @keyframes language-loading {
              0% { width: 0; }
              50% { width: 50%; }
              100% { width: 100%; }
            }
          `;
          document.head.appendChild(style);
        }
        
        // Attempt to change language
        await changeLanguage(langCode);
        
        // Ensure translations are loaded
        if (window.preloadAllTranslations) {
          console.log('[language-selector] Calling preloadAllTranslations');
          await window.preloadAllTranslations();
        }
        
        // Manually trigger translation updates
        if (window.updateCalculatorTranslations) {
          console.log('[language-selector] Calling updateCalculatorTranslations');
          window.updateCalculatorTranslations();
        }
        
        // Trigger direct fixes if available
        if (window.directFixTranslations) {
          console.log('[language-selector] Calling directFixTranslations');
          window.directFixTranslations();
        }
        
        // Update Alpine store if available
        if (window.Alpine?.store) {
          try {
            const i18nStore = window.Alpine.store('i18n');
            if (i18nStore) {
              i18nStore.revision = (i18nStore.revision || 0) + 1;
              i18nStore.timestamp = Date.now();
              console.log('[language-selector] Updated Alpine i18n store');
            }
          } catch (e) {
            console.warn('[language-selector] Error updating Alpine store:', e);
          }
        }
        
        // Dispatch custom event for other components
        const event = new CustomEvent('language:changed', {
          detail: { langCode, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        // Remove loading indicator after a delay
        setTimeout(() => {
          const indicator = document.getElementById('language-loading-indicator');
          if (indicator) {
            indicator.style.width = '100%';
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
          }
        }, 500);
      } catch (error) {
        console.error('[language-selector] Error changing language:', error);
        
        // Fallback: store the selection in localStorage and reload the page with the lang parameter
        try {
          localStorage.setItem('beyondLocale', langCode);
          const url = new URL(window.location.href);
          url.searchParams.set('lang', langCode);
          window.location.href = url.toString();
        } catch (e) {
          console.error('[language-selector] Fallback failed:', e);
        }
      }
      
      // Cerrar el menú desplegable
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.classList.add('hidden');
      toggle.focus();
    }
  });
  
  // Cerrar al presionar ESC
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.classList.add('hidden');
      toggle.focus();
    }
  });
  
  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.classList.add('hidden');
    }
  });
  
  // Navegación por teclado
  dropdown.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      
      const items = Array.from(dropdown.querySelectorAll('button[role="menuitem"]'));
      const currentIndex = items.indexOf(document.activeElement);
      
      let newIndex;
      if (e.key === 'ArrowDown') {
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
      
      items[newIndex].focus();
    }
  });
}

/**
 * Actualiza el idioma seleccionado en el selector
 * @param {HTMLElement} container - Elemento contenedor
 * @param {string} langCode - Código del idioma seleccionado
 * @param {Object} settings - Configuración del selector
 */
function updateSelectedLanguage(container, langCode, settings) {
  const toggle = container.querySelector('#language-dropdown-toggle');
  const languageItems = container.querySelectorAll('[data-lang]');
  
  if (!toggle || !languageItems.length) return;
  
  console.log(`[language-selector] Updating selected language to: ${langCode}`);
  
  // Encontrar los datos del idioma seleccionado
  const selectedLang = settings.languages.find(lang => lang.code === langCode);
  if (!selectedLang) {
    console.warn(`[language-selector] Language ${langCode} not found in settings`);
    return;
  }
  
  // Actualizar el botón principal
  const toggleImg = toggle.querySelector('img');
  const toggleText = toggle.querySelector('span.sm\\:inline');
  
  if (toggleImg) {
    toggleImg.src = `${settings.flagsPath}${selectedLang.flag}`;
    toggleImg.alt = `Flag of ${selectedLang.name} (${selectedLang.code})`;
    console.log(`[language-selector] Updated flag image to: ${toggleImg.src}`);
  }
  
  if (toggleText) {
    toggleText.textContent = selectedLang.name;
    console.log(`[language-selector] Updated language name to: ${selectedLang.name}`);
  }
  
  // Actualizar los elementos del menú
  languageItems.forEach(item => {
    const isSelected = item.getAttribute('data-lang') === langCode;
    item.setAttribute('aria-current', isSelected ? 'true' : 'false');
    item.classList.toggle('bg-primary-100', isSelected);
    item.classList.toggle('dark:bg-primary-800', isSelected);
    item.classList.toggle('font-medium', isSelected);
  });
}

export default {
  initLanguageSelector
}; 