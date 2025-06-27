import DxfParser from 'dxf-parser';

/**
 * Tipos de entidades soportadas en DXF
 */
export enum DxfEntityType {
  POLYLINE = 'POLYLINE',
  LWPOLYLINE = 'LWPOLYLINE',
  LINE = 'LINE',
  CIRCLE = 'CIRCLE',
  ARC = 'ARC',
  SPLINE = 'SPLINE',
  TEXT = 'TEXT'
}

/**
 * Interfaz para las entidades extraídas de un archivo DXF
 */
export interface DxfEntity {
  type: DxfEntityType;
  layer: string;
  coordinates: number[][];
  properties?: Record<string, any>;
}

/**
 * Resultado de la importación de un archivo DXF
 */
export interface DxfImportResult {
  entities: DxfEntity[];
  bounds: {
    min: { x: number; y: number };
    max: { x: number; y: number };
  };
  layers: string[];
  success: boolean;
  error?: string;
}

/**
 * Clase para importar y procesar archivos DXF
 */
export class DxfImporter {
  private parser: DxfParser;

  constructor() {
    this.parser = new DxfParser();
  }

  /**
   * Importa y procesa un archivo DXF
   * @param fileContent Contenido del archivo DXF como string
   * @returns Resultado de la importación
   */
  public importDxf(fileContent: string): DxfImportResult {
    try {
      // Parsear el archivo DXF
      const dxf = this.parser.parseSync(fileContent);
      
      // Extraer entidades
      const entities: DxfEntity[] = [];
      const layers = new Set<string>();
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      
      // Procesar entidades
      if (dxf && dxf.entities && Array.isArray(dxf.entities)) {
        dxf.entities.forEach(entity => {
          const processedEntity = this.processEntity(entity);
          
          if (processedEntity) {
            entities.push(processedEntity);
            layers.add(processedEntity.layer);
            
            // Actualizar límites
            processedEntity.coordinates.forEach(coord => {
              const x = coord[0];
              const y = coord[1];
              
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            });
          }
        });
      }
      
      return {
        entities,
        bounds: {
          min: { x: minX, y: minY },
          max: { x: maxX, y: maxY }
        },
        layers: Array.from(layers),
        success: true
      };
    } catch (error) {
      console.error('Error al importar archivo DXF:', error);
      return {
        entities: [],
        bounds: {
          min: { x: 0, y: 0 },
          max: { x: 0, y: 0 }
        },
        layers: [],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al importar DXF'
      };
    }
  }

  /**
   * Procesa una entidad DXF y la convierte al formato interno
   * @param entity Entidad DXF original
   * @returns Entidad procesada o null si no es soportada
   */
  private processEntity(entity: any): DxfEntity | null {
    const layer = entity.layer || 'default';
    
    switch (entity.type) {
      case 'LWPOLYLINE':
        return this.processLwPolyline(entity, layer);
      
      case 'POLYLINE':
        return this.processPolyline(entity, layer);
      
      case 'LINE':
        return this.processLine(entity, layer);
      
      case 'CIRCLE':
        return this.processCircle(entity, layer);
      
      case 'ARC':
        return this.processArc(entity, layer);
      
      default:
        // Entidad no soportada
        return null;
    }
  }

  /**
   * Procesa una polilínea ligera (LWPOLYLINE)
   */
  private processLwPolyline(entity: any, layer: string): DxfEntity {
    const coordinates: number[][] = [];
    
    // Extraer vértices
    if (entity.vertices && Array.isArray(entity.vertices)) {
      entity.vertices.forEach((vertex: any) => {
        coordinates.push([vertex.x, vertex.y]);
      });
      
      // Si es un polígono cerrado, añadir el primer punto al final
      if (entity.closed && coordinates.length > 0) {
        coordinates.push([...coordinates[0]]);
      }
    }
    
    return {
      type: DxfEntityType.LWPOLYLINE,
      layer,
      coordinates,
      properties: {
        closed: entity.closed || false,
        color: entity.color
      }
    };
  }

  /**
   * Procesa una polilínea (POLYLINE)
   */
  private processPolyline(entity: any, layer: string): DxfEntity {
    const coordinates: number[][] = [];
    
    // Extraer vértices
    if (entity.vertices && Array.isArray(entity.vertices)) {
      entity.vertices.forEach((vertex: any) => {
        coordinates.push([vertex.x, vertex.y]);
      });
      
      // Si es un polígono cerrado, añadir el primer punto al final
      if (entity.closed && coordinates.length > 0) {
        coordinates.push([...coordinates[0]]);
      }
    }
    
    return {
      type: DxfEntityType.POLYLINE,
      layer,
      coordinates,
      properties: {
        closed: entity.closed || false,
        color: entity.color
      }
    };
  }

  /**
   * Procesa una línea (LINE)
   */
  private processLine(entity: any, layer: string): DxfEntity {
    const coordinates: number[][] = [
      [entity.start.x, entity.start.y],
      [entity.end.x, entity.end.y]
    ];
    
    return {
      type: DxfEntityType.LINE,
      layer,
      coordinates,
      properties: {
        color: entity.color
      }
    };
  }

  /**
   * Procesa un círculo (CIRCLE)
   */
  private processCircle(entity: any, layer: string): DxfEntity {
    // Convertir círculo a polígono
    const center = [entity.center.x, entity.center.y];
    const radius = entity.radius;
    const points = 32; // Número de puntos para aproximar el círculo
    
    const coordinates: number[][] = [];
    
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const x = center[0] + radius * Math.cos(angle);
      const y = center[1] + radius * Math.sin(angle);
      coordinates.push([x, y]);
    }
    
    return {
      type: DxfEntityType.CIRCLE,
      layer,
      coordinates,
      properties: {
        center,
        radius,
        color: entity.color
      }
    };
  }

  /**
   * Procesa un arco (ARC)
   */
  private processArc(entity: any, layer: string): DxfEntity {
    // Convertir arco a segmentos
    const center = [entity.center.x, entity.center.y];
    const radius = entity.radius;
    const startAngle = entity.startAngle * (Math.PI / 180); // Convertir a radianes
    const endAngle = entity.endAngle * (Math.PI / 180); // Convertir a radianes
    const points = 16; // Número de puntos para aproximar el arco
    
    const coordinates: number[][] = [];
    
    // Asegurar que endAngle > startAngle
    let endAngleAdjusted = endAngle;
    if (endAngleAdjusted < startAngle) {
      endAngleAdjusted += Math.PI * 2;
    }
    
    for (let i = 0; i <= points; i++) {
      const angle = startAngle + (i / points) * (endAngleAdjusted - startAngle);
      const x = center[0] + radius * Math.cos(angle);
      const y = center[1] + radius * Math.sin(angle);
      coordinates.push([x, y]);
    }
    
    return {
      type: DxfEntityType.ARC,
      layer,
      coordinates,
      properties: {
        center,
        radius,
        startAngle: entity.startAngle,
        endAngle: entity.endAngle,
        color: entity.color
      }
    };
  }

  /**
   * Convierte entidades DXF a GeoJSON
   * @param entities Entidades DXF procesadas
   * @returns Objeto GeoJSON
   */
  public toGeoJSON(entities: DxfEntity[]): GeoJSON.FeatureCollection {
    const features: GeoJSON.Feature[] = [];
    
    entities.forEach(entity => {
      if (entity.coordinates.length < 2) return;
      
      let geometry: GeoJSON.Geometry;
      
      // Determinar tipo de geometría
      if (entity.type === DxfEntityType.LINE || entity.type === DxfEntityType.ARC) {
        // Línea o arco -> LineString
        geometry = {
          type: 'LineString',
          coordinates: entity.coordinates
        };
      } else if (
        (entity.type === DxfEntityType.POLYLINE || entity.type === DxfEntityType.LWPOLYLINE) &&
        entity.properties?.closed &&
        entity.coordinates.length > 3
      ) {
        // Polilínea cerrada -> Polygon
        geometry = {
          type: 'Polygon',
          coordinates: [entity.coordinates]
        };
      } else if (entity.type === DxfEntityType.CIRCLE) {
        // Círculo -> Polygon
        geometry = {
          type: 'Polygon',
          coordinates: [entity.coordinates]
        };
      } else {
        // Por defecto -> LineString
        geometry = {
          type: 'LineString',
          coordinates: entity.coordinates
        };
      }
      
      // Crear feature
      const feature: GeoJSON.Feature = {
        type: 'Feature',
        geometry,
        properties: {
          layer: entity.layer,
          type: entity.type,
          ...entity.properties
        }
      };
      
      features.push(feature);
    });
    
    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Valida un archivo DXF
   * @param fileContent Contenido del archivo DXF
   * @returns Objeto con el resultado de la validación
   */
  public validateDxf(fileContent: string): { valid: boolean; message: string } {
    try {
      // Intentar parsear el archivo
      const dxf = this.parser.parseSync(fileContent);
      
      // Verificar si tiene entidades
      if (!dxf || !dxf.entities || !Array.isArray(dxf.entities) || dxf.entities.length === 0) {
        return { valid: false, message: 'El archivo DXF no contiene entidades' };
      }
      
      // Verificar si tiene entidades soportadas
      const supportedEntities = dxf.entities.filter(entity => 
        ['LWPOLYLINE', 'POLYLINE', 'LINE', 'CIRCLE', 'ARC'].includes(entity.type)
      );
      
      if (supportedEntities.length === 0) {
        return { 
          valid: false, 
          message: 'El archivo DXF no contiene entidades soportadas (LWPOLYLINE, POLYLINE, LINE, CIRCLE, ARC)' 
        };
      }
      
      return { valid: true, message: 'Archivo DXF válido' };
    } catch (error) {
      return { 
        valid: false, 
        message: error instanceof Error ? 
          `Error al validar archivo DXF: ${error.message}` : 
          'Error desconocido al validar archivo DXF' 
      };
    }
  }
} 