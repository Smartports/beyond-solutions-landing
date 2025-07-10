# Configuración para GitHub Pages

Esta guía te ayudará a configurar correctamente el proyecto **Beyond Calculator** en GitHub Pages con Content Security Policy (CSP) optimizado.

## 🚀 Configuración Inicial

### 1. Habilitar GitHub Pages

1. Ve a **Settings** > **Pages** en tu repositorio
2. En **Source**, selecciona **GitHub Actions**
3. No uses **Deploy from branch** ya que necesitamos procesamiento automático

### 2. Configurar Secrets

Añade estos secrets en **Settings** > **Secrets and variables** > **Actions**:

```
GOOGLE_MAPS_API_KEY = tu_google_maps_api_key_aqui
```

### 3. Estructura del Proyecto

```
beyond-solutions-landing/
├── .github/workflows/
│   └── github-pages.yml          # Auto-deploy configurado
├── calculator-gamified.html       # Página principal con CSP optimizado
├── js/
│   ├── alpine-csp-init.js        # Componentes Alpine CSP-friendly
│   └── modules/                  # Módulos JS del proyecto
├── config.example.js             # Plantilla de configuración
└── docs/
    ├── CSP_PRODUCTION_SETUP.md   # Documentación CSP completa
    └── GITHUB_PAGES_SETUP.md     # Esta guía
```

## 🔒 Content Security Policy para GitHub Pages

### Configuración Actual

El CSP está optimizado específicamente para GitHub Pages:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'sha256-RRpbpNRbkhF/miIdruYbcwV/gMV36kyPwTfeZk5tuYE=' https://cdn.jsdelivr.net https://unpkg.com https://maps.googleapis.com *.github.io *.githubpages.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://maps.googleapis.com https://*.googleapis.com ws: wss:;
  frame-src 'none';
  object-src 'none';
  media-src 'self';
  worker-src 'self' blob:;
  manifest-src 'self';
  base-uri 'self';
  form-action 'self';
">
```

### Características Específicas

- ✅ **Sin nonces dinámicos**: Usa hashes SHA256 para scripts inline
- ✅ **Sin report-uri**: GitHub Pages no puede procesar reportes
- ✅ **Dominios GitHub**: Incluye `*.github.io` y `*.githubpages.com`
- ✅ **Alpine.js CSP build**: Versión compatible sin `unsafe-eval`

## 🔧 Desarrollo Local vs Producción

### Desarrollo Local

```bash
# Usar servidor local simple
npx http-server -p 8080 --cors

# O con Python
python -m http.server 8080

# O con Node.js/Express si tienes server.js
npm start
```

### Producción GitHub Pages

El deploy es automático via GitHub Actions cuando haces push a `main` o `master`.

## 📝 Modificaciones Importantes para GitHub Pages

### 1. Alpine.js CSP Build

**Antes (no funciona en GitHub Pages con CSP):**
```html
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

**Ahora (CSP-friendly):**
```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.x.x/dist/cdn.min.js"></script>
```

### 2. Componentes Alpine Externos

Todos los componentes Alpine están en `js/alpine-csp-init.js`:

```javascript
// ❌ No funciona con CSP build
<div x-data="{ count: 1 }">

// ✅ Funciona con CSP build  
<div x-data="counter">

// Definido en js/alpine-csp-init.js
Alpine.data('counter', () => ({ count: 1 }));
```

### 3. Scripts Inline con Hash

Si necesitas modificar el script inline, recalcula su hash:

```bash
# Calcular nuevo hash SHA256
echo "tu_script_aqui" | openssl dgst -sha256 -binary | openssl base64
```

## 🚨 Limitaciones de GitHub Pages

### Lo que NO puedes hacer:
- ❌ Headers HTTP personalizados
- ❌ Nonces dinámicos
- ❌ Procesamiento server-side
- ❌ Reportes CSP automáticos
- ❌ Variables de entorno dinámicas

### Alternativas recomendadas:
- ✅ **Cloudflare Pages**: Headers HTTP + Edge Functions
- ✅ **Netlify**: Functions + Headers personalizados  
- ✅ **Vercel**: Serverless + Headers configurables

## 🔍 Debugging y Monitoreo

### 1. Verificar CSP en DevTools

```javascript
// En consola del navegador
console.log(document.querySelector('meta[http-equiv="Content-Security-Policy"]').content);
```

### 2. Detectar Violaciones CSP

```javascript
// Agregar listener temporal para debugging
document.addEventListener('securitypolicyviolation', (e) => {
  console.error('CSP Violation:', {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    originalPolicy: e.originalPolicy
  });
});
```

### 3. Verificar Alpine.js CSP

```javascript
// Verificar que Alpine CSP está funcionando
console.log('Alpine version:', Alpine.version);
console.log('Alpine CSP mode:', !Alpine.evaluate); // debe ser true
```

## 📋 Lista de Verificación Post-Deploy

### ✅ Funcionalidad Básica
- [ ] Página carga sin errores 404
- [ ] CSS se aplica correctamente
- [ ] JavaScript se ejecuta sin errores

### ✅ Content Security Policy
- [ ] No hay errores CSP en console
- [ ] Scripts externos cargan correctamente
- [ ] Google Maps funciona (si está configurado)

### ✅ Alpine.js
- [ ] Componentes reactivos funcionan
- [ ] No hay errores de `unsafe-eval`
- [ ] Navegación entre fases funciona

### ✅ Gamificación
- [ ] Sistema de XP funciona
- [ ] Badges se muestran correctamente
- [ ] Leaderboard se abre/cierra

### ✅ Módulos de Terreno/Costos
- [ ] Mapa se inicializa (con API key)
- [ ] Autocompletado de ubicaciones funciona
- [ ] Gráficas de costos se renderizan

## 🆘 Solución de Problemas Comunes

### Error: "Alpine is not defined"

```javascript
// Verificar orden de carga
1. ✅ js/alpine-csp-init.js (componentes)
2. ✅ Alpine CSP build CDN
3. ❌ No cargar Alpine antes de definir componentes
```

### Error: CSP Violation

```bash
# Recalcular hash si modificaste script inline
openssl dgst -sha256 -binary script.js | openssl base64
```

### Error: Google Maps no carga

```javascript
// Verificar API key en config.js
window.BEYOND_CONFIG.GOOGLE_MAPS_API_KEY
```

### Error: 404 en recursos

```bash
# Verificar rutas relativas (no absolutas)
✅ src="./js/main.js"  
❌ src="/js/main.js"
```

## 📞 Soporte

Si encuentras problemas:

1. **Revisa GitHub Actions logs**: Ve a **Actions** tab en tu repo
2. **Verifica console del navegador**: F12 > Console
3. **Comprueba Network tab**: F12 > Network para recursos fallidos
4. **Consulta documentación**: `docs/CSP_PRODUCTION_SETUP.md`

## 🎯 Próximos Pasos

1. Configura Google Maps API key en GitHub Secrets
2. Personaliza colores/estilos en `css/colors.css`
3. Añade más funcionalidades siguiendo el patrón Alpine CSP
4. Considera migrar a Cloudflare Pages para mayor flexibilidad 