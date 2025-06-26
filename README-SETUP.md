# Beyond Solutions - Guía de Configuración

## 🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/beyond-solutions-landing.git
cd beyond-solutions-landing
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar API Keys

1. Copia el archivo de configuración de ejemplo:
```bash
cp config.example.js config.js
```

2. Edita `config.js` y agrega tus API keys:
```javascript
window.BEYOND_CONFIG = {
  GOOGLE_MAPS_API_KEY: 'tu-api-key-aqui',
  // ... otras configuraciones
};
```

### 4. Ejecutar en desarrollo

**Opción A: Servidor estático simple**
```bash
python3 -m http.server 8000
```
Abre http://localhost:8000

**Opción B: Build y preview**
```bash
node build.js
cd dist
python3 -m http.server 8000
```

## 📱 Páginas Principales

- **Landing Page**: http://localhost:8000/
- **Calculadora Original**: http://localhost:8000/calculator.html
- **Calculadora Gamificada**: http://localhost:8000/calculator-gamified.html ⭐ NUEVA
- **Dashboard**: http://localhost:8000/dashboard.html
- **Wizard**: http://localhost:8000/wizard.html

## 🔑 Obtener API Keys

### Google Maps API Key (Requerida)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Drawing Library
4. Ve a "Credenciales" y crea una API Key
5. Configura restricciones:
   - Restricción de aplicación: "Sitios web HTTP"
   - Agrega tu dominio: `localhost:8000/*` para desarrollo
   - Agrega tu dominio de producción cuando lo tengas

### Google Analytics (Opcional)
1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una nueva propiedad
3. Obtén el ID de medición (G-XXXXXXXXXX)

### Firebase (Opcional - para funciones avanzadas)
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Agrega una aplicación web
4. Copia la configuración

## 🎮 Flujo de la Calculadora Gamificada

### Fase 1: Wizard/Onboarding (💡)
- Selección de perfil (Desarrollador, Propietario, Inversionista, Arquitecto)
- Tipo de proyecto (Residencial, Comercial, Mixto, Industrial)
- Nombre y ubicación del proyecto
- **Recompensa**: 100 XP + Badge "Primer Proyecto"

### Fase 2: Terreno (🗺️)
- Origen del terreno (Propio, Catálogo, Buscar en mapa)
- Dibujo/importación del polígono
- Vista 3D del terreno
- Análisis solar y de viento
- **Recompensa**: 200 XP + Badge "Cartógrafo"

### Fase 3: Costos (💰)
- Sistema constructivo
- Nivel de materiales
- Análisis financiero (ROI, TIR, VAN, Payback)
- Simulador de escenarios
- **Recompensa**: 300 XP + Badge "Analista Financiero"

### Fase 4: Experiencia 3D (🎮)
- Visualizador inmersivo
- Control día/noche
- Vistas interior/exterior
- Exportación (PDF, Excel, glTF)
- **Recompensa**: 400 XP + Badge "Visionario 3D"

## 🏗️ Estructura del Proyecto

```
beyond-solutions-landing/
├── index.html              # Landing page principal
├── calculator.html         # Calculadora original
├── calculator-gamified.html # ⭐ Nueva calculadora gamificada
├── dashboard.html          # Panel de proyectos
├── wizard.html            # Wizard de onboarding
├── config.js              # ⚠️ API keys (no subir a Git)
├── config.example.js      # Plantilla de configuración
├── build.js               # Script de build
├── css/                   # Estilos
├── js/                    # Scripts
│   └── modules/           # Módulos de funcionalidad
│       ├── wizard.js      # Lógica del wizard
│       ├── terrain.js     # Gestión de terrenos
│       ├── viewer3d.js    # Visualizador 3D
│       └── finance.js     # Motor financiero
├── i18n/                  # Traducciones (18 idiomas)
├── img/                   # Imágenes
└── dist/                  # Build de producción (generado)
```

## 🐛 Solución de Problemas

### El mapa no carga
- Verifica que hayas configurado `GOOGLE_MAPS_API_KEY` en `config.js`
- Revisa la consola del navegador para errores
- Asegúrate de que la API key tenga los permisos correctos

### El wizard no redirige correctamente
- Limpia el localStorage: `localStorage.clear()`
- Recarga la página
- Verifica que estés usando la calculadora gamificada

### Los estilos no se ven correctamente
- Asegúrate de estar ejecutando desde un servidor HTTP (no file://)
- Verifica que todos los archivos CSS estén presentes

## 🚀 Deploy a Producción

### Opción 1: GitHub Pages (Recomendado)
```bash
# Build del proyecto
node build.js

# Commit y push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

El workflow de GitHub Actions se encargará del deploy automático.

### Opción 2: Netlify/Vercel
1. Conecta tu repositorio
2. Configura el comando de build: `node build.js`
3. Directorio de publicación: `dist`
4. Agrega las variables de entorno necesarias

## 📞 Soporte

Si tienes problemas:
1. Revisa la documentación en `/docs`
2. Busca en los issues de GitHub
3. Contacta al equipo: info@beyondsolutions.app

## 🔒 Seguridad

- **NUNCA** subas `config.js` a Git
- Usa variables de entorno en producción
- Restringe las API keys por dominio
- Habilita HTTPS en producción
- Implementa Content Security Policy

## 📈 Próximos Pasos

1. Configura las API keys necesarias
2. Prueba el flujo completo de la calculadora gamificada
3. Personaliza los textos y traducciones
4. Ajusta los parámetros de gamificación
5. Implementa analytics para tracking de conversión

¡Disfruta construyendo con Beyond Solutions! 🏗️✨ 