/**
 * Mobile Optimization Module
 * Handles touch controls, responsive features, and mobile performance
 */

class MobileOptimizer {
  constructor() {
    this.isMobile = this.detectMobile();
    this.isTouch = 'ontouchstart' in window;
    this.touchHandlers = new Map();
    this.performanceObserver = null;
    this.init();
  }

  init() {
    if (this.isMobile || this.isTouch) {
      this.setupTouchHandlers();
      this.optimizePerformance();
      this.setupViewportHandler();
      this.enableMobileFeatures();
    }
    this.setupResponsiveImages();
    this.setupAdaptiveLoading();
  }

  // Detect mobile device
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
  }

  // Setup touch handlers for 3D viewer
  setup3DViewerTouch(canvas, camera) {
    let touchStartX = 0;
    let touchStartY = 0;
    let initialDistance = 0;
    let isRotating = false;
    let isPinching = false;

    // Helper function to get distance between two touches
    const getDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Touch start
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isRotating = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isPinching = true;
        isRotating = false;
        initialDistance = getDistance(e.touches[0], e.touches[1]);
      }
    };

    // Touch move
    const handleTouchMove = (e) => {
      e.preventDefault();

      if (isRotating && e.touches.length === 1) {
        // Rotate camera
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        camera.alpha += deltaX * 0.01;
        camera.beta = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, camera.beta + deltaY * 0.01));

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      } else if (isPinching && e.touches.length === 2) {
        // Pinch to zoom
        const distance = getDistance(e.touches[0], e.touches[1]);
        const scale = distance / initialDistance;

        camera.radius = Math.max(50, Math.min(500, camera.radius / scale));
        initialDistance = distance;
      }
    };

    // Touch end
    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        isRotating = false;
        isPinching = false;
      } else if (e.touches.length === 1) {
        isPinching = false;
        isRotating = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    // Add listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Store handlers for cleanup
    this.touchHandlers.set(canvas, {
      touchstart: handleTouchStart,
      touchmove: handleTouchMove,
      touchend: handleTouchEnd
    });

    // Add mobile controls UI
    this.addMobileControls(canvas, camera);
  }

  // Add mobile control buttons
  addMobileControls(canvas, camera) {
    const controlsHTML = `
      <div class="mobile-3d-controls fixed bottom-4 right-4 flex flex-col gap-2 md:hidden">
        <button class="mobile-control-btn p-3 bg-blue-500 text-white rounded-full shadow-lg" aria-label="Zoom in" data-action="zoom-in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button class="mobile-control-btn p-3 bg-blue-500 text-white rounded-full shadow-lg" aria-label="Zoom out" data-action="zoom-out">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button class="mobile-control-btn p-3 bg-gray-500 text-white rounded-full shadow-lg" aria-label="Reset view" data-action="reset">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        <button class="mobile-control-btn p-3 bg-green-500 text-white rounded-full shadow-lg" aria-label="Toggle rotation" data-action="rotate">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        </button>
      </div>
    `;

    // Insert controls after canvas
    canvas.parentElement.insertAdjacentHTML('beforeend', controlsHTML);

    // Add event listeners
    const controls = canvas.parentElement.querySelector('.mobile-3d-controls');
    let rotationAnimation = null;

    controls.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      switch (action) {
        case 'zoom-in':
          camera.radius = Math.max(50, camera.radius * 0.8);
          break;
        case 'zoom-out':
          camera.radius = Math.min(500, camera.radius * 1.2);
          break;
        case 'reset':
          camera.alpha = Math.PI / 4;
          camera.beta = Math.PI / 3;
          camera.radius = 200;
          break;
        case 'rotate':
          if (rotationAnimation) {
            cancelAnimationFrame(rotationAnimation);
            rotationAnimation = null;
            btn.classList.remove('animate-spin');
          } else {
            btn.classList.add('animate-spin');
            const rotate = () => {
              camera.alpha += 0.01;
              rotationAnimation = requestAnimationFrame(rotate);
            };
            rotate();
          }
          break;
      }
    });
  }

  // Setup general touch handlers
  setupTouchHandlers() {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Add swipe gestures for navigation
    this.setupSwipeGestures();

    // Improve tap targets
    this.improveTapTargets();
  }

  // Setup swipe gestures
  setupSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleSwipe = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const threshold = 50;

      // Horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          // Swipe right - previous phase
          this.triggerEvent('swipe:right');
        } else {
          // Swipe left - next phase
          this.triggerEvent('swipe:left');
        }
      }
    };

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  // Improve tap targets for mobile
  improveTapTargets() {
    const minSize = 44; // Minimum tap target size in pixels

    // Find all interactive elements
    const elements = document.querySelectorAll('button, a, input, select, [role="button"]');

    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      
      if (rect.width < minSize || rect.height < minSize) {
        // Add padding to increase tap target
        element.style.position = 'relative';
        
        // Create invisible expanded hit area
        const hitArea = document.createElement('span');
        hitArea.style.position = 'absolute';
        hitArea.style.inset = `-${(minSize - rect.height) / 2}px -${(minSize - rect.width) / 2}px`;
        hitArea.style.pointerEvents = 'none';
        
        element.appendChild(hitArea);
      }
    });
  }

  // Optimize performance for mobile
  optimizePerformance() {
    // Reduce motion for battery saving
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
    }

    // Lazy load images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Debounce scroll and resize events
    this.debounceEvents();

    // Enable GPU acceleration for animations
    this.enableGPUAcceleration();
  }

  // Setup viewport handler
  setupViewportHandler() {
    // Handle viewport changes
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
      document.head.appendChild(meta);
    }

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      // Reflow layout after orientation change
      setTimeout(() => {
        window.scrollTo(0, 0);
        this.triggerEvent('orientation:change', {
          orientation: window.orientation
        });
      }, 300);
    });
  }

  // Enable mobile-specific features
  enableMobileFeatures() {
    // Add mobile menu
    this.setupMobileMenu();

    // Enable pull to refresh
    this.setupPullToRefresh();

    // Add share functionality
    this.setupNativeShare();

    // Setup offline detection
    this.setupOfflineDetection();
  }

  // Setup mobile menu
  setupMobileMenu() {
    const menuHTML = `
      <button class="mobile-menu-toggle fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden" aria-label="Toggle menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', menuHTML);

    const toggle = document.querySelector('.mobile-menu-toggle');
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('mobile-menu-open');
      toggle.setAttribute('aria-expanded', 
        document.body.classList.contains('mobile-menu-open'));
    });
  }

  // Setup pull to refresh
  setupPullToRefresh() {
    let pullDistance = 0;
    let startY = 0;
    const threshold = 100;
    const container = document.body;

    const pullIndicator = document.createElement('div');
    pullIndicator.className = 'pull-to-refresh-indicator fixed top-0 left-0 right-0 h-20 flex items-center justify-center bg-blue-500 text-white transform -translate-y-full transition-transform';
    pullIndicator.innerHTML = '<span>Pull to refresh</span>';
    container.appendChild(pullIndicator);

    container.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (window.scrollY === 0 && startY > 0) {
        pullDistance = e.touches[0].pageY - startY;
        
        if (pullDistance > 0) {
          const progress = Math.min(pullDistance / threshold, 1);
          pullIndicator.style.transform = `translateY(${progress * 80 - 80}px)`;
          
          if (pullDistance > threshold) {
            pullIndicator.textContent = 'Release to refresh';
          }
        }
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      if (pullDistance > threshold) {
        pullIndicator.textContent = 'Refreshing...';
        window.location.reload();
      } else {
        pullIndicator.style.transform = 'translateY(-100%)';
      }
      pullDistance = 0;
      startY = 0;
    }, { passive: true });
  }

  // Setup native share
  setupNativeShare() {
    if (navigator.share) {
      // Replace share buttons with native share
      const shareButtons = document.querySelectorAll('[data-share]');
      
      shareButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          
          try {
            await navigator.share({
              title: button.dataset.shareTitle || document.title,
              text: button.dataset.shareText || '',
              url: button.dataset.shareUrl || window.location.href
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.error('Share failed:', err);
            }
          }
        });
      });
    }
  }

  // Setup offline detection
  setupOfflineDetection() {
    const offlineIndicator = document.createElement('div');
    offlineIndicator.className = 'offline-indicator fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 transform -translate-y-full transition-transform';
    offlineIndicator.textContent = 'You are offline';
    document.body.appendChild(offlineIndicator);

    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        offlineIndicator.style.transform = 'translateY(0)';
      } else {
        offlineIndicator.style.transform = 'translateY(-100%)';
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  // Setup responsive images
  setupResponsiveImages() {
    // Convert images to use srcset
    const images = document.querySelectorAll('img[data-srcset]');
    
    images.forEach(img => {
      img.srcset = img.dataset.srcset;
      img.sizes = img.dataset.sizes || '100vw';
    });

    // WebP detection and fallback
    this.detectWebPSupport().then(supportsWebP => {
      if (!supportsWebP) {
        document.querySelectorAll('img[data-fallback]').forEach(img => {
          img.src = img.dataset.fallback;
        });
      }
    });
  }

  // Detect WebP support
  async detectWebPSupport() {
    const webP = new Image();
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    
    return new Promise(resolve => {
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
    });
  }

  // Setup adaptive loading based on connection
  setupAdaptiveLoading() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateLoadingStrategy = () => {
        const effectiveType = connection.effectiveType;
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          // Low quality mode
          document.documentElement.classList.add('low-bandwidth');
          this.triggerEvent('connection:slow');
        } else if (effectiveType === '3g') {
          // Medium quality mode
          document.documentElement.classList.add('medium-bandwidth');
          this.triggerEvent('connection:medium');
        } else {
          // High quality mode
          document.documentElement.classList.remove('low-bandwidth', 'medium-bandwidth');
          this.triggerEvent('connection:fast');
        }
      };

      connection.addEventListener('change', updateLoadingStrategy);
      updateLoadingStrategy();
    }
  }

  // Debounce scroll and resize events
  debounceEvents() {
    let scrollTimeout;
    let resizeTimeout;

    // Debounced scroll
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        this.triggerEvent('scroll:debounced');
        scrollTimeout = null;
      }, 150);
    }, { passive: true });

    // Debounced resize
    window.addEventListener('resize', () => {
      if (resizeTimeout) return;
      
      resizeTimeout = setTimeout(() => {
        this.triggerEvent('resize:debounced');
        resizeTimeout = null;
      }, 150);
    });
  }

  // Enable GPU acceleration
  enableGPUAcceleration() {
    const style = document.createElement('style');
    style.textContent = `
      .gpu-accelerated {
        transform: translateZ(0);
        will-change: transform;
      }
      
      .transitioning {
        will-change: transform, opacity;
      }
      
      @media (max-width: 768px) {
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Trigger custom events
  triggerEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  // Cleanup method
  cleanup() {
    // Remove touch handlers
    this.touchHandlers.forEach((handlers, element) => {
      Object.entries(handlers).forEach(([event, handler]) => {
        element.removeEventListener(event, handler);
      });
    });
    this.touchHandlers.clear();
  }
}

// Initialize mobile optimizer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimizer = new MobileOptimizer();
  });
} else {
  window.mobileOptimizer = new MobileOptimizer();
}

// Export for use in other modules
export default MobileOptimizer; 