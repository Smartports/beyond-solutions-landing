/**
 * Sistema de internacionalización (i18n) para Beyond Solutions
 * Maneja la carga, cambio y traducción de contenido en múltiples idiomas
 */

// Configuración global
const DEFAULT_OPTIONS = {
  basePath: '/i18n',
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
  
  // Cargar el idioma detectado
  await changeLanguage(detectedLanguage);
  
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
    console.log(`[i18n] Inicializado con idioma: ${currentLanguage}`);
  }
  
  return {
    t,
    changeLanguage,
    getCurrentLanguage: () => currentLanguage,
    getSupportedLanguages: () => options.supportedLanguages,
    isRTL: isRTL
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
    return urlLang;
  }
  
  const storedLanguage = localStorage.getItem(options.storageKey);
  if (storedLanguage && isSupported(storedLanguage)) {
    return storedLanguage;
  }
  
  // Preferencia del navegador
  const browserLang = navigator.language.split('-')[0];
  if (isSupported(browserLang)) {
    return browserLang;
  }
  
  // Idioma por defecto
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
 * Cambia el idioma actual y actualiza la interfaz
 * @param {string} langCode - Código del idioma
 * @returns {Promise<boolean>} - Éxito o fracaso
 */
export async function changeLanguage(langCode) {
  if (!isSupported(langCode)) {
    if (options.debug) {
      console.warn(`[i18n] Idioma no soportado: ${langCode}, usando fallback: ${options.fallbackLanguage}`);
    }
    langCode = options.fallbackLanguage;
  }
  
  try {
    // Cargar las traducciones si no están en caché
    if (!translationsCache.has(langCode)) {
      await loadTranslations(langCode);
    }
    
    // Actualizar idioma actual
    const previousLanguage = currentLanguage;
    currentLanguage = langCode;
    
    // Guardar en localStorage
    localStorage.setItem(options.storageKey, langCode);
    
    // Actualizar atributos HTML
    updateHtmlLangAttribute();
    updateTextDirection();
    
    // Actualizar URL con el parámetro de idioma (sin recargar la página)
    updateUrlWithLanguage(langCode);
    
    // Traducir elementos de la página
    await translatePageElements();
    
    // Disparar evento de cambio de idioma
    document.dispatchEvent(new CustomEvent('i18n:languageChanged', { 
      detail: { 
        language: langCode,
        previousLanguage: previousLanguage
      } 
    }));
    
    if (options.debug) {
      console.log(`[i18n] Idioma cambiado a: ${langCode}`);
    }
    
    return true;
  } catch (error) {
    console.error(`[i18n] Error al cambiar idioma a ${langCode}:`, error);
    return false;
  }
}

/**
 * Actualiza la URL con el parámetro de idioma
 * @param {string} langCode - Código del idioma
 */
function updateUrlWithLanguage(langCode) {
  // No actualizar la URL si estamos en el idioma por defecto
  if (langCode === options.defaultLanguage) {
    // Si hay un parámetro 'lang' en la URL, eliminarlo
    if (window.location.search.includes('lang=')) {
      const url = new URL(window.location);
      url.searchParams.delete('lang');
      window.history.replaceState({}, '', url);
    }
    return;
  }
  
  // Actualizar o agregar el parámetro 'lang' en la URL
  const url = new URL(window.location);
  url.searchParams.set('lang', langCode);
  window.history.replaceState({}, '', url);
}

/**
 * Carga las traducciones para un idioma específico
 * @param {string} langCode - Código del idioma
 * @returns {Promise<Object>} - Objeto con las traducciones
 */
async function loadTranslations(langCode) {
  try {
    const lang = options.supportedLanguages.find(l => l.code === langCode);
    if (!lang) {
      throw new Error(`Idioma no encontrado: ${langCode}`);
    }
    
    const filePath = `${options.basePath}/${lang.file}`;
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const translations = await response.json();
    translationsCache.set(langCode, translations);
    
    if (options.debug) {
      console.log(`[i18n] Traducciones cargadas para ${langCode}`);
    }
    
    return translations;
  } catch (error) {
    console.error(`[i18n] Error cargando traducciones para ${langCode}:`, error);
    
    // Si es el idioma por defecto el que falla, crear un objeto vacío
    // Si no, intentar cargar el idioma de respaldo
    if (langCode === options.fallbackLanguage) {
      translationsCache.set(langCode, {});
      return {};
    } else {
      return loadTranslations(options.fallbackLanguage);
    }
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
  if (!currentLanguage || !translationsCache.has(currentLanguage)) {
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
        if (currentLanguage !== options.fallbackLanguage && translationsCache.has(options.fallbackLanguage)) {
          const fallbackTranslations = translationsCache.get(options.fallbackLanguage);
          let fallbackValue = fallbackTranslations;
          
          for (const k of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
              fallbackValue = fallbackValue[k];
            } else {
              return defaultValue || key;
            }
          }
          
          value = fallbackValue;
        } else {
          return defaultValue || key;
        }
      }
    }
    
    if (typeof value === 'string') {
      // Interpolación de parámetros {{param}}
      return value.replace(/{{([^{}]*)}}/g, (matched, param) => {
        return params[param] !== undefined ? params[param] : matched;
      });
    }
    
    return defaultValue || key;
  } catch (error) {
    if (options.debug) {
      console.error(`[i18n] Error traduciendo clave "${key}":`, error);
    }
    return defaultValue || key;
  }
}

/**
 * Traduce todos los elementos de la página que contienen el atributo data-i18n
 */
async function translatePageElements() {
  // Elementos con atributo data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key, {}, el.textContent);
    }
  });
  
  // Elementos con atributo data-i18n-attr (para atributos)
  const attrElements = document.querySelectorAll('[data-i18n-attr]');
  attrElements.forEach(el => {
    const attrPairs = el.getAttribute('data-i18n-attr').split(',');
    
    attrPairs.forEach(pair => {
      const [attr, key] = pair.trim().split(':');
      if (attr && key) {
        const translated = t(key, {}, el.getAttribute(attr) || '');
        el.setAttribute(attr, translated);
      }
    });
  });
  
  // Elementos con atributo data-i18n-html (para HTML interno)
  const htmlElements = document.querySelectorAll('[data-i18n-html]');
  htmlElements.forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (key) {
      el.innerHTML = t(key, {}, el.innerHTML);
    }
  });
}

// Exportar funciones y configuración
export default {
  initI18n,
  t,
  changeLanguage,
  isRTL
}; 