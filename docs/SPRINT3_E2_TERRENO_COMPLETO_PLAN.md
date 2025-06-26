# Plan de Implementación: E2 - Terreno Completo (Sprint 3)

> **Propósito**: Este documento presenta el plan detallado de implementación para completar la Épica E2 (Terreno) durante el Sprint 3 del proyecto de calculadora inmobiliaria v2. Servirá como guía y registro del progreso para garantizar una entrega exitosa de la importación CAD y vista 3D low-poly.

## Visión General

En este Sprint 3 completaremos la Épica E2 (Terreno) implementando la funcionalidad para importar archivos CAD/GIS y generando una representación 3D low-poly del terreno con análisis básicos. Esto complementa el MVP desarrollado en el Sprint 2 y completa la experiencia de definición de terreno.

## Registro de Estado

| Fecha | Estado | Notas |
|-------|--------|-------|
| 2025-06-18 | Completado | Todas las historias de usuario implementadas |

## Historias de Usuario

### Historia #1: Importación de Archivos CAD

**Objetivo:** Implementar la funcionalidad para importar archivos CAD (DXF) y extraer geometría del terreno.

**Estado:** ✅ Completado

**Tareas:**
- [x] Investigar y seleccionar biblioteca para parsing de archivos DXF
- [x] Implementar UI para carga de archivos CAD
- [x] Crear parser para extraer polígonos y datos relevantes
- [x] Implementar validación de archivos y manejo de errores
- [x] Convertir geometrías CAD al formato interno de la aplicación
- [x] Añadir soporte para capas básicas (layers)

**Criterios de Aceptación:**
- [x] Usuario puede cargar archivos DXF hasta 10MB
- [x] Sistema extrae correctamente polígonos y líneas del archivo
- [x] Se validan los archivos por formato y contenido antes de procesarlos
- [x] UI muestra feedback durante la carga y procesamiento
- [x] Se maneja correctamente formatos DXF comunes (R12, R14, 2000)
- [x] Tests unitarios verifican la correcta extracción de geometría

**Dependencias:** Sketch 2D básico (Sprint 2)

**Desarrollador Asignado:** Edgar

### Historia #2: Importación de Archivos GeoJSON

**Objetivo:** Implementar la funcionalidad para importar archivos GeoJSON con datos geoespaciales.

**Estado:** ✅ Completado

**Tareas:**
- [x] Implementar UI para carga de archivos GeoJSON
- [x] Crear parser para GeoJSON y extracción de geometría
- [x] Integrar con coordenadas geográficas y proyección
- [x] Implementar validación de archivos GeoJSON
- [x] Extraer propiedades y metadatos relevantes
- [x] Añadir soporte para visualización preliminar

**Criterios de Aceptación:**
- [x] Usuario puede cargar archivos GeoJSON hasta 5MB
- [x] Sistema extrae correctamente polígonos, líneas y propiedades
- [x] Las coordenadas se proyectan correctamente en el mapa
- [x] UI muestra propiedades y atributos del GeoJSON de forma accesible
- [x] Usuario puede seleccionar qué features importar en caso de múltiples
- [x] Tests verifican la proyección y conversión de coordenadas

**Dependencias:** Historia #1

**Desarrollador Asignado:** Edgar

### Historia #3: Implementación de Motor de Renderizado 3D

**Objetivo:** Configurar motor de renderizado 3D (Babylon.js) y estructura base para visualización.

**Estado:** ✅ Completado

**Tareas:**
- [x] Integrar Babylon.js en el proyecto
- [x] Configurar escena 3D básica con cámara, luces y controles
- [x] Implementar sistema de coordenadas y escalas
- [x] Crear sistema de gestión de recursos 3D (texturas, materiales)
- [x] Implementar optimizaciones para dispositivos móviles
- [x] Añadir controles de navegación 3D accesibles

**Criterios de Aceptación:**
- [x] Motor 3D se inicializa correctamente en desktop y dispositivos móviles
- [x] Cámara y controles permiten navegación intuitiva en la escena
- [x] FPS estable (mínimo 30fps) en dispositivos de gama media
- [x] Sistema detecta y se adapta a capacidades del dispositivo
- [x] UI incluye controles accesibles por teclado
- [x] Tests verifican inicialización correcta en diferentes contextos

**Dependencias:** Ninguna del Sprint 3, pero requiere base del Sprint 2

**Desarrollador Asignado:** Edgar

### Historia #4: Generación de Malla 3D Low-Poly

**Objetivo:** Implementar algoritmo para convertir datos 2D del terreno en malla 3D low-poly.

**Estado:** ✅ Completado

**Tareas:**
- [x] Implementar algoritmo de triangulación para polígonos 2D
- [x] Crear generador de malla 3D a partir de triangulación
- [x] Aplicar elevación y datos de altura al terreno
- [x] Implementar sistema de LOD (nivel de detalle)
- [x] Añadir texturas básicas al terreno
- [x] Optimizar geometría para renderizado eficiente

**Criterios de Aceptación:**
- [x] Sistema genera malla 3D correcta a partir de polígonos 2D
- [x] El terreno refleja con precisión los datos de elevación
- [x] La malla mantiene rendimiento óptimo con terrenos complejos
- [x] La geometría se actualiza cuando cambia el polígono base
- [x] Sistema utiliza LOD para optimizar rendimiento en visualización
- [x] Tests unitarios verifican geometría generada

**Dependencias:** Historia #3

**Desarrollador Asignado:** Edgar

### Historia #5: Análisis Solar Básico

**Objetivo:** Implementar análisis solar básico para visualizar sombras en diferentes momentos del día/año.

**Estado:** ✅ Completado

**Tareas:**
- [x] Implementar sistema de posicionamiento solar basado en coordenadas y fecha/hora
- [x] Crear controles para selección de fecha y hora
- [x] Implementar cálculo y visualización de sombras
- [x] Añadir visualización de trayectoria solar
- [x] Crear representación gráfica de horas de sol
- [x] Implementar capturas/instantáneas del análisis

**Criterios de Aceptación:**
- [x] Usuario puede seleccionar fecha y hora para análisis solar
- [x] Las sombras se renderizan correctamente según la posición solar
- [x] Sistema muestra trayectoria solar para la ubicación seleccionada
- [x] Usuario puede visualizar análisis para diferentes épocas del año (solsticios/equinoccios)
- [x] Análisis considera la ubicación geográfica del terreno
- [x] Tests verifican cálculos de posición solar

**Dependencias:** Historia #4

**Desarrollador Asignado:** Edgar

### Historia #6: Análisis de Viento Básico

**Objetivo:** Implementar análisis básico de flujo de viento sobre el terreno.

**Estado:** ✅ Completado

**Tareas:**
- [x] Implementar modelo simplificado de flujo de viento
- [x] Crear controles para dirección e intensidad del viento
- [x] Añadir visualización de vectores de viento
- [x] Implementar cálculo básico de zonas de presión/succión
- [x] Crear sistema de partículas para representación visual
- [x] Optimizar para rendimiento en dispositivos objetivo

**Criterios de Aceptación:**
- [x] Usuario puede configurar dirección e intensidad del viento
- [x] Visualización muestra flujo de viento sobre el terreno
- [x] Sistema indica zonas de presión/succión en el terreno
- [x] La simulación es fluida (mínimo 20fps) en dispositivos objetivo
- [x] La visualización es intuitiva y clara para el usuario
- [x] Tests verifican la consistencia del modelo de viento

**Dependencias:** Historia #4

**Desarrollador Asignado:** Edgar

### Historia #7: Integración con Sketch 2D y Perfil de Elevación

**Objetivo:** Integrar flujos entre Sketch 2D, importaciones y vista 3D con perfiles de elevación.

**Estado:** ✅ Completado

**Tareas:**
- [x] Implementar sincronización entre Sketch 2D y vista 3D
- [x] Crear switch/toggle entre vistas 2D y 3D
- [x] Implementar editor de perfil de elevación
- [x] Añadir visualización de cortes transversales
- [x] Sincronizar cambios en tiempo real entre vistas
- [x] Implementar transiciones suaves entre modos

**Criterios de Aceptación:**
- [x] Cambios en Sketch 2D se reflejan en tiempo real en vista 3D
- [x] Usuario puede alternar fácilmente entre vistas 2D y 3D
- [x] Editor de perfil de elevación modifica correctamente la vista 3D
- [x] Visualización de cortes proporciona información de altura
- [x] Sistema mantiene coherencia de datos entre vistas
- [x] Tests de integración verifican sincronización entre interfaces

**Dependencias:** Historia #4, Sketch 2D del Sprint 2

**Desarrollador Asignado:** Edgar

### Historia #8: Exportación Avanzada y Preparación para Fase 3

**Objetivo:** Implementar exportación de geometría 3D y preparar la transición a la Fase 3.

**Estado:** ✅ Completado

**Tareas:**
- [x] Implementar exportación de geometría 3D en formato glTF
- [x] Crear sistema de guardado de análisis realizados
- [x] Añadir exportación de capturas de análisis
- [x] Implementar generación de informe básico (PDF)
- [x] Crear validaciones previas al paso a Fase 3
- [x] Diseñar UI de transición entre fases

**Criterios de Aceptación:**
- [x] Usuario puede exportar geometría 3D en formato glTF
- [x] Análisis y configuraciones se guardan correctamente
- [x] Sistema permite capturas y exportación de visualizaciones
- [x] Se genera informe básico con datos del terreno y análisis
- [x] Sistema valida completitud antes de permitir avance a Fase 3
- [x] Tests verifican formatos de exportación generados

**Dependencias:** Historias #5, #6, #7

**Desarrollador Asignado:** Edgar

## Riesgos y Mitigaciones

### Riesgo 1: Rendimiento 3D en Dispositivos de Gama Baja
**Descripción:** La visualización 3D y análisis pueden tener bajo rendimiento en dispositivos de gama baja o móviles.

**Mitigación:**
- Implementar sistema de LOD (Level of Detail) automático
- Crear modos de visualización simplificados para dispositivos limitados
- Optimizar geometría y texturas de forma agresiva
- Limitar efectos visuales y número de objetos en escena
- Añadir detección de rendimiento y ajustes automáticos

**Estado:** 🔍 Monitorizado

### Riesgo 2: Complejidad de Importación CAD
**Descripción:** Los archivos CAD pueden tener estructuras complejas y difíciles de interpretar correctamente.

**Mitigación:**
- Iniciar con soporte limitado para formatos/versiones más comunes
- Crear guía clara para usuarios sobre formatos soportados
- Implementar validaciones robustas para rechazar archivos incompatibles
- Tener flujo alternativo para entrada manual de datos
- Documentar claramente limitaciones conocidas

**Estado:** 🔍 Monitorizado

### Riesgo 3: Precisión de Análisis Solar/Viento
**Descripción:** Los análisis solares y de viento simplificados pueden carecer de precisión necesaria para decisiones reales.

**Mitigación:**
- Comunicar claramente que son análisis aproximados/educativos
- Añadir disclaimers sobre el uso para decisiones profesionales
- Verificar algoritmos con fuentes publicadas/conocidas
- Permitir incorporación futura de modelos más precisos
- Comparar resultados con herramientas validadas del mercado

**Estado:** 🔍 Monitorizado

### Riesgo 4: Curva de Aprendizaje para Usuarios
**Descripción:** Las herramientas 3D pueden resultar complejas para usuarios sin experiencia previa.

**Mitigación:**
- Crear tutoriales interactivos paso a paso
- Implementar controles simplificados con opciones avanzadas ocultas
- Añadir tooltips y guías contextuales
- Crear presets para operaciones comunes
- Proporcionar ejemplos y templates para referencia

**Estado:** 🔍 Monitorizado

## Estimación Total del Sprint

| Historia | Estimación (días) | Estado |
|----------|------------------|--------|
| #1: Importación de Archivos CAD | 1.0 | ✅ Completado |
| #2: Importación de Archivos GeoJSON | 0.5 | ✅ Completado |
| #3: Implementación de Motor de Renderizado 3D | 1.0 | ✅ Completado |
| #4: Generación de Malla 3D Low-Poly | 1.0 | ✅ Completado |
| #5: Análisis Solar Básico | 1.0 | ✅ Completado |
| #6: Análisis de Viento Básico | 0.5 | ✅ Completado |
| #7: Integración con Sketch 2D y Perfil de Elevación | 0.5 | ✅ Completado |
| #8: Exportación Avanzada y Preparación para Fase 3 | 0.5 | ✅ Completado |
| **Total** | **6.0** | ✅ **Completado** |

## Leyenda de Estado

- 📝 Pendiente: No iniciado
- 🏗️ En progreso: Desarrollo activo
- 🔍 Revisión: En proceso de revisión (PR abierto)
- ✅ Completado: Integrado en main y desplegado
- ❌ Bloqueado: No se puede avanzar debido a dependencias o problemas

## Diagrama de Dependencias

```mermaid
graph TD
    Sprint2[Finalización Sprint 2: Terreno MVP] -->|Requerido| H1
    Sprint2 -->|Requerido| H3
    
    H1[Historia #1: Importación de Archivos CAD] --> H2
    H2[Historia #2: Importación de Archivos GeoJSON]
    H3[Historia #3: Implementación de Motor de Renderizado 3D] --> H4
    H4[Historia #4: Generación de Malla 3D Low-Poly] --> H5
    H4 --> H6
    H4 --> H7
    H5[Historia #5: Análisis Solar Básico] --> H8
    H6[Historia #6: Análisis de Viento Básico] --> H8
    H7[Historia #7: Integración con Sketch 2D y Perfil de Elevación] --> H8
    H8[Historia #8: Exportación Avanzada y Preparación para Fase 3]
```

## Próximos Pasos

1. Revisar el plan con el equipo completo
2. Asignar desarrolladores a cada historia
3. Evaluar bibliotecas para importación CAD/GIS y renderizado 3D
4. Actualización diaria del estado en este documento
5. Preparar demostración para final del sprint
6. Planificar integración con E3 (Costos) para el siguiente sprint

---

> Este plan está sujeto a ajustes según el feedback del equipo y los desafíos encontrados durante la implementación. 