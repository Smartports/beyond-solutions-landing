import {
  Scene,
  Vector3,
  Animation,
  AbstractMesh,
  Color3,
  MeshBuilder,
  StandardMaterial,
} from '@babylonjs/core';
import { ImmersiveViewer, CameraType } from './ImmersiveViewer';

/**
 * Tipos de vista disponibles
 */
export enum ViewType {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
}

/**
 * Representa un punto de vista predefinido
 */
export interface ViewPoint {
  id: string;
  name: string;
  type: ViewType;
  position: Vector3;
  target: Vector3;
  cameraType: CameraType;
  thumbnail?: string;
  description?: string;
  tags?: string[];
}

/**
 * Opciones de configuración para el gestor de vistas
 */
export interface ViewManagerOptions {
  enableTransitions?: boolean;
  transitionDuration?: number;
  createMinimap?: boolean;
  minimapSize?: number;
  showLabels?: boolean;
}

/**
 * Sistema para gestionar vistas interiores/exteriores y puntos de interés
 */
export class ViewManager {
  private scene: Scene;
  private viewer: ImmersiveViewer;
  private viewPoints: Map<string, ViewPoint> = new Map();
  private currentViewId: string | null = null;
  private minimapMesh: AbstractMesh | null = null;
  private minimapMarker: AbstractMesh | null = null;
  private viewLabels: Map<string, unknown> = new Map();

  constructor(
    viewer: ImmersiveViewer,
    private options: ViewManagerOptions = {},
  ) {
    this.viewer = viewer;
    this.scene = viewer.getScene();

    // Configurar opciones por defecto
    this.options.transitionDuration = this.options.transitionDuration || 1000;

    // Crear minimapa si está habilitado
    if (options.createMinimap) {
      this.createMinimap();
    }
  }

  /**
   * Añade un punto de vista
   * @param viewPoint Punto de vista a añadir
   */
  public addViewPoint(viewPoint: ViewPoint): void {
    this.viewPoints.set(viewPoint.id, viewPoint);

    // Crear etiqueta si está habilitado
    if (this.options.showLabels) {
      this.createViewLabel(viewPoint);
    }

    // Actualizar minimapa si existe
    if (this.minimapMesh) {
      this.updateMinimapMarkers();
    }
  }

  /**
   * Añade múltiples puntos de vista
   * @param viewPoints Array de puntos de vista
   */
  public addViewPoints(viewPoints: ViewPoint[]): void {
    viewPoints.forEach((viewPoint) => this.addViewPoint(viewPoint));
  }

  /**
   * Crea una etiqueta para un punto de vista
   * @param viewPoint Punto de vista
   */
  private createViewLabel(viewPoint: ViewPoint): void {
    // Aquí se implementaría la creación de etiquetas en el espacio 3D
    // Usando BabylonJS GUI o meshes específicos

    // Ejemplo simplificado con un mesh básico
    const sphere = MeshBuilder.CreateSphere(`label_${viewPoint.id}`, { diameter: 0.5 }, this.scene);
    sphere.position = viewPoint.position.clone();
    sphere.position.y += 1; // Elevar un poco para que sea visible

    // Material según tipo
    const material = new StandardMaterial(`label_material_${viewPoint.id}`, this.scene);
    material.diffuseColor =
      viewPoint.type === ViewType.EXTERIOR
        ? new Color3(0.2, 0.6, 1.0) // Azul para exterior
        : new Color3(1.0, 0.6, 0.2); // Naranja para interior
    material.alpha = 0.7;
    sphere.material = material;

    // Guardar referencia
    this.viewLabels.set(viewPoint.id, sphere);
  }

  /**
   * Crea un minimapa simple
   */
  private createMinimap(): void {
    const size = this.options.minimapSize || 100;

    // Crear plano para el minimapa
    this.minimapMesh = MeshBuilder.CreatePlane(
      'minimap',
      { width: size, height: size },
      this.scene,
    );
    this.minimapMesh.rotation.x = Math.PI / 2; // Rotar para que sea horizontal
    this.minimapMesh.position.y = 0.1; // Ligeramente elevado del suelo

    // Material para el minimapa
    const minimapMaterial = new StandardMaterial('minimapMaterial', this.scene);
    minimapMaterial.diffuseColor = new Color3(0.9, 0.9, 0.9);
    minimapMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    this.minimapMesh.material = minimapMaterial;

    // Crear marcador para la posición actual
    this.minimapMarker = MeshBuilder.CreateCylinder(
      'minimapMarker',
      {
        height: 2,
        diameter: 2,
      },
      this.scene,
    );
    this.minimapMarker.position.y = 1;

    const markerMaterial = new StandardMaterial('markerMaterial', this.scene);
    markerMaterial.diffuseColor = new Color3(1, 0, 0);
    markerMaterial.emissiveColor = new Color3(0.5, 0, 0);
    this.minimapMarker.material = markerMaterial;

    // Actualizar marcadores para los puntos de vista
    this.updateMinimapMarkers();
  }

  /**
   * Actualiza los marcadores en el minimapa
   */
  private updateMinimapMarkers(): void {
    if (!this.minimapMesh) return;

    // Aquí se implementaría la creación de marcadores en el minimapa
    // para cada punto de vista

    // Este es un ejemplo simplificado que crearía un marcador por cada punto
    this.viewPoints.forEach((viewPoint) => {
      // Verificar si ya existe un marcador para este punto
      const existingMarker = this.scene.getMeshByName(`minimap_marker_${viewPoint.id}`);
      if (existingMarker) return;

      // Crear marcador
      const marker = MeshBuilder.CreateCylinder(
        `minimap_marker_${viewPoint.id}`,
        {
          height: 1,
          diameter: 1,
        },
        this.scene,
      );

      // Posicionar en el minimapa (escalar coordenadas)
      const minimapScale = (this.options.minimapSize || 100) / 200;
      marker.position.x = this.minimapMesh!.position.x + viewPoint.position.x * minimapScale;
      marker.position.z = this.minimapMesh!.position.z + viewPoint.position.z * minimapScale;
      marker.position.y = this.minimapMesh!.position.y + 0.5;

      // Material según tipo
      const markerMaterial = new StandardMaterial(
        `minimap_marker_material_${viewPoint.id}`,
        this.scene,
      );
      markerMaterial.diffuseColor =
        viewPoint.type === ViewType.EXTERIOR
          ? new Color3(0.2, 0.6, 1.0) // Azul para exterior
          : new Color3(1.0, 0.6, 0.2); // Naranja para interior
      marker.material = markerMaterial;
    });
  }

  /**
   * Actualiza la posición del marcador en el minimapa
   */
  private updateMinimapMarkerPosition(): void {
    if (!this.minimapMarker || !this.minimapMesh) return;

    const camera = this.viewer.getActiveCamera();
    const minimapScale = (this.options.minimapSize || 100) / 200;

    // Actualizar posición del marcador según la cámara
    this.minimapMarker.position.x = this.minimapMesh.position.x + camera.position.x * minimapScale;
    this.minimapMarker.position.z = this.minimapMesh.position.z + camera.position.z * minimapScale;
    this.minimapMarker.position.y = this.minimapMesh.position.y + 0.5;

    // Actualizar rotación para que apunte en la dirección de la cámara
    const forward = (camera as any).getTarget().subtract(camera.position).normalize();
    const angle = Math.atan2(forward.x, forward.z);
    this.minimapMarker.rotation.y = angle;
  }

  /**
   * Navega a un punto de vista específico
   * @param viewId ID del punto de vista
   */
  public goToView(viewId: string): boolean {
    const viewPoint = this.viewPoints.get(viewId);
    if (!viewPoint) {
      console.error(`View point with id ${viewId} not found`);
      return false;
    }

    this.currentViewId = viewId;

    // Cambiar tipo de cámara si es necesario
    this.viewer.setCameraType(viewPoint.cameraType);

    const camera = this.viewer.getActiveCamera();

    if (this.options.enableTransitions) {
      // Crear animación para posición
      const positionAnimation = new Animation(
        'cameraPositionAnimation',
        'position',
        30,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
      );

      const positionKeys = [
        { frame: 0, value: camera.position.clone() },
        { frame: 30, value: viewPoint.position.clone() },
      ];

      positionAnimation.setKeys(positionKeys);

      // Crear animación para target (solo para cámaras que tienen target)
      let targetAnimation;
      if ('setTarget' in camera) {
        targetAnimation = new Animation(
          'cameraTargetAnimation',
          'target',
          30,
          Animation.ANIMATIONTYPE_VECTOR3,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
        );

        const targetKeys = [
          { frame: 0, value: (camera as any).getTarget() },
          { frame: 30, value: viewPoint.target.clone() },
        ];

        targetAnimation.setKeys(targetKeys);
      }

      // Aplicar animaciones
      this.scene.stopAllAnimations();
      camera.animations = [positionAnimation];

      if (targetAnimation) {
        camera.animations.push(targetAnimation);
      }

      this.scene.beginAnimation(camera, 0, 30, false, 1.0, () => {
        // Asegurar posición final exacta
        camera.position = viewPoint.position.clone();
        if ('setTarget' in camera) {
          (camera as any).setTarget(viewPoint.target.clone());
        }

        // Actualizar minimapa
        this.updateMinimapMarkerPosition();
      });
    } else {
      // Cambio inmediato sin transición
      camera.position = viewPoint.position.clone();
      if ('setTarget' in camera) {
        (camera as any).setTarget(viewPoint.target.clone());
      }

      // Actualizar minimapa
      this.updateMinimapMarkerPosition();
    }

    return true;
  }

  /**
   * Obtiene todos los puntos de vista
   */
  public getViewPoints(): ViewPoint[] {
    return Array.from(this.viewPoints.values());
  }

  /**
   * Obtiene puntos de vista filtrados por tipo
   * @param type Tipo de vista a filtrar
   */
  public getViewPointsByType(type: ViewType): ViewPoint[] {
    return Array.from(this.viewPoints.values()).filter((viewPoint) => viewPoint.type === type);
  }

  /**
   * Obtiene el punto de vista actual
   */
  public getCurrentViewPoint(): ViewPoint | null {
    return this.currentViewId ? this.viewPoints.get(this.currentViewId) || null : null;
  }

  /**
   * Actualiza el minimapa con la posición actual
   */
  public updateMinimap(): void {
    this.updateMinimapMarkerPosition();
  }

  /**
   * Limpia recursos
   */
  public dispose(): void {
    // Eliminar etiquetas
    this.viewLabels.forEach((label) => {
      if (label && (label as any).dispose) {
        (label as any).dispose();
      }
    });

    // Eliminar minimapa
    if (this.minimapMesh) {
      this.minimapMesh.dispose();
    }

    if (this.minimapMarker) {
      this.minimapMarker.dispose();
    }

    // Limpiar marcadores del minimapa
    this.viewPoints.forEach((viewPoint) => {
      const marker = this.scene.getMeshByName(`minimap_marker_${viewPoint.id}`);
      if (marker) {
        marker.dispose();
      }
    });
  }
}
