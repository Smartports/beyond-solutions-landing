import React, { useState } from 'react';
import { 
  MaterialCategory, 
  MaterialQualityLevel, 
  MaterialPreset, 
  Material,
  calculateMaterialsCost,
  calculateAnnualMaintenanceCost,
  calculateAverageLifespan
} from '../models/Materials';

// Presets simplificados para el ejemplo
const PRESET_BASIC: MaterialPreset = {
  id: 'basic',
  name: 'Básico',
  description: 'Materiales económicos y funcionales para proyectos con presupuesto limitado.',
  qualityLevel: MaterialQualityLevel.BASIC,
  costMultiplier: 1.0,
  materials: {} as Record<MaterialCategory, Material>
};

const PRESET_STANDARD: MaterialPreset = {
  id: 'standard',
  name: 'Estándar',
  description: 'Materiales de calidad media con buen balance entre costo y durabilidad.',
  qualityLevel: MaterialQualityLevel.STANDARD,
  costMultiplier: 1.5,
  materials: {} as Record<MaterialCategory, Material>
};

const PRESET_PREMIUM: MaterialPreset = {
  id: 'premium',
  name: 'Premium',
  description: 'Materiales de alta calidad con excelente durabilidad y acabados superiores.',
  qualityLevel: MaterialQualityLevel.PREMIUM,
  costMultiplier: 2.5,
  materials: {} as Record<MaterialCategory, Material>
};

const PRESET_ECO: MaterialPreset = {
  id: 'eco',
  name: 'Ecológico',
  description: 'Materiales sostenibles y ecoamigables con bajo impacto ambiental.',
  qualityLevel: MaterialQualityLevel.ECO,
  costMultiplier: 2.0,
  materials: {} as Record<MaterialCategory, Material>
};

const PRESETS = [PRESET_BASIC, PRESET_STANDARD, PRESET_PREMIUM, PRESET_ECO];

interface MaterialsSelectorProps {
  initialPreset?: MaterialPreset;
  onPresetChange: (preset: MaterialPreset) => void;
  areaM2: number;
}

export const MaterialsSelector: React.FC<MaterialsSelectorProps> = ({
  initialPreset,
  onPresetChange,
  areaM2
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset?.id || 'standard');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  
  const selectedPreset = PRESETS.find(p => p.id === selectedPresetId) || PRESET_STANDARD;
  
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      onPresetChange(preset);
    }
    setIsCustomMode(false);
  };
  
  const handleCustomModeToggle = () => {
    setIsCustomMode(!isCustomMode);
  };
  
  const materialsCost = calculateMaterialsCost(selectedPreset, areaM2);
  const annualMaintenance = calculateAnnualMaintenanceCost(selectedPreset, areaM2);
  const averageLifespan = calculateAverageLifespan(selectedPreset);
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Nivel de Materiales</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {PRESETS.map(preset => (
          <div 
            key={preset.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedPresetId === preset.id && !isCustomMode 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handlePresetChange(preset.id)}
          >
            <h3 className="font-semibold text-lg">{preset.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
            <div className="text-xs bg-gray-100 p-1 rounded">
              Factor de costo: {preset.costMultiplier}x
            </div>
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <button
          className={`px-4 py-2 rounded-lg transition-all ${
            isCustomMode 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
          onClick={handleCustomModeToggle}
        >
          {isCustomMode ? 'Modo Personalizado Activo' : 'Personalizar Materiales'}
        </button>
      </div>
      
      {isCustomMode && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Personalización de Materiales</h3>
          <p className="text-sm text-gray-600 mb-4">
            En un proyecto real, aquí podrías seleccionar materiales específicos para cada categoría.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(MaterialCategory).slice(0, 6).map(category => (
              <div key={category} className="border border-gray-100 rounded p-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getMaterialCategoryName(category)}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  defaultValue={MaterialQualityLevel.STANDARD}
                >
                  {Object.values(MaterialQualityLevel).map(level => (
                    <option key={level} value={level}>
                      {getMaterialQualityLevelName(level)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Costo Total de Materiales</p>
            <p className="text-lg font-semibold">${materialsCost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mantenimiento Anual</p>
            <p className="text-lg font-semibold">${annualMaintenance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vida Útil Promedio</p>
            <p className="text-lg font-semibold">{averageLifespan.toFixed(1)} años</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Funciones auxiliares para obtener nombres legibles
function getMaterialCategoryName(category: MaterialCategory): string {
  const names: Record<MaterialCategory, string> = {
    [MaterialCategory.FLOORING]: 'Pisos',
    [MaterialCategory.WALLS]: 'Paredes',
    [MaterialCategory.CEILINGS]: 'Techos',
    [MaterialCategory.DOORS]: 'Puertas',
    [MaterialCategory.WINDOWS]: 'Ventanas',
    [MaterialCategory.KITCHEN]: 'Cocina',
    [MaterialCategory.BATHROOM]: 'Baño',
    [MaterialCategory.LIGHTING]: 'Iluminación',
    [MaterialCategory.HVAC]: 'HVAC',
    [MaterialCategory.PLUMBING]: 'Plomería',
    [MaterialCategory.ELECTRICAL]: 'Eléctrico',
    [MaterialCategory.EXTERIOR]: 'Exterior'
  };
  return names[category] || category;
}

function getMaterialQualityLevelName(level: MaterialQualityLevel): string {
  const names: Record<MaterialQualityLevel, string> = {
    [MaterialQualityLevel.BASIC]: 'Básico',
    [MaterialQualityLevel.STANDARD]: 'Estándar',
    [MaterialQualityLevel.PREMIUM]: 'Premium',
    [MaterialQualityLevel.LUXURY]: 'Lujo',
    [MaterialQualityLevel.ECO]: 'Ecológico'
  };
  return names[level] || level;
}
