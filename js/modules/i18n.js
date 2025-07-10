/**
 * i18n Module - Internationalization service
 * @module i18nService
 */

const i18nService = {
  currentLanguage: 'es',
  translations: {},

  async init() {
    // Get saved language or detect from browser
    this.currentLanguage =
      localStorage.getItem('language') || navigator.language.split('-')[0] || 'es';

    // Load translations
    await this.loadTranslations(this.currentLanguage);
  },

  async loadTranslations(lang) {
    try {
      const response = await fetch(`/i18n/${lang}.json`);
      if (response.ok) {
        this.translations = await response.json();
      } else {
        console.warn(`Could not load translations for ${lang}, falling back to Spanish`);
        if (lang !== 'es') {
          const fallback = await fetch('/i18n/es.json');
          this.translations = await fallback.json();
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  },

  t(key) {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  },

  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    this.loadTranslations(lang).then(() => {
      // Dispatch event for components to update
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    });
  },

  getLanguage() {
    return this.currentLanguage;
  },
};

export default i18nService;
