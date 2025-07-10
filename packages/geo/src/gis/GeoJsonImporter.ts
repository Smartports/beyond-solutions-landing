import * as turf from '@turf/turf';
import { Feature, FeatureCollection, Geometry, GeometryCollection } from 'geojson';

/**
 * Resultado de la importación de un archivo GeoJSON
 */
export interface GeoJsonImportResult {
  featureCollection: FeatureCollection;
  bounds: {
    min: { x: number; y: number };
    max: { x: number; y: number };
  };
  featureCount: number;
  success: boolean;
  error?: string;
}

/**
 * Clase para importar y procesar archivos GeoJSON
 */
export class GeoJsonImporter {
  /**
   * Importa y procesa un archivo GeoJSON
   * @param fileContent Contenido del archivo GeoJSON como string
   * @returns Resultado de la importación
   */
  public importGeoJson(fileContent: string): GeoJsonImportResult {
    try {
      // Parsear el archivo GeoJSON
      const geoJson = JSON.parse(fileContent);

      // Verificar que sea un GeoJSON válido
      if (!this.isValidGeoJson(geoJson)) {
        throw new Error('El archivo no es un GeoJSON válido');
      }

      // Convertir a FeatureCollection si es necesario
      const featureCollection = this.ensureFeatureCollection(geoJson);

      // Calcular límites
      const bounds = this.calculateBounds(featureCollection);

      return {
        featureCollection,
        bounds,
        featureCount: featureCollection.features.length,
        success: true,
      };
    } catch (error) {
      console.error('Error al importar archivo GeoJSON:', error);
      return {
        featureCollection: { type: 'FeatureCollection', features: [] },
        bounds: {
          min: { x: 0, y: 0 },
          max: { x: 0, y: 0 },
        },
        featureCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al importar GeoJSON',
      };
    }
  }

  /**
   * Verifica si un objeto es un GeoJSON válido
   * @param obj Objeto a verificar
   * @returns true si es un GeoJSON válido
   */
  private isValidGeoJson(obj: any): boolean {
    // Verificar que tenga un tipo
    if (!obj || !obj.type) {
      return false;
    }

    // Verificar según el tipo
    switch (obj.type) {
      case 'FeatureCollection':
        return Array.isArray(obj.features);

      case 'Feature':
        return obj.geometry && obj.geometry.type;

      case 'Point':
      case 'LineString':
      case 'Polygon':
      case 'MultiPoint':
      case 'MultiLineString':
      case 'MultiPolygon':
      case 'GeometryCollection':
        return (
          Array.isArray(obj.coordinates) ||
          (obj.type === 'GeometryCollection' && Array.isArray(obj.geometries))
        );

      default:
        return false;
    }
  }

  /**
   * Convierte cualquier tipo de GeoJSON a FeatureCollection
   * @param geoJson Objeto GeoJSON
   * @returns FeatureCollection
   */
  private ensureFeatureCollection(geoJson: any): FeatureCollection {
    if (geoJson.type === 'FeatureCollection') {
      return geoJson as FeatureCollection;
    }

    if (geoJson.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [geoJson as Feature],
      };
    }

    // Si es una geometría, convertirla a Feature y luego a FeatureCollection
    const geometryTypes = [
      'Point',
      'LineString',
      'Polygon',
      'MultiPoint',
      'MultiLineString',
      'MultiPolygon',
      'GeometryCollection',
    ];

    if (geometryTypes.includes(geoJson.type)) {
      const feature: Feature = {
        type: 'Feature',
        geometry: geoJson as Geometry | GeometryCollection,
        properties: {},
      };

      return {
        type: 'FeatureCollection',
        features: [feature],
      };
    }

    // Si no se pudo convertir, devolver una colección vacía
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }

  /**
   * Calcula los límites de una FeatureCollection
   * @param featureCollection FeatureCollection
   * @returns Límites
   */
  private calculateBounds(featureCollection: FeatureCollection): {
    min: { x: number; y: number };
    max: { x: number; y: number };
  } {
    if (!featureCollection.features || featureCollection.features.length === 0) {
      return {
        min: { x: 0, y: 0 },
        max: { x: 0, y: 0 },
      };
    }

    // Usar turf para calcular los límites
    const bbox = turf.bbox(featureCollection);

    return {
      min: { x: bbox[0], y: bbox[1] },
      max: { x: bbox[2], y: bbox[3] },
    };
  }

  /**
   * Valida un archivo GeoJSON
   * @param fileContent Contenido del archivo GeoJSON
   * @returns Objeto con el resultado de la validación
   */
  public validateGeoJson(fileContent: string): { valid: boolean; message: string } {
    try {
      // Intentar parsear el archivo
      const geoJson = JSON.parse(fileContent);

      // Verificar que sea un GeoJSON válido
      if (!this.isValidGeoJson(geoJson)) {
        return { valid: false, message: 'El archivo no es un GeoJSON válido' };
      }

      // Convertir a FeatureCollection
      const featureCollection = this.ensureFeatureCollection(geoJson);

      // Verificar que tenga features
      if (!featureCollection.features || featureCollection.features.length === 0) {
        return { valid: false, message: 'El GeoJSON no contiene features' };
      }

      return { valid: true, message: 'Archivo GeoJSON válido' };
    } catch (error) {
      return {
        valid: false,
        message:
          error instanceof Error
            ? `Error al validar archivo GeoJSON: ${error.message}`
            : 'Error desconocido al validar GeoJSON',
      };
    }
  }

  /**
   * Extrae propiedades de un GeoJSON
   * @param featureCollection FeatureCollection
   * @returns Objeto con propiedades y sus tipos
   */
  public extractProperties(featureCollection: FeatureCollection): Record<string, string[]> {
    const properties: Record<string, Set<string>> = {};

    featureCollection.features.forEach((feature) => {
      if (feature.properties) {
        Object.entries(feature.properties).forEach(([key, value]) => {
          if (!properties[key]) {
            properties[key] = new Set<string>();
          }

          const type = typeof value;
          properties[key].add(type);
        });
      }
    });

    // Convertir Sets a arrays
    const result: Record<string, string[]> = {};
    Object.entries(properties).forEach(([key, types]) => {
      result[key] = Array.from(types);
    });

    return result;
  }

  /**
   * Proyecta coordenadas GeoJSON a coordenadas locales
   * @param featureCollection FeatureCollection
   * @param center Centro de la proyección [lon, lat]
   * @returns FeatureCollection con coordenadas proyectadas
   */
  public projectToLocal(
    featureCollection: FeatureCollection,
    center: [number, number],
  ): FeatureCollection {
    // Factor de escala aproximado para convertir grados a metros en el ecuador
    const SCALE_FACTOR = 111319.9; // metros por grado en el ecuador

    // Ajustar el factor de escala según la latitud
    const latFactor = Math.cos((center[1] * Math.PI) / 180);

    // Clonar la colección
    const projected: FeatureCollection = JSON.parse(JSON.stringify(featureCollection));

    // Función para proyectar una coordenada
    const projectCoord = (coord: number[]): number[] => {
      const dx = (coord[0] - center[0]) * SCALE_FACTOR * latFactor;
      const dy = (coord[1] - center[1]) * SCALE_FACTOR;
      return [dx, dy];
    };

    // Función recursiva para proyectar todas las coordenadas
    const projectCoordinates = (coords: any, depth: number): any => {
      if (depth === 0) {
        // Es una coordenada individual
        return projectCoord(coords);
      } else {
        // Es un array de coordenadas o arrays
        return coords.map((c: any) => projectCoordinates(c, depth - 1));
      }
    };

    // Proyectar cada geometría
    projected.features.forEach((feature) => {
      if (!feature.geometry) return;

      const geomType = feature.geometry.type;
      let depth = 0;

      // Determinar la profundidad de las coordenadas según el tipo
      switch (geomType) {
        case 'Point':
          depth = 0;
          break;
        case 'LineString':
        case 'MultiPoint':
          depth = 1;
          break;
        case 'Polygon':
        case 'MultiLineString':
          depth = 2;
          break;
        case 'MultiPolygon':
          depth = 3;
          break;
      }

      // Proyectar coordenadas
      if (feature.geometry.type !== 'GeometryCollection') {
        feature.geometry.coordinates = projectCoordinates(feature.geometry.coordinates, depth);
      } else if (feature.geometry.geometries) {
        // Caso especial para GeometryCollection
        feature.geometry.geometries.forEach((geom: any) => {
          switch (geom.type) {
            case 'Point':
              geom.coordinates = projectCoordinates(geom.coordinates, 0);
              break;
            case 'LineString':
            case 'MultiPoint':
              geom.coordinates = projectCoordinates(geom.coordinates, 1);
              break;
            case 'Polygon':
            case 'MultiLineString':
              geom.coordinates = projectCoordinates(geom.coordinates, 2);
              break;
            case 'MultiPolygon':
              geom.coordinates = projectCoordinates(geom.coordinates, 3);
              break;
          }
        });
      }
    });

    return projected;
  }
}
