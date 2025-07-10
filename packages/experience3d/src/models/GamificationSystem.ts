/**
 * Nivel de usuario en el sistema de gamificación
 */
export interface UserLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  benefits: string[];
}

/**
 * Badge o logro que puede desbloquear el usuario
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: BadgeCategory;
  xpReward: number;
  isSecret?: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-100 para badges progresivos
}

/**
 * Categorías de badges
 */
export enum BadgeCategory {
  DESIGN = 'design',
  FINANCIAL = 'financial',
  EXPLORATION = 'exploration',
  SUSTAINABILITY = 'sustainability',
  ACHIEVEMENT = 'achievement',
}

/**
 * Opciones de configuración para el sistema de gamificación
 */
export interface GamificationSystemOptions {
  initialXP?: number;
  enableNotifications?: boolean;
  storageKey?: string;
  autoSave?: boolean;
}

/**
 * Sistema de gamificación para la calculadora inmobiliaria
 */
export class GamificationSystem {
  private xp: number = 0;
  private badges: Map<string, Badge> = new Map();
  private unlockedBadges: Set<string> = new Set();
  private userLevels: UserLevel[] = [];
  private currentLevel: UserLevel;
  private onBadgeUnlocked: ((badge: Badge) => void) | null = null;
  private onLevelUp: ((newLevel: UserLevel, oldLevel: UserLevel) => void) | null = null;
  private onXPGained: ((amount: number, newTotal: number) => void) | null = null;

  constructor(private options: GamificationSystemOptions = {}) {
    // Configurar opciones por defecto
    this.options.initialXP = this.options.initialXP || 0;
    this.options.storageKey = this.options.storageKey || 'beyond_gamification_data';
    this.options.autoSave = this.options.autoSave !== undefined ? this.options.autoSave : true;

    // Inicializar niveles de usuario
    this.initializeLevels();

    // Establecer XP inicial
    this.xp = this.options.initialXP;

    // Determinar nivel inicial
    this.currentLevel = this.calculateLevel(this.xp);

    // Cargar datos guardados si autoSave está habilitado
    if (this.options.autoSave) {
      this.loadFromStorage();
    }
  }

  /**
   * Inicializa los niveles de usuario
   */
  private initializeLevels(): void {
    this.userLevels = [
      {
        level: 1,
        title: 'Principiante',
        minXP: 0,
        maxXP: 99,
        benefits: ['Acceso básico a herramientas'],
      },
      {
        level: 2,
        title: 'Aprendiz',
        minXP: 100,
        maxXP: 299,
        benefits: ['Desbloqueo de 3D básico'],
      },
      {
        level: 3,
        title: 'Constructor',
        minXP: 300,
        maxXP: 699,
        benefits: ['Desbloqueo de materiales premium'],
      },
      {
        level: 4,
        title: 'Arquitecto',
        minXP: 700,
        maxXP: 1499,
        benefits: ['Desbloqueo de análisis avanzados'],
      },
      {
        level: 5,
        title: 'Maestro Desarrollador',
        minXP: 1500,
        maxXP: 2999,
        benefits: ['Desbloqueo de simulación financiera avanzada'],
      },
      {
        level: 6,
        title: 'Visionario',
        minXP: 3000,
        maxXP: 5999,
        benefits: ['Desbloqueo de escenarios personalizados'],
      },
      {
        level: 7,
        title: 'Magnate Inmobiliario',
        minXP: 6000,
        maxXP: 9999,
        benefits: ['Desbloqueo de todas las características'],
      },
      {
        level: 8,
        title: 'Leyenda',
        minXP: 10000,
        maxXP: Number.MAX_SAFE_INTEGER,
        benefits: ['Estatus de leyenda', 'Características experimentales'],
      },
    ];
  }

  /**
   * Determina el nivel según la cantidad de XP
   * @param xp Cantidad de XP
   */
  private calculateLevel(xp: number): UserLevel {
    for (let i = this.userLevels.length - 1; i >= 0; i--) {
      if (xp >= this.userLevels[i].minXP) {
        return this.userLevels[i];
      }
    }
    return this.userLevels[0]; // Nivel mínimo por defecto
  }

  /**
   * Registra un badge en el sistema
   * @param badge Badge a registrar
   */
  public registerBadge(badge: Badge): void {
    this.badges.set(badge.id, badge);
  }

  /**
   * Registra múltiples badges
   * @param badges Array de badges a registrar
   */
  public registerBadges(badges: Badge[]): void {
    badges.forEach((badge) => this.registerBadge(badge));
  }

  /**
   * Añade XP al usuario
   * @param amount Cantidad de XP a añadir
   * @param reason Razón por la que se otorga XP (opcional)
   */
  public addXP(amount: number, _reason?: string): void {
    if (amount <= 0) return;

    const _oldXP = this.xp;
    const oldLevel = this.currentLevel;

    this.xp += amount;

    // Determinar si subió de nivel
    const newLevel = this.calculateLevel(this.xp);
    const leveledUp = newLevel.level > oldLevel.level;

    // Actualizar nivel actual
    this.currentLevel = newLevel;

    // Notificar ganancia de XP
    if (this.onXPGained) {
      this.onXPGained(amount, this.xp);
    }

    // Notificar subida de nivel
    if (leveledUp && this.onLevelUp) {
      this.onLevelUp(newLevel, oldLevel);
    }

    // Guardar si autoSave está habilitado
    if (this.options.autoSave) {
      this.saveToStorage();
    }
  }

  /**
   * Desbloquea un badge para el usuario
   * @param badgeId ID del badge a desbloquear
   */
  public unlockBadge(badgeId: string): boolean {
    // Verificar si el badge existe
    const badge = this.badges.get(badgeId);
    if (!badge) {
      console.error(`Badge with id ${badgeId} not found`);
      return false;
    }

    // Verificar si ya está desbloqueado
    if (this.unlockedBadges.has(badgeId)) {
      return false;
    }

    // Desbloquear badge
    this.unlockedBadges.add(badgeId);
    badge.unlockedAt = new Date();
    badge.progress = 100;

    // Otorgar XP por el badge
    if (badge.xpReward > 0) {
      this.addXP(badge.xpReward, `Badge: ${badge.name}`);
    }

    // Notificar desbloqueo
    if (this.onBadgeUnlocked) {
      this.onBadgeUnlocked(badge);
    }

    // Guardar si autoSave está habilitado
    if (this.options.autoSave) {
      this.saveToStorage();
    }

    return true;
  }

  /**
   * Actualiza el progreso de un badge
   * @param badgeId ID del badge
   * @param progress Progreso (0-100)
   */
  public updateBadgeProgress(badgeId: string, progress: number): boolean {
    // Verificar si el badge existe
    const badge = this.badges.get(badgeId);
    if (!badge) {
      console.error(`Badge with id ${badgeId} not found`);
      return false;
    }

    // Verificar si ya está desbloqueado
    if (this.unlockedBadges.has(badgeId)) {
      return false;
    }

    // Limitar progreso entre 0 y 100
    progress = Math.max(0, Math.min(100, progress));

    // Actualizar progreso
    badge.progress = progress;

    // Desbloquear si se completó
    if (progress >= 100) {
      this.unlockBadge(badgeId);
    }

    // Guardar si autoSave está habilitado
    if (this.options.autoSave) {
      this.saveToStorage();
    }

    return true;
  }

  /**
   * Guarda el estado en almacenamiento local
   */
  public saveToStorage(): void {
    try {
      const data = {
        xp: this.xp,
        unlockedBadges: Array.from(this.unlockedBadges),
        badgesProgress: Array.from(this.badges.entries())
          .filter(([, badge]) => badge.progress !== undefined && badge.progress > 0)
          .map(([id, badge]) => ({ id, progress: badge.progress })),
      };

      localStorage.setItem(this.options.storageKey!, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }

  /**
   * Carga el estado desde almacenamiento local
   */
  public loadFromStorage(): void {
    try {
      const dataStr = localStorage.getItem(this.options.storageKey!);
      if (!dataStr) return;

      const data = JSON.parse(dataStr);

      // Cargar XP y nivel
      if (data.xp !== undefined) {
        this.xp = data.xp;
        this.currentLevel = this.calculateLevel(this.xp);
      }

      // Cargar badges desbloqueados
      if (data.unlockedBadges && Array.isArray(data.unlockedBadges)) {
        data.unlockedBadges.forEach((badgeId: string) => {
          this.unlockedBadges.add(badgeId);
          const badge = this.badges.get(badgeId);
          if (badge) {
            badge.progress = 100;
          }
        });
      }

      // Cargar progreso de badges
      if (data.badgesProgress && Array.isArray(data.badgesProgress)) {
        data.badgesProgress.forEach((item: { id: string; progress: number }) => {
          const badge = this.badges.get(item.id);
          if (badge && !this.unlockedBadges.has(item.id)) {
            badge.progress = item.progress;
          }
        });
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  }

  /**
   * Establece callback para cuando se desbloquea un badge
   */
  public onBadgeUnlockedCallback(callback: (badge: Badge) => void): void {
    this.onBadgeUnlocked = callback;
  }

  /**
   * Establece callback para cuando el usuario sube de nivel
   */
  public onLevelUpCallback(callback: (newLevel: UserLevel, oldLevel: UserLevel) => void): void {
    this.onLevelUp = callback;
  }

  /**
   * Establece callback para cuando el usuario gana XP
   */
  public onXPGainedCallback(callback: (amount: number, newTotal: number) => void): void {
    this.onXPGained = callback;
  }

  /**
   * Obtiene todos los badges
   */
  public getAllBadges(): Badge[] {
    return Array.from(this.badges.values());
  }

  /**
   * Obtiene badges desbloqueados
   */
  public getUnlockedBadges(): Badge[] {
    return Array.from(this.badges.values()).filter((badge) => this.unlockedBadges.has(badge.id));
  }

  /**
   * Obtiene badges por categoría
   * @param category Categoría de badges
   */
  public getBadgesByCategory(category: BadgeCategory): Badge[] {
    return Array.from(this.badges.values()).filter((badge) => badge.category === category);
  }

  /**
   * Obtiene XP actual
   */
  public getXP(): number {
    return this.xp;
  }

  /**
   * Obtiene nivel actual
   */
  public getCurrentLevel(): UserLevel {
    return this.currentLevel;
  }

  /**
   * Obtiene todos los niveles
   */
  public getAllLevels(): UserLevel[] {
    return [...this.userLevels];
  }

  /**
   * Verifica si un badge está desbloqueado
   * @param badgeId ID del badge
   */
  public isBadgeUnlocked(badgeId: string): boolean {
    return this.unlockedBadges.has(badgeId);
  }

  /**
   * Obtiene progreso hacia el siguiente nivel
   */
  public getLevelProgress(): { current: number; required: number; percentage: number } {
    const currentXP = this.xp;
    const nextLevelIndex = this.userLevels.findIndex(
      (level) => level.level === this.currentLevel.level + 1,
    );

    // Si es el nivel máximo
    if (nextLevelIndex === -1) {
      return {
        current: currentXP - this.currentLevel.minXP,
        required: 0,
        percentage: 100,
      };
    }

    const nextLevel = this.userLevels[nextLevelIndex];
    const xpForNextLevel = nextLevel.minXP - this.currentLevel.minXP;
    const currentProgress = currentXP - this.currentLevel.minXP;
    const percentage = Math.min(100, Math.floor((currentProgress / xpForNextLevel) * 100));

    return {
      current: currentProgress,
      required: xpForNextLevel,
      percentage,
    };
  }

  /**
   * Reinicia el sistema de gamificación
   */
  public reset(): void {
    this.xp = this.options.initialXP || 0;
    this.unlockedBadges.clear();
    this.currentLevel = this.calculateLevel(this.xp);

    // Reiniciar progreso de badges
    this.badges.forEach((badge) => {
      badge.progress = 0;
      badge.unlockedAt = undefined;
    });

    // Guardar si autoSave está habilitado
    if (this.options.autoSave) {
      this.saveToStorage();
    }
  }
}
