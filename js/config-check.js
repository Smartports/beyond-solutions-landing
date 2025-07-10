// Verificación de configuración para GitHub Pages
// Este archivo reemplaza el script inline para compatibilidad con CSP

(function() {
  'use strict';
  
  // Verificar que la configuración se cargó correctamente
  if (!window.BEYOND_CONFIG) {
    console.error('⚠️ No se pudo cargar la configuración. Asegúrate de que config.js existe.');
  } else {
    console.log('✅ Configuración cargada correctamente');

    // Advertencia si faltan API keys importantes
    if (!window.BEYOND_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('⚠️ Google Maps API Key no configurada correctamente.');
    }
  }
})(); 