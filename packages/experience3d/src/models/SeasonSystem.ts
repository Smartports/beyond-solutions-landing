import { Scene, ParticleSystem, Texture, Color4, Vector3, AbstractMesh, StandardMaterial, Color3 } from '@babylonjs/core';
import { ImmersiveViewer } from './ImmersiveViewer';
import { LightingSystem } from './LightingSystem';

/**
 * Tipos de estaciones disponibles
 */
export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}

/**
 * Opciones de configuración para el sistema de estaciones
 */
export interface SeasonSystemOptions {
  initialSeason?: Season;
  enableParticleEffects?: boolean;
  particleIntensity?: 'low' | 'medium' | 'high';
  affectMaterials?: boolean;
}

/**
 * Sistema para manejar cambios estacionales en la escena 3D
 */
export class SeasonSystem {
  private scene: Scene;
  private currentSeason: Season;
  private particleSystems: Map<Season, ParticleSystem> = new Map();
  private activeParticleSystem: ParticleSystem | null = null;
  private vegetationMeshes: AbstractMesh[] = [];
  private originalMaterials: Map<string, StandardMaterial> = new Map();
  private seasonalMaterials: Map<Season, Map<string, StandardMaterial>> = new Map();
  private lightingSystem: LightingSystem | null = null;

  constructor(
    private viewer: ImmersiveViewer,
    private options: SeasonSystemOptions = {}
  ) {
    this.scene = viewer.getScene();
    this.currentSeason = options.initialSeason || Season.SUMMER;
    
    // Inicializar mapas de materiales estacionales
    Object.values(Season).forEach(season => {
      this.seasonalMaterials.set(season, new Map<string, StandardMaterial>());
    });
    
    // Crear sistemas de partículas si está habilitado
    if (options.enableParticleEffects) {
      this.createParticleSystems();
    }
  }
  
  /**
   * Establece el sistema de iluminación para coordinar cambios
   */
  public setLightingSystem(lightingSystem: LightingSystem): void {
    this.lightingSystem = lightingSystem;
  }
  
  /**
   * Crea sistemas de partículas para efectos estacionales
   */
  private createParticleSystems(): void {
    // Determinar cantidad de partículas según intensidad
    let particleCount = 1000;
    switch (this.options.particleIntensity) {
      case 'low': particleCount = 500; break;
      case 'medium': particleCount = 1500; break;
      case 'high': particleCount = 3000; break;
    }
    
    // Sistema para nieve (invierno)
    const snowSystem = new ParticleSystem('snow', particleCount, this.scene);
    snowSystem.particleTexture = new Texture('/assets/textures/snowflake.png', this.scene);
    snowSystem.emitter = new Vector3(0, 20, 0);
    snowSystem.minEmitBox = new Vector3(-50, 0, -50);
    snowSystem.maxEmitBox = new Vector3(50, 0, 50);
    snowSystem.color1 = new Color4(1, 1, 1, 1);
    snowSystem.color2 = new Color4(0.9, 0.9, 1, 1);
    snowSystem.minSize = 0.1;
    snowSystem.maxSize = 0.5;
    snowSystem.minLifeTime = 5;
    snowSystem.maxLifeTime = 8;
    snowSystem.emitRate = particleCount / 10;
    snowSystem.gravity = new Vector3(0, -0.1, 0);
    snowSystem.direction1 = new Vector3(-0.2, -1, -0.2);
    snowSystem.direction2 = new Vector3(0.2, -1, 0.2);
    snowSystem.minAngularSpeed = 0;
    snowSystem.maxAngularSpeed = Math.PI;
    this.particleSystems.set(Season.WINTER, snowSystem);
    
    // Sistema para hojas cayendo (otoño)
    const leavesSystem = new ParticleSystem('leaves', particleCount / 2, this.scene);
    leavesSystem.particleTexture = new Texture('/assets/textures/leaf.png', this.scene);
    leavesSystem.emitter = new Vector3(0, 15, 0);
    leavesSystem.minEmitBox = new Vector3(-40, 0, -40);
    leavesSystem.maxEmitBox = new Vector3(40, 0, 40);
    leavesSystem.color1 = new Color4(0.8, 0.3, 0.1, 1);
    leavesSystem.color2 = new Color4(0.9, 0.5, 0.1, 1);
    leavesSystem.colorDead = new Color4(0.5, 0.2, 0.1, 0);
    leavesSystem.minSize = 0.3;
    leavesSystem.maxSize = 0.8;
    leavesSystem.minLifeTime = 5;
    leavesSystem.maxLifeTime = 10;
    leavesSystem.emitRate = particleCount / 20;
    leavesSystem.gravity = new Vector3(0, -0.05, 0);
    leavesSystem.direction1 = new Vector3(-0.3, -1, -0.3);
    leavesSystem.direction2 = new Vector3(0.3, -1, 0.3);
    leavesSystem.minAngularSpeed = 0.5;
    leavesSystem.maxAngularSpeed = Math.PI;
    this.particleSystems.set(Season.AUTUMN, leavesSystem);
    
    // Sistema para pétalos (primavera)
    const petalsSystem = new ParticleSystem('petals', particleCount / 3, this.scene);
    petalsSystem.particleTexture = new Texture('/assets/textures/petal.png', this.scene);
    petalsSystem.emitter = new Vector3(0, 12, 0);
    petalsSystem.minEmitBox = new Vector3(-30, 0, -30);
    petalsSystem.maxEmitBox = new Vector3(30, 0, 30);
    petalsSystem.color1 = new Color4(1, 0.8, 0.9, 1);
    petalsSystem.color2 = new Color4(0.9, 0.5, 0.7, 1);
    petalsSystem.colorDead = new Color4(0.7, 0.5, 0.5, 0);
    petalsSystem.minSize = 0.1;
    petalsSystem.maxSize = 0.4;
    petalsSystem.minLifeTime = 4;
    petalsSystem.maxLifeTime = 8;
    petalsSystem.emitRate = particleCount / 30;
    petalsSystem.gravity = new Vector3(0, -0.03, 0);
    petalsSystem.direction1 = new Vector3(-0.2, -1, -0.2);
    petalsSystem.direction2 = new Vector3(0.2, -1, 0.2);
    petalsSystem.minAngularSpeed = 0.1;
    petalsSystem.maxAngularSpeed = Math.PI / 2;
    this.particleSystems.set(Season.SPRING, petalsSystem);
  }
  
  /**
   * Añade un mesh de vegetación que cambiará según la estación
   * @param mesh Mesh de vegetación
   */
  public addVegetationMesh(mesh: AbstractMesh): void {
    if (!mesh.material || !(mesh.material instanceof StandardMaterial)) {
      console.warn('Vegetation mesh must have a StandardMaterial');
      return;
    }
    
    // Guardar material original
    const originalMaterial = mesh.material as StandardMaterial;
    this.originalMaterials.set(mesh.id, originalMaterial.clone(`${mesh.id}_original`));
    
    // Crear materiales para cada estación
    this.createSeasonalMaterials(mesh.id, originalMaterial);
    
    // Añadir a la lista
    this.vegetationMeshes.push(mesh);
    
    // Aplicar material de la estación actual
    this.applySeasonalMaterial(mesh);
  }
  
  /**
   * Crea materiales para cada estación basados en el material original
   * @param meshId ID del mesh
   * @param baseMaterial Material base
   */
  private createSeasonalMaterials(meshId: string, baseMaterial: StandardMaterial): void {
    // Primavera - Más verde brillante, floreciente
    const springMaterial = baseMaterial.clone(`${meshId}_spring`);
    springMaterial.diffuseColor = new Color3(0.4, 0.8, 0.4);
    springMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
    this.seasonalMaterials.get(Season.SPRING)?.set(meshId, springMaterial);
    
    // Verano - Verde intenso
    const summerMaterial = baseMaterial.clone(`${meshId}_summer`);
    summerMaterial.diffuseColor = new Color3(0.2, 0.7, 0.2);
    summerMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    this.seasonalMaterials.get(Season.SUMMER)?.set(meshId, summerMaterial);
    
    // Otoño - Amarillos, naranjas y rojos
    const autumnMaterial = baseMaterial.clone(`${meshId}_autumn`);
    autumnMaterial.diffuseColor = new Color3(0.8, 0.4, 0.1);
    autumnMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    this.seasonalMaterials.get(Season.AUTUMN)?.set(meshId, autumnMaterial);
    
    // Invierno - Más gris, con menos saturación
    const winterMaterial = baseMaterial.clone(`${meshId}_winter`);
    winterMaterial.diffuseColor = new Color3(0.5, 0.5, 0.6);
    winterMaterial.specularColor = new Color3(0.3, 0.3, 0.3);
    this.seasonalMaterials.get(Season.WINTER)?.set(meshId, winterMaterial);
  }
  
  /**
   * Aplica el material estacional a un mesh
   * @param mesh Mesh a actualizar
   */
  private applySeasonalMaterial(mesh: AbstractMesh): void {
    if (!this.options.affectMaterials) return;
    
    const seasonalMaterial = this.seasonalMaterials.get(this.currentSeason)?.get(mesh.id);
    if (seasonalMaterial) {
      mesh.material = seasonalMaterial;
    }
  }
  
  /**
   * Cambia la estación actual
   * @param season Nueva estación
   */
  public setSeason(season: Season): void {
    // Detener sistema de partículas actual si existe
    if (this.activeParticleSystem) {
      this.activeParticleSystem.stop();
      this.activeParticleSystem = null;
    }
    
    this.currentSeason = season;
    
    // Aplicar materiales estacionales
    if (this.options.affectMaterials) {
      this.vegetationMeshes.forEach(mesh => this.applySeasonalMaterial(mesh));
    }
    
    // Activar sistema de partículas correspondiente
    if (this.options.enableParticleEffects) {
      const particleSystem = this.particleSystems.get(season);
      if (particleSystem) {
        particleSystem.start();
        this.activeParticleSystem = particleSystem;
      }
    }
    
    // Ajustar iluminación según estación
    if (this.lightingSystem) {
      switch (season) {
        case Season.WINTER:
          // Luz más fría y menos intensa en invierno
          this.scene.ambientColor = new Color3(0.8, 0.8, 1.0);
          break;
        case Season.SUMMER:
          // Luz más cálida e intensa en verano
          this.scene.ambientColor = new Color3(1.0, 0.95, 0.8);
          break;
        case Season.SPRING:
          // Luz balanceada en primavera
          this.scene.ambientColor = new Color3(0.9, 1.0, 0.9);
          break;
        case Season.AUTUMN:
          // Luz cálida en otoño
          this.scene.ambientColor = new Color3(1.0, 0.9, 0.7);
          break;
      }
    }
  }
  
  /**
   * Obtiene la estación actual
   */
  public getCurrentSeason(): Season {
    return this.currentSeason;
  }
  
  /**
   * Limpia recursos
   */
  public dispose(): void {
    // Detener y liberar sistemas de partículas
    this.particleSystems.forEach(system => {
      system.stop();
      system.dispose();
    });
    
    // Restaurar materiales originales
    if (this.options.affectMaterials) {
      this.vegetationMeshes.forEach(mesh => {
        const originalMaterial = this.originalMaterials.get(mesh.id);
        if (originalMaterial) {
          mesh.material = originalMaterial;
        }
      });
    }
    
    // Liberar materiales estacionales
    this.seasonalMaterials.forEach(materials => {
      materials.forEach(material => material.dispose());
    });
  }
} 