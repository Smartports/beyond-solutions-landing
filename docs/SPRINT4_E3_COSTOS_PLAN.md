# Plan de Implementación: E3 - Costos Completo (Sprint 4)

> **Propósito**: Este documento presenta el plan detallado de implementación para la Épica E3 (Costos) durante el Sprint 4 del proyecto de calculadora inmobiliaria v2. Servirá como guía y registro del progreso para garantizar una entrega exitosa del motor financiero, KPIs y simulador de escenarios.

## Visión General

La Épica E3 tiene como objetivo estimar costos y KPIs mediante un selector de materiales y un motor financiero robusto. Este sprint implementará el sistema para definir el sistema constructivo, seleccionar niveles de materiales, calcular costos directos e indirectos, y proporcionar análisis financieros con simulación de escenarios.

## Registro de Estado

| Fecha | Estado | Notas |
|-------|--------|-------|
| [FECHA_ACTUAL] | Planeado | Plan inicial creado |

## Historias de Usuario

### Historia #1: Sistema Constructivo Base

**Objetivo:** Implementar la selección de sistemas constructivos básicos para el proyecto inmobiliario.

**Estado:** 📝 Pendiente

**Tareas:**
- [ ] Diseñar UI para selección de sistema constructivo
- [ ] Implementar selección de tipo de estructura
- [ ] Crear componente para selección de cerramientos
- [ ] Implementar opciones de cubiertas
- [ ] Añadir selector básico de MEP (Mecánico, Eléctrico, Plomería)
- [ ] Integrar con el sistema de autosave

**Criterios de Aceptación:**
- [ ] Usuario puede seleccionar entre al menos 3 tipos de estructuras
- [ ] Selector de cerramientos ofrece al menos 4 opciones
- [ ] Selector de cubiertas muestra al menos 3 alternativas
- [ ] Opciones de MEP básico están disponibles y son seleccionables
- [ ] Las selecciones se guardan correctamente en el sistema
- [ ] Tests unitarios verifican las combinaciones de selecciones

**Dependencias:** Completitud del Sprint 3 (terreno definido)

**Desarrollador Asignado:** Edgar

### Historia #2: Selector de Nivel de Materiales

**Objetivo:** Implementar selector de niveles de materiales con presets y opción personalizada.

**Estado:** 📝 Pendiente

**Tareas:**
- [ ] Diseñar UI para selector de nivel de materiales
- [ ] Implementar presets: básico, estándar, premium, ecológico
- [ ] Crear editor para opción personalizada
- [ ] Implementar visualización previa de materiales
- [ ] Integrar con costos y presupuesto
- [ ] Añadir sistema de favoritos para configuraciones personalizadas

**Criterios de Aceptación:**
- [ ] Usuario puede seleccionar entre los 4 presets de materiales
- [ ] Cada preset muestra claramente sus características y costos asociados
- [ ] El modo personalizado permite ajustar componentes individuales
- [ ] Se muestra previsualización básica de los materiales seleccionados
- [ ] El sistema actualiza los costos en tiempo real según la selección
- [ ] Tests verifican que cada preset aplica los factores de costo correctos

**Dependencias:** Historia #1

**Desarrollador Asignado:** Edgar

### Historia #3: Editor de Materiales Personalizado

**Objetivo:** Desarrollar editor avanzado para personalización de materiales y texturas.

**Estado:** 📝 Pendiente

**Tareas:**
- [ ] Implementar catálogo de materiales con texturas PBR
- [ ] Crear interfaz para selección y aplicación de materiales
- [ ] Implementar previsualización 3D básica de materiales
- [ ] Añadir sistema de filtros y búsqueda de materiales
- [ ] Integrar con el motor financiero para actualización de costos
- [ ] Crear sistema de guardado de combinaciones personalizadas

**Criterios de Aceptación:**
- [ ] Catálogo incluye al menos 50 materiales con texturas PBR
- [ ] Usuario puede aplicar y previsualizar materiales en tiempo real
- [ ] Sistema permite filtrar materiales por tipo, costo, sostenibilidad
- [ ] Los costos se actualizan automáticamente al cambiar materiales
- [ ] Usuario puede guardar y nombrar combinaciones personalizadas
- [ ] Tests verifican la carga y aplicación correcta de texturas

**Dependencias:** Historia #2, Vista 3D del Sprint 3

**Desarrollador Asignado:** Edgar

### Historia #4: Motor Financiero - Costos Directos/Indirectos

**Objetivo:** Implementar calculadora de costos directos e indirectos con variables configurables.

**Estado:** 📝 Pendiente

**Tareas:**
- [ ] Implementar modelo de cálculo para costos directos de construcción
- [ ] Crear calculadora de costos indirectos con porcentajes configurables
- [ ] Implementar desglose detallado de partidas
- [ ] Añadir ajuste por ubicación geográfica y complejidad
- [ ] Integrar factores de inflación y proyección temporal
- [ ] Crear dashboard de resumen de costos

**Criterios de Aceptación:**
- [ ] Sistema calcula costos directos basados en m² y selecciones previas
- [ ] Costos indirectos se calculan con porcentajes configurables
- [ ] Desglose muestra al menos 10 partidas principales con sus costos
- [ ] El factor de ubicación geográfica ajusta correctamente los costos
- [ ] Dashboard muestra resumen claro con gráficos y tablas
- [ ] Tests unitarios verifican la precisión de los cálculos financieros

**Dependencias:** Historia #2

**Desarrollador Asignado:** Edgar

### Historia #5: Motor Financiero - Financiamiento e Impuestos

**Objetivo:** Implementar módulos para cálculo de financiamiento e impuestos del proyecto.

**Estado:** 📝 Pendiente

**Tareas:**
- [ ] Crear calculadora de financiamiento con diferentes esquemas
- [ ] Implementar tabla de amortización configurable
- [ ] Desarrollar calculadora de impuestos por región
- [ ] Añadir estimación de gastos notariales y de escrituración
- [ ] Implementar comparativa de esquemas de financiamiento
- [ ] Crear visualizaciones para facilitar la comprensión

**Criterios de Aceptación:**
- [ ] Usuario puede configurar al menos 3 esquemas de financiamiento
- [ ] Sistema genera tabla de amortización correcta para cada esquema
- [ ] Cálculo de impuestos considera ubicación y tipo de proyecto
- [ ] Gastos notariales se estiman según valor y ubicación
- [ ] Comparativa muestra claramente ventajas de cada opción de financiamiento
- [ ] Tests verifican cálculos financieros con diferentes parámetros

**Dependencias:** Historia #4

**Desarrollador Asignado:** Edgar

### Historia #6: Proyección de Ventas y Flujo de Caja

**Objetivo:** Implementar proyección de ventas y análisis de flujo de caja del proyecto.

**Estado:** 📝 Pendiente

**Tareas:**
- [ ] Desarrollar modelo de proyección de ventas configurable
- [ ] Crear flujo de caja con ingresos y egresos temporales
- [ ] Implementar visualización de punto de equilibrio
- [ ] Añadir cálculo de velocidad de ventas y absorción
- [ ] Integrar con financiamiento para mostrar servicio de deuda
- [ ] Desarrollar gráficos de proyección mensual/anual

**Criterios de Aceptación:**
- [ ] Usuario puede configurar parámetros de proyección de ventas
- [ ] Flujo de caja muestra correctamente ingresos y egresos en línea temporal
- [ ] Gráfico de punto de equilibrio identifica claramente el momento de recuperación
- [ ] Cálculos de velocidad de ventas son precisos y configurables
- [ ] Visualizaciones son claras y permiten entender las proyecciones
- [ ] Tests verifican la integridad de los cálculos en diferentes escenarios

**Dependencias:** Historia #5

**Desarrollador Asignado:** Edgar

### Historia #7: Cálculo de KPIs Financieros

**Objetivo:** Implementar calculadora de indicadores clave de desempeño financiero.

**Estado:** 📝 Pendiente

**Tareas:**
- [ ] Implementar cálculo de ROI (Retorno sobre inversión)
- [ ] Desarrollar módulo para TIR (Tasa interna de retorno)
- [ ] Crear calculadora de VAN (Valor actual neto)
- [ ] Implementar estimación de Payback (Tiempo de recuperación)
- [ ] Añadir otros KPIs relevantes (margen, rentabilidad, etc.)
- [ ] Desarrollar dashboard unificado de KPIs

**Criterios de Aceptación:**
- [ ] Sistema calcula ROI correctamente basado en inversión y retornos
- [ ] Cálculo de TIR considera flujo de caja completo del proyecto
- [ ] VAN se calcula con tasa de descuento configurable
- [ ] Payback muestra tiempo exacto de recuperación de la inversión
- [ ] Dashboard presenta los KPIs de forma clara y comparativa
- [ ] Tests unitarios verifican la precisión de cada cálculo financiero

**Dependencias:** Historia #6

**Desarrollador Asignado:** Edgar

### Historia #8: Simulador de Escenarios

**Objetivo:** Implementar simulador para comparar diferentes escenarios financieros del proyecto.

**Estado:** 📝 Pendiente

**Tareas:**
- [ ] Diseñar interfaz para configuración de escenarios
- [ ] Implementar presets (optimista, realista, pesimista)
- [ ] Crear sistema para guardar y comparar escenarios personalizados
- [ ] Desarrollar visualizaciones comparativas
- [ ] Implementar proyección a 5 años con variables ajustables
- [ ] Añadir sistema de exportación de resultados

**Criterios de Aceptación:**
- [ ] Usuario puede configurar y comparar al menos 3 escenarios diferentes
- [ ] Presets predefinidos aplican automáticamente parámetros adecuados
- [ ] Sistema permite crear y guardar escenarios personalizados
- [ ] Visualizaciones muestran claramente diferencias entre escenarios
- [ ] Proyección a 5 años muestra evolución financiera del proyecto
- [ ] Usuario puede exportar resultados en formato PDF y Excel
- [ ] Tests verifican la integridad de comparativas entre escenarios

**Dependencias:** Historia #7

**Desarrollador Asignado:** Edgar

## Riesgos y Mitigaciones

### Riesgo 1: Complejidad del Modelo Financiero
**Descripción:** El modelo financiero podría volverse demasiado complejo, dificultando su comprensión y uso por parte de usuarios no especializados.

**Mitigación:**
- Implementar niveles de detalle progresivos (básico, intermedio, avanzado)
- Crear tooltips y ayudas contextuales para términos financieros
- Proporcionar valores predeterminados sensatos para todas las variables
- Incluir ejemplos y casos de uso guiados
- Desarrollar visualizaciones que simplifiquen la comprensión de conceptos complejos

**Estado:** 🔍 Monitorizado

### Riesgo 2: Precisión de Estimaciones de Costos
**Descripción:** Las estimaciones de costos podrían desviarse significativamente de valores reales de mercado.

**Mitigación:**
- Utilizar fuentes confiables y actualizadas para datos de costos base
- Implementar factores de ajuste por región, inflación y temporada
- Añadir rangos de confianza en las estimaciones
- Permitir actualización manual de costos unitarios
- Crear sistema de feedback para reportar discrepancias
- Implementar proceso de calibración periódica del modelo

**Estado:** 🔍 Monitorizado

### Riesgo 3: Rendimiento con Cálculos Complejos
**Descripción:** Los cálculos financieros complejos podrían afectar el rendimiento, especialmente en dispositivos móviles.

**Mitigación:**
- Implementar cálculos por lotes y en segundo plano
- Optimizar algoritmos para reducir complejidad computacional
- Utilizar workers para cálculos intensivos
- Cachear resultados intermedios
- Implementar indicadores de progreso para cálculos largos
- Limitar la complejidad de escenarios en dispositivos de bajo rendimiento

**Estado:** 🔍 Monitorizado

### Riesgo 4: Complejidad de UX en Simulaciones
**Descripción:** La interfaz para crear y comparar escenarios podría resultar confusa debido a la gran cantidad de variables.

**Mitigación:**
- Implementar diseño progresivo que muestre solo las variables relevantes
- Usar visualizaciones interactivas para facilitar la comprensión
- Crear wizards guiados para configuración de escenarios
- Proporcionar templates y casos predefinidos como punto de partida
- Realizar pruebas de usabilidad con usuarios reales
- Implementar sistema de guardado automático de configuraciones

**Estado:** 🔍 Monitorizado

## Estimación Total del Sprint

| Historia | Estimación (días) | Estado |
|----------|------------------|--------|
| #1: Sistema Constructivo Base | 0.5 | 📝 Pendiente |
| #2: Selector de Nivel de Materiales | 0.5 | 📝 Pendiente |
| #3: Editor de Materiales Personalizado | 1.0 | 📝 Pendiente |
| #4: Motor Financiero - Costos Directos/Indirectos | 1.0 | 📝 Pendiente |
| #5: Motor Financiero - Financiamiento e Impuestos | 0.5 | 📝 Pendiente |
| #6: Proyección de Ventas y Flujo de Caja | 0.5 | 📝 Pendiente |
| #7: Cálculo de KPIs Financieros | 1.0 | 📝 Pendiente |
| #8: Simulador de Escenarios | 1.0 | 📝 Pendiente |
| **Total** | **6.0** | 📝 **Pendiente** |

## Leyenda de Estado

- 📝 Pendiente: No iniciado
- 🏗️ En progreso: Desarrollo activo
- 🔍 Revisión: En proceso de revisión (PR abierto)
- ✅ Completado: Integrado en main y desplegado
- ❌ Bloqueado: No se puede avanzar debido a dependencias o problemas

## Diagrama de Dependencias

```mermaid
graph TD
    Sprint3[Finalización Sprint 3: Terreno Completo] -->|Requerido| H1
    
    H1[Historia #1: Sistema Constructivo Base] --> H2
    H2[Historia #2: Selector de Nivel de Materiales] --> H3
    H2 --> H4
    H3[Historia #3: Editor de Materiales Personalizado]
    H4[Historia #4: Motor Financiero - Costos D/I] --> H5
    H5[Historia #5: Motor Financiero - Financiamiento] --> H6
    H6[Historia #6: Proyección de Ventas] --> H7
    H7[Historia #7: Cálculo de KPIs] --> H8
    H8[Historia #8: Simulador de Escenarios]
```

## Próximos Pasos

1. Revisar el plan con el equipo completo
2. Asignar desarrolladores a cada historia
3. Definir estructura del modelo financiero
4. Actualización diaria del estado en este documento
5. Preparar demostración para final del sprint
6. Planificar integración con E4 (Experiencia 3D & Gamificación) para el siguiente sprint

---

> Este plan está sujeto a ajustes según el feedback del equipo y los desafíos encontrados durante la implementación. 