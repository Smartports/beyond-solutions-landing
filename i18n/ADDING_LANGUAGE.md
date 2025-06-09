# Guía para agregar un nuevo idioma al sitio

Este documento detalla los pasos para añadir un nuevo idioma al sistema de internacionalización de Beyond Solutions.

## Pasos para añadir un nuevo idioma

### 1. Crear el archivo de traducción

1. Copia el archivo de base `/i18n/es.json` a un nuevo archivo con el código de idioma deseado:
   ```
   cp i18n/es.json i18n/[codigo].json
   ```
   Donde `[codigo]` es el código ISO 639-1 de dos letras del idioma (ej: `fr` para francés).

2. Edita el nuevo archivo JSON y traduce todos los valores. Asegúrate de mantener la estructura y las claves intactas.

3. Actualiza la sección `metadata` con la información correcta del idioma:
   ```json
   "metadata": {
     "locale": "fr",
     "name": "French",
     "nativeName": "Français",
     "dir": "ltr"
   }
   ```
   
   - `locale`: Código ISO 639-1 del idioma
   - `name`: Nombre del idioma en inglés
   - `nativeName`: Nombre del idioma en su propio idioma
   - `dir`: Dirección del texto ("ltr" para izquierda a derecha, "rtl" para derecha a izquierda)

### 2. Agregar el idioma al archivo de configuración

Edita el archivo `/i18n/config.json` y añade el nuevo idioma a la lista `availableLocales`:

```json
{
  "code": "fr",
  "name": "French",
  "nativeName": "Français",
  "flag": "fr"
}
```

- `code`: Código ISO 639-1 del idioma
- `name`: Nombre del idioma en inglés
- `nativeName`: Nombre del idioma en su propio idioma
- `flag`: Código de país ISO 3166-1 alpha-2 para la bandera

### 3. Probar el nuevo idioma

1. Abre el sitio en un navegador
2. Utiliza el selector de idiomas en el header para seleccionar el nuevo idioma
3. Verifica que todas las traducciones se muestren correctamente
4. Para idiomas RTL, comprueba que el diseño se ajuste adecuadamente

## Consideraciones para idiomas RTL

Para idiomas que se escriben de derecha a izquierda (RTL) como árabe (ar) o hebreo (he):

1. Establece `"dir": "rtl"` en la sección `metadata` del archivo de traducción
2. Asegúrate de añadir también `"dir": "rtl"` en el objeto del idioma en `config.json`
3. Verifica que los estilos de RTL en `/i18n/rtl.css` funcionen correctamente con el nuevo idioma

## Códigos de idioma y banderas comunes

| Idioma    | Código Idioma | Código Bandera |
|-----------|---------------|----------------|
| Español   | es            | es             |
| Inglés    | en            | us/gb          |
| Francés   | fr            | fr             |
| Alemán    | de            | de             |
| Italiano  | it            | it             |
| Portugués | pt            | pt/br          |
| Ruso      | ru            | ru             |
| Chino     | zh            | cn             |
| Japonés   | ja            | jp             |
| Coreano   | ko            | kr             |
| Árabe     | ar            | sa/ae          |
| Hebreo    | he            | il             |

Para un listado completo de códigos ISO 639-1 (idiomas) y ISO 3166-1 alpha-2 (países), consulta:
- [Lista de códigos ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [Lista de códigos ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) 