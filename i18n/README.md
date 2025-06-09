# Sistema de Internacionalización (i18n) para Beyond Solutions

Este directorio contiene todos los recursos necesarios para el sistema multilenguaje de la landing page de Beyond Solutions.

## Estructura de archivos

```
i18n/
├── config.json          # Configuración general del sistema i18n
├── i18n.js              # Script principal del sistema
├── language-selector.js # Componente Alpine.js para el selector de idiomas
├── rtl.css              # Estilos para idiomas de derecha a izquierda (RTL)
├── README.md            # Este archivo
├── flags/               # Directorio para banderas personalizadas (opcional)
├── es.json              # Traducciones en español (idioma predeterminado)
├── en.json              # Traducciones en inglés
└── [locale].json        # Otros archivos de traducción
```

## Cómo funciona

El sistema detecta automáticamente el idioma preferido del navegador del usuario. Si ese idioma no está disponible, se muestra el contenido en español (idioma predeterminado).

Los usuarios pueden cambiar manualmente el idioma utilizando el selector de idiomas en el header. La selección se guarda en localStorage para futuras visitas.

## Añadir un nuevo idioma

Para añadir un nuevo idioma al sitio:

1. Crea un nuevo archivo JSON en el directorio `i18n/` con el código de idioma como nombre (ej: `fr.json` para francés).
2. Copia la estructura de `es.json` y traduce todos los valores al nuevo idioma.
3. Asegúrate de que la sección `metadata` tenga la información correcta:
   ```json
   "metadata": {
     "locale": "fr",
     "name": "French",
     "nativeName": "Français",
     "dir": "ltr"
   }
   ```
4. Añade el nuevo idioma al archivo `config.json` en la lista `availableLocales`:
   ```json
   {
     "code": "fr",
     "name": "French",
     "nativeName": "Français",
     "flag": "fr"
   }
   ```

### Notas sobre los códigos de idioma y banderas

- Usa códigos de idioma ISO 639-1 de dos letras (ej: `es`, `en`, `fr`).
- Para las banderas, usa códigos de país ISO 3166-1 alpha-2 (ej: `es`, `us`, `fr`).
- Para idiomas con múltiples países, elige la bandera más representativa (ej: `us` para inglés).
- Para idiomas RTL (como árabe o hebreo), añade `"dir": "rtl"` en el objeto del idioma en `config.json`.

## Uso en HTML

### Textos estáticos

Para traducir texto estático, usa el atributo `data-i18n` con la clave de traducción:

```html
<h1 data-i18n="sections.modelo.title"></h1>
```

### Atributos

Para traducir atributos (como title, placeholder, aria-label), usa el atributo `data-i18n-attr`:

```html
<a href="#" data-i18n-attr="title:nav.menu.close, aria-label:nav.menu.close">...</a>
```

### Desde JavaScript

Para obtener traducciones programáticamente:

```javascript
const text = i18n.t('sections.contacto.title');
```

Con parámetros:

```javascript
const greeting = i18n.t('greeting', { name: 'Juan' }); // "Hola, Juan!"
```

## Consideraciones de RTL

Para idiomas de derecha a izquierda (RTL) como árabe o hebreo, los estilos se ajustan automáticamente cuando se selecciona un idioma RTL, utilizando las clases definidas en `rtl.css`. 