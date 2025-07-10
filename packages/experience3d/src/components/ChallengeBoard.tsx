import React, { useState, useEffect } from 'react';
import {
  ChallengeSystem,
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  LeaderboardEntry,
} from '../models/ChallengeSystem';

interface ChallengeBoardProps {
  challengeSystem: ChallengeSystem;
  className?: string;
  showActiveChallenges?: boolean;
  showCompletedChallenges?: boolean;
  showLeaderboard?: boolean;
  challengeLayout?: 'grid' | 'list';
  leaderboardSize?: number;
  onChallengeClick?: (challenge: Challenge) => void;
}

/**
 * Componente para mostrar desafíos y tabla de clasificación
 */
const ChallengeBoard: React.FC<ChallengeBoardProps> = ({
  challengeSystem,
  className,
  showActiveChallenges = true,
  showCompletedChallenges = true,
  showLeaderboard = true,
  challengeLayout = 'grid',
  leaderboardSize = 5,
  onChallengeClick,
}) => {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChallengeDifficulty | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'leaderboard'>('active');

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    if (challengeSystem) {
      // Cargar desafíos
      setActiveChallenges(challengeSystem.getActiveChallenges());
      setCompletedChallenges(challengeSystem.getCompletedChallenges());

      // Cargar leaderboard
      setLeaderboard(challengeSystem.getLeaderboard());

      // Configurar callbacks para actualizaciones
      challengeSystem.onChallengeCompletedCallback((_challenge) => {
        setActiveChallenges(challengeSystem.getActiveChallenges());
        setCompletedChallenges(challengeSystem.getCompletedChallenges());
      });

      challengeSystem.onChallengeProgressUpdatedCallback((_challenge) => {
        setActiveChallenges([...challengeSystem.getActiveChallenges()]);
      });

      challengeSystem.onLeaderboardUpdatedCallback((newLeaderboard) => {
        setLeaderboard(newLeaderboard);
      });
    }
  }, [challengeSystem]);

  // Filtrar desafíos por categoría y dificultad
  const getFilteredChallenges = (challenges: Challenge[]): Challenge[] => {
    let filtered = [...challenges];

    if (selectedCategory) {
      filtered = filtered.filter((challenge) => challenge.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((challenge) => challenge.difficulty === selectedDifficulty);
    }

    return filtered;
  };

  // Obtener categorías únicas de desafíos
  const getUniqueCategories = (): ChallengeCategory[] => {
    const categories = new Set<ChallengeCategory>();

    [...activeChallenges, ...completedChallenges].forEach((challenge) => {
      categories.add(challenge.category);
    });

    return Array.from(categories);
  };

  // Obtener dificultades únicas de desafíos
  const getUniqueDifficulties = (): ChallengeDifficulty[] => {
    const difficulties = new Set<ChallengeDifficulty>();

    [...activeChallenges, ...completedChallenges].forEach((challenge) => {
      difficulties.add(challenge.difficulty);
    });

    return Array.from(difficulties);
  };

  // Obtener icono para categoría
  const getCategoryIcon = (category: ChallengeCategory): string => {
    switch (category) {
      case ChallengeCategory.DESIGN:
        return '🎨';
      case ChallengeCategory.FINANCIAL:
        return '💰';
      case ChallengeCategory.EXPLORATION:
        return '🔍';
      case ChallengeCategory.SUSTAINABILITY:
        return '🌱';
      case ChallengeCategory.SOCIAL:
        return '👥';
      default:
        return '🔔';
    }
  };

  // Obtener nombre para categoría
  const getCategoryName = (category: ChallengeCategory): string => {
    switch (category) {
      case ChallengeCategory.DESIGN:
        return 'Diseño';
      case ChallengeCategory.FINANCIAL:
        return 'Finanzas';
      case ChallengeCategory.EXPLORATION:
        return 'Exploración 3D';
      case ChallengeCategory.SUSTAINABILITY:
        return 'Sostenibilidad';
      case ChallengeCategory.SOCIAL:
        return 'Social';
      default:
        return 'Otro';
    }
  };

  // Obtener icono para dificultad
  const getDifficultyIcon = (difficulty: ChallengeDifficulty): string => {
    switch (difficulty) {
      case ChallengeDifficulty.EASY:
        return '⭐';
      case ChallengeDifficulty.MEDIUM:
        return '⭐⭐';
      case ChallengeDifficulty.HARD:
        return '⭐⭐⭐';
      case ChallengeDifficulty.EXPERT:
        return '⭐⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  // Obtener nombre para dificultad
  const getDifficultyName = (difficulty: ChallengeDifficulty): string => {
    switch (difficulty) {
      case ChallengeDifficulty.EASY:
        return 'Fácil';
      case ChallengeDifficulty.MEDIUM:
        return 'Medio';
      case ChallengeDifficulty.HARD:
        return 'Difícil';
      case ChallengeDifficulty.EXPERT:
        return 'Experto';
      default:
        return 'Desconocido';
    }
  };

  // Formatear fecha
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';

    return new Date(date).toLocaleDateString();
  };

  // Formatear fecha de última actividad
  const formatLastActive = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return formatDate(date);
    }
  };

  // Manejar clic en desafío
  const handleChallengeClick = (challenge: Challenge) => {
    if (onChallengeClick) {
      onChallengeClick(challenge);
    }
  };

  // Filtrar por categoría
  const filterByCategory = (category: ChallengeCategory | null) => {
    setSelectedCategory(category);
  };

  // Filtrar por dificultad
  const filterByDifficulty = (difficulty: ChallengeDifficulty | null) => {
    setSelectedDifficulty(difficulty);
  };

  // Actualizar leaderboard
  const refreshLeaderboard = () => {
    if (challengeSystem) {
      challengeSystem.refreshLeaderboard();
    }
  };

  return (
    <div className={`challenge-board ${className || ''}`}>
      {/* Pestañas de navegación */}
      <div className="challenge-tabs">
        {showActiveChallenges && (
          <button
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Desafíos Activos ({activeChallenges.length})
          </button>
        )}

        {showCompletedChallenges && (
          <button
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completados ({completedChallenges.length})
          </button>
        )}

        {showLeaderboard && (
          <button
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Tabla de Clasificación
          </button>
        )}
      </div>

      {/* Filtros para desafíos */}
      {(activeTab === 'active' || activeTab === 'completed') && (
        <div className="challenge-filters">
          {/* Filtro de categorías */}
          <div className="filter-group">
            <span className="filter-label">Categoría:</span>
            <button
              className={`filter-button ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => filterByCategory(null)}
            >
              Todas
            </button>

            {getUniqueCategories().map((category) => (
              <button
                key={category}
                className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => filterByCategory(category)}
              >
                <span role="img" aria-hidden="true">
                  {getCategoryIcon(category)}
                </span>
                {getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* Filtro de dificultad */}
          <div className="filter-group">
            <span className="filter-label">Dificultad:</span>
            <button
              className={`filter-button ${selectedDifficulty === null ? 'active' : ''}`}
              onClick={() => filterByDifficulty(null)}
            >
              Todas
            </button>

            {getUniqueDifficulties().map((difficulty) => (
              <button
                key={difficulty}
                className={`filter-button ${selectedDifficulty === difficulty ? 'active' : ''}`}
                onClick={() => filterByDifficulty(difficulty)}
              >
                <span role="img" aria-hidden="true">
                  {getDifficultyIcon(difficulty)}
                </span>
                {getDifficultyName(difficulty)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido según pestaña activa */}
      <div className="challenge-content">
        {/* Desafíos activos */}
        {activeTab === 'active' && showActiveChallenges && (
          <div className={`challenges-container layout-${challengeLayout}`}>
            {getFilteredChallenges(activeChallenges).map((challenge) => (
              <div
                key={challenge.id}
                className={`challenge-item ${challenge.category} ${challenge.difficulty}`}
                onClick={() => handleChallengeClick(challenge)}
              >
                <div className="challenge-icon">
                  <img src={challenge.iconUrl} alt={challenge.name} />
                </div>
                <div className="challenge-info">
                  <div className="challenge-name">{challenge.name}</div>
                  <div className="challenge-description">{challenge.description}</div>
                  <div className="challenge-meta">
                    <span className="challenge-difficulty">
                      {getDifficultyIcon(challenge.difficulty)}
                    </span>
                    <span className="challenge-xp">+{challenge.xpReward} XP</span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="challenge-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${challenge.progress || 0}%` }}
                      />
                    </div>
                    <div className="progress-text">{challenge.progress || 0}% completado</div>
                  </div>
                </div>
              </div>
            ))}

            {getFilteredChallenges(activeChallenges).length === 0 && (
              <div className="no-challenges-message">
                No hay desafíos activos que coincidan con los filtros
              </div>
            )}
          </div>
        )}

        {/* Desafíos completados */}
        {activeTab === 'completed' && showCompletedChallenges && (
          <div className={`challenges-container layout-${challengeLayout}`}>
            {getFilteredChallenges(completedChallenges).map((challenge) => (
              <div
                key={challenge.id}
                className={`challenge-item completed ${challenge.category} ${challenge.difficulty}`}
                onClick={() => handleChallengeClick(challenge)}
              >
                <div className="challenge-icon">
                  <img src={challenge.iconUrl} alt={challenge.name} />
                  <div className="completed-badge">✓</div>
                </div>
                <div className="challenge-info">
                  <div className="challenge-name">{challenge.name}</div>
                  <div className="challenge-description">{challenge.description}</div>
                  <div className="challenge-meta">
                    <span className="challenge-difficulty">
                      {getDifficultyIcon(challenge.difficulty)}
                    </span>
                    <span className="challenge-xp">+{challenge.xpReward} XP</span>
                    {challenge.completedAt && (
                      <span className="challenge-date">
                        Completado: {formatDate(challenge.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {getFilteredChallenges(completedChallenges).length === 0 && (
              <div className="no-challenges-message">
                No hay desafíos completados que coincidan con los filtros
              </div>
            )}
          </div>
        )}

        {/* Tabla de clasificación */}
        {activeTab === 'leaderboard' && showLeaderboard && (
          <div className="leaderboard-container">
            <div className="leaderboard-header">
              <h3>Tabla de Clasificación</h3>
              <button className="refresh-button" onClick={refreshLeaderboard}>
                Actualizar
              </button>
            </div>

            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Usuario</th>
                  <th>Nivel</th>
                  <th>Puntuación</th>
                  <th>Desafíos</th>
                  <th>Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, leaderboardSize).map((entry, index) => (
                  <tr key={entry.userId} className={index < 3 ? `top-${index + 1}` : ''}>
                    <td className="position">{index + 1}</td>
                    <td className="user">
                      {entry.avatarUrl && (
                        <img src={entry.avatarUrl} alt={entry.username} className="user-avatar" />
                      )}
                      <span className="username">{entry.username}</span>
                    </td>
                    <td className="level">{entry.level}</td>
                    <td className="score">{entry.score}</td>
                    <td className="challenges">{entry.challengesCompleted}</td>
                    <td className="last-active">{formatLastActive(entry.lastActive)}</td>
                  </tr>
                ))}

                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={6} className="no-data">
                      No hay datos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeBoard;
