import React, { useState, useEffect } from 'react';
import { 
  GamificationSystem, 
  Badge, 
  UserLevel,
  BadgeCategory
} from '../models/GamificationSystem';

interface GamificationDashboardProps {
  gamificationSystem: GamificationSystem;
  className?: string;
  showLevel?: boolean;
  showXP?: boolean;
  showBadges?: boolean;
  showProgress?: boolean;
  badgeLayout?: 'grid' | 'list';
  maxBadgesToShow?: number;
  onBadgeClick?: (badge: Badge) => void;
}

/**
 * Componente para mostrar el dashboard de gamificación
 */
const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  gamificationSystem,
  className,
  showLevel = true,
  showXP = true,
  showBadges = true,
  showProgress = true,
  badgeLayout = 'grid',
  maxBadgesToShow = 8,
  onBadgeClick
}) => {
  const [xp, setXP] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<UserLevel | null>(null);
  const [levelProgress, setLevelProgress] = useState<{ current: number, required: number, percentage: number }>({
    current: 0,
    required: 100,
    percentage: 0
  });
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | null>(null);
  
  // Cargar datos cuando el componente se monta
  useEffect(() => {
    if (gamificationSystem) {
      // Cargar XP y nivel
      setXP(gamificationSystem.getXP());
      setCurrentLevel(gamificationSystem.getCurrentLevel());
      setLevelProgress(gamificationSystem.getLevelProgress());
      
      // Cargar badges
      setUnlockedBadges(gamificationSystem.getUnlockedBadges());
      setAllBadges(gamificationSystem.getAllBadges());
      
      // Configurar callbacks para actualizaciones
      gamificationSystem.onXPGainedCallback((amount, newTotal) => {
        setXP(newTotal);
      });
      
      gamificationSystem.onLevelUpCallback((newLevel, oldLevel) => {
        setCurrentLevel(newLevel);
        setLevelProgress(gamificationSystem.getLevelProgress());
      });
      
      gamificationSystem.onBadgeUnlockedCallback((badge) => {
        setUnlockedBadges(gamificationSystem.getUnlockedBadges());
      });
    }
  }, [gamificationSystem]);
  
  // Filtrar badges por categoría
  const getFilteredBadges = (): Badge[] => {
    if (!selectedCategory) {
      return unlockedBadges;
    }
    
    return unlockedBadges.filter(badge => badge.category === selectedCategory);
  };
  
  // Obtener categorías únicas de badges desbloqueados
  const getUnlockedCategories = (): BadgeCategory[] => {
    const categories = new Set<BadgeCategory>();
    
    unlockedBadges.forEach(badge => {
      categories.add(badge.category);
    });
    
    return Array.from(categories);
  };
  
  // Obtener icono para categoría
  const getCategoryIcon = (category: BadgeCategory): string => {
    switch (category) {
      case BadgeCategory.DESIGN: return '🎨';
      case BadgeCategory.FINANCIAL: return '💰';
      case BadgeCategory.EXPLORATION: return '🔍';
      case BadgeCategory.SUSTAINABILITY: return '🌱';
      case BadgeCategory.ACHIEVEMENT: return '🏆';
      default: return '🔔';
    }
  };
  
  // Obtener nombre para categoría
  const getCategoryName = (category: BadgeCategory): string => {
    switch (category) {
      case BadgeCategory.DESIGN: return 'Diseño';
      case BadgeCategory.FINANCIAL: return 'Finanzas';
      case BadgeCategory.EXPLORATION: return 'Exploración';
      case BadgeCategory.SUSTAINABILITY: return 'Sostenibilidad';
      case BadgeCategory.ACHIEVEMENT: return 'Logros';
      default: return 'Otro';
    }
  };
  
  // Formatear fecha
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString();
  };
  
  // Calcular progreso total de badges
  const getBadgeProgress = (): number => {
    if (allBadges.length === 0) return 0;
    return Math.round((unlockedBadges.length / allBadges.length) * 100);
  };
  
  // Manejar clic en badge
  const handleBadgeClick = (badge: Badge) => {
    if (onBadgeClick) {
      onBadgeClick(badge);
    }
  };
  
  // Filtrar por categoría
  const filterByCategory = (category: BadgeCategory | null) => {
    setSelectedCategory(category);
  };
  
  return (
    <div className={`gamification-dashboard ${className || ''}`}>
      {/* Sección de nivel y XP */}
      {(showLevel || showXP) && (
        <div className="level-xp-section">
          {showLevel && currentLevel && (
            <div className="level-info">
              <div className="level-number">Nivel {currentLevel.level}</div>
              <div className="level-title">{currentLevel.title}</div>
            </div>
          )}
          
          {showXP && (
            <div className="xp-info">
              <div className="xp-amount">{xp} XP</div>
            </div>
          )}
          
          {showProgress && currentLevel && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${levelProgress.percentage}%` }}
                />
              </div>
              <div className="progress-text">
                {levelProgress.current}/{levelProgress.required} XP para el siguiente nivel
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Sección de badges */}
      {showBadges && (
        <div className="badges-section">
          <div className="badges-header">
            <h3>Logros Desbloqueados ({unlockedBadges.length}/{allBadges.length})</h3>
            
            {showProgress && (
              <div className="badges-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getBadgeProgress()}%` }}
                  />
                </div>
                <div className="progress-text">{getBadgeProgress()}%</div>
              </div>
            )}
          </div>
          
          {/* Filtro de categorías */}
          <div className="category-filter">
            <button
              className={`category-button ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => filterByCategory(null)}
            >
              Todos
            </button>
            
            {getUnlockedCategories().map(category => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => filterByCategory(category)}
              >
                <span role="img" aria-hidden="true">{getCategoryIcon(category)}</span>
                {getCategoryName(category)}
              </button>
            ))}
          </div>
          
          {/* Lista de badges */}
          <div className={`badges-container layout-${badgeLayout}`}>
            {getFilteredBadges().slice(0, maxBadgesToShow).map(badge => (
              <div
                key={badge.id}
                className={`badge-item ${badge.category}`}
                onClick={() => handleBadgeClick(badge)}
              >
                <div className="badge-icon">
                  <img src={badge.iconUrl} alt={badge.name} />
                </div>
                <div className="badge-info">
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-description">{badge.description}</div>
                  <div className="badge-meta">
                    <span className="badge-xp">+{badge.xpReward} XP</span>
                    {badge.unlockedAt && (
                      <span className="badge-date">{formatDate(badge.unlockedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {getFilteredBadges().length === 0 && (
              <div className="no-badges-message">
                No hay logros desbloqueados en esta categoría
              </div>
            )}
            
            {getFilteredBadges().length > maxBadgesToShow && (
              <div className="more-badges">
                +{getFilteredBadges().length - maxBadgesToShow} más
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Beneficios del nivel actual */}
      {showLevel && currentLevel && currentLevel.benefits && currentLevel.benefits.length > 0 && (
        <div className="level-benefits">
          <h4>Beneficios del Nivel {currentLevel.level}</h4>
          <ul>
            {currentLevel.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard; 