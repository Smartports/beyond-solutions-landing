import { GamificationSystem, Badge, BadgeCategory } from './GamificationSystem';

/**
 * Representa un desafío que puede completar el usuario
 */
export interface Challenge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  xpReward: number;
  badgeReward?: string; // ID del badge que se otorga al completar
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isCompleted?: boolean;
  progress?: number; // 0-100 para desafíos progresivos
  completedAt?: Date;
  criteria: ChallengeCriteria;
}

/**
 * Categorías de desafíos
 */
export enum ChallengeCategory {
  DESIGN = 'design',
  FINANCIAL = 'financial',
  EXPLORATION = '3d_exploration',
  SUSTAINABILITY = 'sustainability',
  SOCIAL = 'social'
}

/**
 * Dificultad del desafío
 */
export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

/**
 * Criterios para completar un desafío
 */
export interface ChallengeCriteria {
  type: ChallengeType;
  target: number;
  current: number;
  conditions?: Record<string, any>;
}

/**
 * Tipos de desafíos
 */
export enum ChallengeType {
  VISIT_VIEWS = 'visit_views',
  COMPLETE_PROJECTS = 'complete_projects',
  UNLOCK_BADGES = 'unlock_badges',
  REACH_LEVEL = 'reach_level',
  FINANCIAL_GOAL = 'financial_goal',
  SHARE_PROJECTS = 'share_projects',
  EXPLORE_SEASONS = 'explore_seasons',
  CUSTOM = 'custom'
}

/**
 * Entrada en la tabla de clasificación
 */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  level: number;
  badgeCount: number;
  challengesCompleted: number;
  lastActive: Date;
}

/**
 * Opciones de configuración para el sistema de desafíos
 */
export interface ChallengeSystemOptions {
  storageKey?: string;
  autoSave?: boolean;
  refreshInterval?: number; // Intervalo para actualizar desafíos (ms)
  showCompletedChallenges?: boolean;
  simulateLeaderboard?: boolean; // Para simular una tabla de clasificación con datos ficticios
}

/**
 * Sistema de desafíos y tabla de clasificación
 */
export class ChallengeSystem {
  private challenges: Map<string, Challenge> = new Map();
  private activeChallenges: Challenge[] = [];
  private completedChallenges: Challenge[] = [];
  private leaderboard: LeaderboardEntry[] = [];
  private refreshIntervalId: number | null = null;
  private onChallengeCompleted: ((challenge: Challenge) => void) | null = null;
  private onChallengeProgressUpdated: ((challenge: Challenge) => void) | null = null;
  private onLeaderboardUpdated: ((leaderboard: LeaderboardEntry[]) => void) | null = null;
  
  constructor(
    private gamificationSystem: GamificationSystem,
    private options: ChallengeSystemOptions = {}
  ) {
    // Configurar opciones por defecto
    this.options.storageKey = this.options.storageKey || 'beyond_challenges_data';
    this.options.autoSave = this.options.autoSave !== undefined ? this.options.autoSave : true;
    this.options.refreshInterval = this.options.refreshInterval || 60000; // 1 minuto por defecto
    this.options.showCompletedChallenges = this.options.showCompletedChallenges !== undefined 
      ? this.options.showCompletedChallenges 
      : true;
    
    // Cargar datos guardados si autoSave está habilitado
    if (this.options.autoSave) {
      this.loadFromStorage();
    }
    
    // Iniciar intervalo de actualización
    this.startRefreshInterval();
    
    // Generar leaderboard simulado si está habilitado
    if (this.options.simulateLeaderboard) {
      this.generateSimulatedLeaderboard();
    }
  }
  
  /**
   * Inicia el intervalo para actualizar desafíos
   */
  private startRefreshInterval(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    
    this.refreshIntervalId = window.setInterval(() => {
      this.refreshChallenges();
    }, this.options.refreshInterval);
  }
  
  /**
   * Actualiza el estado de los desafíos
   */
  private refreshChallenges(): void {
    const now = new Date();
    
    // Actualizar estado de activación según fechas
    this.challenges.forEach(challenge => {
      // Verificar si debe estar activo según fechas
      if (challenge.startDate && challenge.endDate) {
        const isActive = now >= challenge.startDate && now <= challenge.endDate;
        if (challenge.isActive !== isActive) {
          challenge.isActive = isActive;
          this.updateChallengeLists();
        }
      }
    });
    
    // Guardar si autoSave está habilitado
    if (this.options.autoSave) {
      this.saveToStorage();
    }
  }
  
  /**
   * Actualiza las listas de desafíos activos y completados
   */
  private updateChallengeLists(): void {
    this.activeChallenges = Array.from(this.challenges.values())
      .filter(challenge => challenge.isActive && !challenge.isCompleted);
    
    this.completedChallenges = Array.from(this.challenges.values())
      .filter(challenge => challenge.isCompleted);
  }
  
  /**
   * Registra un desafío en el sistema
   * @param challenge Desafío a registrar
   */
  public registerChallenge(challenge: Challenge): void {
    // Asegurarse de que tiene valores por defecto
    challenge.progress = challenge.progress || 0;
    challenge.isCompleted = challenge.isCompleted || false;
    
    this.challenges.set(challenge.id, challenge);
    this.updateChallengeLists();
  }
  
  /**
   * Registra múltiples desafíos
   * @param challenges Array de desafíos a registrar
   */
  public registerChallenges(challenges: Challenge[]): void {
    challenges.forEach(challenge => this.registerChallenge(challenge));
  }
  
  /**
   * Actualiza el progreso de un desafío
   * @param challengeId ID del desafío
   * @param progress Valor actual del progreso
   */
  public updateChallengeProgress(challengeId: string, progress: number): boolean {
    // Verificar si el desafío existe
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      console.error(`Challenge with id ${challengeId} not found`);
      return false;
    }
    
    // Verificar si ya está completado
    if (challenge.isCompleted) {
      return false;
    }
    
    // Verificar si está activo
    if (!challenge.isActive) {
      return false;
    }
    
    // Actualizar progreso
    challenge.criteria.current = progress;
    challenge.progress = Math.min(100, Math.floor((progress / challenge.criteria.target) * 100));
    
    // Notificar actualización de progreso
    if (this.onChallengeProgressUpdated) {
      this.onChallengeProgressUpdated(challenge);
    }
    
    // Verificar si se completó
    if (progress >= challenge.criteria.target) {
      this.completeChallenge(challengeId);
    }
    
    // Guardar si autoSave está habilitado
    if (this.options.autoSave) {
      this.saveToStorage();
    }
    
    return true;
  }
  
  /**
   * Marca un desafío como completado
   * @param challengeId ID del desafío
   */
  public completeChallenge(challengeId: string): boolean {
    // Verificar si el desafío existe
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      console.error(`Challenge with id ${challengeId} not found`);
      return false;
    }
    
    // Verificar si ya está completado
    if (challenge.isCompleted) {
      return false;
    }
    
    // Verificar si está activo
    if (!challenge.isActive) {
      return false;
    }
    
    // Completar desafío
    challenge.isCompleted = true;
    challenge.completedAt = new Date();
    challenge.progress = 100;
    
    // Otorgar XP
    if (challenge.xpReward > 0) {
      this.gamificationSystem.addXP(challenge.xpReward, `Challenge: ${challenge.name}`);
    }
    
    // Otorgar badge si corresponde
    if (challenge.badgeReward) {
      this.gamificationSystem.unlockBadge(challenge.badgeReward);
    }
    
    // Actualizar listas
    this.updateChallengeLists();
    
    // Notificar completitud
    if (this.onChallengeCompleted) {
      this.onChallengeCompleted(challenge);
    }
    
    // Guardar si autoSave está habilitado
    if (this.options.autoSave) {
      this.saveToStorage();
    }
    
    return true;
  }
  
  /**
   * Genera una tabla de clasificación simulada con datos ficticios
   */
  private generateSimulatedLeaderboard(): void {
    const usernames = [
      'ArquitectoMaster', 'DesarrolladorPro', 'InmobiliariaStar',
      'ConstructorTop', 'InversionistaGuru', 'DiseñadorElite',
      'ProyectistaVIP', 'UrbanistaPro', 'PlanificadorExpert',
      'MagnateInmobiliario', 'ArquitectoVisionario', 'DesarrolladorCreativo'
    ];
    
    // Generar entradas simuladas
    this.leaderboard = Array(10).fill(0).map((_, index) => {
      const now = new Date();
      const lastActive = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Hasta 7 días atrás
      
      return {
        userId: `user-${index + 1}`,
        username: usernames[index % usernames.length],
        avatarUrl: `https://randomuser.me/api/portraits/${index % 2 ? 'men' : 'women'}/${index + 1}.jpg`,
        score: Math.floor(10000 / (index + 1) * (Math.random() * 0.5 + 0.75)),
        level: Math.max(1, 8 - Math.floor(index / 2)),
        badgeCount: Math.max(1, 20 - index * 2),
        challengesCompleted: Math.max(1, 15 - index),
        lastActive
      };
    });
    
    // Ordenar por puntuación
    this.leaderboard.sort((a, b) => b.score - a.score);
    
    // Notificar actualización
    if (this.onLeaderboardUpdated) {
      this.onLeaderboardUpdated(this.leaderboard);
    }
  }
  
  /**
   * Guarda el estado en almacenamiento local
   */
  public saveToStorage(): void {
    try {
      const data = {
        challenges: Array.from(this.challenges.values())
      };
      
      localStorage.setItem(this.options.storageKey!, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving challenges data:', error);
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
      
      // Cargar desafíos
      if (data.challenges && Array.isArray(data.challenges)) {
        data.challenges.forEach((challenge: Challenge) => {
          this.challenges.set(challenge.id, challenge);
        });
        
        this.updateChallengeLists();
      }
    } catch (error) {
      console.error('Error loading challenges data:', error);
    }
  }
  
  /**
   * Establece callback para cuando se completa un desafío
   */
  public onChallengeCompletedCallback(callback: (challenge: Challenge) => void): void {
    this.onChallengeCompleted = callback;
  }
  
  /**
   * Establece callback para cuando se actualiza el progreso de un desafío
   */
  public onChallengeProgressUpdatedCallback(callback: (challenge: Challenge) => void): void {
    this.onChallengeProgressUpdated = callback;
  }
  
  /**
   * Establece callback para cuando se actualiza la tabla de clasificación
   */
  public onLeaderboardUpdatedCallback(callback: (leaderboard: LeaderboardEntry[]) => void): void {
    this.onLeaderboardUpdated = callback;
  }
  
  /**
   * Obtiene todos los desafíos
   */
  public getAllChallenges(): Challenge[] {
    return Array.from(this.challenges.values());
  }
  
  /**
   * Obtiene desafíos activos
   */
  public getActiveChallenges(): Challenge[] {
    return [...this.activeChallenges];
  }
  
  /**
   * Obtiene desafíos completados
   */
  public getCompletedChallenges(): Challenge[] {
    return [...this.completedChallenges];
  }
  
  /**
   * Obtiene desafíos por categoría
   * @param category Categoría de desafíos
   */
  public getChallengesByCategory(category: ChallengeCategory): Challenge[] {
    return Array.from(this.challenges.values())
      .filter(challenge => challenge.category === category && 
        (challenge.isActive || (this.options.showCompletedChallenges && challenge.isCompleted)));
  }
  
  /**
   * Obtiene la tabla de clasificación
   */
  public getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }
  
  /**
   * Actualiza la tabla de clasificación
   * En una implementación real, esto se conectaría a un backend
   */
  public refreshLeaderboard(): void {
    if (this.options.simulateLeaderboard) {
      // Simular pequeños cambios en la tabla
      this.leaderboard.forEach(entry => {
        entry.score += Math.floor(Math.random() * 100) - 20;
        entry.score = Math.max(0, entry.score);
        
        // Actualizar fecha de actividad para algunos
        if (Math.random() > 0.7) {
          entry.lastActive = new Date();
        }
      });
      
      // Reordenar
      this.leaderboard.sort((a, b) => b.score - a.score);
      
      // Notificar actualización
      if (this.onLeaderboardUpdated) {
        this.onLeaderboardUpdated(this.leaderboard);
      }
    }
  }
  
  /**
   * Limpia recursos
   */
  public dispose(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }
} 