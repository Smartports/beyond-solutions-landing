import React, { useState } from 'react';
import { 
  StructureType, 
  EnclosureType, 
  RoofingType, 
  MepSystemType, 
  ConstructionSystem,
  calculateBaseConstructionCost,
  calculateConstructionTime,
  CONSTRUCTION_SYSTEM_COSTS
} from '../models/ConstructionSystem';

interface ConstructionSystemSelectorProps {
  initialSystem?: ConstructionSystem;
  onSystemChange: (system: ConstructionSystem) => void;
  areaM2: number;
}

export const ConstructionSystemSelector: React.FC<ConstructionSystemSelectorProps> = ({
  initialSystem,
  onSystemChange,
  areaM2
}) => {
  const [system, setSystem] = useState<ConstructionSystem>(initialSystem || {
    structure: StructureType.CONCRETE_FRAME,
    enclosure: EnclosureType.BRICK_WALL,
    roofing: RoofingType.CONCRETE_SLAB,
    mepSystem: MepSystemType.STANDARD
  });
  
  const handleChange = (field: keyof ConstructionSystem, value: any) => {
    const updatedSystem = {
      ...system,
      [field]: value
    };
    setSystem(updatedSystem);
    onSystemChange(updatedSystem);
  };
  
  const baseCost = calculateBaseConstructionCost(system);
  const totalCost = baseCost * areaM2;
  const constructionTime = calculateConstructionTime(system, areaM2);
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Sistema Constructivo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Estructura
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={system.structure}
            onChange={(e) => handleChange('structure', e.target.value)}
          >
            {Object.values(StructureType).map(type => (
              <option key={type} value={type}>
                {getStructureTypeName(type)} (${CONSTRUCTION_SYSTEM_COSTS.structure[type].costPerM2}/m²)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Cerramiento
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={system.enclosure}
            onChange={(e) => handleChange('enclosure', e.target.value)}
          >
            {Object.values(EnclosureType).map(type => (
              <option key={type} value={type}>
                {getEnclosureTypeName(type)} (${CONSTRUCTION_SYSTEM_COSTS.enclosure[type].costPerM2}/m²)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Cubierta
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={system.roofing}
            onChange={(e) => handleChange('roofing', e.target.value)}
          >
            {Object.values(RoofingType).map(type => (
              <option key={type} value={type}>
                {getRoofingTypeName(type)} (${CONSTRUCTION_SYSTEM_COSTS.roofing[type].costPerM2}/m²)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sistema MEP
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={system.mepSystem}
            onChange={(e) => handleChange('mepSystem', e.target.value)}
          >
            {Object.values(MepSystemType).map(type => (
              <option key={type} value={type}>
                {getMepSystemTypeName(type)} (${CONSTRUCTION_SYSTEM_COSTS.mepSystem[type].costPerM2}/m²)
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Costo Base por m²</p>
            <p className="text-lg font-semibold">${baseCost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Costo Total Estimado</p>
            <p className="text-lg font-semibold">${totalCost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tiempo Estimado</p>
            <p className="text-lg font-semibold">{constructionTime} semanas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Funciones auxiliares para obtener nombres legibles
function getStructureTypeName(type: StructureType): string {
  const names: Record<StructureType, string> = {
    [StructureType.CONCRETE_FRAME]: 'Estructura de Concreto',
    [StructureType.STEEL_FRAME]: 'Estructura de Acero',
    [StructureType.WOOD_FRAME]: 'Estructura de Madera',
    [StructureType.MASONRY]: 'Mampostería',
    [StructureType.PREFABRICATED]: 'Prefabricado'
  };
  return names[type] || type;
}

function getEnclosureTypeName(type: EnclosureType): string {
  const names: Record<EnclosureType, string> = {
    [EnclosureType.BRICK_WALL]: 'Muro de Ladrillo',
    [EnclosureType.CONCRETE_BLOCK]: 'Bloque de Concreto',
    [EnclosureType.DRYWALL]: 'Panel de Yeso',
    [EnclosureType.GLASS_CURTAIN]: 'Muro Cortina',
    [EnclosureType.PREFAB_PANEL]: 'Panel Prefabricado',
    [EnclosureType.WOOD_PANEL]: 'Panel de Madera'
  };
  return names[type] || type;
}

function getRoofingTypeName(type: RoofingType): string {
  const names: Record<RoofingType, string> = {
    [RoofingType.CONCRETE_SLAB]: 'Losa de Concreto',
    [RoofingType.METAL_DECK]: 'Cubierta Metálica',
    [RoofingType.TILE_ROOF]: 'Techo de Tejas',
    [RoofingType.GREEN_ROOF]: 'Techo Verde',
    [RoofingType.SHINGLE_ROOF]: 'Techo de Tejas Asfálticas'
  };
  return names[type] || type;
}

function getMepSystemTypeName(type: MepSystemType): string {
  const names: Record<MepSystemType, string> = {
    [MepSystemType.BASIC]: 'MEP Básico',
    [MepSystemType.STANDARD]: 'MEP Estándar',
    [MepSystemType.ADVANCED]: 'MEP Avanzado',
    [MepSystemType.SMART]: 'MEP Inteligente',
    [MepSystemType.SUSTAINABLE]: 'MEP Sostenible'
  };
  return names[type] || type;
}
