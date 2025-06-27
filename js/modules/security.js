/**
 * Security Module - XSS Prevention and Input Validation
 */

export const Security = {
  /**
   * Sanitize HTML content to prevent XSS attacks
   * @param {string} str - The string to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Validate and sanitize input
   * @param {string} input - Input to validate
   * @param {string} type - Type of validation (email, text, number, etc.)
   * @returns {object} - { valid: boolean, sanitized: string, error?: string }
   */
  validateInput(input, type = 'text') {
    const validators = {
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        sanitize: (val) => val.toLowerCase().trim(),
        error: 'Please enter a valid email address'
      },
      text: {
        pattern: /^[a-zA-Z0-9\s\-_,.áéíóúñÁÉÍÓÚÑ]+$/,
        sanitize: (val) => this.sanitizeHTML(val.trim()),
        error: 'Please enter valid text (letters, numbers, and basic punctuation only)'
      },
      projectName: {
        pattern: /^[a-zA-Z0-9\s\-_,.áéíóúñÁÉÍÓÚÑ]{3,100}$/,
        sanitize: (val) => this.sanitizeHTML(val.trim()),
        error: 'Project name must be 3-100 characters long'
      },
      location: {
        pattern: /^[a-zA-Z0-9\s\-,#.áéíóúñÁÉÍÓÚÑ]{3,200}$/,
        sanitize: (val) => this.sanitizeHTML(val.trim()),
        error: 'Please enter a valid location'
      },
      number: {
        pattern: /^\d+(\.\d{1,2})?$/,
        sanitize: (val) => parseFloat(val) || 0,
        error: 'Please enter a valid number'
      },
      phone: {
        pattern: /^[\d\s\-\+\(\)]+$/,
        sanitize: (val) => val.replace(/[^\d\s\-\+\(\)]/g, ''),
        error: 'Please enter a valid phone number'
      }
    };

    const validator = validators[type] || validators.text;
    const sanitized = validator.sanitize(input);
    const valid = validator.pattern.test(input);

    return {
      valid,
      sanitized,
      error: valid ? undefined : validator.error
    };
  },

  /**
   * Prevent XSS in dynamic content insertion
   * @param {Element} element - Target element
   * @param {string} content - Content to insert
   * @param {boolean} isHTML - Whether content contains HTML
   */
  safeInsert(element, content, isHTML = false) {
    if (!element) return;
    
    if (isHTML) {
      // Parse HTML safely
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // Remove script tags and event handlers
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      
      const elements = doc.querySelectorAll('*');
      elements.forEach(el => {
        // Remove all event handlers
        for (const attr of el.attributes) {
          if (attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
        }
      });
      
      element.innerHTML = doc.body.innerHTML;
    } else {
      element.textContent = content;
    }
  },

  /**
   * Create secure form submission
   * @param {HTMLFormElement} form - Form element
   * @param {Function} callback - Callback function
   */
  secureForm(form, callback) {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {};
      const errors = {};
      
      // Validate all inputs
      for (const [key, value] of formData.entries()) {
        const input = form.elements[key];
        const type = input.dataset.validate || 'text';
        const result = this.validateInput(value, type);
        
        if (result.valid) {
          data[key] = result.sanitized;
        } else {
          errors[key] = result.error;
        }
      }
      
      if (Object.keys(errors).length === 0) {
        // All inputs valid
        callback(data);
      } else {
        // Handle validation errors
        this.showErrors(form, errors);
      }
    });
  },

  /**
   * Show validation errors on form
   * @param {HTMLFormElement} form - Form element
   * @param {Object} errors - Error messages by field name
   */
  showErrors(form, errors) {
    if (!form) return;
    // Clear previous errors
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // Show new errors
    for (const [field, error] of Object.entries(errors)) {
      const input = form.elements[field];
      if (input) {
        input.classList.add('error');
        const errorEl = document.createElement('p');
        errorEl.className = 'error-message text-red-500 text-sm mt-1';
        errorEl.textContent = error;
        input.parentElement.appendChild(errorEl);
      }
    }
  },

  /**
   * Rate limiting for API calls
   */
  rateLimiter: {
    limits: new Map(),
    
    check(key, maxRequests = 10, windowMs = 60000) {
      const now = Date.now();
      const userLimits = this.limits.get(key) || { count: 0, resetTime: now + windowMs };
      
      if (now > userLimits.resetTime) {
        userLimits.count = 0;
        userLimits.resetTime = now + windowMs;
      }
      
      if (userLimits.count >= maxRequests) {
        return false;
      }
      
      userLimits.count++;
      this.limits.set(key, userLimits);
      return true;
    }
  },

  /**
   * CSRF Token Management
   */
  csrf: {
    token: null,
    
    generate() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      return this.token;
    },
    
    validate(token) {
      return token === this.token;
    },
    
    addToForm(form) {
      if (!this.token) this.generate();
      
      let input = form.querySelector('input[name="csrf_token"]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        form.appendChild(input);
      }
      input.value = this.token;
    }
  }
};

// Auto-initialize security features
document.addEventListener('DOMContentLoaded', () => {
  // Add CSRF tokens to all forms
  document.querySelectorAll('form').forEach(form => {
    Security.csrf.addToForm(form);
  });
  
  // Add input validation to all inputs with data-validate
  document.querySelectorAll('input[data-validate], textarea[data-validate]').forEach(input => {
    input.addEventListener('blur', () => {
      const type = input.dataset.validate;
      const result = Security.validateInput(input.value, type);
      
      if (!result.valid) {
        input.classList.add('error');
        Security.showErrors(input.form, { [input.name]: result.error });
      } else {
        input.classList.remove('error');
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      }
    });
  });
});

export default Security; 