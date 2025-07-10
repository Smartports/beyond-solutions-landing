# Configuración de Content Security Policy (CSP) para Producción

## ⚠️ CONFIGURACIÓN ESPECÍFICA PARA GITHUB PAGES

**GitHub Pages tiene limitaciones que requieren una estrategia diferente:**

### Limitaciones de GitHub Pages:
- ❌ No permite headers HTTP personalizados
- ❌ No hay servidor backend para generar nonces dinámicos  
- ❌ No se puede procesar contenido del lado del servidor
- ✅ Solo se pueden usar meta tags para CSP

### Configuración Actual para GitHub Pages:

```html
<!-- Content Security Policy optimizada para GitHub Pages -->
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

### Explicación de ajustes para GitHub Pages:

1. **Uso de hashes SHA256**: En lugar de nonces dinámicos, usamos hashes para scripts inline específicos
2. **Eliminación de report-uri**: GitHub Pages no puede procesar reportes de violaciones
3. **Dominios GitHub**: Agregados `*.github.io` y `*.githubpages.com` a script-src
4. **Sin nonces**: Los scripts externos no necesitan nonces en este enfoque

### Verificación del Hash SHA256:

Si modificas el script inline, debes recalcular su hash:

```bash
# Para el script de configuración actual:
echo "// Verificar que la configuración se cargó correctamente
if (!window.BEYOND_CONFIG) {
  console.error('⚠️ No se pudo cargar la configuración. Asegúrate de que config.js existe.');
} else {
  console.log('✅ Configuración cargada correctamente');

  // Advertencia si faltan API keys importantes
  if (!window.BEYOND_CONFIG.GOOGLE_MAPS_API_KEY) {
    console.warn('⚠️ Google Maps API Key no configurada correctamente.');
  }
}" | openssl dgst -sha256 -binary | openssl base64
```

**Resultado:** `RRpbpNRbkhF/miIdruYbcwV/gMV36kyPwTfeZk5tuYE=`

### Alternativas para Mayor Seguridad en GitHub Pages:

1. **Cloudflare Pages** (recomendado para proyectos serios):
   - Soporte completo para headers HTTP
   - Edge Functions para nonces dinámicos
   - Mejor rendimiento y seguridad

2. **Netlify**:
   - Headers personalizados
   - Functions para lógica del servidor
   - Deploy automático desde GitHub

3. **Vercel**:
   - Serverless functions
   - Headers configurables
   - Excelente rendimiento

### Lista de Verificación para GitHub Pages:

- [x] CSP configurado via meta tag
- [x] Hash SHA256 calculado para scripts inline
- [x] Dominios GitHub agregados al CSP
- [x] Report-uri eliminado (no funcional)
- [ ] Probar en GitHub Pages staging
- [ ] Verificar que Google Maps funciona
- [ ] Verificar que Alpine.js CSP build funciona
- [ ] Monitorear errores en console del navegador

---

## Configuración para Servidores con Capacidades Completas

## Resumen

Este documento describe cómo configurar correctamente el Content Security Policy (CSP) para la calculadora gamificada en un entorno de producción, utilizando Alpine.js CSP build y nonces dinámicos.

## Cambios Implementados

### 1. Alpine.js CSP Build

Se migró de Alpine.js estándar a la versión CSP-friendly que no requiere `unsafe-eval`:

**Antes:**
```html
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

**Ahora:**
```html
<script defer nonce="NONCE_VALUE" src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.x.x/dist/cdn.min.js"></script>
```

### 2. Componentes Alpine Externos

Todos los componentes Alpine.js fueron extraídos a un archivo externo (`js/alpine-csp-init.js`) para cumplir con las restricciones del CSP build.

### 3. CSP con Nonces

La política CSP actual utiliza un nonce estático para desarrollo. En producción, debe ser dinámico.

## Configuración para Producción

### Opción 1: Servidor Node.js/Express

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware para generar nonce
app.use((req, res, next) => {
  // Generar nonce único para cada petición
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  // Configurar CSP header
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://unpkg.com https://maps.googleapis.com;
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
    report-uri /csp-violations;
  `.replace(/\s+/g, ' '));
  
  next();
});

// Servir archivos estáticos con nonce inyectado
app.get('*.html', (req, res, next) => {
  const filePath = path.join(__dirname, req.path);
  
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return next();
    
    // Reemplazar nonce estático con el dinámico
    content = content.replace(/nonce="calculator-gamified-2025"/g, `nonce="${res.locals.nonce}"`);
    
    res.send(content);
  });
});
```

### Opción 2: Nginx con sub_filter

```nginx
server {
    # Generar nonce único
    set_secure_random_alphanum $csp_nonce 32;
    
    # Configurar CSP header
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'nonce-$csp_nonce' https://cdn.jsdelivr.net https://unpkg.com https://maps.googleapis.com;
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
        report-uri /csp-violations;
    ";
    
    # Reemplazar nonce en HTML
    location ~ \.html$ {
        sub_filter 'nonce="calculator-gamified-2025"' 'nonce="$csp_nonce"';
        sub_filter_once off;
    }
}
```

### Opción 3: Cloudflare Workers

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch(request);
  
  // Solo procesar HTML
  if (!response.headers.get('content-type')?.includes('text/html')) {
    return response;
  }
  
  // Generar nonce
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  
  // Clonar respuesta y modificar
  const modifiedResponse = new Response(
    (await response.text()).replace(/nonce="calculator-gamified-2025"/g, `nonce="${nonce}"`),
    response
  );
  
  // Agregar CSP header
  modifiedResponse.headers.set('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://unpkg.com https://maps.googleapis.com;
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
    report-uri /csp-violations;
  `.replace(/\s+/g, ' '));
  
  return modifiedResponse;
}
```

## Reporte de Violaciones CSP

### Endpoint para recibir reportes

```javascript
// Express endpoint
app.post('/csp-violations', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.log('CSP Violation:', req.body);
  
  // Registrar en sistema de logging
  logger.warn('CSP Violation', {
    documentUri: req.body['csp-report']['document-uri'],
    violatedDirective: req.body['csp-report']['violated-directive'],
    blockedUri: req.body['csp-report']['blocked-uri'],
    lineNumber: req.body['csp-report']['line-number'],
    sourceFile: req.body['csp-report']['source-file']
  });
  
  res.status(204).end();
});
```

## Modo Report-Only

Para probar antes de aplicar en producción:

```javascript
// Cambiar Content-Security-Policy por Content-Security-Policy-Report-Only
res.setHeader('Content-Security-Policy-Report-Only', cspPolicy);
```

## Lista de Verificación para Producción

- [ ] Configurar generación de nonces dinámicos en el servidor
- [ ] Implementar endpoint para reportes CSP
- [ ] Probar en modo report-only primero
- [ ] Verificar que todos los recursos externos están permitidos
- [ ] Monitorear reportes de violaciones
- [ ] Considerar usar hashes SHA256 para scripts críticos inline
- [ ] Implementar fallback para navegadores sin soporte CSP

## Mejoras de Seguridad Adicionales

### 1. Usar Hashes para Scripts Críticos

Para scripts inline que no pueden ser externos:

```html
<script nonce="NONCE_VALUE">
  // Script crítico aquí
</script>
```

Generar hash:
```bash
echo -n "// Script crítico aquí" | openssl dgst -sha256 -binary | openssl base64
```

Agregar al CSP:
```
script-src 'self' 'sha256-HASH_VALUE' ...
```

### 2. Subresource Integrity (SRI)

Agregar integridad a recursos externos:

```html
<script 
  src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.x.x/dist/cdn.min.js"
  integrity="sha384-HASH"
  crossorigin="anonymous"
  nonce="NONCE_VALUE"
></script>
```

### 3. Trusted Types (Futuro)

Preparar para Trusted Types API:

```javascript
if (window.trustedTypes && trustedTypes.createPolicy) {
  trustedTypes.createPolicy('default', {
    createHTML: (string) => string,
    createScriptURL: (string) => string,
    createScript: (string) => string,
  });
}
```

## Referencias

- [Alpine.js CSP Build Documentation](https://alpinejs.dev/advanced/csp)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator by Google](https://csp-evaluator.withgoogle.com/)
- [Content Security Policy Builder](https://www.csphero.com/csp-builder) 