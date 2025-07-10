/**
 * Configuración para la integración con Google Maps API
 *
 * Este archivo centraliza la configuración de la API de Google Maps.
 * En un entorno real, la API_KEY debería cargarse desde variables de entorno
 * y estar restringida por dominio en la consola de Google Cloud.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

// Referencia vacía para evitar error de variable no usada en lint
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-expressions
void (google as unknown);

// Marcar la variable global google como utilizada para evitar advertencia de ESLint
// eslint-disable-next-line no-unused-expressions
void google;

// Linter: the global google type is only for declaration, not runtime use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  // Use `any` to avoid TS errors when Google Maps typings are not available at build time
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

// Referencia para que ESLint considere usado el global google
export const __googleShim = typeof google === 'undefined' ? null : google;

// Configuración de la API de Google Maps
export const MAPS_CONFIG = {
  // En producción, esta clave debería estar protegida y cargada desde variables de entorno
  // Aquí usamos una clave de ejemplo que debería ser reemplazada
  API_KEY: 'AIzaSyCHZEIwEo3h7Ah3skmMbyMOEcj6H85eG_c',

  // Opciones por defecto para el mapa
  DEFAULT_OPTIONS: {
    center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México por defecto
    zoom: 18,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    mapTypeId: 'roadmap' as const,
    mapTypeControlOptions: {
      style: 2, // dropdown menu
      mapTypeIds: ['roadmap', 'satellite'],
    },
  },

  // Límites de uso para prevenir costos excesivos
  USAGE_LIMITS: {
    maxPolygonVertices: 50,
    maxSearchRadius: 5000, // metros
    maxMapInstances: 1,
    geocodingRateLimit: 10, // peticiones por minuto
  },

  // Estilos personalizados para el mapa
  MAP_STYLES: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],

  // Opciones para el geocoding
  GEOCODING_OPTIONS: {
    region: 'mx', // Enfoque en México
    language: 'es',
  },
};
