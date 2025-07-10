import React, { useState, useEffect } from 'react';

// Tipos
export interface ElevationEditorProps {
  onElevationChange?: (elevation: ElevationData) => void;
  initialElevation?: number;
  className?: string;
}

export interface ElevationData {
  averageHeight: number;
  slope?: number;
  points?: Array<{ x: number; y: number; z: number }>;
}

/**
 * Componente para editar la elevación del terreno
 */
export const ElevationEditor: React.FC<ElevationEditorProps> = ({
  onElevationChange,
  initialElevation = 0,
  className = '',
}) => {
  const [averageHeight, setAverageHeight] = useState(initialElevation);
  const [slope, setSlope] = useState(0);
  const [elevationPresets] = useState<Array<{ name: string; value: number }>>([
    { name: 'Plano', value: 0 },
    { name: 'Ligera pendiente', value: 2 },
    { name: 'Pendiente moderada', value: 5 },
    { name: 'Pendiente pronunciada', value: 10 },
  ]);

  // Notificar cambios en la elevación
  useEffect(() => {
    if (onElevationChange) {
      onElevationChange({
        averageHeight,
        slope,
      });
    }
  }, [averageHeight, slope, onElevationChange]);

  // Manejar cambio en la altura promedio
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAverageHeight(value);
    }
  };

  // Manejar cambio en la pendiente
  const handleSlopeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setSlope(value);
    }
  };

  // Aplicar preset de elevación
  const applyPreset = (preset: { name: string; value: number }) => {
    setSlope(preset.value);
  };

  return (
    <div className={`elevation-editor ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-primary-800 dark:text-accent-50">
        Elevación del Terreno
      </h2>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <label
            htmlFor="average-height"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Altura promedio (metros sobre nivel del mar)
          </label>
          <input
            id="average-height"
            type="number"
            min="0"
            step="0.1"
            value={averageHeight}
            onChange={handleHeightChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-800 dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Altura promedio del terreno en metros sobre el nivel del mar.
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="slope"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Pendiente (%)
          </label>
          <input
            id="slope"
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={slope}
            onChange={handleSlopeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
            <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
              {slope}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">30%</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Pendiente promedio del terreno en porcentaje.
          </p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Presets de pendiente
          </label>
          <div className="flex flex-wrap gap-2">
            {elevationPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`px-3 py-1 text-sm rounded-full ${
                  slope === preset.value
                    ? 'bg-primary-800 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {preset.name} ({preset.value}%)
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2 text-primary-800 dark:text-accent-100">
          Información de elevación
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Altura promedio</p>
            <p className="text-gray-800 dark:text-gray-200">{averageHeight} m.s.n.m.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendiente</p>
            <p className="text-gray-800 dark:text-gray-200">{slope}%</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Nota:</strong> En la versión completa, podrás visualizar un modelo 3D del
            terreno con la elevación configurada.
          </p>
        </div>
      </div>
    </div>
  );
};
