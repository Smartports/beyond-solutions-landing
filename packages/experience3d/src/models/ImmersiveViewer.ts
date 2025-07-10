import {
  Engine,
  Scene,
  Vector3,
  ArcRotateCamera,
  FreeCamera,
  Camera,
  TargetCamera,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  Color3,
} from '@babylonjs/core';

/**
 * Tipos de cámara disponibles
 */
export enum CameraType {
  FREE = 'free',
  ARC_ROTATE = 'arc_rotate',
  FIRST_PERSON = 'first_person',
  TOP_DOWN = 'top_down',
}

/**
 * Opciones de configuración para el visor inmersivo
 */
export interface ImmersiveViewerOptions {
  canvasId: string;
  antialias?: boolean;
  enableCollisions?: boolean;
  enablePhysics?: boolean;
  enableShadows?: boolean;
  defaultCameraType?: CameraType;
  initialPosition?: Vector3;
  initialTarget?: Vector3;
  enableOcclusionCulling?: boolean;
}

/**
 * Clase principal para el visor inmersivo 3D
 */
export class ImmersiveViewer {
  private engine!: Engine;
  private scene!: Scene;
  private cameras: Map<CameraType, Camera> = new Map();
  private activeCamera!: Camera;
  private defaultLight!: HemisphericLight;
  private ground!: Mesh;
  private isInitialized: boolean = false;

  constructor(private options: ImmersiveViewerOptions) {}

  /**
   * Inicializa el visor 3D
   */
  public initialize(): boolean {
    try {
      const canvasEl = document.getElementById(this.options.canvasId);
      if (!(canvasEl instanceof HTMLCanvasElement)) {
        console.error(`Element with id ${this.options.canvasId} is not an HTMLCanvasElement`);
        return false;
      }
      const canvas = canvasEl;

      // Crear motor y escena
      this.engine = new Engine(canvas, this.options.antialias ?? true);
      this.scene = new Scene(this.engine);

      // Configurar opciones
      if (this.options.enableCollisions) {
        this.scene.collisionsEnabled = true;
      }

      if (this.options.enableOcclusionCulling) {
        this.scene.useRightHandedSystem = true;
        (this.scene as any).useOctreeForRenderingSelection = true;
        (this.scene as any).useOctreeForPicking = true;
        (this.scene as any).useOctreeForCollisions = true;
      }

      // Crear cámaras
      this.createCameras();

      // Crear iluminación básica
      this.defaultLight = new HemisphericLight('defaultLight', new Vector3(0, 1, 0), this.scene);
      this.defaultLight.intensity = 0.7;
      this.defaultLight.diffuse = Color3.FromHexString('#FFFFFF');
      this.defaultLight.specular = Color3.FromHexString('#FFFFFF');

      // Crear suelo básico
      this.ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, this.scene);
      this.ground.checkCollisions = this.options.enableCollisions ?? false;

      // Iniciar renderizado
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });

      // Manejar redimensionamiento
      window.addEventListener('resize', () => {
        this.engine.resize();
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing immersive viewer:', error);
      return false;
    }
  }

  /**
   * Crea las cámaras para diferentes modos de visualización
   */
  private createCameras(): void {
    const initialPosition = this.options.initialPosition ?? new Vector3(0, 5, -10);
    const initialTarget = this.options.initialTarget ?? Vector3.Zero();

    // Cámara de rotación
    const arcRotateCamera = new ArcRotateCamera(
      'arcRotateCamera',
      Math.PI / 2,
      Math.PI / 3,
      15,
      initialTarget,
      this.scene,
    );
    arcRotateCamera.lowerRadiusLimit = 5;
    arcRotateCamera.upperRadiusLimit = 50;
    arcRotateCamera.wheelPrecision = 50;
    arcRotateCamera.checkCollisions = this.options.enableCollisions ?? false;
    this.cameras.set(CameraType.ARC_ROTATE, arcRotateCamera);

    // Cámara libre
    const freeCamera = new FreeCamera('freeCamera', initialPosition, this.scene);
    freeCamera.setTarget(initialTarget);
    freeCamera.checkCollisions = this.options.enableCollisions ?? false;
    freeCamera.applyGravity = this.options.enablePhysics ?? false;
    freeCamera.ellipsoid = new Vector3(1, 1.8, 1);
    this.cameras.set(CameraType.FREE, freeCamera);

    // Cámara primera persona
    const firstPersonCamera = new FreeCamera('firstPersonCamera', initialPosition, this.scene);
    firstPersonCamera.setTarget(initialTarget);
    firstPersonCamera.checkCollisions = this.options.enableCollisions ?? false;
    firstPersonCamera.applyGravity = this.options.enablePhysics ?? false;
    firstPersonCamera.ellipsoid = new Vector3(1, 1.8, 1);
    firstPersonCamera.speed = 0.5;
    firstPersonCamera.angularSensibility = 1000;
    this.cameras.set(CameraType.FIRST_PERSON, firstPersonCamera);

    // Cámara vista superior
    const topDownCamera = new TargetCamera('topDownCamera', new Vector3(0, 20, 0), this.scene);
    topDownCamera.setTarget(initialTarget);
    (topDownCamera as any).checkCollisions = this.options.enableCollisions ?? false;
    this.cameras.set(CameraType.TOP_DOWN, topDownCamera);

    // Establecer cámara activa
    const defaultCameraType = this.options.defaultCameraType ?? CameraType.ARC_ROTATE;
    this.activeCamera = this.cameras.get(defaultCameraType)!;
    this.scene.activeCamera = this.activeCamera;
    this.activeCamera.attachControl(this.engine.getRenderingCanvas() as HTMLCanvasElement, true);
  }

  /**
   * Cambia el tipo de cámara activa
   * @param cameraType Tipo de cámara a activar
   */
  public setCameraType(cameraType: CameraType): void {
    if (!this.isInitialized) {
      console.error('Viewer not initialized');
      return;
    }

    const camera = this.cameras.get(cameraType);
    if (!camera) {
      console.error(`Camera type ${cameraType} not found`);
      return;
    }

    // Desactivar controles de la cámara actual
    if (this.activeCamera) {
      this.activeCamera.detachControl(this.engine.getRenderingCanvas() as HTMLCanvasElement);
    }

    // Activar nueva cámara
    this.activeCamera = camera;
    this.scene.activeCamera = camera;
    camera.attachControl(this.engine.getRenderingCanvas() as HTMLCanvasElement, true);
  }

  /**
   * Obtiene la escena de Babylon.js
   */
  public getScene(): Scene {
    return this.scene;
  }

  /**
   * Obtiene el motor de Babylon.js
   */
  public getEngine(): Engine {
    return this.engine;
  }

  /**
   * Obtiene la cámara activa
   */
  public getActiveCamera(): Camera {
    return this.activeCamera;
  }

  /**
   * Limpia y libera recursos
   */
  public dispose(): void {
    if (this.isInitialized) {
      this.scene.dispose();
      this.engine.dispose();
    }
  }
}
