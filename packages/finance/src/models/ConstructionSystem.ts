/**
 * Tipos de estructura para el sistema constructivo
 */
export enum StructureType {
  CONCRETE_FRAME = 'concrete_frame',
  STEEL_FRAME = 'steel_frame',
  WOOD_FRAME = 'wood_frame',
  MASONRY = 'masonry',
  PREFABRICATED = 'prefabricated'
}

/**
 * Tipos de cerramientos para el sistema constructivo
 */
export enum EnclosureType {
  BRICK_WALL = 'brick_wall',
  CONCRETE_BLOCK = 'concrete_block',
  DRYWALL = 'drywall',
  GLASS_CURTAIN = 'glass_curtain',
  PREFAB_PANEL = 'prefab_panel',
  WOOD_PANEL = 'wood_panel'
}

/**
 * Tipos de cubiertas para el sistema constructivo
 */
export enum RoofingType {
  CONCRETE_SLAB = 'concrete_slab',
  METAL_DECK = 'metal_deck',
  TILE_ROOF = 'tile_roof',
  GREEN_ROOF = 'green_roof',
  SHINGLE_ROOF = 'shingle_roof'
}

/**
 * Tipos de sistemas MEP (Mecánico, Eléctrico, Plomería)
 */
export enum MepSystemType {
  BASIC = 'basic',
  STANDARD = 'standard',
  ADVANCED = 'advanced',
  SMART = 'smart',
  SUSTAINABLE = 'sustainable'
}

/**
 * Interfaz para el sistema constructivo
 */
export interface ConstructionSystem {
  structure: StructureType;
  enclosure: EnclosureType;
  roofing: RoofingType;
  mepSystem: MepSystemType;
  customizations?: Record<string, any>;
}

/**
 * Información de costos base para cada tipo de sistema constructivo
 */
export const CONSTRUCTION_SYSTEM_COSTS = {
  structure: {
    [StructureType.CONCRETE_FRAME]: { costPerM2: 250, timeMultiplier: 1.0 },
    [StructureType.STEEL_FRAME]: { costPerM2: 300, timeMultiplier: 0.8 },
    [StructureType.WOOD_FRAME]: { costPerM2: 180, timeMultiplier: 0.7 },
    [StructureType.MASONRY]: { costPerM2: 200, timeMultiplier: 1.2 },
    [StructureType.PREFABRICATED]: { costPerM2: 220, timeMultiplier: 0.6 }
  },
  enclosure: {
    [EnclosureType.BRICK_WALL]: { costPerM2: 80, timeMultiplier: 1.0 },
    [EnclosureType.CONCRETE_BLOCK]: { costPerM2: 70, timeMultiplier: 0.9 },
    [EnclosureType.DRYWALL]: { costPerM2: 50, timeMultiplier: 0.6 },
    [EnclosureType.GLASS_CURTAIN]: { costPerM2: 350, timeMultiplier: 0.8 },
    [EnclosureType.PREFAB_PANEL]: { costPerM2: 120, timeMultiplier: 0.5 },
    [EnclosureType.WOOD_PANEL]: { costPerM2: 90, timeMultiplier: 0.7 }
  },
  roofing: {
    [RoofingType.CONCRETE_SLAB]: { costPerM2: 150, timeMultiplier: 1.0 },
    [RoofingType.METAL_DECK]: { costPerM2: 120, timeMultiplier: 0.7 },
    [RoofingType.TILE_ROOF]: { costPerM2: 100, timeMultiplier: 0.9 },
    [RoofingType.GREEN_ROOF]: { costPerM2: 200, timeMultiplier: 1.2 },
    [RoofingType.SHINGLE_ROOF]: { costPerM2: 80, timeMultiplier: 0.8 }
  },
  mepSystem: {
    [MepSystemType.BASIC]: { costPerM2: 100, timeMultiplier: 1.0 },
    [MepSystemType.STANDARD]: { costPerM2: 150, timeMultiplier: 1.0 },
    [MepSystemType.ADVANCED]: { costPerM2: 250, timeMultiplier: 1.2 },
    [MepSystemType.SMART]: { costPerM2: 350, timeMultiplier: 1.3 },
    [MepSystemType.SUSTAINABLE]: { costPerM2: 300, timeMultiplier: 1.1 }
  }
};

/**
 * Calcula el costo base por m² para un sistema constructivo
 * @param system Sistema constructivo
 * @returns Costo base por m²
 */
export function calculateBaseConstructionCost(system: ConstructionSystem): number {
  const structureCost = CONSTRUCTION_SYSTEM_COSTS.structure[system.structure].costPerM2;
  const enclosureCost = CONSTRUCTION_SYSTEM_COSTS.enclosure[system.enclosure].costPerM2;
  const roofingCost = CONSTRUCTION_SYSTEM_COSTS.roofing[system.roofing].costPerM2;
  const mepCost = CONSTRUCTION_SYSTEM_COSTS.mepSystem[system.mepSystem].costPerM2;
  
  return structureCost + enclosureCost + roofingCost + mepCost;
}

/**
 * Calcula el tiempo estimado de construcción en semanas
 * @param system Sistema constructivo
 * @param areaM2 Área en metros cuadrados
 * @returns Tiempo estimado en semanas
 */
export function calculateConstructionTime(system: ConstructionSystem, areaM2: number): number {
  const structureTime = CONSTRUCTION_SYSTEM_COSTS.structure[system.structure].timeMultiplier;
  const enclosureTime = CONSTRUCTION_SYSTEM_COSTS.enclosure[system.enclosure].timeMultiplier;
  const roofingTime = CONSTRUCTION_SYSTEM_COSTS.roofing[system.roofing].timeMultiplier;
  const mepTime = CONSTRUCTION_SYSTEM_COSTS.mepSystem[system.mepSystem].timeMultiplier;
  
  // Base: 1 semana por cada 50m² con los multiplicadores aplicados
  const baseTime = areaM2 / 50;
  const timeMultiplier = (structureTime + enclosureTime + roofingTime + mepTime) / 4;
  
  return Math.ceil(baseTime * timeMultiplier);
}
