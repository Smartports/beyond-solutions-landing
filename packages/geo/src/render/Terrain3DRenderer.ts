// @ts-nocheck

import * as BABYLON from 'babylonjs';
import * as turf from '@turf/turf';
import { FeatureCollection, Feature, Polygon } from 'geojson';
import { GLTF2Export } from '@babylonjs/serializers';

/**
 * Opciones para el renderizado 3D del terreno
 */
export interface Terrain3DOptions {
  /**
   * Elemento canvas donde renderizar
   */
  canvas: HTMLCanvasElement;
  
  /**
   * Datos GeoJSON del terreno
   */
  geoJson: FeatureCollection;
  
  /**
   * Elevación base del terreno (metros)
   */
  baseElevation?: number;
  
  /**
   * Elevación máxima del terreno (metros)
   */
  maxElevation?: number;
  
  /**
   * Color del terreno
   */
  terrainColor?: BABYLON.Color3;
  
  /**
   * Color del cielo
   */
  skyColor?: BABYLON.Color3;
  
  /**
   * Nivel de detalle (1-10)
   */
  detailLevel?: number;
}

/**
 * Clase para renderizar terrenos en 3D usando Babylon.js
 */
export class Terrain3DRenderer {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  private light: BABYLON.HemisphericLight;
  private terrainMesh: BABYLON.Mesh | null = null;
  private geoJson: FeatureCollection;
  private options: Terrain3DOptions;
  
  /**
   * Constructor
   * @param options Opciones de renderizado
   */
  constructor(options: Terrain3DOptions) {
    this.canvas = options.canvas;
    this.geoJson = options.geoJson;
    this.options = {
      baseElevation: 0,
      maxElevation: 10,
      detailLevel: 5,
      terrainColor: new BABYLON.Color3(0.4, 0.6, 0.3),
      skyColor: new BABYLON.Color3(0.8, 0.8, 1.0),
      ...options
    };
    
    // Inicializar motor de renderizado
    this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    
    // Crear escena
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(
      this.options.skyColor!.r,
      this.options.skyColor!.g,
      this.options.skyColor!.b,
      1
    );
    
    // Configurar cámara
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      50,
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.wheelPrecision = 50;
    this.camera.lowerRadiusLimit = 5;
    this.camera.upperRadiusLimit = 500;
    
    // Configurar luz
    this.light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    this.light.intensity = 0.7;
    
    // Crear terreno
    this.createTerrain();
    
    // Iniciar bucle de renderizado
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    
    // Manejar cambios de tamaño
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }
  
  /**
   * Crea el terreno 3D a partir de GeoJSON
   */
  private createTerrain(): void {
    // Limpiar terreno existente
    if (this.terrainMesh) {
      this.terrainMesh.dispose();
      this.terrainMesh = null;
    }
    
    // Verificar que hay features
    if (!this.geoJson.features || this.geoJson.features.length === 0) {
      console.warn('No hay features en el GeoJSON');
      return;
    }
    
    // Extraer polígonos
    const polygons = this.geoJson.features
      .filter(feature => 
        feature.geometry && 
        (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')
      );
    
    if (polygons.length === 0) {
      console.warn('No hay polígonos en el GeoJSON');
      return;
    }
    
    // Unir polígonos si hay varios
    let mergedPolygon: Feature<Polygon>;
    
    if (polygons.length === 1 && polygons[0].geometry.type === 'Polygon') {
      mergedPolygon = polygons[0] as Feature<Polygon>;
    } else {
      // Convertir multipolígonos a polígonos individuales
      const allPolygons: Feature<Polygon>[] = [];
      
      polygons.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          allPolygons.push(feature as Feature<Polygon>);
        } else if (feature.geometry.type === 'MultiPolygon') {
          const multiPolygon = feature.geometry;
          multiPolygon.coordinates.forEach(polygonCoords => {
            const polygon: Feature<Polygon> = {
              type: 'Feature',
              properties: feature.properties,
              geometry: {
                type: 'Polygon',
                coordinates: polygonCoords
              }
            };
            allPolygons.push(polygon);
          });
        }
      });
      
      // Unir polígonos
      mergedPolygon = allPolygons.reduce((merged, polygon) => {
        if (!merged) return polygon;
        return turf.union(merged, polygon) as Feature<Polygon>;
      }, null as unknown as Feature<Polygon>);
    }
    
    // Triangular el polígono
    const triangulation = this.triangulatePolygon(mergedPolygon);
    
    // Crear malla 3D
    this.terrainMesh = this.createMeshFromTriangulation(triangulation);
    
    // Centrar cámara en el terreno
    const boundingBox = this.terrainMesh.getBoundingInfo().boundingBox;
    const center = boundingBox.centerWorld;
    const size = boundingBox.extendSize;
    const maxSize = Math.max(size.x, size.z) * 2;
    
    this.camera.target = center;
    this.camera.radius = maxSize * 1.5;
  }
  
  /**
   * Triangula un polígono
   * @param polygon Polígono a triangular
   * @returns Triangulación
   */
  private triangulatePolygon(polygon: Feature<Polygon>): number[][] {
    // Extraer coordenadas del polígono
    const coordinates = polygon.geometry.coordinates[0];
    
    // Crear array de puntos para triangulación
    const points: number[][] = coordinates.map(coord => [coord[0], coord[1]]);
    
    // Eliminar el último punto si es igual al primero (polígono cerrado)
    if (
      points.length > 0 &&
      points[0][0] === points[points.length - 1][0] &&
      points[0][1] === points[points.length - 1][1]
    ) {
      points.pop();
    }
    
    // Triangular usando earcut (implementado en Babylon)
    const indices = [];
    const positions = [];
    const uvs = [];
    
    // Calcular límites para normalizar coordenadas
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    points.forEach(point => {
      minX = Math.min(minX, point[0]);
      minY = Math.min(minY, point[1]);
      maxX = Math.max(maxX, point[0]);
      maxY = Math.max(maxY, point[1]);
    });
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Crear vértices 3D
    points.forEach(point => {
      // Normalizar a coordenadas locales
      const x = point[0] - minX - width / 2;
      const z = point[1] - minY - height / 2;
      
      // Calcular elevación (por ahora plana)
      const y = this.options.baseElevation!;
      
      positions.push(x, y, z);
      
      // Coordenadas UV para textura
      const u = (point[0] - minX) / width;
      const v = (point[1] - minY) / height;
      uvs.push(u, v);
    });
    
    // Triangular
    const triangulation = BABYLON.VertexData.CreatePolygon({
      shape: points.map(p => new BABYLON.Vector3(p[0] - minX - width / 2, 0, p[1] - minY - height / 2)),
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    });
    
    return triangulation.indices.map((index, i) => {
      if (i % 3 === 0) {
        return [
          triangulation.indices[i],
          triangulation.indices[i + 1],
          triangulation.indices[i + 2]
        ];
      }
      return [];
    }).filter(triangle => triangle.length > 0) as number[][];
  }
  
  /**
   * Crea una malla 3D a partir de una triangulación
   * @param triangulation Triangulación
   * @returns Malla 3D
   */
  private createMeshFromTriangulation(triangulation: number[][]): BABYLON.Mesh {
    // Crear malla
    const terrainMesh = new BABYLON.Mesh('terrain', this.scene);
    
    // Crear material
    const material = new BABYLON.StandardMaterial('terrainMaterial', this.scene);
    material.diffuseColor = this.options.terrainColor!;
    material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    
    // Aplicar material
    terrainMesh.material = material;
    
    // Crear geometría
    const vertexData = new BABYLON.VertexData();
    
    // Extraer datos de la triangulación
    const positions: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    
    // Procesar triángulos
    triangulation.forEach((triangle, triangleIndex) => {
      // Añadir índices
      indices.push(
        triangleIndex * 3,
        triangleIndex * 3 + 1,
        triangleIndex * 3 + 2
      );
      
      // Añadir vértices
      triangle.forEach(vertexIndex => {
        const vertex = triangulation[vertexIndex];
        if (vertex) {
          positions.push(
            vertex[0],
            this.options.baseElevation!,
            vertex[1]
          );
        }
      });
    });
    
    // Calcular normales
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    
    // Aplicar datos a la malla
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.applyToMesh(terrainMesh);
    
    return terrainMesh;
  }
  
  /**
   * Aplica una elevación al terreno
   * @param elevationData Datos de elevación (array de {x, y, elevation})
   */
  public applyElevation(elevationData: {x: number; y: number; elevation: number}[]): void {
    if (!this.terrainMesh) {
      console.warn('No hay terreno para aplicar elevación');
      return;
    }
    
    // TODO: Implementar interpolación de elevación
    
    // Actualizar malla
    this.terrainMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, 
      this.terrainMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)!);
    
    // Recalcular normales
    const positions = this.terrainMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)!;
    const indices = this.terrainMesh.getIndices()!;
    const normals: number[] = [];
    
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    this.terrainMesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  }
  
  /**
   * Configura la posición del sol para análisis solar
   * @param date Fecha y hora para el análisis
   * @param latitude Latitud en grados
   * @param longitude Longitud en grados
   */
  public setSunPosition(date: Date, latitude: number, longitude: number): void {
    // Calcular posición solar
    const sunPosition = this.calculateSunPosition(date, latitude, longitude);
    
    // Crear o actualizar luz direccional para el sol
    if (!this.scene.getLightByName('sunLight')) {
      const sunLight = new BABYLON.DirectionalLight(
        'sunLight',
        new BABYLON.Vector3(sunPosition.x, sunPosition.y, sunPosition.z),
        this.scene
      );
      sunLight.intensity = 1;
      sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
      
      // Crear esfera para representar el sol
      const sun = BABYLON.MeshBuilder.CreateSphere(
        'sun',
        { diameter: 5 },
        this.scene
      );
      const sunMaterial = new BABYLON.StandardMaterial('sunMaterial', this.scene);
      sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.9, 0.5);
      sun.material = sunMaterial;
      
      // Posicionar el sol
      const distance = 100;
      sun.position = new BABYLON.Vector3(
        sunPosition.x * distance,
        sunPosition.y * distance,
        sunPosition.z * distance
      );
    } else {
      const sunLight = this.scene.getLightByName('sunLight') as BABYLON.DirectionalLight;
      sunLight.direction = new BABYLON.Vector3(sunPosition.x, sunPosition.y, sunPosition.z);
      
      const sun = this.scene.getMeshByName('sun');
      if (sun) {
        const distance = 100;
        sun.position = new BABYLON.Vector3(
          sunPosition.x * distance,
          sunPosition.y * distance,
          sunPosition.z * distance
        );
      }
    }
    
    // Activar sombras
    this.enableShadows();
  }
  
  /**
   * Calcula la posición del sol
   * @param date Fecha y hora
   * @param latitude Latitud en grados
   * @param longitude Longitud en grados
   * @returns Vector normalizado con la dirección del sol
   */
  private calculateSunPosition(date: Date, latitude: number, longitude: number): BABYLON.Vector3 {
    // Implementación simplificada del algoritmo de posición solar
    
    // Convertir a radianes
    const lat = latitude * Math.PI / 180;
    
    // Día del año (1-366)
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Hora decimal (0-24)
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    
    // Declinación solar
    const declination = 0.4093 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365);
    
    // Ángulo horario
    const hourAngle = (hour - 12) * 15 * Math.PI / 180;
    
    // Altitud solar
    const sinAltitude = Math.sin(lat) * Math.sin(declination) + 
                        Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
    const altitude = Math.asin(sinAltitude);
    
    // Azimut solar
    const cosAzimuth = (Math.sin(declination) - Math.sin(lat) * sinAltitude) / 
                       (Math.cos(lat) * Math.cos(altitude));
    let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
    
    if (hour > 12) {
      azimuth = 2 * Math.PI - azimuth;
    }
    
    // Convertir a coordenadas cartesianas
    const x = Math.cos(altitude) * Math.sin(azimuth);
    const y = Math.sin(altitude);
    const z = Math.cos(altitude) * Math.cos(azimuth);
    
    return new BABYLON.Vector3(x, y, z).normalize();
  }
  
  /**
   * Activa las sombras en la escena
   */
  private enableShadows(): void {
    if (!this.terrainMesh) return;
    
    const sunLight = this.scene.getLightByName('sunLight') as BABYLON.DirectionalLight;
    if (!sunLight) return;
    
    // Configurar generador de sombras
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, sunLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    
    // Añadir terreno como generador de sombras
    shadowGenerator.addShadowCaster(this.terrainMesh);
    
    // Recibir sombras
    this.terrainMesh.receiveShadows = true;
  }
  
  /**
   * Configura la simulación de viento
   * @param direction Dirección del viento en grados (0-360)
   * @param intensity Intensidad del viento (0-1)
   */
  public setWind(direction: number, intensity: number): void {
    // Convertir dirección a radianes
    const dirRad = direction * Math.PI / 180;
    
    // Calcular vector de dirección
    const dirX = Math.sin(dirRad);
    const dirZ = Math.cos(dirRad);
    
    // Crear sistema de partículas para visualizar el viento
    const windParticles = new BABYLON.ParticleSystem('wind', 2000, this.scene);
    
    // Configurar textura
    const particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', this.scene);
    windParticles.particleTexture = particleTexture;
    
    // Configurar emisor
    const emitterSize = 50;
    windParticles.emitter = new BABYLON.Vector3(-dirX * emitterSize, 10, -dirZ * emitterSize);
    windParticles.minEmitBox = new BABYLON.Vector3(-emitterSize, 0, -emitterSize);
    windParticles.maxEmitBox = new BABYLON.Vector3(emitterSize, 20, emitterSize);
    
    // Configurar partículas
    windParticles.color1 = new BABYLON.Color4(0.8, 0.8, 0.9, 0.1);
    windParticles.color2 = new BABYLON.Color4(0.9, 0.9, 1.0, 0.15);
    windParticles.colorDead = new BABYLON.Color4(0.9, 0.9, 1.0, 0);
    
    windParticles.minSize = 0.5;
    windParticles.maxSize = 1.5;
    
    windParticles.minLifeTime = 1;
    windParticles.maxLifeTime = 3;
    
    windParticles.emitRate = 500 * intensity;
    
    // Configurar dirección
    windParticles.direction1 = new BABYLON.Vector3(dirX, 0, dirZ);
    windParticles.direction2 = new BABYLON.Vector3(dirX, 0.1, dirZ);
    
    // Configurar velocidad
    windParticles.minEmitPower = 10 * intensity;
    windParticles.maxEmitPower = 30 * intensity;
    windParticles.updateSpeed = 0.01;
    
    // Iniciar sistema de partículas
    windParticles.start();
  }
  
  /**
   * Toma una captura de la escena
   * @returns Promise con el data URL de la imagen
   */
  public takeSnapshot(): Promise<string> {
    return new Promise((resolve) => {
      BABYLON.Tools.CreateScreenshot(this.engine, this.camera, { width: 1920, height: 1080 }, (data) => {
        resolve(data);
      });
    });
  }
  
  /**
   * Exporta la geometría 3D en formato glTF
   * @returns Blob con el archivo glTF
   */
  public async exportToGLTF(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Utilizar la utilidad de serializers para exportar la escena completa a GLB
        GLTF2Export.GLBAsync(this.scene, 'terrain').then((glb) => {
          const blob = new Blob([glb.glb], { type: 'model/gltf-binary' });
          resolve(blob);
        }).catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
  
  /**
   * Libera recursos
   */
  public dispose(): void {
    this.engine.dispose();
  }
} 