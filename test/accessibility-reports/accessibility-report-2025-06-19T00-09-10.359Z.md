# Accessibility Audit Report

Date: 6/18/2025, 6:09:10 PM

## Summary

- Total pages tested: 5
- Total accessibility tests run: 177
- Tests passed: 166 (93.79%)
- Total violations: 11
- Color contrast violations: 3

❌ **Accessibility violations found. Please review the detailed report below.**

## Automated Accessibility Tests

### 404

#### Light Mode

- Tests passed: 1
- Violations: 2

##### Violations

| Rule                                                                      | Impact  | Elements Affected |
| ------------------------------------------------------------------------- | ------- | ----------------- |
| document-title (Documents must have <title> element to aid in navigation) | serious | 1                 |
| html-has-lang (<html> element must have a lang attribute)                 | serious | 1                 |

#### Dark Mode

- Tests passed: 1
- Violations: 2

##### Violations

| Rule                                                                      | Impact  | Elements Affected |
| ------------------------------------------------------------------------- | ------- | ----------------- |
| document-title (Documents must have <title> element to aid in navigation) | serious | 1                 |
| html-has-lang (<html> element must have a lang attribute)                 | serious | 1                 |

### index

#### Light Mode

- Tests passed: 20
- Violations: 0

#### Dark Mode

- Tests passed: 20
- Violations: 0

### calculator

#### Light Mode

- Tests passed: 23
- Violations: 0

#### Dark Mode

- Tests passed: 23
- Violations: 0

### component-examples

#### Light Mode

- Tests passed: 23
- Violations: 1

##### Violations

| Rule                                             | Impact   | Elements Affected |
| ------------------------------------------------ | -------- | ----------------- |
| button-name (Buttons must have discernible text) | critical | 1                 |

#### Dark Mode

- Tests passed: 23
- Violations: 2

##### Violations

| Rule                                                                        | Impact   | Elements Affected |
| --------------------------------------------------------------------------- | -------- | ----------------- |
| button-name (Buttons must have discernible text)                            | critical | 1                 |
| color-contrast (Elements must meet minimum color contrast ratio thresholds) | serious  | 4                 |

### color-palette-showcase

#### Light Mode

- Tests passed: 16
- Violations: 2

##### Violations

| Rule                                                                        | Impact   | Elements Affected |
| --------------------------------------------------------------------------- | -------- | ----------------- |
| color-contrast (Elements must meet minimum color contrast ratio thresholds) | serious  | 2                 |
| label (Form elements must have labels)                                      | critical | 1                 |

#### Dark Mode

- Tests passed: 16
- Violations: 2

##### Violations

| Rule                                                                        | Impact   | Elements Affected |
| --------------------------------------------------------------------------- | -------- | ----------------- |
| color-contrast (Elements must meet minimum color contrast ratio thresholds) | serious  | 2                 |
| label (Form elements must have labels)                                      | critical | 1                 |

## Manual Color Contrast Tests

❌ **172 color contrast issues found.**

| Page                        | Mode  | Element | Text                                                   | Text Color         | Background         | Ratio | Required |
| --------------------------- | ----- | ------- | ------------------------------------------------------ | ------------------ | ------------------ | ----- | -------- |
| index.html                  | light | a       | Beyond Solutions                                       | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| index.html                  | light | a       | Sobre Nosotros                                         | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| index.html                  | light | span    | Sobre Nosotros                                         | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| index.html                  | light | a       | Modelo                                                 | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Modelo                                                 | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | a       | ¿Por qué Beyond?                                       | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | ¿Por qué Beyond?                                       | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | a       | Sectores                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Sectores                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | a       | Capacidades                                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Capacidades                                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | a       | Calculadora                                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Calculadora                                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | a       | Contacto                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Contacto                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h2      | Modelo                                                 | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | El modelo abarca la orquestación integral de terre...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Identificación estratégica de suministros en funci...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Incorporación de propuestas arquitectónicas innova...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Cumplimiento regulatorio integral permitiendo real...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Ejecución eficiente mediante digitalización y cola...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Estrategias de mercado basadas en big-data para un...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | span    | Administración y mantenimiento profesional orienta...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h2      | ¿Por qué Beyond?                                       | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | h3      | DISEÑO CON PROPÓSITO Y BIENESTAR                       | rgb(36, 59, 68)    | rgba(0, 0, 0, 0)   | 1.78  | 4.5      |
| index.html                  | light | p       | Arquitectura, arte y materiales que elevan la vida...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | TECNOLOGÍA Y EFICIENCIA OPERATIVA                      | rgb(36, 59, 68)    | rgba(0, 0, 0, 0)   | 1.78  | 4.5      |
| index.html                  | light | p       | Automatización, data y excelencia operativa que op...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | COMPROMISO SOCIAL Y AMBIENTAL                          | rgb(36, 59, 68)    | rgba(0, 0, 0, 0)   | 1.78  | 4.5      |
| index.html                  | light | p       | Construcción responsable con impacto positivo, res...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h2      | Sectores                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | h3      | RESIDENCIAL                                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | p       | Estilo de vida exclusivo y sostenible, donde diseñ...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | RESTAURACIÓN Y RECONVERSIÓN                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | p       | Restauración de alta gama que fusiona conservación...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | EDUCACIÓN, ARTE Y CULTURA                              | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | p       | Espacios que impulsan la educación, el arte y la c...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | COMERCIAL E INDUSTRIAL                                 | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | p       | Entornos dinámicos que combinan diseño, tecnología...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h2      | Capacidades                                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | h3      | Terrenos – Adquisión Inteligente                       | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Mediante el análisis avanzado de big data, parámet...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Materiales – Redefiniendo la cadena de suministros     | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Optimizamos la cadena de suministro mediante tecno...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Arquitectura – Vanguardismo y Alto Impacto             | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Diseñamos espacios urbanos que integran modernismo...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Diseño – Adaptabilidad, Tecnología, Experiencia        | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Desarrollamos espacios modulares y personalizables...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Arte – Curaduría, Identidad, Experiencia               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Fusionamos arte y arquitectura mediante una curadu...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Regulatorio – Gestión Normativa Integral               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Ofrecemos una gestión experta en normativas, licen...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Construcción – Tecnológica y Global                    | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Conectamos una red global de constructores (BGP) q...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Desarrollo – Modelo Inmobiliario Disruptor             | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Revolucionamos el desarrollo inmobiliario con una ...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Comercialización – Datos, Precisión y Conversión       | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Implementamos inteligencia de mercado basada en bi...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h3      | Operación – Rendimiento y Optimización                 | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Gestionamos activos inmobiliarios con una platafor...  | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | h2      | Contacto                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 3        |
| index.html                  | light | p       | Teléfono Fijo                                          | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| index.html                  | light | a       | +52 55 (86470143) - Recepción                          | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | p       | WhatsApp Business                                      | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| index.html                  | light | a       | +52 55 (60553710) - Business WA                        | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | p       | Email                                                  | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| index.html                  | light | a       | info@beyondsolutions.app                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | p       | Sitio Web                                              | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| index.html                  | light | a       | www.beyondsolutions.app                                | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| index.html                  | light | p       | Haz clic aquí para programar una reunión con nuest...  | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| index.html                  | light | h3      | Beyond Solutions                                       | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| index.html                  | light | p       | Desarrollo inmobiliario inteligente                    | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| index.html                  | light | h4      | Alianzas estratégicas                                  | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| index.html                  | light | p       | © 2025 Beyond Solutions. Todos los derechos reserv... | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| index.html                  | light | a       | Contacto                                               | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| calculator.html             | light | a       | Beyond Solutions                                       | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| calculator.html             | light | a       | Sobre Nosotros                                         | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | span    | Sobre Nosotros                                         | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | a       | Modelo                                                 | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | span    | Modelo                                                 | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | a       | ¿Por qué Beyond?                                       | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | span    | ¿Por qué Beyond?                                       | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | a       | Sectores                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | span    | Sectores                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | a       | Capacidades                                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | span    | Capacidades                                            | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | a       | Calculadora                                            | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| calculator.html             | light | span    | Calculadora                                            | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| calculator.html             | light | a       | Contacto                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | span    | Contacto                                               | rgb(39, 39, 42)    | rgba(0, 0, 0, 0)   | 1.41  | 4.5      |
| calculator.html             | light | h1      | Calculadora de Presupuesto Inmobiliario                | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| calculator.html             | light | p       | Sigue los pasos para estimar el presupuesto, márge...  | rgb(63, 63, 70)    | rgba(0, 0, 0, 0)   | 2.01  | 4.5      |
| calculator.html             | light | h3      | Resumen                                                | rgb(17, 24, 39)    | rgba(0, 0, 0, 0)   | 1.18  | 4.5      |
| calculator.html             | light | span    | Tipo de proyecto                                       | rgb(31, 41, 55)    | rgba(0, 0, 0, 0)   | 1.43  | 4.5      |
| calculator.html             | light | span    | Entidad                                                | rgb(31, 41, 55)    | rgba(0, 0, 0, 0)   | 1.43  | 4.5      |
| calculator.html             | light | span    | Presupuesto                                            | rgb(31, 41, 55)    | rgba(0, 0, 0, 0)   | 1.43  | 4.5      |
| calculator.html             | light | span    | Dirección                                              | rgb(31, 41, 55)    | rgba(0, 0, 0, 0)   | 1.43  | 4.5      |
| calculator.html             | light | span    | Superficie                                             | rgb(31, 41, 55)    | rgba(0, 0, 0, 0)   | 1.43  | 4.5      |
| calculator.html             | light | span    | Superficie útil                                        | rgb(31, 41, 55)    | rgba(0, 0, 0, 0)   | 1.43  | 4.5      |
| calculator.html             | light | span    | Uso de suelo                                           | rgb(31, 41, 55)    | rgba(0, 0, 0, 0)   | 1.43  | 4.5      |
| calculator.html             | light | h3      | Beyond Solutions                                       | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| calculator.html             | light | p       | Desarrollo inmobiliario inteligente                    | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| calculator.html             | light | p       | © 2025 Beyond Solutions. Todos los derechos reserv... | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| calculator.html             | light | a       | Contacto                                               | rgb(113, 113, 122) | rgba(0, 0, 0, 0)   | 4.35  | 4.5      |
| component-examples.html     | light | h2      | Buttons                                                | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| component-examples.html     | light | h3      | Primary Button                                         | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h3      | Secondary Button                                       | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h3      | Tertiary Button                                        | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | button  | Tertiary Button                                        | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| component-examples.html     | light | h3      | Disabled Button                                        | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | button  | Disabled Button                                        | rgb(104, 118, 124) | rgb(173, 179, 183) | 2.22  | 4.5      |
| component-examples.html     | light | h3      | Icon Button                                            | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h2      | Form Elements                                          | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| component-examples.html     | light | h3      | Text Input                                             | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | label   | Name                                                   | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h3      | Select Dropdown                                        | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | label   | Country                                                | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h3      | Checkbox                                               | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | label   | Subscribe to newsletter...                             | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | span    | Subscribe to newsletter                                | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h2      | Cards                                                  | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| component-examples.html     | light | h3      | Basic Card                                             | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h3      | Card Title                                             | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | p       | This is a basic card component with a title and co...  | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| component-examples.html     | light | a       | Learn More →                                           | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| component-examples.html     | light | h3      | Feature Card                                           | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h3      | Feature Title                                          | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | p       | This is a feature card with an icon, title, and de...  | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| component-examples.html     | light | h2      | Alerts & Notifications                                 | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| component-examples.html     | light | h3      | Info Alert                                             | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | p       | Information                                            | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | p       | This feature is only available to registered users...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h3      | Success Alert                                          | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | p       | Success!                                               | rgb(21, 128, 61)   | rgba(0, 0, 0, 0)   | 4.19  | 4.5      |
| component-examples.html     | light | p       | Your changes have been saved successfully.             | rgb(21, 128, 61)   | rgba(0, 0, 0, 0)   | 4.19  | 4.5      |
| component-examples.html     | light | h2      | Typography Components                                  | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| component-examples.html     | light | h3      | Page Title                                             | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h1      | Page Title                                             | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 3        |
| component-examples.html     | light | h3      | Section Heading                                        | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | h2      | Section Heading                                        | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 3        |
| component-examples.html     | light | h3      | Quote                                                  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | light | p       | This is a quotation that stands out from the regul...  | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| component-examples.html     | dark  | button  | Tertiary Button                                        | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| component-examples.html     | dark  | button  | Disabled Button                                        | rgb(104, 118, 124) | rgb(173, 179, 183) | 2.22  | 4.5      |
| component-examples.html     | dark  | label   | Name                                                   | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | dark  | label   | Country                                                | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | dark  | label   | Subscribe to newsletter...                             | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | dark  | p       | Information                                            | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | dark  | p       | This feature is only available to registered users...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| component-examples.html     | dark  | p       | Success!                                               | rgb(21, 128, 61)   | rgba(0, 0, 0, 0)   | 4.19  | 4.5      |
| component-examples.html     | dark  | p       | Your changes have been saved successfully.             | rgb(21, 128, 61)   | rgba(0, 0, 0, 0)   | 4.19  | 4.5      |
| color-palette-showcase.html | light | h2      | Primary Colors                                         | rgb(36, 59, 68)    | rgba(0, 0, 0, 0)   | 1.78  | 3        |
| color-palette-showcase.html | light | p       | Our primary color palette consists of sophisticate...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| color-palette-showcase.html | light | h2      | Accent Colors                                          | rgb(36, 59, 68)    | rgba(0, 0, 0, 0)   | 1.78  | 3        |
| color-palette-showcase.html | light | p       | Our accent colors complement the primary palette a...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| color-palette-showcase.html | light | h2      | Text Colors                                            | rgb(36, 59, 68)    | rgba(0, 0, 0, 0)   | 1.78  | 3        |
| color-palette-showcase.html | light | p       | Our text colors are designed for optimal readabili...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| color-palette-showcase.html | light | h3      | Dark Text on Light Background                          | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 3        |
| color-palette-showcase.html | light | p       | This is body text using our primary dark color (#1...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| color-palette-showcase.html | light | p       | This is secondary text using our primary color (#3...  | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| color-palette-showcase.html | light | h3      | Dark Text on Light Primary Background                  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 3        |
| color-palette-showcase.html | light | p       | This is body text using our dark color (#192525) o...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| color-palette-showcase.html | light | h2      | UI Components                                          | rgb(36, 59, 68)    | rgba(0, 0, 0, 0)   | 1.78  | 3        |
| color-palette-showcase.html | light | p       | Our color palette applied to common UI components.     | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| color-palette-showcase.html | light | h3      | Buttons                                                | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| color-palette-showcase.html | light | h3      | Form Elements                                          | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| color-palette-showcase.html | light | h3      | Alerts                                                 | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 3        |
| color-palette-showcase.html | dark  | h3      | Dark Text on Light Background                          | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 3        |
| color-palette-showcase.html | dark  | p       | This is body text using our primary dark color (#1...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |
| color-palette-showcase.html | dark  | p       | This is secondary text using our primary color (#3...  | rgb(51, 75, 78)    | rgba(0, 0, 0, 0)   | 2.26  | 4.5      |
| color-palette-showcase.html | dark  | h3      | Dark Text on Light Primary Background                  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 3        |
| color-palette-showcase.html | dark  | p       | This is body text using our dark color (#192525) o...  | rgb(25, 37, 37)    | rgba(0, 0, 0, 0)   | 1.33  | 4.5      |

## Conclusion

❌ **11 accessibility issues need to be addressed.**

### Color Palette Recommendations

- Review and adjust the color palette to ensure all text meets WCAG 2.1 AA contrast requirements
- Pay special attention to text on colored backgrounds
- Consider using darker colors for text or lighter colors for backgrounds
- Test both light and dark modes thoroughly
