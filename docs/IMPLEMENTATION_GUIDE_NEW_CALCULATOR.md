# Guía de Implementación – Actualización Calculadora Inmobiliaria

> **Propósito**: establecer un marco de trabajo claro y auto‑contenible que permita al equipo entregar la nueva calculadora inmobiliaria (v2) – con flujo de 4 fases, visualización 3D low‑poly y gamificación temprana – sin omitir tareas críticas y manteniendo trazabilidad del avance.

---

Inspecciona el nuevo diagrama de decisiones a implementar: /docs/new-calculator-tree-decision-diagram.md

## 1. Visión resumida

1. **Reducir fricción** convirtiendo el onboarding en un wizard de 2 pasos.
2. **Habilitar terreno interactivo** con mapa + sketch 2D y vista 3D low‑poly.
3. **Simplificar costos** mediante selector de nivel de materiales y motor financiero en un panel unificado.
4. **Generar engagement** con visualizador inmersivo 3D y recompensas de gamificación en cada fase.

---

## 2. Alcance & Épicas

| Épica                                  | Objetivo                                                    | Componentes clave                                       |
| -------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| **E1 – Wizard/Onboarding**             | Capturar perfil y tipo de proyecto en <60 s.                | `Wizard2Q`, `DashboardAutosave`                         |
| **E2 – Terreno**                       | Seleccionar o dibujar terreno y generar geometría low‑poly. | `MapPicker`, `Sketch2D`, `ImportCAD`, `Vista3D`         |
| **E3 – Costos**                        | Estimar costos y KPIs con selector de materiales.           | `NivelMateriales`, `MotorFinanciero`, `KPIPanel`        |
| **E4 – Experiencia 3D & Gamificación** | Recorrer proyecto, otorgar XP y exportar.                   | `Viewer3D`, `GamificationCore`, `ExportsSuite`          |
| **E5 – Infraestructura**               | Estado global, autosave, i18n, tests, CI/CD.                | `ReduxSlices`, `IndexedDBSync`, `Jest`, `GithubActions` |

---

## 3. Cronograma (6 sprints de 1 semana)

1. **Sprint 0 – Kick‑off & Setup**
   • Storybook, linting, rutas básicas.
2. **Sprint 1 – E1 listo (wizard + autosave v1)**
3. **Sprint 2 – E2 MVP (mapa + sketch 2D)**
4. **Sprint 3 – E2 completo (import CAD, vista 3D low‑poly)**
5. **Sprint 4 – E3 completo (motor financiero + KPIs + simulador)**
6. **Sprint 5 – E4 completo (viewer 3D, badges iniciales, export PDF)**
7. **Sprint 6 – Hardening & QA** (accesibilidad, estrés, docs)

*(Si algún sprint excede el WIP máximo, se divide por vertical funcional.)*

---

## 4. Historias de usuario (plantilla)

```gherkin
Como <tipo de usuario>
Quiero <acción>
Para <beneficio>
```

**Criterios de aceptación genéricos**:

1. Todos los textos traducibles vía `i18n`.
2. Validaciones y máscaras con `react-hook-form` + `zod`.
3. AA en contraste según WCAG 2.1.
4. Rendimiento: LCP <2.5 s en dispositivos de gama media.

> Cada historia debe vincularse a una PR con checklist «Definition of Done» (tests, docs, screenshots).

---

## 5. Prompt ejecutor (copiar/pegar en ChatGPT / agente interno)

```
Eres Orquestador Técnico y genio desarrollador Full Stack de la calculadora inmobiliaria v2.
Contexto:
- Tech stack: Tailwind + Babylon.js (consider threejs as well), local database (based on indexdb, localstorage and sessionstorage).
- Podemos (y preferimos) usar tecnologías de google como geofencing, https://mapsplatform.google.com/ y relacionadas que puedan ser útiles de integrar congruentemente.
- Cronograma: 6 sprints semanales (ver Guía).

Objetivo del prompt:
1. Dividir la épica **{ÉPICA}** del sprint actual en historias tamaño ≤1 día.
2. Para cada historia, generar: `objetivo`, `tareas`, `aceptación`, `dependencias`.
3. Identificar riesgos de alcance y proponer mitigaciones.
4. Output en formato Markdown listo para pegar en GitHub Issues.

Restricciones:
- No crear historias sin criterios de aceptación medibles.
- Sugerir tests automáticos cuando aplique.
- Mantener numeración consistente.

Ejecuta ahora usando los datos del sprint y retorna el plan.
```

> **Uso recomendado**: el *Scrum Master* ejecuta el prompt al inicio de cada sprint; el resultado se revisa en planning y se copia a GitHub Projects.

---

## 6. Checklist GLOBAL de entrega

* [ ] Estructura de carpetas `apps/web`, `packages/ui`, `packages/core` lista.
* [ ] Storybook con tokens de diseño publicados.
* [ ] Wizard funcional con autosave en IndexedDB.
* [ ] Mapa con búsqueda, pin y sketch 2D.
* [ ] Import CAD/GIS (.dxf, .geojson) compatible.
* [ ] Viewer 3D con LOD y controles táctiles.
* [ ] Selector de materiales + texturas PBR (≥50 presets).
* [ ] Motor financiero con USD ↔ MXN y simulador de escenarios.
* [ ] XP + badges: 10 logros iniciales.
* [ ] Export PDF (finanzas) y glTF (modelo).
* [ ] Tests unitarios ≥ 80 % coverage.
* [ ] Lighthouse ≥ 90 / 90 / 90 / 100 (PWA disabled).
* [ ] Docs actualizadas en `/docs` + README Sprint 6.

---

## 7. Gobernanza y métricas

* **Fuente única de verdad**: rama `main`; deploy preview en Vercel.
* **Reporte diario**: bot PostHog → canal #dashboards.
* **Defecto SLA**: bugs bloqueantes corregidos <48 h.
* **Éxito MVP**: >70 % usuarios nuevos completan Fase 2 y >40 % llegan a Viewer 3D.

---

## 8. Contactos clave

| Rol           | Nombre / Alias | Canal             |
| ------------- | -------------- | ----------------- |
| Product Owner | Edgar          | `edgar.zorrilla@smartports.app` |
| Tech Lead FE  | Edgar  | |
| Tech Lead BE  | Edgar  | |
| UX Lead       | Edgar  | |

---

> Mantén este documento **vivo**: actualiza entregables ✔, agrega riesgos 🚧 y versiona cambios junto con el código (ruta `/docs/IMPLEMENTATION_GUIDE_NEW_CALCULATOR.md`).
