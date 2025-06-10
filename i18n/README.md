# Sistema de Internacionalización (i18n) - Beyond Solutions

Este directorio contiene los archivos necesarios para la internacionalización del sitio web de Beyond Solutions.

## Estructura de archivos

```
i18n/
├── flags/            # Banderas SVG para cada idioma
│   ├── es.svg        # Español
│   ├── en.svg        # Inglés
│   ├── fr.svg        # Francés
│   └── ...           # Otras banderas
│
├── es.json           # Traducción en español (idioma por defecto)
├── en.json           # Traducción en inglés
├── fr.json           # Traducción en francés
└── ...               # Otros archivos de idioma
```

## Formatos de archivo

### Archivos de traducción (JSON)

Cada archivo de idioma es un archivo JSON con la siguiente estructura:

```json
{
  "meta": {
    "name": "Español",
    "nativeName": "Español",
    "dir": "ltr",
    "code": "es"
  },
  "nav": {
    "brand": "Beyond Solutions",
    "items": {
      "about": "Sobre Nosotros",
      "modelo": "Modelo",
      "por_que": "¿Por qué Beyond?",
      ...
    },
    ...
  },
  ...
}
```

## Uso en HTML

### Traducción de texto

Para traducir texto en el HTML, usa el atributo `data-i18n`:

```html
<h1 data-i18n="hero.title">Texto por defecto</h1>
```

### Traducción de atributos

Para traducir atributos HTML, usa `data-i18n-attr`:

```html
<a href="#" data-i18n-attr="aria-label:nav.menu.open">Enlace</a>
```

Para múltiples atributos:

```html
<img src="image.jpg" data-i18n-attr="alt:image.alt,title:image.title">
```

### Traducción de HTML interno

Para traducir HTML (no solo texto), usa `data-i18n-html`:

```html
<div data-i18n-html="section.html">Contenido HTML</div>
```

## Agregar un nuevo idioma

1. Crear un archivo JSON con las traducciones en la carpeta `i18n/` (por ejemplo, `de.json` para alemán)
2. Agregar la bandera correspondiente en formato SVG en `i18n/flags/` (por ejemplo, `de.svg`)
3. Agregar el idioma en la configuración en `js/i18n.js` en el array `supportedLanguages`

## Idiomas soportados

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
- 🇦🇪 Árabe (ar) - idioma RTL (derecha a izquierda)
- 🇸🇪 Sueco (sv)
- 🇳🇱 Holandés (nl)

## Configuración SEO

El sistema de internacionalización está configurado para SEO con:

- Rutas basadas en idioma (por ejemplo, `/es/`, `/en/`)
- Meta tags de idioma alternativo
- Cabeceras HTTP `Content-Language`
- Sitemap.xml con entradas para todos los idiomas

## API JavaScript

El sistema expone las siguientes funciones:

```javascript
// Inicializar el sistema i18n
const i18n = await initI18n(options);

// Cambiar el idioma actual
changeLanguage('fr');

// Obtener una traducción
const text = t('hero.title');

// Verificar si el idioma actual es RTL
const isRightToLeft = isRTL();
``` 