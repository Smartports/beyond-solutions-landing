/**
 * Navigation Timing Module - Performance monitoring
 * @module NavigationTiming
 */

class NavigationTiming {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }
  
  init() {
    // Measure initial page load
    this.measurePageLoad();
    
    // Set up performance observers
    this.setupObservers();
    
    // Monitor route changes (for SPAs)
    this.monitorRouteChanges();
    
    // Set up resource timing
    this.setupResourceTiming();
  }
  
  measurePageLoad() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
          const lookupDNS = perfData.domainLookupEnd - perfData.domainLookupStart;
          const ttfb = perfData.responseStart - perfData.navigationStart;
          
          this.metrics.pageLoad = {
            total: pageLoadTime,
            domReady: domReadyTime,
            dns: lookupDNS,
            ttfb: ttfb,
            timestamp: Date.now()
          };
          
          console.log('Page Load Metrics:', this.metrics.pageLoad);
          
          // Send to analytics if available
          this.reportMetrics('pageLoad', this.metrics.pageLoad);
        }, 0);
      });
    }
  }
  
  setupObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          console.log('LCP:', this.metrics.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }
      
      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            console.log('FID:', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }
      
      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.cls = clsValue;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }
  
  monitorRouteChanges() {
    // Monitor for route changes in SPA
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        this.onRouteChange(url);
      }
    }).observe(document, { subtree: true, childList: true });
  }
  
  onRouteChange(newUrl) {
    const navigationStart = performance.now();
    
    // Wait for route to stabilize
    setTimeout(() => {
      const navigationEnd = performance.now();
      const routeChangeTime = navigationEnd - navigationStart;
      
      this.metrics.routeChange = {
        from: this.lastRoute || 'initial',
        to: newUrl,
        duration: routeChangeTime,
        timestamp: Date.now()
      };
      
      console.log('Route Change:', this.metrics.routeChange);
      this.reportMetrics('routeChange', this.metrics.routeChange);
      
      this.lastRoute = newUrl;
    }, 100);
  }
  
  setupResourceTiming() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 500) { // Log slow resources
            console.warn('Slow resource:', {
              name: entry.name,
              duration: entry.duration,
              type: entry.initiatorType
            });
          }
        });
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing not supported');
      }
    }
  }
  
  reportMetrics(type, data) {
    // Send to analytics service if configured
    if (window.gtag) {
      window.gtag('event', 'performance', {
        event_category: 'Performance',
        event_label: type,
        value: Math.round(data.total || data.duration || 0),
        custom_map: data
      });
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('performanceMetrics', {
      detail: { type, data }
    }));
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export default NavigationTiming; 