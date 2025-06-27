/**
 * Theme Module - Dark/Light theme management
 * @module ThemeService
 */

class ThemeService {
  constructor() {
    this.theme = 'light';
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }
  
  init() {
    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.theme = savedTheme;
    } else if (this.mediaQuery.matches) {
      this.theme = 'dark';
    }
    
    // Apply theme
    this.applyTheme();
    
    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.theme = e.matches ? 'dark' : 'light';
        this.applyTheme();
      }
    });
  }
  
  applyTheme() {
    document.documentElement.classList.toggle('dark', this.theme === 'dark');
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = this.theme === 'dark' ? '#1f2937' : '#ffffff';
    }
  }
  
  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: this.theme }));
  }
  
  getTheme() {
    return this.theme;
  }
  
  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      this.applyTheme();
    }
  }
}

export default ThemeService; 