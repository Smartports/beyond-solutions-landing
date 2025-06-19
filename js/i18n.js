/**
 * Sistema de internacionalización (i18n) para Beyond Solutions
 * Maneja la carga, cambio y traducción de contenido en múltiples idiomas
 */

// Configuración global
const DEFAULT_OPTIONS = {
  basePath: './i18n',
  defaultLanguage: 'es',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'es', name: 'Español', dir: 'ltr', file: 'es.json' },
    { code: 'en', name: 'English', dir: 'ltr', file: 'en.json' },
    { code: 'fr', name: 'Français', dir: 'ltr', file: 'fr.json' },
    { code: 'de', name: 'Deutsch', dir: 'ltr', file: 'de.json' },
    { code: 'it', name: 'Italiano', dir: 'ltr', file: 'it.json' },
    { code: 'pt', name: 'Português', dir: 'ltr', file: 'pt.json' },
    { code: 'zh', name: '中文', dir: 'ltr', file: 'zh.json' },
    { code: 'ja', name: '日本語', dir: 'ltr', file: 'ja.json' },
    { code: 'ko', name: '한국어', dir: 'ltr', file: 'ko.json' },
    { code: 'ru', name: 'Русский', dir: 'ltr', file: 'ru.json' },
    { code: 'ar', name: 'العربية', dir: 'rtl', file: 'ar.json' },
    { code: 'sv', name: 'Svenska', dir: 'ltr', file: 'sv.json' },
    { code: 'nl', name: 'Nederlands', dir: 'ltr', file: 'nl.json' },
    { code: 'pl', name: 'Polski', dir: 'ltr', file: 'pl.json' },
    { code: 'tr', name: 'Türkçe', dir: 'ltr', file: 'tr.json' },
    { code: 'hi', name: 'हिन्दी', dir: 'ltr', file: 'hi.json' },
    { code: 'vi', name: 'Tiếng Việt', dir: 'ltr', file: 'vi.json' },
    { code: 'el', name: 'Ελληνικά', dir: 'ltr', file: 'el.json' }
  ],
  storageKey: 'beyondLocale',
  debug: false
};

// Cache para traduciones cargadas
const translationsCache = new Map();
let currentLanguage = null;
let options = {...DEFAULT_OPTIONS};

/**
 * Inicializa el sistema i18n
 * @param {Object} customOptions - Opciones de configuración personalizadas
 * @returns {Object} - La instancia i18n
 */
export async function initI18n(customOptions = {}) {
  // Mezclar opciones por defecto con las personalizadas
  options = { ...options, ...customOptions };
  
  // Determinar el idioma inicial
  const detectedLanguage = detectLanguage();
   
  if (!detectedLanguage) {
    console.error('[i18n] CRITICAL: detectLanguage() returned null/undefined language. Defaulting to:', options.defaultLanguage);
  }
  
  // Cargar el idioma detectado
  const languageToUse = detectedLanguage || options.defaultLanguage;
  console.log(`[i18n] Initializing with detected language: ${languageToUse} (detected: ${detectedLanguage || 'NONE'})`);
  
  await changeLanguage(languageToUse);
  
  // Asegurarse de que siempre tengamos un idioma válido después de la inicialización
  if (!currentLanguage) {
    console.error('[i18n] CRITICAL: After initialization, currentLanguage is still null! Forcing default language.');
    currentLanguage = options.defaultLanguage;
    
    // Intentar cargar traducciones para el idioma por defecto si no se han cargado
    if (!translationsCache.has(currentLanguage)) {
      try {
        await loadTranslations(currentLanguage);
      } catch (e) {
        console.error('[i18n] Failed to load translations for default language:', e);
        // Crear un objeto vacío para evitar errores
        translationsCache.set(currentLanguage, {});
      }
    }
    
    // Actualizar HTML y guardar en localStorage
    updateHtmlLangAttribute();
    updateTextDirection();
    try {
      localStorage.setItem(options.storageKey, currentLanguage);
    } catch (e) {
      console.warn('[i18n] Could not store language in localStorage:', e);
    }
  }
  
  // Detectar cambios de URL para parámetros de idioma (ej: ?lang=es, ?lang=en)
  detectLanguageFromUrl();
  
  // Inicializar marcado de elementos
  await translatePageElements();
  
  // Escuchar cambios de idioma para actualizar el elemento HTML
  document.addEventListener('i18n:languageChanged', () => {
    updateHtmlLangAttribute();
    updateTextDirection();
  });

  if (options.debug) {
    console.log(`[i18n] Initialized with language: ${currentLanguage}`);
    console.log('[i18n] Available languages in cache:', Array.from(translationsCache.keys()));
  }
  
  // Add language meta tags for SEO
  addLanguageMetaTags();
  
  return {
    t,
    changeLanguage,
    getCurrentLanguage: () => currentLanguage,
    getSupportedLanguages: () => options.supportedLanguages,
    isRTL: isRTL,
    translateNode,
    translationsCache // Expose for debugging purposes
  };
}

/**
 * Detecta el idioma basado en el almacenamiento local,
 * parámetros de URL, navegador o valor por defecto.
 * @returns {string} Código de idioma detectado
 */
function detectLanguage() {
  // Orden de prioridad para detección de idioma:
  // 1. Parámetros de URL (?lang=es, ?lang=en, etc.)
  // 2. Almacenamiento local
  // 3. Navegador (Accept-Language)
  // 4. Idioma por defecto
  
  // Buscar en parámetros de URL
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang && isSupported(urlLang)) {
    console.log(`[i18n] Language detected from URL: ${urlLang}`);
    return urlLang;
  }
  
  try {
    const storedLanguage = localStorage.getItem(options.storageKey);
    if (storedLanguage && isSupported(storedLanguage)) {
      console.log(`[i18n] Language detected from localStorage: ${storedLanguage}`);
      return storedLanguage;
    }
  } catch (e) {
    console.warn('[i18n] Error accessing localStorage:', e);
  }
  
  // Preferencia del navegador
  try {
    const browserLang = navigator.language.split('-')[0];
    if (isSupported(browserLang)) {
      console.log(`[i18n] Language detected from browser: ${browserLang}`);
      return browserLang;
    }
  } catch (e) {
    console.warn('[i18n] Error detecting browser language:', e);
  }
  
  // Idioma por defecto
  console.log(`[i18n] Using default language: ${options.defaultLanguage}`);
  return options.defaultLanguage;
}

/**
 * Detecta el idioma desde los parámetros de la URL (?lang=es, ?lang=en)
 * @param {boolean} setLanguage - Si es true, cambia el idioma si se detecta
 * @returns {string|null} - Código de idioma o null si no se detecta
 */
function detectLanguageFromUrl(setLanguage = true) {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  
  if (urlLang && isSupported(urlLang)) {
    if (setLanguage && urlLang !== currentLanguage) {
      changeLanguage(urlLang);
    }
    return urlLang;
  }
  return null;
}

/**
 * Comprueba si un idioma está soportado
 * @param {string} langCode - Código de idioma
 * @returns {boolean}
 */
function isSupported(langCode) {
  return options.supportedLanguages.some(lang => lang.code === langCode);
}

/**
 * Verifica si el idioma actual es RTL (derecha a izquierda)
 * @returns {boolean}
 */
export function isRTL() {
  const lang = options.supportedLanguages.find(l => l.code === currentLanguage);
  return lang && lang.dir === 'rtl';
}

/**
 * Actualiza el atributo lang del elemento HTML
 */
function updateHtmlLangAttribute() {
  document.documentElement.lang = currentLanguage;
}

/**
 * Actualiza la dirección del texto según el idioma
 */
function updateTextDirection() {
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  document.documentElement.classList.toggle('rtl', isRTL());
}

/**
 * Traduce un nodo del DOM y sus descendientes
 * @param {Node} node - El nodo a traducir
 */
function translateNode(node) {
  if (!node) return;

  const elements = node.nodeType === 1 && node.matches('[data-i18n], [data-i18n-attr]')
    ? [node, ...node.querySelectorAll('[data-i18n], [data-i18n-attr]')]
    : node.querySelectorAll('[data-i18n], [data-i18n-attr]');

  elements.forEach(el => {
    const i18nKey = el.getAttribute('data-i18n');
    if (i18nKey) {
      el.textContent = t(i18nKey, {}, el.textContent);
    }

    const i18nAttr = el.getAttribute('data-i18n-attr');
    if (i18nAttr) {
      i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.trim().split(':');
        if (attr && key) {
          const translated = t(key, {}, el.getAttribute(attr) || '');
          el.setAttribute(attr, translated);
        }
      });
    }
  });
}

/**
 * Inicializa un MutationObserver para traducir elementos agregados dinámicamente
 */
function initMutationObserver() {
  if (window.i18nObserver) {
    window.i18nObserver.disconnect();
  }
  
  window.i18nObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Solo elementos
            translateNode(node);
          }
        });
      }
    });
  });
  
  window.i18nObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Cambia el idioma actual y actualiza las traducciones
 * @param {string} langCode - Código del idioma a cambiar
 * @returns {Promise<boolean>} - True si el cambio fue exitoso
 */
export async function changeLanguage(langCode) {
  if (!langCode || !isSupported(langCode)) {
    console.error(`[i18n] Invalid or unsupported language code: ${langCode}`);
    return false;
  }
  
  if (langCode === currentLanguage) {
    if (options.debug) {
      console.log(`[i18n] Language already set to ${langCode}, no change needed`);
    }
    return true;
  }
  
  try {
    // Cargar traducciones si no están en caché
    if (!translationsCache.has(langCode)) {
      await loadTranslations(langCode);
    }
    
    // Guardar idioma anterior para referencia
    const previousLanguage = currentLanguage;
    
    // Actualizar idioma actual
    currentLanguage = langCode;
    
    // Guardar en localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('beyondLocale', langCode);
    }
    
    // Actualizar atributos HTML
    updateHtmlLangAttribute();
    updateTextDirection();
    
    // Actualizar URL si es necesario
    if (options.updateUrlOnChange) {
      updateUrlWithLanguage(langCode);
    }
    
    // Traducir elementos de la página
    await translatePageElements();
    
    // Añadir meta tags para SEO
    if (options.addMetaTags) {
      addLanguageMetaTags();
    }
    
    // Notificar que el idioma ha cambiado
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('i18n:languageChanged', { 
        detail: { 
          previousLanguage, 
          currentLanguage: langCode,
          timestamp: Date.now()
        } 
      });
      document.dispatchEvent(event);
      
      // Also dispatch on window for better compatibility
      window.dispatchEvent(new CustomEvent('i18n:languageChanged', { 
        detail: { 
          previousLanguage, 
          currentLanguage: langCode,
          timestamp: Date.now()
        } 
      }));
      
      if (options.debug) {
        console.log(`[i18n] Language changed from ${previousLanguage || 'none'} to ${langCode}`);
        console.log(`[i18n] Event i18n:languageChanged dispatched with details:`, {
          previousLanguage,
          currentLanguage: langCode,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error(`[i18n] Error changing language to ${langCode}:`, error);
    return false;
  }
}

/**
 * Actualiza la URL con el parámetro de idioma
 * @param {string} langCode - Código de idioma
 */
function updateUrlWithLanguage(langCode) {
  if (!langCode) return;
  
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', langCode);
    
    // Actualizar URL sin recargar la página
    window.history.replaceState({}, '', url.toString());
  } catch (e) {
    console.warn('[i18n] Error updating URL with language parameter:', e);
  }
}

/**
 * Carga las traducciones para un idioma específico
 * @param {string} langCode - Código del idioma a cargar
 * @returns {Promise<Object>} - Objeto con las traducciones
 */
async function loadTranslations(langCode) {
  console.log(`[i18n] Loading translations for ${langCode}`);
  
  // Si ya están en caché, devolverlas directamente
  if (translationsCache.has(langCode)) {
    console.log(`[i18n] Using cached translations for ${langCode}`);
    return translationsCache.get(langCode);
  }
  
  // Determinar la ruta del archivo de traducciones
  const langConfig = options.supportedLanguages.find(l => l.code === langCode);
  const fileName = langConfig?.file || `${langCode}.json`;
  const url = `${options.basePath}/${fileName}`;
  
  try {
    // Log to help debug
    console.log(`[i18n] Fetching translations from ${url}`);
    
    // Fetch with cache busting to avoid stale translations
    const cacheBuster = `?_=${Date.now()}`;
    const response = await fetch(`${url}${cacheBuster}`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load translations: ${response.status} ${response.statusText}`);
    }
    
    const translations = await response.json();
    
    // Apply fixes for calculator translations
    fixCalculatorTranslationKeys(translations);
    
    // Cache the translations
    translationsCache.set(langCode, translations);
    
    if (options.debug) {
      console.log(`[i18n] Loaded translations for ${langCode}`);
    }
    
    return translations;
  } catch (error) {
    console.error(`[i18n] Error loading translations for ${langCode}:`, error);
    
    // Try a second attempt with a different path format
    try {
      console.log(`[i18n] Attempting alternative path for ${langCode}`);
      const altUrl = `${options.basePath}/${langCode}.json`;
      const cacheBuster = `?_=${Date.now()}`;
      const response = await fetch(`${altUrl}${cacheBuster}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load translations from alternative path: ${response.status} ${response.statusText}`);
      }
      
      const translations = await response.json();
      
      // Apply fixes for calculator translations
      fixCalculatorTranslationKeys(translations);
      
      // Cache the translations
      translationsCache.set(langCode, translations);
      
      if (options.debug) {
        console.log(`[i18n] Loaded translations for ${langCode} from alternative path`);
      }
      
      return translations;
    } catch (altError) {
      console.error(`[i18n] Error loading translations from alternative path for ${langCode}:`, altError);
      
      // If it's the default language that fails, create an empty object
      // Otherwise, try to load the fallback language
      if (langCode === options.fallbackLanguage) {
        console.warn(`[i18n] Creating empty translations for fallback language ${langCode}`);
        const emptyTranslations = { calculator: {} };
        translationsCache.set(langCode, emptyTranslations);
        return emptyTranslations;
      } else {
        console.warn(`[i18n] Falling back to ${options.fallbackLanguage} for ${langCode}`);
        return loadTranslations(options.fallbackLanguage);
      }
    }
  }
}

/**
 * Corrige y normaliza las claves de traducción para la calculadora
 * @param {Object} translations - Objeto de traducciones
 */
function fixCalculatorTranslationKeys(translations) {
  if (!translations || typeof translations !== 'object') {
    console.warn('[i18n] Cannot fix calculator keys: translations is not an object', typeof translations);
    return;
  }

  try {
    // Ensure calculator object exists
    if (!translations.calculator) {
      translations.calculator = {};
    }

    // Ensure critical sections exist
    const requiredSections = ['step1', 'step2', 'step3', 'summary', 'form', 'values'];
    requiredSections.forEach(section => {
      if (!translations.calculator[section]) {
        translations.calculator[section] = {};
      }
    });

    // Ensure critical calculator values section exists
    if (!translations.calculator.values) {
      translations.calculator.values = {};
    }

    // Create nested structure if needed
    ['scope', 'entity', 'type', 'status', 'use'].forEach(category => {
      if (!translations.calculator.values[category]) {
        translations.calculator.values[category] = {};
      }
    });

    // Extract step1 field labels from other locations if missing
    if (!translations.calculator.step1.scope && translations.calculator.scope) {
      translations.calculator.step1.scope = translations.calculator.scope;
    }
    if (!translations.calculator.step1.entity && translations.calculator.entity) {
      translations.calculator.step1.entity = translations.calculator.entity;
    }

    // Extract step2 field labels from other locations if missing
    if (!translations.calculator.step2.budget && translations.calculator.budget) {
      translations.calculator.step2.budget = translations.calculator.budget;
    }
    if (!translations.calculator.step2.address && translations.calculator.address) {
      translations.calculator.step2.address = translations.calculator.address;
    }
    if (!translations.calculator.step2.surface && translations.calculator.surface) {
      translations.calculator.step2.surface = translations.calculator.surface;
    }
    if (!translations.calculator.step2.usableSurface && translations.calculator.usableSurface) {
      translations.calculator.step2.usableSurface = translations.calculator.usableSurface;
    }
    if (!translations.calculator.step2.use && translations.calculator.use) {
      translations.calculator.step2.use = translations.calculator.use;
    }
    if (!translations.calculator.step2.type && translations.calculator.type) {
      translations.calculator.step2.type = translations.calculator.type;
    }
    if (!translations.calculator.step2.status && translations.calculator.status) {
      translations.calculator.step2.status = translations.calculator.status;
    }
    if (!translations.calculator.step2.characteristics && translations.calculator.characteristics) {
      translations.calculator.step2.characteristics = translations.calculator.characteristics;
    }

    // Copy step fields to summary if missing
    if (!translations.calculator.summary.scope && translations.calculator.step1.scope) {
      translations.calculator.summary.scope = translations.calculator.step1.scope;
    }
    if (!translations.calculator.summary.entity && translations.calculator.step1.entity) {
      translations.calculator.summary.entity = translations.calculator.step1.entity;
    }
    if (!translations.calculator.summary.budget && translations.calculator.step2.budget) {
      translations.calculator.summary.budget = translations.calculator.step2.budget;
    }
    if (!translations.calculator.summary.address && translations.calculator.step2.address) {
      translations.calculator.summary.address = translations.calculator.step2.address;
    }
    if (!translations.calculator.summary.surface && translations.calculator.step2.surface) {
      translations.calculator.summary.surface = translations.calculator.step2.surface;
    }
    if (!translations.calculator.summary.usableSurface && translations.calculator.step2.usableSurface) {
      translations.calculator.summary.usableSurface = translations.calculator.step2.usableSurface;
    }
    if (!translations.calculator.summary.use && translations.calculator.step2.use) {
      translations.calculator.summary.use = translations.calculator.step2.use;
    }
    if (!translations.calculator.summary.type && translations.calculator.step2.type) {
      translations.calculator.summary.type = translations.calculator.step2.type;
    }
    if (!translations.calculator.summary.status && translations.calculator.step2.status) {
      translations.calculator.summary.status = translations.calculator.step2.status;
    }

    // Look for translations in flattened keys
    const flattenedKeys = Object.keys(translations).filter(key => key.includes('.'));
    if (flattenedKeys.length > 0) {
      console.log('[i18n] Found flattened keys, extracting calculator translations');
      
      flattenedKeys.forEach(flatKey => {
        if (flatKey.startsWith('calculator.')) {
          const parts = flatKey.split('.');
          if (parts.length >= 2) {
            let target = translations;
            
            // Navigate to the parent object
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i];
              if (!target[part]) {
                target[part] = {};
              }
              target = target[part];
            }
            
            // Set the value at the leaf
            const lastPart = parts[parts.length - 1];
            target[lastPart] = translations[flatKey];
          }
        }
      });
    }

    // Scan for common patterns in translations that might contain calculator translations
    const scanForCalculatorKeys = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        
        // Look for calculator-related keys
        if (key.toLowerCase().includes('calculator') || 
            key.toLowerCase().includes('calc') || 
            key.toLowerCase().includes('form') ||
            key.toLowerCase().includes('step')) {
          
          // If we find a calculator section, try to extract field labels
          if (typeof value === 'object') {
            // Look for field labels in this section
            const fieldKeys = ['scope', 'entity', 'budget', 'address', 'surface', 
                             'usableSurface', 'use', 'type', 'status', 'characteristics'];
            
            fieldKeys.forEach(fieldKey => {
              if (value[fieldKey] && typeof value[fieldKey] === 'string') {
                // Found a field label, map it to the correct location
                if (fieldKey === 'scope' || fieldKey === 'entity') {
                  if (!translations.calculator.step1[fieldKey]) {
                    translations.calculator.step1[fieldKey] = value[fieldKey];
                  }
                } else {
                  if (!translations.calculator.step2[fieldKey]) {
                    translations.calculator.step2[fieldKey] = value[fieldKey];
                  }
                }
                
                // Also map to summary
                if (!translations.calculator.summary[fieldKey]) {
                  translations.calculator.summary[fieldKey] = value[fieldKey];
                }
              }
            });
          }
        }
        
        // Recursively scan nested objects
        if (value && typeof value === 'object') {
          scanForCalculatorKeys(value, currentPath);
        }
      });
    };
    
    // Scan the entire translations object for calculator keys
    scanForCalculatorKeys(translations);

    // Set default values for critical missing keys
    const criticalKeys = {
      'calculator.form.required_field': 'Required field',
      'calculator.next': 'Next',
      'calculator.prev': 'Previous',
      'calculator.step1.title': 'Project Information',
      'calculator.step2.title': 'Property Details',
      'calculator.step3.title': 'Additional Information',
      'calculator.summary.title': 'Project Summary'
    };
    
    Object.entries(criticalKeys).forEach(([key, defaultValue]) => {
      const parts = key.split('.');
      let current = translations;
      
      // Navigate to the parent object
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set default value if missing
      const lastPart = parts[parts.length - 1];
      if (!current[lastPart]) {
        current[lastPart] = defaultValue;
      }
    });

    // Log the fixed translations for debugging
    if (options.debug) {
      console.log('[i18n] Fixed calculator translations:', {
        step1: translations.calculator.step1,
        step2: translations.calculator.step2,
        summary: translations.calculator.summary
      });
    }
  } catch (error) {
    console.error('[i18n] Error fixing calculator translations:', error);
  }
}

/**
 * Traduce una clave a texto en el idioma actual
 * @param {string} key - Clave de traducción (formato: namespace.section.key)
 * @param {Object} params - Parámetros para interpolación
 * @param {string} defaultValue - Valor por defecto si no se encuentra la traducción
 * @returns {string} - Texto traducido
 */
export function t(key, params = {}, defaultValue = '') {
  // Only log debug messages if debug is true
  if (options.debug) {
    console.log(`[i18n] t() called with key: "${key}", current language: ${currentLanguage}`);
  }

  // Check if i18n is fully initialized to determine if we should log warnings
  const shouldLogWarnings = typeof window !== 'undefined' && 
                           window.i18nFullyInitialized === true;

  if (!currentLanguage) {
    // Enhanced debugging - track where null language calls are coming from
    // But only log if we're past initialization
    if (shouldLogWarnings) {
      console.warn(`[i18n] WARNING: Translation attempted with NULL language for key "${key}"`, {
        stack: new Error().stack.split('\n').slice(2, 6).join('\n'),
        calledAt: new Date().toISOString(),
        documentReady: document.readyState,
        defaultValue: defaultValue || key
      });
    }
    
    // Try to recover by setting a language
    if (typeof localStorage !== 'undefined') {
      const storedLang = localStorage.getItem(options.storageKey);
      if (storedLang && isSupported(storedLang)) {
        console.log(`[i18n] Recovering with stored language: ${storedLang}`);
        currentLanguage = storedLang;
      } else {
        console.log(`[i18n] Recovering with default language: ${options.defaultLanguage}`);
        currentLanguage = options.defaultLanguage;
      }
    } else {
      currentLanguage = options.defaultLanguage;
    }
    
    // If we still don't have translations, try to load them
    if (!translationsCache.has(currentLanguage)) {
      console.log(`[i18n] Emergency loading translations for ${currentLanguage}`);
      loadTranslations(currentLanguage).catch(e => {
        console.error(`[i18n] Failed emergency translation loading:`, e);
      });
      
      // Return default value while translations are loading
      return defaultValue || key;
    }
  }
  
  if (!translationsCache.has(currentLanguage)) {
    // Enhanced debugging - log more details about translation cache state
    // But only log if we're past initialization
    if (shouldLogWarnings) {
      console.warn(`[i18n] No translations loaded for "${currentLanguage}" (language code: ${typeof currentLanguage}), returning default`, {
        availableLanguages: Array.from(translationsCache.keys()),
        requestedKey: key,
        defaultValue: defaultValue || key,
        calledFrom: (new Error().stack || '').split('\n')[2] || 'unknown'
      });
    }
    
    // Try to load translations for the current language
    console.log(`[i18n] Attempting to load missing translations for ${currentLanguage}`);
    loadTranslations(currentLanguage).catch(e => {
      console.error(`[i18n] Failed to load missing translations:`, e);
    });
    
    // Try fallback languages while translations are loading
    const fallbackLanguages = [options.fallbackLanguage, options.defaultLanguage, 'en', 'es'];
    
    for (const fallbackLang of fallbackLanguages) {
      if (fallbackLang !== currentLanguage && translationsCache.has(fallbackLang)) {
        console.log(`[i18n] Using fallback language ${fallbackLang} for key "${key}"`);
        
        // Try to get translation from fallback language
        try {
          const fallbackTranslations = translationsCache.get(fallbackLang);
          const keys = key.split('.');
          let value = fallbackTranslations;
          
          let found = true;
          for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
              value = value[k];
            } else {
              found = false;
              break;
            }
          }
          
          if (found && typeof value === 'string') {
            return interpolate(value, params);
          }
        } catch (e) {
          console.warn(`[i18n] Error using fallback language ${fallbackLang}:`, e);
        }
      }
    }
    
    // Special handling for calculator keys
    if (key.startsWith('calculator.')) {
      return getCalculatorFallback(key, params, defaultValue);
    }
    
    return defaultValue || key;
  }
  
  try {
    const translations = translationsCache.get(currentLanguage);
    const keys = key.split('.');
    let value = translations;
    
    // Navegar por el objeto de traducciones siguiendo la ruta de claves
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Si no se encuentra la clave en el idioma actual, buscar en el fallback
        if (options.debug) {
          console.warn(`[i18n] Key part "${k}" not found in path "${key}" for language "${currentLanguage}"`);
        }
        
        // Special handling for calculator keys
        if (key.startsWith('calculator.')) {
          return getCalculatorFallback(key, params, defaultValue);
        }
        
        if (currentLanguage !== options.fallbackLanguage && translationsCache.has(options.fallbackLanguage)) {
          if (options.debug) {
            console.log(`[i18n] Trying fallback language "${options.fallbackLanguage}" for key "${key}"`);
          }
          
          const fallbackTranslations = translationsCache.get(options.fallbackLanguage);
          let fallbackValue = fallbackTranslations;
          
          for (const k of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
              fallbackValue = fallbackValue[k];
            } else {
              if (options.debug) {
                console.warn(`[i18n] Key "${key}" not found in fallback language "${options.fallbackLanguage}" either`);
              }
              return defaultValue || key;
            }
          }
          
          if (typeof fallbackValue === 'string') {
            if (options.debug) {
              console.log(`[i18n] Found translation in fallback language: "${fallbackValue}"`);
            }
            return interpolate(fallbackValue, params);
          } else {
            if (shouldLogWarnings && options.debug) {
              console.warn(`[i18n] Value for key "${key}" in fallback language is not a string: ${typeof fallbackValue}`);
            }
            return defaultValue || key;
          }
        } else {
          if (shouldLogWarnings && options.debug) {
            console.warn(`[i18n] Key "${key}" not found in current language and no fallback available`);
          }
          return defaultValue || key;
        }
      }
    }
    
    if (typeof value === 'string') {
      const result = interpolate(value, params);
      
      if (options.debug) {
        console.log(`[i18n] Translated "${key}" to "${result}"`);
      }
      
      return result;
    }
    
    if (shouldLogWarnings && options.debug) {
      console.warn(`[i18n] Value for key "${key}" is not a string: ${typeof value}`);
    }
    
    return defaultValue || key;
  } catch (error) {
    if (shouldLogWarnings) {
      console.error(`[i18n] Error translating key "${key}":`, error);
    }
    return defaultValue || key;
  }
}

/**
 * Helper function to get fallback translations for calculator keys
 */
function getCalculatorFallback(key, params, defaultValue) {
  // For calculator keys, try to extract a meaningful fallback from the key
  const lastPart = key.split('.').pop();
  if (lastPart) {
    // Capitalize first letter and replace underscores/hyphens with spaces
    const fallback = lastPart.charAt(0).toUpperCase() + 
                   lastPart.slice(1).replace(/[_-]/g, ' ');
    
    if (options.debug) {
      console.log(`[i18n] Using extracted fallback for calculator key: ${fallback}`);
    }
    
    return fallback;
  }
  
  // Hard-coded fallbacks for critical calculator keys
  const calculatorFallbacks = {
    'calculator.step1.scope': 'Project type',
    'calculator.step1.entity': 'Entity',
    'calculator.step2.budget': 'Budget',
    'calculator.step2.address': 'Address',
    'calculator.step2.type': 'Land type',
    'calculator.step2.status': 'Status',
    'calculator.step2.surface': 'Surface area',
    'calculator.step2.usableSurface': 'Usable surface',
    'calculator.step2.use': 'Land use',
    'calculator.step2.characteristics': 'Characteristics',
    'calculator.summary.scope': 'Project type',
    'calculator.summary.entity': 'Entity',
    'calculator.summary.budget': 'Budget',
    'calculator.summary.address': 'Address',
    'calculator.summary.surface': 'Surface area',
    'calculator.summary.usableSurface': 'Usable surface',
    'calculator.summary.use': 'Land use',
    'calculator.summary.type': 'Land type',
    'calculator.summary.status': 'Status'
  };
  
  if (calculatorFallbacks[key]) {
    return calculatorFallbacks[key];
  }
  
  return defaultValue || key;
}

/**
 * Helper function for interpolating parameters in translated strings
 */
function interpolate(text, params) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/{{([^{}]*)}}/g, (matched, param) => {
    return params[param] !== undefined ? params[param] : matched;
  });
}

/**
 * Translates all page elements with the data-i18n attribute
 */
async function translatePageElements() {
  translateNode(document.body);
}

/**
 * Add language meta tags for SEO
 */
function addLanguageMetaTags() {
  // Remove any existing language meta tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  
  // Add meta tags for each supported language
  options.supportedLanguages.forEach(lang => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang.code;
    
    // Create the URL with the language parameter
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang.code);
    link.href = url.toString();
    
    document.head.appendChild(link);
  });
  
  // Update theme-color meta tag for mobile browsers
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
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    themeColorMeta.content = e.matches ? '#192525' : '#334b4e';
  });
}

/**
 * Ensure all languages are properly loaded and supported
 * This function is called during initialization to prepare all languages
 */
export async function ensureAllLanguagesSupport() {
  console.log('[i18n] Ensuring support for all languages');
  
  try {
    // List of all supported language codes from i18n/config.json
    const supportedLanguages = options.supportedLanguages.map(lang => lang.code);
    
    console.log(`[i18n] Preloading translations for ${supportedLanguages.length} languages: ${supportedLanguages.join(', ')}`);
    
    // Preload translations for all languages
    const preloadPromises = supportedLanguages.map(async (langCode) => {
      try {
        if (!translationsCache.has(langCode)) {
          console.log(`[i18n] Preloading translations for ${langCode}`);
          const translations = await loadTranslations(langCode);
          
          // Apply fixes to calculator translations
          if (translations) {
            fixCalculatorTranslationKeys(translations);
          }
          
          // Verify translations were loaded
          if (translationsCache.has(langCode)) {
            console.log(`[i18n] Successfully loaded translations for ${langCode}`);
          } else {
            console.error(`[i18n] Failed to cache translations for ${langCode}`);
          }
        }
        return langCode;
      } catch (error) {
        console.warn(`[i18n] Error preloading translations for ${langCode}:`, error);
        return null;
      }
    });
    
    // Wait for all preloads to complete
    const results = await Promise.allSettled(preloadPromises);
    const loadedLanguages = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);
    
    console.log(`[i18n] Preloaded translations for ${loadedLanguages.length}/${supportedLanguages.length} languages:`, loadedLanguages);
    
    // Log the current state of the translations cache
    console.log('[i18n] Current translations cache state:', {
      languages: Array.from(translationsCache.keys()),
      hasFallback: translationsCache.has(options.fallbackLanguage),
      hasDefault: translationsCache.has(options.defaultLanguage)
    });
    
    return loadedLanguages;
  } catch (error) {
    console.error('[i18n] Error ensuring all languages support:', error);
    return [];
  }
}

/**
 * Initialize the i18n system
 * @param {Object} customOptions - Custom options to override defaults
 * @returns {Promise<boolean>} - True if initialization was successful
 */
export async function init(customOptions = {}) {
  console.log('[i18n] Initializing i18n system');
  
  try {
    // Merge custom options with defaults
    Object.assign(options, customOptions);
    
    // Debug mode
    if (options.debug) {
      console.log('[i18n] Debug mode enabled');
      console.log('[i18n] Options:', options);
    }
    
    // Set up HTML attributes
    updateHtmlLangAttribute();
    
    // Determine initial language
    let initialLang = null;
    
    // Check URL parameter first
    if (options.useUrlParam) {
      initialLang = getLanguageFromUrl();
      if (initialLang) {
        console.log(`[i18n] Language found in URL: ${initialLang}`);
      }
    }
    
    // Then check localStorage
    if (!initialLang && typeof localStorage !== 'undefined') {
      initialLang = localStorage.getItem(options.storageKey);
      if (initialLang) {
        console.log(`[i18n] Language found in localStorage: ${initialLang}`);
      }
    }
    
    // Then check navigator.language
    if (!initialLang && typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      if (isSupported(browserLang)) {
        initialLang = browserLang;
        console.log(`[i18n] Language found in navigator: ${initialLang}`);
      }
    }
    
    // Fallback to default language
    if (!initialLang || !isSupported(initialLang)) {
      initialLang = options.defaultLanguage;
      console.log(`[i18n] Using default language: ${initialLang}`);
    }
    
    // Load translations for the initial language
    await loadTranslations(initialLang);
    
    // Set current language
    currentLanguage = initialLang;
    
    // Update HTML attributes
    updateHtmlLangAttribute();
    updateTextDirection();
    
    // Store in localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(options.storageKey, initialLang);
      } catch (e) {
        console.warn('[i18n] Could not store language in localStorage:', e);
      }
    }
    
    // Add meta tags
    if (options.addMetaTags) {
      addLanguageMetaTags();
    }
    
    // Translate the page
    if (typeof document !== 'undefined') {
      await translatePageElements();
    }
    
    // Ensure all languages support in the background
    setTimeout(() => {
      ensureAllLanguagesSupport().catch(error => {
        console.warn('[i18n] Error in background language preloading:', error);
      });
    }, 2000);
    
    // Mark initialization as complete
    if (typeof window !== 'undefined') {
      window.i18nFullyInitialized = true;
      
      // Dispatch event
      const event = new CustomEvent('i18n:initialized', { 
        detail: { 
          language: currentLanguage,
          timestamp: Date.now()
        } 
      });
      
      document.dispatchEvent(event);
      window.dispatchEvent(event);
      
      console.log(`[i18n] Initialization complete with language: ${currentLanguage}`);
    }
    
    return true;
  } catch (error) {
    console.error('[i18n] Error initializing i18n system:', error);
    return false;
  }
}

// Export functions and configuration
export default {
  initI18n,
  t,
  changeLanguage,
  isRTL
};