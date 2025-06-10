# Beyond Solutions Landing Page

Landing page for Beyond Solutions, a platform designed to strategically integrate and manage all elements that make up a world-class real estate development.

## Multilanguage Support

This site features multilingual support using a client-side i18n system. Unlike traditional multilingual sites that use path-based routing (e.g., `/es/`, `/en/`), this implementation uses query parameters (e.g., `?lang=es`, `?lang=en`) which works better with GitHub Pages.

## GitHub Pages Deployment

This site is configured to be deployed on GitHub Pages. Key features:

1. **Query parameter-based language switching**: Uses `?lang=code` format instead of subdirectories
2. **Automatic language detection**: Detects browser language and user preferences
3. **404 redirect handling**: Custom 404 page handles old path-based language URLs
4. **SEO friendly**: Proper `hreflang` annotations in the HTML

## Local Development

To run this site locally:

1. Clone the repository
2. Serve the files using any static web server
   ```
   python -m http.server 8000
   ```
3. Navigate to `http://localhost:8000` in your browser

## Available Languages

- Spanish (es) - Default
- English (en)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Russian (ru)
- Arabic (ar) - RTL support
- Swedish (sv)
- Dutch (nl)

## File Structure

- `/i18n/` - Translation files and flag images
- `/js/` - JavaScript modules including i18n system
- `/css/` - Stylesheets
- `/img/` - Image assets
- `index.html` - Main HTML file
- `404.html` - Custom 404 page with language redirection

## Características

- Diseño responsive optimizado para todos los dispositivos
- Tema claro/oscuro basado en preferencias del usuario
- Sistema de internacionalización (i18n) completo con 13 idiomas
- Rutas basadas en idioma para SEO (/es/, /en/, etc.)
- Optimización para performance y accesibilidad

## Estructura del proyecto

```
beyond-solutions-landing/
├── css/                  # Estilos CSS
│   ├── language-selector.css  # Estilos para el selector de idiomas
│   └── rtl.css           # Estilos para idiomas RTL (derecha a izquierda)
│
├── i18n/                 # Archivos de internacionalización
│   ├── flags/            # Banderas SVG para cada idioma
│   ├── es.json           # Traducción en español (idioma por defecto)
│   ├── en.json           # Traducción en inglés
│   └── ...               # Otros archivos de idioma
│
├── img/                  # Imágenes e iconos
│
├── js/                   # JavaScript
│   ├── i18n.js           # Módulo principal de internacionalización
│   ├── language-selector.js  # Componente de selector de idiomas
│   └── main.js           # Script principal
│
├── .htaccess             # Configuración para Apache (rutas y redirecciones)
├── index.html            # Página principal
├── robots.txt            # Configuración para motores de búsqueda
└── sitemap.xml           # Mapa del sitio para SEO
```

## Sistema de Internacionalización

El sistema de i18n permite mostrar el contenido en múltiples idiomas:

- **Detección automática** del idioma preferido del usuario
- **Rutas de URL basadas en idioma** (/es/, /en/, etc.)
- **Soporte para idiomas RTL** (derecha a izquierda) como árabe
- **Selector de idiomas** con banderas y nombres nativos
- **Marcado de datos** con atributos HTML simples (data-i18n)

### Idiomas soportados

- 🇪🇸 Español (es) - idioma por defecto
- 🇺🇸 Inglés (en) - idioma de respaldo
- 🇫🇷 Francés (fr)
- 🇩🇪 Alemán (de)
- 🇮🇹 Italiano (it)
- 🇵🇹 Portugués (pt)
- 🇨🇳 Chino (zh)
- 🇯🇵 Japonés (ja)
- 🇰🇷 Coreano (ko)
- 🇷🇺 Ruso (ru)
- 🇦🇪 Árabe (ar) - RTL
- 🇸🇪 Sueco (sv)
- 🇳🇱 Holandés (nl)

Para más detalles sobre el sistema de i18n, ver [i18n/README.md](i18n/README.md).

## Desarrollo

### Requisitos

- Servidor web (Apache recomendado para .htaccess)
- No se requiere Node.js o procesamiento del lado del servidor

### Instalación local

1. Clone el repositorio:
   ```
   git clone https://github.com/your-username/beyond-solutions-landing.git
   ```

2. Configure su servidor web para apuntar al directorio del proyecto.

3. Acceda a la página a través de su servidor web local.

## Optimización SEO

- Meta tags para cada idioma
- Sitemap.xml con entradas para todos los idiomas
- Configuración robots.txt
- Cabeceras HTTP Content-Language
- Enlaces rel="alternate" hreflang para indicar versiones alternativas en otros idiomas

## Accesibilidad

- Navegación por teclado completa
- Atributos ARIA para mejorar la experiencia de lectores de pantalla
- Contraste de color adecuado
- Textos alternativos para imágenes

## Licencia

Todos los derechos reservados © 2025 Beyond Solutions 