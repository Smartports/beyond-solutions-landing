import React, { useState, useEffect } from 'react';
import { SeasonSystem, Season } from '../models/SeasonSystem';

interface SeasonSelectorProps {
  seasonSystem: SeasonSystem;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
  showIcons?: boolean;
  onChange?: (season: Season) => void;
}

/**
 * Componente para seleccionar estaciones del año
 */
const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasonSystem,
  className,
  layout = 'horizontal',
  showLabels = true,
  showIcons = true,
  onChange
}) => {
  const [currentSeason, setCurrentSeason] = useState<Season>(Season.SUMMER);
  
  // Inicializar con la estación actual del sistema
  useEffect(() => {
    if (seasonSystem) {
      setCurrentSeason(seasonSystem.getCurrentSeason());
    }
  }, [seasonSystem]);
  
  // Cambiar la estación
  const handleSeasonChange = (season: Season) => {
    setCurrentSeason(season);
    
    if (seasonSystem) {
      seasonSystem.setSeason(season);
    }
    
    if (onChange) {
      onChange(season);
    }
  };
  
  // Obtener icono para cada estación
  const getSeasonIcon = (season: Season): string => {
    switch (season) {
      case Season.SPRING: return '🌸';
      case Season.SUMMER: return '☀️';
      case Season.AUTUMN: return '🍂';
      case Season.WINTER: return '❄️';
      default: return '🌍';
    }
  };
  
  // Obtener nombre para cada estación
  const getSeasonName = (season: Season): string => {
    switch (season) {
      case Season.SPRING: return 'Primavera';
      case Season.SUMMER: return 'Verano';
      case Season.AUTUMN: return 'Otoño';
      case Season.WINTER: return 'Invierno';
      default: return 'Desconocido';
    }
  };
  
  // Todas las estaciones disponibles
  const seasons = Object.values(Season);
  
  return (
    <div className={`season-selector layout-${layout} ${className || ''}`}>
      {seasons.map(season => (
        <button
          key={season}
          className={`season-button ${currentSeason === season ? 'active' : ''} ${season}`}
          onClick={() => handleSeasonChange(season)}
          aria-label={getSeasonName(season)}
          aria-pressed={currentSeason === season}
        >
          {showIcons && (
            <span className="season-icon" role="img" aria-hidden="true">
              {getSeasonIcon(season)}
            </span>
          )}
          {showLabels && (
            <span className="season-label">
              {getSeasonName(season)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SeasonSelector; 