/**
 * Configuración de ejemplo para Beyond Solutions
 * 
 * IMPORTANTE: 
 * 1. Copia este archivo como 'config.js'
 * 2. Reemplaza los valores con tus propias API keys
 * 3. NUNCA subas config.js a Git (ya está en .gitignore)
 * 4. En producción, usa variables de entorno
 */

window.BEYOND_CONFIG = {
  // Google Maps Platform
  GOOGLE_MAPS_API_KEY: 'AIzaSyCHZEIwEo3h7Ah3skmMbyMOEcj6H85eG_c',
  
  // Google Analytics
  GOOGLE_ANALYTICS_ID: 'G-XXXXXXXXXX',
  
  // Firebase (para autenticación y base de datos en tiempo real)
  FIREBASE_CONFIG: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef123456'
  },
  
  // Stripe (para pagos)
  STRIPE_PUBLIC_KEY: 'pk_test_XXXXXXXXXX',
  
  // Configuración de entorno
  ENVIRONMENT: 'development', // 'development' | 'staging' | 'production'
  
  // URLs de API
  API_BASE_URL: 'http://localhost:3000/api',
  
  // Características habilitadas
  FEATURES: {
    GAMIFICATION: true,
    SOCIAL_SHARING: true,
    PREMIUM_MATERIALS: false,
    AI_SUGGESTIONS: false,
    MULTIPLAYER: false
  },
  
  // Límites y configuraciones
  LIMITS: {
    MAX_PROJECTS_FREE: 3,
    MAX_TERRAIN_AREA: 10000, // m²
    MAX_3D_COMPLEXITY: 'medium' // 'low' | 'medium' | 'high'
  }
};

/**
 * Instrucciones para obtener las API Keys:
 * 
 * 1. Google Maps API Key:
 *    - Ve a https://console.cloud.google.com/
 *    - Crea un nuevo proyecto o selecciona uno existente
 *    - Habilita las siguientes APIs:
 *      * Maps JavaScript API
 *      * Places API
 *      * Geocoding API
 *      * Drawing Library
 *    - Crea credenciales (API Key)
 *    - Restringe la API Key a tu dominio
 * 
 * 2. Google Analytics:
 *    - Ve a https://analytics.google.com/
 *    - Crea una nueva propiedad
 *    - Obtén el ID de medición (G-XXXXXXXXXX)
 * 
 * 3. Firebase:
 *    - Ve a https://console.firebase.google.com/
 *    - Crea un nuevo proyecto
 *    - Agrega una aplicación web
 *    - Copia la configuración
 * 
 * 4. Stripe:
 *    - Ve a https://dashboard.stripe.com/
 *    - Obtén tu clave pública de prueba
 */ 