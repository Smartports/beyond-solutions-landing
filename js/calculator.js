/**
 * Beyond Solutions - Calculator Module
 * Maneja la lógica de la calculadora de presupuesto inmobiliario
 */

// Debug helper to diagnose i18n issues
function debugI18nState() {
  console.group('🔍 [i18n Debug] Translation System State');
  try {
    // Check for i18n availability
    const i18nAvailable = typeof window.i18n !== 'undefined';
    const tFunctionAvailable = typeof window.t === 'function';
    const currentLanguage = window.i18n?.getCurrentLanguage?.() || 
                          localStorage.getItem('beyondLocale') || 
                          'unknown';
    
    console.log('📊 Basic state:', {
      i18nAvailable,
      tFunctionAvailable,
      currentLanguage,
      windowHasT: 'undefined' !== typeof window.t,
      i18nHasT: i18nAvailable && 'undefined' !== typeof window.i18n.t
    });
    
    // Test translation function
    if (tFunctionAvailable) {
      const testKey = 'nav.items.about';
      console.log(`🔤 Testing translation for key "${testKey}"...`);
      try {
        const translationResult = window.t(testKey);
        console.log(`✅ Translation result: "${translationResult}" (success: ${translationResult !== testKey})`);
      } catch (e) {
        console.error('❌ Translation test failed:', e);
      }
    }
    
    // Check cache state if available
    if (i18nAvailable && window.i18n.translationsCache) {
      console.log('📦 Translations cache state:', {
        keys: Array.from(window.i18n.translationsCache.keys()),
        hasCurrent: window.i18n.translationsCache.has(currentLanguage),
        currentLanguage
      });
    } else {
      console.log('📦 Translations cache not directly accessible');
    }
    
    // Document readiness and Alpine state
    console.log('🌐 Environment:', {
      documentReady: document.readyState,
      alpineLoaded: 'undefined' !== typeof Alpine,
      alpineI18nStore: Alpine?.store?.('i18n'),
      userAgent: navigator.userAgent
    });
  } catch (e) {
    console.error('Error in i18n debug function:', e);
  }
  console.groupEnd();
}

// Call debug function automatically when loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('[calculator.js] DOMContentLoaded event received');
  setTimeout(debugI18nState, 500);  // Initial debug
  
  // Also debug when i18n events fire
  document.addEventListener('i18n:ready', () => {
    console.log('[calculator.js] i18n:ready event received');
    debugI18nState();
  });
  
  document.addEventListener('i18n:languageChanged', () => {
    console.log('[calculator.js] i18n:languageChanged event received');
    debugI18nState();
  });
});

// Update calculator translations helper
window.updateCalculatorTranslations = function() {
  debugI18nState();
  
  // Original function would go here
  console.log('[calculator.js] Calculator translations updating...');
  
  // Notify at the end
  console.log('[calculator.js] Calculator translations updated');
};

import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm';

/* Exponemos dependencias en window para que el resto del código las use */
window.jsPDF  = jsPDF;
window.Papa   = Papa;

// Global flag to track i18n initialization state
window.i18nFullyInitialized = false;

// Track when initialization happens
document.addEventListener('i18n:ready', () => {
  setTimeout(() => {
    window.i18nFullyInitialized = true;
    console.log('[global] i18n fully initialized flag set to true');
    
    // Preload all languages to ensure they're available
    preloadAllTranslations();
  }, 100); // Small delay to ensure everything is ready
});

/**
 * Preload translations for all supported languages
 */
window.preloadAllTranslations = async function preloadAllTranslations() {
  try {
    console.log('[calculator] Preloading all translations');
    
    // List of all supported languages
    const languages = [
      'es', 'en', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru',
      'ar', 'pl', 'tr', 'hi', 'vi', 'el', 'sv', 'nl'
    ];
    
    // Current language
    const currentLang = window.i18n?.getCurrentLanguage?.() || 
                      localStorage.getItem('beyondLocale') || 
                      'es';
    
    // Move current language to the beginning for faster loading
    const sortedLanguages = [
      currentLang,
      ...languages.filter(lang => lang !== currentLang)
    ];
    
    // Load each language in sequence (not parallel to avoid overwhelming the server)
    for (const lang of sortedLanguages) {
      try {
        console.log(`[calculator] Preloading translations for ${lang}`);
        
        // Use fetch directly to ensure we get the translations
        const response = await fetch(`./i18n/${lang}.json?_=${Date.now()}`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${lang}: ${response.status}`);
        }
        
        const translations = await response.json();
        
        // Store in the translations cache if available
        if (window.i18n?.translationsCache instanceof Map) {
          window.i18n.translationsCache.set(lang, translations);
          console.log(`[calculator] Successfully cached translations for ${lang}`);
        } else {
          // Try to use the internal function if available
          if (typeof window.i18n?.changeLanguage === 'function') {
            // This will load and cache the translations
            await window.i18n.changeLanguage(lang);
            // Change back to the original language
            if (lang !== currentLang) {
              await window.i18n.changeLanguage(currentLang);
            }
          }
        }
      } catch (e) {
        console.error(`[calculator] Error preloading translations for ${lang}:`, e);
      }
    }
    
    console.log('[calculator] Finished preloading all translations');
    
    // Force update translations after preloading
    if (typeof updateAllTranslations === 'function') {
      updateAllTranslations();
    } else if (typeof window.updateCalculatorTranslations === 'function') {
      window.updateCalculatorTranslations();
    }
    
    // Apply direct fixes if available
    if (typeof window.directFixTranslations === 'function') {
      window.directFixTranslations();
    }
  } catch (e) {
    console.error('[calculator] Error in preloadAllTranslations:', e);
  }
}

/**
 * Safe translation helper function that won't throw errors when i18n isn't ready
 * @param {string} key - Translation key
 * @param {string} defaultValue - Default value to return if translation isn't available
 * @returns {string} - Translated string or default value
 */
function safeTranslate(key, defaultValue = '') {
  try {
    // If i18n is fully initialized and we still have null language, it's worth logging
    const shouldLog = window.i18nFullyInitialized;
    
    // Check if i18n is initialized with a valid language
    if (window.i18n && 
        typeof window.i18n.t === 'function' && 
        window.i18n.getCurrentLanguage && 
        window.i18n.getCurrentLanguage()) {
      return window.i18n.t(key, {}, defaultValue);
    }
    
    // Fallback to window.t if available
    if (typeof window.t === 'function') {
      // Create a wrapper that won't fail if window.t internally has issues
      try {
        return window.t(key, {}, defaultValue);
      } catch (e) {
        if (shouldLog) {
          console.warn(`[safeTranslate] Error using window.t with key "${key}":`, e);
        }
        return defaultValue || key;
      }
    }
    
    // If no translation function is available, return default
    return defaultValue || key;
  } catch (e) {
    if (window.i18nFullyInitialized) {
      console.error(`[safeTranslate] Error translating key "${key}":`, e);
    }
    return defaultValue || key;
  }
}

// Define calculator form component globally before Alpine initialization
document.addEventListener('alpine:init', () => {
    // Crear un store para i18n si no existe
    if (!Alpine.store('i18n')) {
        Alpine.store('i18n', {
            ready: false,
            timestamp: 0
        });
    }
    
    Alpine.data('calculatorForm', () => ({
  // Estado reactivo
  costItems: [
    { key: 'landPreparation', label: 'Preparación del terreno', defaultPercent: 10 },
    { key: 'materials',       label: 'Materiales',               defaultPercent: 40 },
    { key: 'labor',           label: 'Mano de obra',             defaultPercent: 30 },
    { key: 'contingency',     label: 'Contingencia',             defaultPercent: 20 },
  ],
  steps: [
    { id: 'scope',    label: '1. Tipo de Proyecto' }, // Will be translated dynamically
    { id: 'land',     label: '2. Datos del Terreno' }, // Will be translated dynamically
    { id: 'costs',    label: '3. Desglose de Costos' }, // Will be translated dynamically
    { id: 'results',  label: '4. Resultados' }, // Will be translated dynamically
  ],
  
  // Update steps after i18n is ready
  updateSteps() {},
  currentStep: 0,
  form: {
    scope: '',
    entity: '',
    budgetTotal: null,
    land: {
      address: '',
      type: '',
      status: '',
      surface: null,
      use: '',
      characteristics: '',
      usableSurface: null,
    },
    costs: {
      regulatorio: { percent: 0.05, value: 0 },
      materiales: { percent: 0.53, value: 0, level: 'low' },
      construccion: { percent: 0.3, value: 0 },
      arquitectura: { percent: 0.07, value: 0 },
      diseno: { percent: 0.05, value: 0 },
      arte: { percent: 0.05, value: 0 },
    },
  },
  costKeys: ['regulatorio', 'materiales', 'construccion', 'arquitectura', 'diseno', 'arte'],
  costLabels: {
    regulatorio: 'Regulatorio',
    materiales: 'Materiales',
    construccion: 'Construcción',
    arquitectura: 'Arquitectura',
    diseno: 'Diseño',
    arte: 'Arte',
  },
  
  // Estas funciones ya no se usan directamente, se centraliza en updateAllTranslations
  updateCostLabels() {},
  updatePlaceholders() {},
  updateSelectOptions() {},
  updateTooltips() {},

  // Función de ayuda para traducir de forma segura. Se hace reactiva al store.
  safeTranslate(key, fallback = '') {
    // La dependencia de `this.$store.i18n.revision` fuerza la re-evaluación.
    const revision = this.$store.i18n.revision;
    return safeTranslate(key, fallback);
  },

  // Función para traducir atributos no reactivos (placeholders, options).
  updateAllTranslations() {
    console.log('Updating all calculator translations');
    
    try {
      // Update all text content with data-i18n attributes
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
          element.textContent = this.safeTranslate(key, element.textContent);
        }
      });
      
      // Update all placeholders with data-i18n-placeholder attributes
      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (key) {
          element.placeholder = this.safeTranslate(key, element.placeholder);
        }
      });
      
      // Update all step labels
      this.updateStepLabels();
      
      // Fix specific elements that might not be updated correctly
      this.fixSpecificElements();
      
      // Update hidden steps as well
      this.updateHiddenStepElements();
      
      // Update form field labels and descriptions
      this.updateFormFieldLabels();
      
      // Update summary fields
      this.updateSummaryFields();
      
      // Schedule another update for problematic elements
      setTimeout(() => { this.fixSpecificElements(); }, 100);
      setTimeout(() => { this.updateHiddenStepElements(); }, 200);
      setTimeout(() => { this.fixSpecificElements(); }, 300);
    } catch (error) {
      console.error('Error updating calculator translations:', error);
    }
  },
  
  // Helper method to translate elements in a container
  translateElementsInContainer(container, t) {
    if (!container) return;
    
        // Translate all placeholders based on data-i18n-attr attributes
    container.querySelectorAll('[data-i18n-attr*="placeholder"]').forEach(input => {
            const attr = input.getAttribute('data-i18n-attr');
            if (attr) {
                const match = attr.match(/placeholder:([^,]+)/);
                if (match && match[1]) {
                    const key = match[1];
                    input.placeholder = t(key, input.placeholder);
                }
            }
        });
        
        // Special case for characteristics field
    const charInput = container.querySelector('#characteristics');
    if (charInput) {
            charInput.placeholder = t('calculator.step2.characteristics.placeholder', charInput.placeholder);
        }

        // Translate all select options
    container.querySelectorAll('select').forEach(select => {
            // Translate disabled/placeholder options
            const disabledOption = select.querySelector('option[disabled]');
            if (disabledOption) {
                const key = disabledOption.getAttribute('data-i18n');
                if (key) {
                    disabledOption.textContent = t(key, disabledOption.textContent);
                }
            }
            
            // Translate all regular options
            select.querySelectorAll('option[data-i18n]').forEach(option => {
                const key = option.getAttribute('data-i18n');
                if (key) {
                    option.textContent = t(key, option.textContent);
                }
            });
        });
        
        // Update all regular text nodes with data-i18n attribute
    container.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key && el.tagName !== 'OPTION') { // Skip options as they're handled above
                el.textContent = t(key, el.textContent);
            }
        });
        
        // Update attributes like aria-label that have translations
    container.querySelectorAll('[data-i18n-attr]').forEach(el => {
            const attrSpec = el.getAttribute('data-i18n-attr');
            if (attrSpec) {
                attrSpec.split(',').forEach(spec => {
                    const [attr, key] = spec.trim().split(':');
                    if (attr && key && attr !== 'placeholder') { // Skip placeholders as they're handled above
                        el.setAttribute(attr, t(key, el.getAttribute(attr) || ''));
                    }
                });
            }
        });
  },
  
  // Helper method to translate hidden steps by temporarily making them visible
  prepareAndTranslateHiddenStep(stepIdx, container, t) {
    // Cache important translation keys for each step
    const stepTranslations = {
        0: [ // Step 1
            'calculator.step1.title',
            'calculator.step1.scope',
            'calculator.step1.entity',
            'calculator.step1.scope.select',
            'calculator.values.scope.patrimonial',
            'calculator.values.scope.inversion',
            'calculator.values.entity.b2b',
            'calculator.values.entity.b2c',
            'calculator.form.required_field'
        ],
        1: [ // Step 2
            'calculator.step2.title',
            'calculator.step2.budget',
            'calculator.step2.address',
            'calculator.step2.type',
            'calculator.step2.status',
            'calculator.step2.surface',
            'calculator.step2.usableSurface',
            'calculator.step2.use',
            'calculator.step2.characteristics',
            'calculator.step2.type.select',
            'calculator.step2.status.select',
            'calculator.values.type.own',
            'calculator.values.type.notown',
            'calculator.values.type.remate',
            'calculator.values.status.construccion',
            'calculator.values.status.demolicion',
            'calculator.values.status.reconversion',
            'calculator.form.budget_description',
            'calculator.form.address_description',
            'calculator.form.type_description',
            'calculator.form.status_description',
            'calculator.form.surface_description',
            'calculator.form.usableSurface_description'
        ]
    };
    
    // Pre-translate these keys and cache them for when the steps become visible
    if (stepTranslations[stepIdx]) {
        for (const key of stepTranslations[stepIdx]) {
            const translation = t(key);
            
            // Pre-populate the form labels by looking for matching elements
            document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
                if (el.textContent !== translation) {
                    el.textContent = translation;
                }
            });
        }
    }
    
    // Update the summary section which is always visible and contains translations for fields from all steps
    const summaryItems = [
        'calculator.summary.scope',
        'calculator.summary.entity',
        'calculator.summary.budget',
        'calculator.summary.address',
        'calculator.summary.surface',
        'calculator.summary.usableSurface',
        'calculator.summary.use',
        'calculator.summary.type',
        'calculator.summary.status'
    ];
    
    for (const key of summaryItems) {
        document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
            const translation = t(key, el.textContent);
            if (el.textContent !== translation) {
                el.textContent = translation;
            }
        });
    }
  },
  
  // Specific function to handle critical translations that must always be updated
  forceUpdateCriticalTranslations() {
    console.log('[calculator] Force updating critical translations');
    
    // First apply the direct fix for specific problematic elements
    this.fixSpecificElements();
    
    // Use window.i18n.t directly if available
    let translateFn;
    if (window.i18n && typeof window.i18n.t === 'function') {
      translateFn = (key, defaultValue) => window.i18n.t(key, {}, defaultValue);
    } else if (typeof window.t === 'function') {
      translateFn = (key, defaultValue) => window.t(key, {}, defaultValue);
    } else {
      console.error('[calculator] No translation function available!');
      return;
    }
    
    // Get current language for logging
    const currentLanguage = window.i18n?.getCurrentLanguage?.() || localStorage.getItem('beyondLocale') || 'es';
    console.log(`[calculator] Current language: ${currentLanguage}`);
    
    // List of critical keys that must be translated
    const criticalKeys = [
      'calculator.summary.scope',
      'calculator.summary.entity',
      'calculator.form.budget_description',
      'calculator.step2.address.placeholder',
      'calculator.step2.type',
      'calculator.step2.status',
      'calculator.step2.surface',
      'calculator.step2.usableSurface',
      'calculator.step2.characteristics',
      'calculator.form.surface_description',
      'calculator.form.usableSurface_description',
      'calculator.form.type_description',
      'calculator.form.status_description',
      'calculator.form.budget_description',
      'calculator.form.address_description',
      'calculator.form.required_field',
      'calculator.step1.scope',
      'calculator.step1.entity'
    ];
    
    // First log all translations to verify they're available
    console.log('[calculator] Critical translations:');
    const translations = {};
    criticalKeys.forEach(key => {
      translations[key] = translateFn(key, key);
      console.log(`- ${key}: "${translations[key]}"`);
    });
    
    // Direct translation of specific labels that might be causing issues
    const directTranslationMap = {
      '[for="scope"]': 'calculator.step1.scope',
      '[for="entity"]': 'calculator.step1.entity',
      '[for="budgetTotal"]': 'calculator.step2.budget',
      '[for="address"]': 'calculator.step2.address',
      '[for="landType"]': 'calculator.step2.type',
      '[for="type"]': 'calculator.step2.type',
      '[for="status"]': 'calculator.step2.status',
      '[for="surface"]': 'calculator.step2.surface',
      '[for="usableSurface"]': 'calculator.step2.usableSurface',
      '[for="use"]': 'calculator.step2.use',
      '[for="characteristics"]': 'calculator.step2.characteristics',
      '#scope-description': 'calculator.form.required_field',
      '#entity-description': 'calculator.form.required_field',
      '#budgetTotal-description': 'calculator.form.budget_description',
      '#address-description': 'calculator.form.address_description',
      '#type-description': 'calculator.form.type_description',
      '#status-description': 'calculator.form.status_description',
      '#surface-description': 'calculator.form.surface_description',
      '#usableSurface-description': 'calculator.form.usableSurface_description'
    };
    
    // Apply direct translations with specific selectors
    Object.entries(directTranslationMap).forEach(([selector, key]) => {
      const elements = document.querySelectorAll(selector);
      const translation = translateFn(key, "");
      
      elements.forEach(el => {
        if (translation && translation !== key) {
          el.textContent = translation;
        } else if (el.textContent.includes('calculator.')) {
          // If element contains a translation key, try to extract the last part as a fallback
          const lastPart = el.textContent.split('.').pop();
          if (lastPart) {
            // Capitalize first letter and replace underscores/hyphens with spaces
            const fallback = lastPart.charAt(0).toUpperCase() + 
                            lastPart.slice(1).replace(/[_-]/g, ' ');
            el.textContent = fallback;
          }
        }
      });
    });
    
    // Now handle data-i18n elements by forcing direct translation
    document.querySelectorAll(`[data-i18n]`).forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (criticalKeys.includes(key)) {
        const translation = translateFn(key, "");
        
        if (translation && translation !== key) {
          el.textContent = translation;
        } else if (el.textContent.includes('calculator.')) {
          // If element contains a translation key, try to extract the last part as a fallback
          const lastPart = el.textContent.split('.').pop();
          if (lastPart) {
            // Capitalize first letter and replace underscores/hyphens with spaces
            const fallback = lastPart.charAt(0).toUpperCase() + 
                            lastPart.slice(1).replace(/[_-]/g, ' ');
            el.textContent = fallback;
          }
        }
      }
    });
    
    // Force-update placeholders
    document.querySelectorAll('input[data-i18n-attr*="placeholder"]').forEach(input => {
      const attrSpec = input.getAttribute('data-i18n-attr');
      if (attrSpec) {
        const match = attrSpec.match(/placeholder:([^,]+)/);
        if (match && match[1]) {
          const key = match[1];
          const translation = translateFn(key, "");
          
          if (translation && translation !== key) {
            input.placeholder = translation;
          }
        }
      }
    });
    
    // Special handling for summary items
    document.querySelectorAll('.summary-container li span.font-semibold').forEach(span => {
      const key = span.getAttribute('data-i18n');
      if (key && key.startsWith('calculator.summary.')) {
        const translation = translateFn(key, "");
        if (translation && translation !== key) {
          span.textContent = translation;
        } else if (span.textContent.includes('calculator.')) {
          // Extract meaningful part from the key
          const lastPart = key.split('.').pop();
          if (lastPart) {
            const fallback = lastPart.charAt(0).toUpperCase() + 
                            lastPart.slice(1).replace(/[_-]/g, ' ');
            span.textContent = fallback;
          }
        }
      }
    });
  },

  results: {
    totalCost: 0,
    totalSell: 0,
    profit: 0,
    m2Cost: 0,
    m2Sell: 0,
  },
  profitMargin: 0.3, // Default
  errors: {},
  tooltipTexts: {
    budgetTotal: safeTranslate('calculator.tooltips.budgetTotal', 'Incluye terreno y construcción, sin regulatorio.'),
    usableSurface: safeTranslate('calculator.tooltips.usableSurface', 'Superficie útil construible según uso de suelo.'),
    materialesLevel: safeTranslate('calculator.tooltips.materialesLevel', 'Define el rango de calidad y costo de materiales.'),
  },
  feedbackMessage: '',
  feedbackType: '',
  init() {
    this.costItems.forEach(item => {
        this.form.costs[item.key] = {
          percent: item.defaultPercent,
          amount:  0,
        };
    });

    this.form.costs.materiales.level = 'low';
    this.calculateResults();

    // Apply translations immediately
    this.updateAllTranslations();
    
    // Force critical translations directly
    this.forceUpdateCriticalTranslations();
    
    // Apply direct fix for problematic elements
    this.fixSpecificElements();
    
    // Schedule another fix after a short delay to ensure DOM is fully loaded
    setTimeout(() => {
      this.fixSpecificElements();
    }, 300);
    
    // Listen for language changes and update translations
    const languageChangedHandler = () => {
      console.log('Language changed event detected in calculator');
      
      // First update immediately
      this.updateAllTranslations();
      this.forceUpdateCriticalTranslations();
      
      // Apply direct fix for problematic elements
      this.fixSpecificElements();
      
      // Apply multiple updates with delays to ensure all elements get translated
      // This handles async loading of translations and DOM updates
      const delayTimes = [100, 300, 500, 1000];
      delayTimes.forEach(delay => {
        setTimeout(() => {
          console.log(`[calculator] Applying translation update after ${delay}ms`);
          this.updateAllTranslations();
          this.forceUpdateCriticalTranslations();
          
          // Special handling for specific elements that might need direct updates
          if (delay >= 300) {
            // Force update on step indicators and navigation texts
            document.querySelectorAll('.step-indicator').forEach(el => {
              const key = el.getAttribute('data-i18n');
              if (key) {
                const t = (key, defaultValue) => this.safeTranslate(key, defaultValue);
                el.textContent = t(key, el.textContent);
              }
            });
            
            // Update visible summary labels
            document.querySelectorAll('[data-i18n^="calculator.summary."]').forEach(el => {
              const key = el.getAttribute('data-i18n');
              if (key) {
                const t = (key, defaultValue) => this.safeTranslate(key, defaultValue);
                el.textContent = t(key, el.textContent);
              }
            });
          }
          
          // Force Alpine to update the UI if possible
          if (window.Alpine) {
            try {
              Alpine.store('i18n').revision = (Alpine.store('i18n').revision || 0) + 1;
              Alpine.store('i18n').timestamp = Date.now();
            } catch (e) {
              console.error('[calculator] Error updating Alpine store:', e);
            }
          }
        }, delay);
      });
    };
    
    // Add multiple event listeners to ensure we catch all language change events
    document.addEventListener('i18n:languageChanged', languageChangedHandler);
    window.addEventListener('i18n:languageChanged', languageChangedHandler);
    document.addEventListener('i18n:ready', languageChangedHandler);
    
    // Force translation update shortly after initialization to catch any lazy-loaded translations
    setTimeout(() => {
      this.updateAllTranslations();
    }, 500);

    this.$watch('form.budgetTotal', () => this.calculateResults());
    this.$watch('form.land.usableSurface', () => this.calculateResults());
    this.$watch('form.costs', () => this.calculateResults(), { deep:true });
  },
  validateStep() {
    // Clear previous errors
    this.errors = {};
    
    // Validate based on current step
    if (this.currentStep === 0) {
      if (!this.form.scope) {
        this.errors.scope = safeTranslate('calculator.errors.scope', 'El tipo de proyecto es obligatorio');
      }
      if (!this.form.entity) {
        this.errors.entity = safeTranslate('calculator.errors.entity', 'La entidad es obligatoria');
      }
    }
    
    if (this.currentStep === 1) {
      if (!this.form.budgetTotal || this.form.budgetTotal <= 0) {
        this.errors.budgetTotal = safeTranslate('calculator.errors.budgetTotal', 'El presupuesto debe ser mayor a 0');
      }
      if (!this.form.land.address) {
        this.errors.address = safeTranslate('calculator.errors.address', 'La dirección es obligatoria');
      }
      if (!this.form.land.type) {
        this.errors.type = safeTranslate('calculator.errors.type', 'El tipo de terreno es obligatorio');
      }
      if (!this.form.land.status) {
        this.errors.status = safeTranslate('calculator.errors.status', 'El estatus es obligatorio');
      }
      if (!this.form.land.surface || this.form.land.surface <= 0) {
        this.errors.surface = safeTranslate('calculator.errors.surface', 'La superficie debe ser mayor a 0');
      }
      if (!this.form.land.usableSurface || this.form.land.usableSurface <= 0) {
        this.errors.usableSurface = safeTranslate('calculator.errors.usableSurface', 'La superficie útil debe ser mayor a 0');
      }
    }
    
    if (this.currentStep === 2) {
      for (const key of this.costKeys) {
        if (this.form.costs[key].percent === null || this.form.costs[key].percent < 0) {
          this.errors[key] = safeTranslate('calculator.errors.percent', 'El porcentaje es obligatorio');
        }
      }
    }
    return Object.keys(this.errors).length === 0;
  },
  nextStep() {
    console.log('nextStep called, current step:', this.currentStep);
    
    // Validate the current step before proceeding
    if (!this.validateStep()) {
      return;
    }
    
    // Store the current step for reference
    const leavingStep = this.currentStep;
    
    // Calculate the next step
    const nextStep = this.currentStep + 1;
    
    // Check if we're at the last step
    if (nextStep >= this.steps.length) {
      return;
    }
    
    // Update the current step
    this.currentStep = nextStep;
    
    // Special handling for step transitions
    if (leavingStep === 0 && nextStep === 1) {
      // When moving from step 1 to step 2, ensure step 2 translations are correct
      console.log('Special handling for step 1 to step 2 transition');
      
      // Apply fixes multiple times with increasing delays
      [10, 50, 100, 300, 500].forEach(delay => {
        setTimeout(() => {
          // Try multiple approaches to fix translations
          if (typeof this.fixSpecificElements === 'function') {
            this.fixSpecificElements();
          }
          
          if (typeof this.updateHiddenStepElements === 'function') {
            this.updateHiddenStepElements();
          }
          
          if (typeof window.fixCalculatorTranslations === 'function') {
            window.fixCalculatorTranslations();
          }
          
          // Force update all translations
          this.updateAllTranslations();
          this.forceUpdateCriticalTranslations();
        }, delay);
      });
    }
    
    // Update URL hash
    window.location.hash = `step${nextStep + 1}`;
    
    // Scroll to top of form
    const calculatorForm = document.querySelector('.calculator-container');
    if (calculatorForm) {
      calculatorForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Dispatch a custom event that step has changed
    const event = new CustomEvent('calculator:stepChanged', {
      detail: {
        previousStep: leavingStep,
        currentStep: nextStep,
        direction: 'forward'
      }
    });
    document.dispatchEvent(event);
  },
  prevStep() {
    console.log('prevStep called, current step:', this.currentStep);
    
    // Calculate the previous step
    const prevStep = this.currentStep - 1;
    
    // Check if we're at the first step
    if (prevStep < 0) {
      return;
    }
    
    // Store the current step for reference
    const leavingStep = this.currentStep;
    
    // Update the current step
    this.currentStep = prevStep;
    
    // Apply translations before showing the step
    if (typeof this.updateAllTranslations === 'function') {
      this.updateAllTranslations();
    }
    
    // Apply direct fixes if available
    if (typeof window.directFixTranslations === 'function') {
      window.directFixTranslations();
    }
    
    // Special handling for step transitions
    if (leavingStep === 1 && prevStep === 0) {
      // When moving from step 2 to step 1, ensure step 1 translations are correct
      console.log('Special handling for step 2 to step 1 transition');
      
      // Apply fixes multiple times with increasing delays
      [10, 50, 100, 300, 500].forEach(delay => {
        setTimeout(() => {
          // Try multiple approaches to fix translations
          if (typeof this.fixSpecificElements === 'function') {
            this.fixSpecificElements();
          }
          
          if (typeof this.updateHiddenStepElements === 'function') {
            this.updateHiddenStepElements();
          }
          
          if (typeof window.fixCalculatorTranslations === 'function') {
            window.fixCalculatorTranslations();
          }
          
          // Force update all translations
          this.updateAllTranslations();
          this.forceUpdateCriticalTranslations();
        }, delay);
      });
    }
    
    // Update URL hash
    window.location.hash = `step${prevStep + 1}`;
    
    // Scroll to top of form
    const calculatorForm = document.querySelector('.calculator-container');
    if (calculatorForm) {
      calculatorForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Dispatch a custom event that step has changed
    const event = new CustomEvent('calculator:stepChanged', {
      detail: {
        previousStep: leavingStep,
        currentStep: prevStep,
        direction: 'backward'
      }
    });
    document.dispatchEvent(event);
  },
  goToStep(stepNumber) {
    console.log('goToStep called with step:', stepNumber);
    
    // Validate that the step number is valid
    if (stepNumber < 0 || stepNumber >= this.steps.length) {
      return;
    }
    
    // Store the current step for reference
    const leavingStep = this.currentStep;
    
    // Update the current step
    this.currentStep = stepNumber;
    
    // Apply translations for the new step
    if (typeof this.updateAllTranslations === 'function') {
      this.updateAllTranslations();
    }
    
    // Apply direct fixes if available
    if (typeof window.directFixTranslations === 'function') {
      window.directFixTranslations();
    }
    
    // Special handling for step transitions
    if (Math.abs(leavingStep - stepNumber) > 0) {
      console.log(`Special handling for transition from step ${leavingStep + 1} to step ${stepNumber + 1}`);
      
      // Apply fixes multiple times with increasing delays
      [10, 50, 100, 300, 500].forEach(delay => {
        setTimeout(() => {
          // Try multiple approaches to fix translations
          if (typeof this.fixSpecificElements === 'function') {
            this.fixSpecificElements();
          }
          
          if (typeof this.updateHiddenStepElements === 'function') {
            this.updateHiddenStepElements();
          }
          
          if (typeof window.fixCalculatorTranslations === 'function') {
            window.fixCalculatorTranslations();
          }
          
          // Force update all translations
          this.updateAllTranslations();
          this.forceUpdateCriticalTranslations();
        }, delay);
      });
    }
    
    // Update URL hash
    window.location.hash = `step${stepNumber + 1}`;
    
    // Scroll to top of form
    const calculatorForm = document.querySelector('.calculator-container');
    if (calculatorForm) {
      calculatorForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Dispatch a custom event that step has changed
    const event = new CustomEvent('calculator:stepChanged', {
      detail: {
        previousStep: leavingStep,
        currentStep: stepNumber,
        direction: leavingStep < stepNumber ? 'forward' : 'backward'
      }
    });
    document.dispatchEvent(event);
  },
  resetForm() {
    this.form = {
      scope: '',
      entity: '',
      budgetTotal: null,
      land: {
        address: '',
        type: '',
        status: '',
        surface: null,
        use: '',
        characteristics: '',
        usableSurface: null,
      },
      costs: {
        regulatorio: { percent: 0.05, value: 0 },
        materiales: { percent: 0.53, value: 0, level: 'low' },
        construccion: { percent: 0.3, value: 0 },
        arquitectura: { percent: 0.07, value: 0 },
        diseno: { percent: 0.05, value: 0 },
        arte: { percent: 0.05, value: 0 },
      },
    };
    this.results = {
      totalCost: 0,
      totalSell: 0,
      profit: 0,
      m2Cost: 0,
      m2Sell: 0,
    };
    this.currentStep = 0;
    // Asegurar que las traducciones se apliquen después de resetear.
    this.updateAllTranslations();
  },
  calculateResults() {
    // Calcular valores de cada rubro
    let totalCost = 0;
    for (const key of this.costKeys) {
      const percent = parseFloat(this.form.costs[key].percent) || 0;
      const value = (parseFloat(this.form.budgetTotal) || 0) * percent;
      this.form.costs[key].value = value;
      totalCost += value;
    }
    // Precio de venta estimado
    const totalSell = totalCost * (1 + this.profitMargin);
    // Utilidad bruta
    const profit = totalSell - totalCost;
    // Costo y venta por m2
    const m2 = parseFloat(this.form.land.usableSurface) || 1;
    const m2Cost = totalCost / m2;
    const m2Sell = totalSell / m2;
    this.results = {
      totalCost,
      totalSell,
      profit,
      m2Cost,
      m2Sell,
    };
  },
  exportPDF() {
    try {
      const doc = new window.jsPDF();
      const t = (key, def) => safeTranslate(key, def);
      doc.setFontSize(16);
      doc.text(t('calculator.title', 'Calculadora de Presupuesto Inmobiliario'), 10, 15);
      doc.setFontSize(12);
      let y = 30;
      doc.text(`${t('calculator.summary.scope', 'Tipo de proyecto')}: ${this.form.scope ? t(`calculator.values.scope.${this.form.scope}`, this.form.scope) : ''}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.entity', 'Entidad')}: ${this.form.entity ? t(`calculator.values.entity.${this.form.entity}`, this.form.entity) : ''}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.budget', 'Presupuesto')}: ${this.form.budgetTotal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.address', 'Dirección')}: ${this.form.land.address}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.surface', 'Superficie')}: ${this.form.land.surface} m²`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.usableSurface', 'Superficie útil')}: ${this.form.land.usableSurface} m²`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.use', 'Uso de suelo')}: ${this.form.land.use}`, 10, y);
      y += 12;
      doc.text(t('calculator.step3.title', 'Desglose de Costos'), 10, y);
      y += 8;
      for (const key of this.costKeys) {
        doc.text(`${this.costLabels[key]}: ${(this.form.costs[key].value || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})} (${((this.form.costs[key].percent || 0) * 100).toFixed(2)}%)`, 10, y);
        y += 8;
      }
      y += 4;
      doc.text(t('calculator.step4.title', 'Resultados y Resumen'), 10, y);
      y += 8;
      doc.text(`${t('calculator.result.totalCost', 'Costo total')}: ${(this.results.totalCost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.result.totalSell', 'Precio de venta estimado')}: ${(this.results.totalSell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.result.profit', 'Utilidad bruta')}: ${(this.results.profit || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.result.m2Cost', 'Costo por m²')}: ${(this.results.m2Cost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.result.m2Sell', 'Precio de venta por m²')}: ${(this.results.m2Sell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      doc.save('beyond-calculator.pdf');
      this.showFeedback(safeTranslate('calculator.feedback.pdfSuccess', 'PDF generado correctamente.'), 'success');
    } catch (e) {
      this.showFeedback(safeTranslate('calculator.feedback.pdfError', 'Error al exportar PDF.'), 'error');
    }
  },
  exportCSV() {
    try {
      const t = (key, def) => safeTranslate(key, def);
      const data = [
        [t('calculator.summary.scope', 'Tipo de proyecto'), this.form.scope],
        [t('calculator.summary.entity', 'Entidad'), this.form.entity],
        [t('calculator.summary.budget', 'Presupuesto'), this.form.budgetTotal],
        [t('calculator.summary.address', 'Dirección'), this.form.land.address],
        [t('calculator.summary.surface', 'Superficie'), this.form.land.surface],
        [t('calculator.summary.usableSurface', 'Superficie útil'), this.form.land.usableSurface],
        [t('calculator.summary.use', 'Uso de suelo'), this.form.land.use],
        [],
        [t('calculator.step3.title', 'Desglose de Costos')],
        ...this.costKeys.map(key => [this.costLabels[key], (this.form.costs[key].value || 0), ((this.form.costs[key].percent || 0) * 100).toFixed(2) + '%']),
        [],
        [t('calculator.step4.title', 'Resultados y Resumen')],
        [t('calculator.result.totalCost', 'Costo total'), this.results.totalCost],
        [t('calculator.result.totalSell', 'Precio de venta estimado'), this.results.totalSell],
        [t('calculator.result.profit', 'Utilidad bruta'), this.results.profit],
        [t('calculator.result.m2Cost', 'Costo por m²'), this.results.m2Cost],
        [t('calculator.result.m2Sell', 'Precio de venta por m²'), this.results.m2Sell],
      ];
      const csv = window.Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'beyond-calculator.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showFeedback(safeTranslate('calculator.feedback.csvSuccess', 'CSV generado correctamente.'), 'success');
    } catch (e) {
      this.showFeedback(safeTranslate('calculator.feedback.csvError', 'Error al exportar CSV.'), 'error');
    }
  },
  shareWA() {
    try {
      const t = (key, def) => safeTranslate(key, def);
      const lines = [
        `${t('calculator.title', 'Calculadora de Presupuesto Inmobiliario')}`,
        `${t('calculator.summary.scope', 'Tipo de proyecto')}: ${this.form.scope}`,
        `${t('calculator.summary.entity', 'Entidad')}: ${this.form.entity}`,
        `${t('calculator.summary.budget', 'Presupuesto')}: ${this.form.budgetTotal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.summary.address', 'Dirección')}: ${this.form.land.address}`,
        `${t('calculator.summary.surface', 'Superficie')}: ${this.form.land.surface} m²`,
        `${t('calculator.summary.usableSurface', 'Superficie útil')}: ${this.form.land.usableSurface} m²`,
        `${t('calculator.summary.use', 'Uso de suelo')}: ${this.form.land.use}`,
        '',
        t('calculator.step3.title', 'Desglose de Costos'),
        ...this.costKeys.map(key => `${this.costLabels[key]}: ${(this.form.costs[key].value || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})} (${((this.form.costs[key].percent || 0) * 100).toFixed(2)}%)`),
        '',
        t('calculator.step4.title', 'Resultados y Resumen'),
        `${t('calculator.result.totalCost', 'Costo total')}: ${(this.results.totalCost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.totalSell', 'Precio de venta estimado')}: ${(this.results.totalSell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.profit', 'Utilidad bruta')}: ${(this.results.profit || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.m2Cost', 'Costo por m²')}: ${(this.results.m2Cost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.m2Sell', 'Precio de venta por m²')}: ${(this.results.m2Sell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`
      ];
      const text = encodeURIComponent(lines.join('\n'));
      const waUrl = `https://api.whatsapp.com/send?text=${text}`;
      window.open(waUrl, '_blank');
      this.showFeedback(safeTranslate('calculator.feedback.waSuccess', 'Compartido en WhatsApp.'), 'success');
    } catch (e) {
      this.showFeedback(safeTranslate('calculator.feedback.waError', 'Error al compartir en WhatsApp.'), 'error');
    }
  },
  shareEmail() {
    try {
      const t = (key, def) => safeTranslate(key, def);
      const subject = encodeURIComponent(t('calculator.title', 'Calculadora de Presupuesto Inmobiliario'));
      const lines = [
        `${t('calculator.title', 'Calculadora de Presupuesto Inmobiliario')}`,
        `${t('calculator.summary.scope', 'Tipo de proyecto')}: ${this.form.scope}`,
        `${t('calculator.summary.entity', 'Entidad')}: ${this.form.entity}`,
        `${t('calculator.summary.budget', 'Presupuesto')}: ${this.form.budgetTotal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.summary.address', 'Dirección')}: ${this.form.land.address}`,
        `${t('calculator.summary.surface', 'Superficie')}: ${this.form.land.surface} m²`,
        `${t('calculator.summary.usableSurface', 'Superficie útil')}: ${this.form.land.usableSurface} m²`,
        `${t('calculator.summary.use', 'Uso de suelo')}: ${this.form.land.use}`,
        '',
        t('calculator.step3.title', 'Desglose de Costos'),
        ...this.costKeys.map(key => `${this.costLabels[key]}: ${(this.form.costs[key].value || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})} (${((this.form.costs[key].percent || 0) * 100).toFixed(2)}%)`),
        '',
        t('calculator.step4.title', 'Resultados y Resumen'),
        `${t('calculator.result.totalCost', 'Costo total')}: ${(this.results.totalCost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.totalSell', 'Precio de venta estimado')}: ${(this.results.totalSell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.profit', 'Utilidad bruta')}: ${(this.results.profit || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.m2Cost', 'Costo por m²')}: ${(this.results.m2Cost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.m2Sell', 'Precio de venta por m²')}: ${(this.results.m2Sell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`
      ];
      const body = encodeURIComponent(lines.join('\n'));
      const mailto = `mailto:?subject=${subject}&body=${body}`;
      window.open(mailto, '_blank');
      this.showFeedback(safeTranslate('calculator.feedback.emailSuccess', 'Correo abierto.'), 'success');
    } catch (e) {
      this.showFeedback(safeTranslate('calculator.feedback.emailError', 'Error al compartir por Email.'), 'error');
    }
  },
  saveSimulation() {
    try {
      localStorage.setItem('beyondCalcForm', JSON.stringify(this.form));
      localStorage.setItem('beyondCalcResults', JSON.stringify(this.results));
      this.showFeedback(safeTranslate('calculator.feedback.saved', 'Simulación guardada.'), 'success');
    } catch (e) {
      this.showFeedback(safeTranslate('calculator.feedback.saveError', 'Error al guardar.'), 'error');
    }
  },
  restoreSimulation() {
    try {
      const form = JSON.parse(localStorage.getItem('beyondCalcForm'));
      const results = JSON.parse(localStorage.getItem('beyondCalcResults'));
      if (form && results) {
        this.form = form;
        this.results = results;
        this.currentStep = 3;
        this.showFeedback(safeTranslate('calculator.feedback.restored', 'Simulación restaurada.'), 'success');
      } else {
        this.showFeedback(safeTranslate('calculator.feedback.noSaved', 'No hay simulación guardada.'), 'info');
      }
    } catch (e) {
      this.showFeedback(safeTranslate('calculator.feedback.restoreError', 'Error al restaurar.'), 'error');
    }
  },
  showFeedback(msg, type) {
    this.feedbackMessage = msg;
    this.feedbackType = type;
    setTimeout(() => { this.feedbackMessage = ''; this.feedbackType = ''; }, 4000);
  },
  animateStep() {
    const main = document.querySelector('main');
    if (main && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      main.classList.add('animate-step');
      setTimeout(() => main.classList.remove('animate-step'), 400);
    }
  },
  // Observa cambios relevantes para recalcular
  $watch: {
    'form.budgetTotal': function () { this.calculateResults(); },
    'form.land.usableSurface': function () { this.calculateResults(); },
    'form.costs': {
      deep: true,
      handler() { this.calculateResults(); }
    },
    // Watch for i18n store changes to update translations
    '$store.i18n.revision': function() {
      console.log('i18n store revision changed, updating translations');
      this.updateAllTranslations();
    }
  },
  // Direct fix for specific problematic elements
  fixSpecificElements() {
    console.log('Fixing specific calculator elements');
    
    try {
      // Get current language for debugging
      const currentLang = window.i18n?.getCurrentLanguage();
      console.log(`Current language: ${currentLang}`);
      
      // Create a mapping of problematic elements to their translation keys
      const problematicElements = [
        // Step 1 elements
        { selector: '#step1 .form-group:nth-child(1) label', key: 'calculator.step1.scope' },
        { selector: '#step1 .form-group:nth-child(2) label', key: 'calculator.step1.entity' },
        { selector: '#step1 select[name="scope"] option:first-child', key: 'calculator.step1.scope.select' },
        { selector: '#step1 select[name="entity"] option:first-child', key: 'calculator.step1.entity.select' },
        
        // Step 2 elements - the most problematic ones
        { selector: '#step2 .form-group:nth-child(1) label', key: 'calculator.step2.budget' },
        { selector: '#step2 .form-group:nth-child(2) label', key: 'calculator.step2.address' },
        { selector: '#step2 .form-group:nth-child(3) label', key: 'calculator.step2.type' },
        { selector: '#step2 .form-group:nth-child(4) label', key: 'calculator.step2.status' },
        { selector: '#step2 .form-group:nth-child(5) label', key: 'calculator.step2.surface' },
        { selector: '#step2 .form-group:nth-child(6) label', key: 'calculator.step2.usableSurface' },
        { selector: '#step2 .form-group:nth-child(7) label', key: 'calculator.step2.use' },
        { selector: '#step2 .form-group:nth-child(8) label', key: 'calculator.step2.characteristics' },
        { selector: '#step2 select[name="type"] option:first-child', key: 'calculator.step2.type.select' },
        { selector: '#step2 select[name="status"] option:first-child', key: 'calculator.step2.status.select' }
      ];
      
      // Process each problematic element
      problematicElements.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        if (elements.length > 0) {
          elements.forEach(element => {
            // Try multiple translation approaches for maximum compatibility
            
            // First, try direct translation
            let translation = window.i18n?.t(item.key);
            
            // If that fails (returns the key), try a more specific approach
            if (translation === item.key) {
              // Try to get from parts of the key
              const parts = item.key.split('.');
              const lastPart = parts[parts.length - 1];
              
              // Try specific fallbacks based on the field
              if (lastPart === 'scope') {
                translation = window.i18n?.t('calculator.form.scope', {}, 'Project type');
              } else if (lastPart === 'entity') {
                translation = window.i18n?.t('calculator.form.entity', {}, 'Entity');
              } else if (lastPart === 'budget') {
                translation = window.i18n?.t('calculator.form.budget', {}, 'Budget');
              } else if (lastPart === 'address') {
                translation = window.i18n?.t('calculator.form.address', {}, 'Address');
              } else if (lastPart === 'type') {
                translation = window.i18n?.t('calculator.form.type', {}, 'Land type');
              } else if (lastPart === 'status') {
                translation = window.i18n?.t('calculator.form.status', {}, 'Status');
              } else if (lastPart === 'surface') {
                translation = window.i18n?.t('calculator.form.surface', {}, 'Surface area');
              } else if (lastPart === 'usableSurface') {
                translation = window.i18n?.t('calculator.form.usableSurface', {}, 'Usable surface');
              } else if (lastPart === 'use') {
                translation = window.i18n?.t('calculator.form.use', {}, 'Land use');
              } else if (lastPart === 'characteristics') {
                translation = window.i18n?.t('calculator.form.characteristics', {}, 'Characteristics');
              } else if (lastPart === 'select') {
                translation = window.i18n?.t('calculator.form.select', {}, 'Select an option');
              }
              
              // If still not translated, capitalize the last part of the key
              if (translation === item.key || translation.includes('[') || translation.includes(']')) {
                translation = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/([A-Z])/g, ' $1');
              }
            }
            
            // Apply the translation if we have something reasonable
            if (translation && !translation.includes('[') && !translation.includes(']')) {
              console.log(`Fixing element "${item.selector}" with key "${item.key}" to "${translation}"`);
              element.textContent = translation;
            }
          });
        } else {
          console.log(`Element not found: ${item.selector}`);
        }
      });
      
      // Special handling for placeholder attributes
      const placeholderElements = [
        { selector: '#step2 input[name="address"]', key: 'calculator.step2.address.placeholder' },
        { selector: '#step2 input[name="surface"]', key: 'calculator.step2.surface.placeholder' },
        { selector: '#step2 input[name="usableSurface"]', key: 'calculator.step2.usableSurface.placeholder' },
        { selector: '#step2 input[name="use"]', key: 'calculator.step2.use.placeholder' },
        { selector: '#step2 textarea[name="characteristics"]', key: 'calculator.step2.characteristics.placeholder' }
      ];
      
      placeholderElements.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) {
          const translation = window.i18n?.t(item.key);
          if (translation && translation !== item.key) {
            console.log(`Setting placeholder for "${item.selector}" to "${translation}"`);
            element.placeholder = translation;
          } else {
            // Fallback - extract from the key
            const parts = item.key.split('.');
            const fieldName = parts[parts.length - 2];
            const placeholder = `Enter ${fieldName.charAt(0).toLowerCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')}`;
            console.log(`Setting fallback placeholder for "${item.selector}" to "${placeholder}"`);
            element.placeholder = placeholder;
          }
        }
      });
    } catch (error) {
      console.error('Error fixing specific calculator elements:', error);
    }
  },
  // Update elements in hidden steps
  updateHiddenStepElements() {
    console.log('Updating hidden step elements');
    
    try {
      // Get all steps
      const steps = document.querySelectorAll('.step');
      
      // Process each step
      steps.forEach(step => {
        // Check if the step is hidden
        if (step.style.display === 'none' || !step.classList.contains('active')) {
          console.log(`Updating hidden step: ${step.id}`);
          
          // Update all elements with data-i18n attributes in this step
          step.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
              const translation = window.i18n?.t(key, {}, element.textContent);
              console.log(`Updating hidden element with key "${key}" to "${translation}"`);
              element.textContent = translation;
            }
          });
          
          // Update all form labels in this step
          step.querySelectorAll('.form-group label').forEach(label => {
            // Try to find a data-i18n attribute
            const key = label.getAttribute('data-i18n');
            if (key) {
              const translation = window.i18n?.t(key, {}, label.textContent);
              console.log(`Updating hidden label with key "${key}" to "${translation}"`);
              label.textContent = translation;
            } else {
              // If no data-i18n attribute, try to infer the key from the for attribute
              const forAttr = label.getAttribute('for');
              if (forAttr) {
                const stepId = step.id;
                const inferredKey = `calculator.${stepId}.${forAttr}`;
                const translation = window.i18n?.t(inferredKey, {}, label.textContent);
                if (translation !== inferredKey) {
                  console.log(`Updating hidden label with inferred key "${inferredKey}" to "${translation}"`);
                  label.textContent = translation;
                }
              }
            }
          });
          
          // Update all select options in this step
          step.querySelectorAll('select').forEach(select => {
            const name = select.getAttribute('name');
            if (name) {
              // Update the first option (usually the placeholder)
              const firstOption = select.querySelector('option:first-child');
              if (firstOption) {
                const stepId = step.id;
                const inferredKey = `calculator.${stepId}.${name}.select`;
                const translation = window.i18n?.t(inferredKey, {}, firstOption.textContent);
                if (translation !== inferredKey) {
                  console.log(`Updating hidden select option with inferred key "${inferredKey}" to "${translation}"`);
                  firstOption.textContent = translation;
                }
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Error updating hidden step elements:', error);
    }
  },
  // Update step labels
  updateStepLabels() {
    console.log('Updating step labels');
    
    try {
      // Get all step elements
      const stepElements = document.querySelectorAll('.step');
      
      // Process each step
      stepElements.forEach(step => {
        // Get step number
        const stepNumber = step.getAttribute('data-step');
        
        // Update step label
        const stepLabel = document.querySelector(`.step-label[data-step="${stepNumber}"]`);
        if (stepLabel) {
          const stepTitle = document.querySelector(`.step-title[data-step="${stepNumber}"]`);
          if (stepTitle) {
            stepLabel.textContent = stepTitle.textContent;
          }
        }
      });
    } catch (error) {
      console.error('Error updating step labels:', error);
    }
  },
  // Update form field labels and descriptions
  updateFormFieldLabels() {
    console.log('Updating form field labels and descriptions');
    
    try {
      // Get all form fields
      const formFields = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
      
      // Process each form field
      formFields.forEach(field => {
        // Get field name
        const fieldName = field.getAttribute('name') || field.getAttribute('id');
        
        // Update field label
        const fieldLabel = document.querySelector(`.form-label[for="${fieldName}"]`);
        if (fieldLabel) {
          fieldLabel.textContent = field.placeholder;
        }
        
        // Update field description
        const fieldDescription = document.querySelector(`.form-description[for="${fieldName}"]`);
        if (fieldDescription) {
          fieldDescription.textContent = field.placeholder;
        }
      });
    } catch (error) {
      console.error('Error updating form field labels and descriptions:', error);
    }
  },
  // Update summary fields
  updateSummaryFields() {
    console.log('Updating summary fields');
    
    try {
      // Get all summary elements
      const summaryElements = document.querySelectorAll('.summary-container li span');
      
      // Process each summary element
      summaryElements.forEach(element => {
        // Get key from data-i18n attribute
        const key = element.getAttribute('data-i18n');
        
        // Update summary field
        if (key) {
          const translation = window.i18n?.t(key, {}, element.textContent);
          console.log(`Updating summary field with key "${key}" to "${translation}"`);
          element.textContent = translation;
        }
      });
    } catch (error) {
      console.error('Error updating summary fields:', error);
    }
  },
}))});

/**
 * Force update translations for critical elements that might be hidden
 * This ensures that elements in hidden steps are properly translated
 */
function forceUpdateCriticalTranslations() {
  // Get all critical elements by their data-i18n attributes or specific selectors
  const criticalSelectors = [
    '[data-i18n^="calculator.step1."]',
    '[data-i18n^="calculator.step2."]',
    '[data-i18n^="calculator.summary."]',
    '[data-i18n^="calculator.form."]',
    'label[for]',
    '.form-label',
    '.form-text'
  ];
  
  const criticalElements = document.querySelectorAll(criticalSelectors.join(', '));
  
  criticalElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      // Try to get translation directly
      const translation = window.i18n?.t?.(key) || window.t?.(key);
      if (translation && translation !== key) {
        el.textContent = translation;
      } else {
        // Apply fallback instead of showing warning
        // console.warn(`[calculator] No translation found for ${key}`);
        const parts = key.split('.');
        if (parts.length > 1) {
          const lastPart = parts[parts.length - 1];
          const fallback = lastPart.charAt(0).toUpperCase() + 
                          lastPart.slice(1).replace(/[_-]/g, ' ');
          el.textContent = fallback;
        }
      }
    }
    
    // Also check for aria-label and placeholder attributes
    ['aria-label', 'placeholder'].forEach(attr => {
      const attrKey = el.getAttribute(`data-i18n-${attr}`);
      if (attrKey) {
        const attrTranslation = window.i18n?.t?.(attrKey) || window.t?.(attrKey);
        if (attrTranslation && attrTranslation !== attrKey) {
          el.setAttribute(attr, attrTranslation);
        }
      }
    });
  });
  
  // Special handling for labels that might not have data-i18n attributes
  document.querySelectorAll('label[for]').forEach(label => {
    const forAttr = label.getAttribute('for');
    if (forAttr) {
      const inputField = document.getElementById(forAttr);
      if (inputField) {
        const fieldName = inputField.name || inputField.id;
        if (fieldName) {
          // Try to find translation for this field
          const possibleKeys = [
            `calculator.step1.${fieldName}`,
            `calculator.step2.${fieldName}`,
            `calculator.summary.${fieldName}`
          ];
          
          let foundTranslation = false;
          for (const key of possibleKeys) {
            const translation = window.i18n?.t?.(key) || window.t?.(key);
            if (translation && translation !== key) {
              label.textContent = translation;
              foundTranslation = true;
              break;
            }
          }
          
          // If no translation was found, apply a fallback based on the field name
          if (!foundTranslation && label.textContent.includes('calculator.')) {
            // Create a readable label from the field name
            const fallback = fieldName.charAt(0).toUpperCase() + 
                            fieldName.slice(1).replace(/([A-Z])/g, ' $1').trim();
            label.textContent = fallback;
          }
        }
      }
    }
  });
}

// Direct fix for translations - runs after page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('[calculator] Adding direct translation fix script');
  
  // Run the fix immediately
  setTimeout(forceUpdateCriticalTranslations, 100);
  
  // Run the fix again after a delay to ensure everything is loaded
  setTimeout(forceUpdateCriticalTranslations, 500);
  
  // Add event listener for language changes
  document.addEventListener('i18n:languageChanged', () => {
    console.log('[calculator] Language changed, applying direct fixes');
    
    // Run multiple times with delays to ensure all translations are applied
    [100, 300, 500, 1000].forEach(delay => {
      setTimeout(forceUpdateCriticalTranslations, delay);
    });
  });
});
