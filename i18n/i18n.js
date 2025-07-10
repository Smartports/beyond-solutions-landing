/**
 * Internationalization (i18n) system for Beyond Solutions
 */

// Main i18n object
const i18n = {
  config: null,
  currentLocale: null,
  translations: {},

  /**
   * Initialize the i18n system
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Load configuration
      this.config = await this.fetchJSON('./i18n/config.json');

      // Detect preferred language or use from localStorage
      const savedLocale = localStorage.getItem('beyondLocale');
      let detectedLocale = savedLocale || this.detectBrowserLanguage();

      // Check if detected locale is available, otherwise use default
      if (!this.isLocaleAvailable(detectedLocale)) {
        detectedLocale = this.config.defaultLocale;
      }

      await this.setLocale(detectedLocale);

      // Initialize language selector
      this.initLanguageSelector();

      console.log(`i18n initialized with locale: ${this.currentLocale}`);
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
    }
  },

  /**
   * Fetch JSON file
   * @param {string} url - URL to fetch
   * @returns {Promise<object>} - JSON data
   */
  async fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Detect browser language
   * @returns {string} - Detected language code
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.split('-')[0]; // Get primary language code (e.g., 'en' from 'en-US')
  },

  /**
   * Check if a locale is available
   * @param {string} localeCode - Locale code to check
   * @returns {boolean} - Whether the locale is available
   */
  isLocaleAvailable(localeCode) {
    return this.config.availableLocales.some((locale) => locale.code === localeCode);
  },

  /**
   * Set the current locale
   * @param {string} localeCode - Locale code to set
   * @returns {Promise<void>}
   */
  async setLocale(localeCode) {
    try {
      // Load translations
      const translations = await this.fetchJSON(`./i18n/${localeCode}.json`);

      // If this is not the default locale, ensure consistency with the default locale
      if (localeCode !== this.config.defaultLocale) {
        const defaultTranslations = await this.getDefaultTranslations();
        this.ensureTranslationConsistency(translations, defaultTranslations);
      }

      // Set translations
      this.translations = translations;

      // Set current locale
      this.currentLocale = localeCode;

      // Store in localStorage
      localStorage.setItem('beyondLocale', localeCode);

      // Apply translations to the page
      this.translatePage();

      // Set document language and direction
      document.documentElement.lang = localeCode;
      const localeConfig = this.config.availableLocales.find((l) => l.code === localeCode);
      if (localeConfig && localeConfig.dir === 'rtl') {
        document.documentElement.dir = 'rtl';
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.classList.remove('rtl');
      }

      // Update language selector
      this.updateLanguageSelector();

      // Dispatch events for locale change
      window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale: localeCode } }));
      window.dispatchEvent(
        new CustomEvent('i18n:languageChanged', { detail: { locale: localeCode } }),
      );
      document.dispatchEvent(
        new CustomEvent('i18n:languageChanged', { detail: { locale: localeCode } }),
      );
    } catch (error) {
      console.error(`Failed to set locale ${localeCode}:`, error);
      // Fallback to default locale if the requested one fails
      if (localeCode !== this.config.defaultLocale) {
        console.warn(`Falling back to default locale: ${this.config.defaultLocale}`);
        await this.setLocale(this.config.defaultLocale);
      }
    }
  },

  /**
   * Get translation by key
   * @param {string} key - Translation key (dot notation supported)
   * @param {object} params - Parameters for interpolation
   * @returns {string} - Translated text
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let result = this.translations;

    // Navigate through nested objects
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return key as fallback
      }
    }

    // Return if not a string
    if (typeof result !== 'string') {
      console.warn(`Translation key does not resolve to a string: ${key}`);
      return key;
    }

    // Replace parameters
    if (params && typeof params === 'object') {
      return result.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : `{${paramKey}}`;
      });
    }

    return result;
  },

  /**
   * Translate the entire page
   */
  translatePage() {
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else if (el.tagName === 'OPTION') {
        el.textContent = translation;
        // Store the translated value for form processing
        if (
          el.value &&
          [
            'Patrimonial',
            'Inversion',
            'Propio',
            'No Propio',
            'Remate',
            'Construcción',
            'Demolición',
            'Reconversión',
          ].includes(el.value)
        ) {
          el.setAttribute('data-translated-value', translation);
        }
      } else {
        el.textContent = translation;
      }
    });

    // Translate all elements with data-i18n-attr attribute (for attributes like title, aria-label, etc.)
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const attrs = el.getAttribute('data-i18n-attr').split(',');

      attrs.forEach((attr) => {
        const [attrName, keyName] = attr.trim().split(':');
        if (attrName && keyName) {
          el.setAttribute(attrName, this.t(keyName));
        }
      });
    });

    // Translate all select options with dynamic data-i18n attributes
    document.querySelectorAll('select').forEach((select) => {
      Array.from(select.options).forEach((option) => {
        const key = option.getAttribute('data-i18n');
        if (key) {
          const translation = this.t(key);
          if (translation && translation !== key) {
            option.textContent = translation;
          }
        }
      });
    });

    // Update page title
    if (this.translations.general && this.translations.general.title) {
      document.title = this.translations.general.title;
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && this.translations.general && this.translations.general.description) {
      metaDesc.setAttribute('content', this.translations.general.description);
    }

    // Dispatch an event to notify Alpine.js components that translations are ready
    document.dispatchEvent(
      new CustomEvent('i18n:ready', { detail: { locale: this.currentLocale } }),
    );
  },

  /**
   * Initialize the language selector
   */
  initLanguageSelector() {
    const langSelector = document.getElementById('language-selector');
    if (!langSelector) return;

    // Create dropdown items
    const langDropdown = document.getElementById('language-dropdown');
    if (langDropdown) {
      langDropdown.innerHTML = '';

      this.config.availableLocales.forEach((locale) => {
        const item = document.createElement('a');
        item.href = '#';
        item.className =
          'flex items-center gap-2 px-4 py-2 hover:bg-accent-100 dark:hover:bg-primary-800 transition-colors rounded';
        item.setAttribute('data-locale', locale.code);

        // Create flag
        const flag = document.createElement('img');
        flag.src = `https://flagcdn.com/w20/${locale.flag}.png`;
        flag.srcset = `https://flagcdn.com/w40/${locale.flag}.png 2x`;
        flag.width = 20;
        flag.height = 15;
        flag.alt = 'Flag of ' + locale.name + ' (' + locale.code + ')';
        flag.className = 'rounded-sm';

        // Create label
        const label = document.createElement('span');
        label.textContent = locale.nativeName;

        item.appendChild(flag);
        item.appendChild(label);

        // Add click event
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.setLocale(locale.code);
          document.getElementById('language-dropdown-toggle').click(); // Close dropdown
        });

        langDropdown.appendChild(item);
      });
    }

    this.updateLanguageSelector();
  },

  /**
   * Update language selector to reflect current locale
   */
  updateLanguageSelector() {
    const currentLocale = this.config.availableLocales.find((l) => l.code === this.currentLocale);
    if (!currentLocale) return;

    const langButton = document.getElementById('current-language');
    if (langButton) {
      // Update flag
      const flagImg = langButton.querySelector('img');
      if (flagImg) {
        flagImg.src = `https://flagcdn.com/w20/${currentLocale.flag}.png`;
        flagImg.srcset = `https://flagcdn.com/w40/${currentLocale.flag}.png 2x`;
        flagImg.alt = currentLocale.name;
      }

      // Update label
      const label = langButton.querySelector('span');
      if (label) {
        label.textContent = currentLocale.nativeName;
      }
    }

    // Highlight current locale in dropdown
    document.querySelectorAll('#language-dropdown a').forEach((item) => {
      if (item.getAttribute('data-locale') === this.currentLocale) {
        item.classList.add('bg-accent-50', 'dark:bg-primary-800', 'font-semibold');
      } else {
        item.classList.remove('bg-accent-50', 'dark:bg-primary-800', 'font-semibold');
      }
    });
  },

  /**
   * Get default translations (lazy loaded)
   * @returns {Promise<object>} Default translations
   */
  async getDefaultTranslations() {
    if (!this._defaultTranslations) {
      this._defaultTranslations = await this.fetchJSON(`./i18n/${this.config.defaultLocale}.json`);
    }
    return this._defaultTranslations;
  },

  /**
   * Ensure translation object has all keys from the default translations
   * @param {object} translations - Target translations to check
   * @param {object} defaultTranslations - Default translations to compare against
   */
  ensureTranslationConsistency(translations, defaultTranslations) {
    const ensureKeys = (target, source, path = '') => {
      for (const key in source) {
        const currentPath = path ? `${path}.${key}` : key;

        // If key doesn't exist in target, copy it from source
        if (!(key in target)) {
          console.warn(`Missing translation key: ${currentPath} in ${this.currentLocale}`);
          target[key] = source[key];
          continue;
        }

        // If both are objects, recurse
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof target[key] === 'object' &&
          target[key] !== null &&
          !Array.isArray(target[key])
        ) {
          ensureKeys(target[key], source[key], currentPath);
        }

        // If types don't match, replace with source
        if (typeof target[key] !== typeof source[key]) {
          console.warn(`Type mismatch for key: ${currentPath} in ${this.currentLocale}`);
          target[key] = source[key];
        }
      }
    };

    ensureKeys(translations, defaultTranslations);
  },
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});

// Make i18n globally available
window.i18n = i18n;
