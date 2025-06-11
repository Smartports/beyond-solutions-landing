# Internationalization System (i18n) - Beyond Solutions

This directory contains the necessary files for the internationalization of the Beyond Solutions website.

## File Structure

```bash
i18n/
├── flags/            # SVG flags for each language
│   ├── es.svg        # Spanish
│   ├── en.svg        # English
│   ├── fr.svg        # French
│   └── ...           # Other flags
│
├── es.json           # Spanish translation (default language)
├── en.json           # English translation
├── fr.json           # French translation
└── ...               # Other language files
```

## File Formats

### Translation Files (JSON)

Each language file is a JSON file with the following structure:

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

## Usage in HTML

### Text Translation

To translate text in HTML, use the `data-i18n` attribute:

```html
<h1 data-i18n="hero.title">Default text</h1>
```

### Attribute Translation

To translate HTML attributes, use `data-i18n-attr`:

```html
<a href="#" data-i18n-attr="aria-label:nav.menu.open">Link</a>
```

For multiple attributes:

```html
<img src="image.jpg" data-i18n-attr="alt:image.alt,title:image.title">
```

### Internal HTML Translation

To translate HTML (not just text), use `data-i18n-html`:

```html
<div data-i18n-html="section.html">HTML Content</div>
```

## Adding a New Language

1. Create a JSON file with translations in the `i18n/` folder (e.g., `de.json` for German)
2. Add the corresponding flag in SVG format in `i18n/flags/` (e.g., `de.svg`)
3. Add the language in the configuration in `js/i18n.js` in the `supportedLanguages` array

## Supported Languages

- 🇪🇸 Spanish (es) - default language
- 🇺🇸 English (en) - fallback language
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇷🇺 Russian (ru)
- 🇸🇦 Arabic (ar) - RTL
- 🇵🇱 Polish (pl)
- 🇹🇷 Turkish (tr)
- 🇸🇪 Swedish (sv)
- 🇳🇱 Dutch (nl)
- 🇮🇳 Hindi (hi)
- 🇻🇳 Vietnamese (vi)
- 🇬🇷 Greek (el)

## SEO Configuration

The internationalization system is configured for SEO with:

- Language-based routes (e.g., `/es/`, `/en/`)
- Alternative language meta tags
- HTTP `Content-Language` headers
- Sitemap.xml with entries for all languages

## JavaScript API

The system exposes the following functions:

```javascript
// Initialize the i18n system
const i18n = await initI18n(options);

// Change the current language
changeLanguage('fr');

// Get a translation
const text = t('hero.title');

// Check if the current language is RTL
const isRightToLeft = isRTL();
```
