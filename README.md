# Beyond Solutions - Landing Page

## Descripción
Landing page de Beyond Solutions, una plataforma digital diseñada para integrar y gestionar estratégicamente todos los elementos que conforman un desarrollo inmobiliario de clase mundial. A través de soluciones basadas en automatización, inteligencia artificial (IA), aprendizaje automático (ML) y análisis avanzado de big data.

## Tecnologías Utilizadas
- HTML5
- TailwindCSS (via CDN)
- Alpine.js (para interactividad)
- AOS (Animate On Scroll)
- Sistema multilenguaje personalizado (i18n)
- Responsive Design

## Estructura del Proyecto

### Archivos Principales
- `index.html` - Página principal
- `DESIGN_SYSTEM.md` - Documentación del sistema de diseño
- `DECK_CONTEXT.md` - Contenido y estructura de la presentación

### Sistema de Internacionalización (i18n)
- `/i18n/` - Directorio principal del sistema multilenguaje
  - `i18n.js` - Script principal del sistema
  - `language-selector.js` - Componente Alpine.js para el selector de idiomas
  - `rtl.css` - Estilos para idiomas de derecha a izquierda
  - `config.json` - Configuración general del sistema i18n
  - `es.json`, `en.json`, etc. - Archivos de traducción por idioma
  - `README.md` - Documentación del sistema i18n
  - `ADDING_LANGUAGE.md` - Guía para añadir nuevos idiomas

### Recursos
- Imágenes de secciones (arquitectura.jpg, art.jpg, etc.)
- Iconos para sectores y contacto (icon-*.png)
- Logos de alianzas estratégicas (logo-*.png)

## Características Principales

### Secciones
1. **Hero/Sobre Nosotros** - Presentación de la empresa y su propósito
2. **Modelo** - Descripción del modelo de negocio y sus componentes
3. **¿Por qué Beyond?** - Ventajas diferenciales
4. **Sectores** - Áreas de aplicación (Residencial, Restauración, Comercial, Educación)
5. **Capacidades** - Detalle de capacidades en:
   - Terrenos
   - Materiales
   - Arquitectura
   - Diseño
   - Arte
   - Regulatorio
   - Construcción
   - Desarrollo
   - Comercialización
   - Operación
6. **Contacto** - Información de contacto y formulario
7. **Alianzas** - Logos de empresas aliadas en el sector

### Funcionalidades
- Modo oscuro/claro (con persistencia en localStorage)
- Navegación suave por anclajes
- Animaciones al hacer scroll
- Diseño completamente responsive
- Soporte para prefers-reduced-motion
- Botón "volver arriba"
- **Sistema multilenguaje**:
  - Detección automática del idioma del navegador
  - Selector de idiomas con banderas
  - Soporte para idiomas RTL (derecha a izquierda)
  - Almacenamiento de preferencia de idioma en localStorage
  - Fácil adición de nuevos idiomas mediante archivos JSON

## Sistema Multilenguaje

### Características
- **Detección automática**: El sistema detecta el idioma preferido del navegador del usuario
- **Selector visual**: Selector de idiomas con banderas en el header
- **Persistencia**: La selección de idioma se guarda en localStorage
- **Extensible**: Fácil adición de nuevos idiomas mediante archivos JSON
- **Soporte RTL**: Diseño adaptable para idiomas que se escriben de derecha a izquierda
- **Internacionalización completa**: Todos los textos del sitio están disponibles para traducción

### Idiomas Disponibles
- Español (es) - Idioma predeterminado
- Inglés (en)
- *Más idiomas pueden ser añadidos fácilmente siguiendo la guía en `/i18n/ADDING_LANGUAGE.md`*

### Cómo Añadir un Nuevo Idioma
Ver la guía detallada en `/i18n/ADDING_LANGUAGE.md`

## Instalación y Despliegue

### Requisitos
No se requieren instalaciones especiales ya que todas las dependencias se cargan a través de CDN.

### Desarrollo Local
1. Clonar el repositorio:
```bash
git clone https://github.com/your-username/beyond-solutions-landing.git
cd beyond-solutions-landing
```

2. Abrir el archivo index.html en el navegador:
```bash
# En macOS
open index.html

# En Windows
start index.html

# En Linux
xdg-open index.html
```

### Despliegue
La página puede ser desplegada en cualquier servidor web estático como:
- GitHub Pages
- Netlify
- Vercel
- Amazon S3
- Firebase Hosting

## Sistema de Diseño
El diseño de la página sigue los lineamientos del sistema de diseño documentado en `DESIGN_SYSTEM.md`, que incluye:

- **Identidad y principios**:
  - Claridad
  - Futurismo discreto
  - Accesibilidad
  - Transparencia

- **Paleta de colores oficial**:
  - Primary-900: #192c64
  - Primary-700: #243f8f
  - Accent-300: #bdc5dd
  - Accent-100: #e9ebf3

- **Tipografía**:
  - Display/Headers: Open Sauce One
  - Body: Open Sauce One
  - Auxiliar: Muli

- **Componentes**:
  - Botones primarios
  - Tarjetas
  - Banners CTA
  - Formularios

## Accesibilidad
- Contraste WCAG 2.1 AA mínimo
- Navegación lógica por teclado
- Soporte para prefers-reduced-motion
- Uso apropiado de roles ARIA
- Soporte para múltiples idiomas y contextos culturales

## Contacto
- **Email**: info@beyondsolutions.app
- **Teléfono**: +52 55 8647 0143
- **Dirección**: Torre Guttenberg – J. Rousseau 3, Anzures, Miguel Hidalgo, Ciudad de México, México
- **Sitio Web**: www.beyondsolutions.app

## Licencia
© 2025 Beyond Solutions. Todos los derechos reservados. 