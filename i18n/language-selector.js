/**
 * Language selector component for Alpine.js
 */
document.addEventListener('alpine:init', () => {
  Alpine.data('languageSelector', () => ({
    open: false,
    
    init() {
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.$el.contains(e.target)) {
          this.open = false;
        }
      });
      
      // Close dropdown when pressing Escape
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.open = false;
        }
      });
      
      // Close dropdown when changing language
      window.addEventListener('localeChanged', () => {
        this.open = false;
      });
    },
    
    toggle() {
      this.open = !this.open;
    },
    
    close() {
      this.open = false;
    },
    
    changeLanguage(locale) {
      window.i18n.setLocale(locale);
      this.close();
    }
  }));
}); 