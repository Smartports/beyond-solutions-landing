# Guide to Adding a New Language to the Site

This document details the steps to add a new language to the Beyond Solutions internationalization system.

## Steps to Add a New Language

### 1. Create the Translation File

1. Copy the base file `./i18n/es.json` to a new file with the desired language code:
   ```
   cp i18n/es.json i18n/[code].json
   ```
   Where `[code]` is the two-letter ISO 639-1 code for the language (e.g., `fr` for French).

2. Edit the new JSON file and translate all values. Make sure to keep the structure and keys intact.

3. Update the `metadata` section with the correct language information:
   ```json
   "metadata": {
     "locale": "fr",
     "name": "French",
     "nativeName": "Français",
     "dir": "ltr"
   }
   ```
   
   - `locale`: ISO 639-1 code for the language
   - `name`: Language name in English
   - `nativeName`: Language name in its own language
   - `dir`: Text direction ("ltr" for left-to-right, "rtl" for right-to-left)

### 2. Add the Language to the Configuration File

Edit the file `./i18n/config.json` and add the new language to the `availableLocales` list:

```json
{
  "code": "fr",
  "name": "French",
  "nativeName": "Français",
  "flag": "fr"
}
```

- `code`: ISO 639-1 code for the language
- `name`: Language name in English
- `nativeName`: Language name in its own language
- `flag`: ISO 3166-1 alpha-2 country code for the flag

### 3. Test the New Language

1. Open the site in a browser
2. Use the language selector in the header to select the new language
3. Verify that all translations are displayed correctly
4. For RTL languages, check that the layout adjusts properly

## Considerations for RTL Languages

For languages written from right to left (RTL) such as Arabic (ar) or Hebrew (he):

1. Set `"dir": "rtl"` in the `metadata` section of the translation file
2. Make sure to also add `"dir": "rtl"` in the language object in `config.json`
3. Verify that the RTL styles in `./i18n/rtl.css` work correctly with the new language

## Common Language and Flag Codes

| Language   | Language Code | Flag Code |
|------------|--------------|-----------|
| Spanish    | es           | es        |
| English    | en           | us/gb     |
| French     | fr           | fr        |
| German     | de           | de        |
| Italian    | it           | it        |
| Portuguese | pt           | pt/br     |
| Russian    | ru           | ru        |
| Chinese    | zh           | cn        |
| Japanese   | ja           | jp        |
| Korean     | ko           | kr        |
| Arabic     | ar           | sa/ae     |
| Hebrew     | he           | il        |

For a complete list of ISO 639-1 (languages) and ISO 3166-1 alpha-2 (countries) codes, see:
- [List of ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [List of ISO 3166-1 alpha-2 codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) 