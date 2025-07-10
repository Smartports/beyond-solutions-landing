import React, { useState, useEffect } from 'react';

/**
 * Props para el componente LayerSelector
 */
export interface LayerSelectorProps {
  /**
   * Lista de capas disponibles
   */
  layers: string[];

  /**
   * Capas seleccionadas inicialmente
   */
  initialSelected?: string[];

  /**
   * Callback cuando cambia la selección
   */
  onChange?: (selectedLayers: string[]) => void;

  /**
   * Permitir selección múltiple
   */
  multiple?: boolean;

  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente para seleccionar capas
 */
export const LayerSelector: React.FC<LayerSelectorProps> = ({
  layers,
  initialSelected = [],
  onChange,
  multiple = true,
  className = '',
}) => {
  const [selectedLayers, setSelectedLayers] = useState<string[]>(initialSelected);

  // Actualizar selección cuando cambian las props
  useEffect(() => {
    setSelectedLayers(initialSelected);
  }, [initialSelected]);

  /**
   * Maneja el cambio en la selección de una capa
   */
  const handleLayerChange = (layer: string, checked: boolean) => {
    let newSelectedLayers: string[];

    if (multiple) {
      // Modo múltiple
      if (checked) {
        newSelectedLayers = [...selectedLayers, layer];
      } else {
        newSelectedLayers = selectedLayers.filter((l) => l !== layer);
      }
    } else {
      // Modo único
      newSelectedLayers = checked ? [layer] : [];
    }

    setSelectedLayers(newSelectedLayers);

    // Notificar al padre
    if (onChange) {
      onChange(newSelectedLayers);
    }
  };

  /**
   * Selecciona o deselecciona todas las capas
   */
  const handleSelectAll = (select: boolean) => {
    const newSelectedLayers = select ? [...layers] : [];
    setSelectedLayers(newSelectedLayers);

    // Notificar al padre
    if (onChange) {
      onChange(newSelectedLayers);
    }
  };

  return (
    <div className={`layer-selector ${className}`}>
      {multiple && layers.length > 1 && (
        <div className="layer-selector-actions">
          <button
            onClick={() => handleSelectAll(true)}
            className="layer-selector-button"
            disabled={selectedLayers.length === layers.length}
          >
            Seleccionar todo
          </button>
          <button
            onClick={() => handleSelectAll(false)}
            className="layer-selector-button"
            disabled={selectedLayers.length === 0}
          >
            Deseleccionar todo
          </button>
        </div>
      )}

      <div className="layer-selector-list">
        {layers.map((layer) => (
          <label key={layer} className="layer-selector-item">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={multiple ? undefined : 'layer-selector'}
              checked={selectedLayers.includes(layer)}
              onChange={(e) => handleLayerChange(layer, e.target.checked)}
            />
            {layer}
          </label>
        ))}
      </div>
    </div>
  );
};
