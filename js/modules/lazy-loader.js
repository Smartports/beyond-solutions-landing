/**
 * Lazy Loader Module - Sistema de carga diferida inteligente
 * Optimiza el rendimiento cargando módulos y assets bajo demanda
 */

window.LazyLoader = {
  // Cache de módulos cargados
  loadedModules: new Set(),
  
  // Cache de assets cargados
  loadedAssets: new Set(),
  
  // Observable de carga
  loadingObserver: null,
  
  // Configuración
  config: {
    intersectionThreshold: 0.1,
    rootMargin: '50px',
    preloadDelay: 100,
    chunkSize: 50000 // 50KB chunks
  },

  /**
   * Inicializar el lazy loader
   */
  init() {
    this.setupIntersectionObserver();
    this.preloadCriticalAssets();
    this.setupModuleLoader();
    console.log('🚀 LazyLoader initialized');
  },

  /**
   * Configurar Intersection Observer para carga automática
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, falling back to immediate loading');
      return;
    }

    this.loadingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleIntersection(entry.target);
        }
      });
    }, {
      threshold: this.config.intersectionThreshold,
      rootMargin: this.config.rootMargin
    });
  },

  /**
   * Manejar intersección de elementos
   */
  handleIntersection(element) {
    const lazyModule = element.dataset.lazyModule;
    const lazyAsset = element.dataset.lazyAsset;

    if (lazyModule) {
      this.loadModule(lazyModule);
    }

    if (lazyAsset) {
      this.loadAsset(lazyAsset, element);
    }

    // Dejar de observar una vez cargado
    this.loadingObserver.unobserve(element);
  },

  /**
   * Precargar assets críticos
   */
  async preloadCriticalAssets() {
    const criticalAssets = [
      '/css/colors.css',
      '/js/main.js',
      '/js/i18n.js'
    ];

    for (const asset of criticalAssets) {
      await this.loadAsset(asset);
    }
  },

  /**
   * Cargar módulo de forma diferida
   */
  async loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve();
    }

    try {
      const moduleMap = {
        'terrain': '/js/modules/terrain.js',
        'viewer3d': '/js/modules/viewer3d.js',
        'finance': '/js/modules/finance.js',
        'storage': '/js/modules/storage.js',
        'wizard': '/js/modules/wizard.js'
      };

      const modulePath = moduleMap[moduleName];
      if (!modulePath) {
        throw new Error(`Unknown module: ${moduleName}`);
      }

      // Mostrar loader
      this.showModuleLoader(moduleName);

      // Cargar script de forma asíncrona
      await this.loadScript(modulePath);
      
      this.loadedModules.add(moduleName);
      this.hideModuleLoader(moduleName);
      
      console.log(`✅ Module ${moduleName} loaded successfully`);
      
      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent('moduleLoaded', {
        detail: { moduleName }
      }));

    } catch (error) {
      console.error(`Error loading module ${moduleName}:`, error);
      this.showModuleError(moduleName, error.message);
    }
  },

  /**
   * Cargar script de forma asíncrona
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (this.loadedAssets.has(src)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.loadedAssets.add(src);
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  },

  /**
   * Cargar asset (imagen, CSS, etc.)
   */
  async loadAsset(assetPath, element = null) {
    if (this.loadedAssets.has(assetPath)) {
      return Promise.resolve();
    }

    try {
      const extension = this.getFileExtension(assetPath);
      
      switch (extension) {
        case 'css':
          await this.loadCSS(assetPath);
          break;
        case 'js':
          await this.loadScript(assetPath);
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'webp':
        case 'svg':
          await this.loadImage(assetPath, element);
          break;
        default:
          console.warn(`Unknown asset type: ${extension}`);
      }

      this.loadedAssets.add(assetPath);
      
    } catch (error) {
      console.error(`Error loading asset ${assetPath}:`, error);
    }
  },

  /**
   * Cargar CSS de forma asíncrona
   */
  loadCSS(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      
      document.head.appendChild(link);
    });
  },

  /**
   * Cargar imagen de forma asíncrona
   */
  loadImage(src, element = null) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        if (element) {
          if (element.tagName === 'IMG') {
            element.src = src;
            element.classList.add('loaded');
          } else {
            element.style.backgroundImage = `url(${src})`;
            element.classList.add('bg-loaded');
          }
        }
        resolve();
      };
      
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      
      img.src = src;
    });
  },

  /**
   * Obtener extensión de archivo
   */
  getFileExtension(path) {
    return path.split('.').pop().toLowerCase();
  },

  /**
   * Mostrar loader de módulo
   */
  showModuleLoader(moduleName) {
    const loaderId = `loader-${moduleName}`;
    let loader = document.getElementById(loaderId);
    
    if (!loader) {
      loader = document.createElement('div');
      loader.id = loaderId;
      loader.className = 'module-loader fixed top-4 right-4 bg-primary-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      loader.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="loader w-4 h-4"></div>
          <span>Cargando ${moduleName}...</span>
        </div>
      `;
      document.body.appendChild(loader);
    }
  },

  /**
   * Ocultar loader de módulo
   */
  hideModuleLoader(moduleName) {
    const loaderId = `loader-${moduleName}`;
    const loader = document.getElementById(loaderId);
    if (loader) {
      loader.remove();
    }
  },

  /**
   * Mostrar error de módulo
   */
  showModuleError(moduleName, errorMessage) {
    this.hideModuleLoader(moduleName);
    
    const errorId = `error-${moduleName}`;
    const error = document.createElement('div');
    error.id = errorId;
    error.className = 'module-error fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    error.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>❌</span>
        <span>Error cargando ${moduleName}</span>
        <button onclick="this.parentNode.parentNode.remove()" class="ml-2 font-bold">×</button>
      </div>
    `;
    document.body.appendChild(error);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (error.parentNode) {
        error.remove();
      }
    }, 5000);
  },

  /**
   * Configurar carga automática de módulos
   */
  setupModuleLoader() {
    // Observar elementos con data-lazy-module
    document.querySelectorAll('[data-lazy-module]').forEach(element => {
      if (this.loadingObserver) {
        this.loadingObserver.observe(element);
      } else {
        // Fallback para navegadores sin IntersectionObserver
        this.handleIntersection(element);
      }
    });

    // Observar elementos con data-lazy-asset
    document.querySelectorAll('[data-lazy-asset]').forEach(element => {
      if (this.loadingObserver) {
        this.loadingObserver.observe(element);
      } else {
        this.handleIntersection(element);
      }
    });
  },

  /**
   * Precargar módulo específico
   */
  async preloadModule(moduleName) {
    if (!this.loadedModules.has(moduleName)) {
      await this.loadModule(moduleName);
    }
  },

  /**
   * Verificar si un módulo está cargado
   */
  isModuleLoaded(moduleName) {
    return this.loadedModules.has(moduleName);
  },

  /**
   * Obtener estadísticas de carga
   */
  getStats() {
    return {
      loadedModules: Array.from(this.loadedModules),
      loadedAssets: Array.from(this.loadedAssets),
      totalModules: this.loadedModules.size,
      totalAssets: this.loadedAssets.size
    };
  }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.LazyLoader.init();
  });
} else {
  window.LazyLoader.init();
} 