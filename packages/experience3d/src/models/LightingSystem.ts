import {
  Scene,
  DirectionalLight,
  ShadowGenerator,
  Vector3,
  Color3,
  HemisphericLight,
  SpotLight,
  PointLight,
} from '@babylonjs/core';
import { ImmersiveViewer } from './ImmersiveViewer';

/**
 * Representa una hora del día
 */
export interface TimeOfDay {
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * Configuración del sistema de iluminación
 */
export interface LightingSystemOptions {
  enableShadows?: boolean;
  shadowQuality?: 'low' | 'medium' | 'high';
  enableHDR?: boolean;
  initialTime?: TimeOfDay;
}

/**
 * Sistema para manejar la iluminación y ciclo día/noche
 */
export class LightingSystem {
  private scene: Scene;
  private sunLight: DirectionalLight;
  private ambientLight: HemisphericLight;
  private moonLight: DirectionalLight;
  private shadowGenerator: ShadowGenerator | null = null;
  private currentTime: TimeOfDay;
  private isNight: boolean = false;
  private interiorLights: (SpotLight | PointLight)[] = [];

  constructor(
    private viewer: ImmersiveViewer,
    private options: LightingSystemOptions = {},
  ) {
    this.scene = viewer.getScene();
    this.currentTime = options.initialTime || { hour: 12, minute: 0 };

    // Crear luces
    this.sunLight = new DirectionalLight('sunLight', new Vector3(0.5, -1, 1), this.scene);
    this.sunLight.intensity = 1.0;

    this.ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), this.scene);
    this.ambientLight.intensity = 0.5;

    this.moonLight = new DirectionalLight('moonLight', new Vector3(-0.5, -1, -1), this.scene);
    this.moonLight.intensity = 0.2;
    this.moonLight.diffuse = new Color3(0.7, 0.7, 1);
    this.moonLight.specular = new Color3(0.7, 0.7, 1);

    // Configurar sombras si está habilitado
    if (options.enableShadows) {
      this.setupShadows();
    }

    // Aplicar configuración inicial
    this.updateLighting();
  }

  /**
   * Configura el generador de sombras
   */
  private setupShadows(): void {
    // Crear generador de sombras
    this.shadowGenerator = new ShadowGenerator(1024, this.sunLight);

    // Configurar calidad según opciones
    switch (this.options.shadowQuality) {
      case 'low':
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 2;
        break;
      case 'medium':
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 1;
        break;
      case 'high':
        this.shadowGenerator.usePercentageCloserFiltering = true;
        this.shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
        break;
      default:
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 1;
    }
  }

  /**
   * Actualiza la iluminación según la hora del día
   */
  private updateLighting(): void {
    // Calcular ángulo del sol basado en la hora (0 = medianoche, 180 = mediodía)
    const totalMinutes = this.currentTime.hour * 60 + this.currentTime.minute;
    const dayProgress = totalMinutes / (24 * 60);
    const sunAngle = Math.PI * (dayProgress * 2);

    // Posición del sol
    const sunX = Math.sin(sunAngle);
    const sunY = Math.cos(sunAngle);
    this.sunLight.direction = new Vector3(sunX, sunY * -0.8, sunX * 0.3);

    // Posición de la luna (opuesta al sol)
    this.moonLight.direction = new Vector3(-sunX, -sunY * -0.8, -sunX * 0.3);

    // Determinar si es de día o de noche
    this.isNight = this.currentTime.hour < 6 || this.currentTime.hour >= 18;

    // Ajustar intensidades
    if (this.isNight) {
      // Noche
      this.sunLight.intensity = 0;
      this.moonLight.intensity = 0.3;
      this.ambientLight.intensity = 0.2;
      this.ambientLight.diffuse = new Color3(0.2, 0.2, 0.5);

      // Encender luces interiores
      this.interiorLights.forEach((light) => {
        light.intensity = light.metadata?.maxIntensity || 1.0;
      });
    } else {
      // Día
      const dayIntensity = Math.sin(Math.PI * (dayProgress * 2 - 0.25));
      const normalizedIntensity = Math.max(0, Math.min(1, dayIntensity));

      this.sunLight.intensity = normalizedIntensity * 1.2;
      this.moonLight.intensity = 0;
      this.ambientLight.intensity = 0.3 + normalizedIntensity * 0.3;
      this.ambientLight.diffuse = new Color3(1, 1, 1);

      // Apagar o atenuar luces interiores
      this.interiorLights.forEach((light) => {
        light.intensity = 0;
      });
    }

    // Colores del cielo según hora del día
    let skyColor: Color3;

    if (this.currentTime.hour < 6) {
      // Noche profunda
      skyColor = new Color3(0.05, 0.05, 0.1);
    } else if (this.currentTime.hour < 7) {
      // Amanecer
      skyColor = new Color3(0.5, 0.3, 0.3);
    } else if (this.currentTime.hour < 17) {
      // Día
      skyColor = new Color3(0.3, 0.6, 0.9);
    } else if (this.currentTime.hour < 19) {
      // Atardecer
      skyColor = new Color3(0.8, 0.4, 0.2);
    } else {
      // Noche
      skyColor = new Color3(0.05, 0.05, 0.1);
    }

    // Aplicar color al cielo (fondo de la escena)
    this.scene.clearColor = skyColor.toColor4(1);
  }

  /**
   * Establece la hora del día
   * @param time Hora del día
   */
  public setTime(time: TimeOfDay): void {
    // Validar hora
    if (time.hour < 0 || time.hour > 23 || time.minute < 0 || time.minute > 59) {
      console.error('Invalid time format. Hour must be 0-23, minute 0-59');
      return;
    }

    this.currentTime = time;
    this.updateLighting();
  }

  /**
   * Obtiene la hora actual
   */
  public getTime(): TimeOfDay {
    return { ...this.currentTime };
  }

  /**
   * Añade una luz interior
   * @param light Luz a añadir
   */
  public addInteriorLight(light: SpotLight | PointLight): void {
    // Guardar intensidad máxima como metadata
    light.metadata = { maxIntensity: light.intensity };

    // Ajustar intensidad según hora actual
    if (!this.isNight) {
      light.intensity = 0;
    }

    this.interiorLights.push(light);
  }

  /**
   * Añade un objeto que proyecta sombras
   * @param mesh Objeto que proyectará sombras
   */
  public addShadowCaster(mesh: any): void {
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(mesh);
    }
  }

  /**
   * Limpia recursos
   */
  public dispose(): void {
    this.sunLight.dispose();
    this.ambientLight.dispose();
    this.moonLight.dispose();
    this.interiorLights.forEach((light) => light.dispose());
  }
}
