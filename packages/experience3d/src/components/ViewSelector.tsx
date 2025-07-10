import React, { useState, useEffect } from 'react';
import { ViewManager, ViewPoint, ViewType } from '../models/ViewManager';

interface ViewSelectorProps {
  viewManager: ViewManager;
  className?: string;
  layout?: 'list' | 'grid' | 'tabs';
  showThumbnails?: boolean;
  showTypes?: boolean;
  filterType?: ViewType;
  onViewSelected?: (viewPoint: ViewPoint) => void;
}

/**
 * Componente para seleccionar vistas predefinidas
 */
const ViewSelector: React.FC<ViewSelectorProps> = ({
  viewManager,
  className,
  layout = 'list',
  showThumbnails = true,
  showTypes = true,
  filterType,
  onViewSelected,
}) => {
  const [viewPoints, setViewPoints] = useState<ViewPoint[]>([]);
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ViewType | null>(filterType || null);

  // Cargar puntos de vista cuando el componente se monta
  useEffect(() => {
    if (viewManager) {
      const points = filterType
        ? viewManager.getViewPointsByType(filterType)
        : viewManager.getViewPoints();

      setViewPoints(points);

      // Establecer vista actual si existe
      const currentView = viewManager.getCurrentViewPoint();
      if (currentView) {
        setSelectedViewId(currentView.id);
      }
    }
  }, [viewManager, filterType]);

  // Cambiar filtro de tipo
  const handleTypeChange = (type: ViewType | null) => {
    setActiveType(type);

    if (viewManager) {
      const points = type ? viewManager.getViewPointsByType(type) : viewManager.getViewPoints();

      setViewPoints(points);
    }
  };

  // Ir a una vista
  const goToView = (viewPoint: ViewPoint) => {
    if (viewManager) {
      const success = viewManager.goToView(viewPoint.id);

      if (success) {
        setSelectedViewId(viewPoint.id);

        if (onViewSelected) {
          onViewSelected(viewPoint);
        }
      }
    }
  };

  // Obtener icono para tipo de vista
  const getTypeIcon = (type: ViewType): string => {
    switch (type) {
      case ViewType.EXTERIOR:
        return '🏠';
      case ViewType.INTERIOR:
        return '🛋️';
      default:
        return '🔍';
    }
  };

  // Obtener nombre para tipo de vista
  const getTypeName = (type: ViewType): string => {
    switch (type) {
      case ViewType.EXTERIOR:
        return 'Exterior';
      case ViewType.INTERIOR:
        return 'Interior';
      default:
        return 'Otro';
    }
  };

  // Obtener todos los tipos únicos
  const getUniqueTypes = (): ViewType[] => {
    if (!viewManager) return [];

    const allViews = viewManager.getViewPoints();
    const types = new Set<ViewType>();

    allViews.forEach((view) => types.add(view.type));

    return Array.from(types);
  };

  return (
    <div className={`view-selector layout-${layout} ${className || ''}`}>
      {/* Filtro por tipos si está habilitado */}
      {showTypes && (
        <div className="view-type-filter">
          <button
            className={`type-button ${activeType === null ? 'active' : ''}`}
            onClick={() => handleTypeChange(null)}
          >
            Todos
          </button>

          {getUniqueTypes().map((type) => (
            <button
              key={type}
              className={`type-button ${activeType === type ? 'active' : ''}`}
              onClick={() => handleTypeChange(type)}
            >
              <span role="img" aria-hidden="true">
                {getTypeIcon(type)}
              </span>
              {getTypeName(type)}
            </button>
          ))}
        </div>
      )}

      {/* Lista de vistas */}
      <div className={`view-points-container layout-${layout}`}>
        {viewPoints.map((viewPoint) => (
          <div
            key={viewPoint.id}
            className={`view-point-item ${selectedViewId === viewPoint.id ? 'selected' : ''}`}
            onClick={() => goToView(viewPoint)}
          >
            {showThumbnails && viewPoint.thumbnail && (
              <div className="view-thumbnail">
                <img src={viewPoint.thumbnail} alt={viewPoint.name} />
              </div>
            )}

            <div className="view-info">
              <div className="view-name">
                <span role="img" aria-hidden="true">
                  {getTypeIcon(viewPoint.type)}
                </span>
                {viewPoint.name}
              </div>

              {viewPoint.description && (
                <div className="view-description">{viewPoint.description}</div>
              )}

              {viewPoint.tags && viewPoint.tags.length > 0 && (
                <div className="view-tags">
                  {viewPoint.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {viewPoints.length === 0 && (
          <div className="no-views-message">No hay vistas disponibles</div>
        )}
      </div>
    </div>
  );
};

export default ViewSelector;
