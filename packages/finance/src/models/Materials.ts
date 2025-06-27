/**
 * Categorías de materiales
 */
export enum MaterialCategory {
  FLOORING = 'flooring',
  WALLS = 'walls',
  CEILINGS = 'ceilings',
  DOORS = 'doors',
  WINDOWS = 'windows',
  KITCHEN = 'kitchen',
  BATHROOM = 'bathroom',
  LIGHTING = 'lighting',
  HVAC = 'hvac',
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  EXTERIOR = 'exterior'
}

/**
 * Niveles de calidad para materiales
 */
export enum MaterialQualityLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  LUXURY = 'luxury',
  ECO = 'eco'
}

/**
 * Interfaz para un material
 */
export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  qualityLevel: MaterialQualityLevel;
  costPerUnit: number;
  unit: string;
  description: string;
  imageUrl?: string;
  ecoFriendly: boolean;
  durabilityYears: number;
  maintenanceCostPerYear: number;
}

/**
 * Interfaz para un preset de materiales
 */
export interface MaterialPreset {
  id: string;
  name: string;
  description: string;
  qualityLevel: MaterialQualityLevel;
  costMultiplier: number;
  materials: Record<MaterialCategory, Material>;
}

/**
 * Calcula el costo total de materiales según el preset y área
 * @param preset Preset de materiales seleccionado
 * @param areaM2 Área en metros cuadrados
 * @returns Costo total de materiales
 */
export function calculateMaterialsCost(preset: MaterialPreset, areaM2: number): number {
  // Factor base por m²
  const baseCostPerM2 = 200; // Costo base de materiales por m²
  
  // Aplicar multiplicador del preset
  const totalCost = baseCostPerM2 * preset.costMultiplier * areaM2;
  
  return totalCost;
}

/**
 * Estima el costo de mantenimiento anual según los materiales seleccionados
 * @param preset Preset de materiales seleccionado
 * @param areaM2 Área en metros cuadrados
 * @returns Costo anual de mantenimiento
 */
export function calculateAnnualMaintenanceCost(preset: MaterialPreset, areaM2: number): number {
  // Calcular promedio de costo de mantenimiento por m²
  let totalMaintenanceCost = 0;
  
  Object.values(preset.materials).forEach(material => {
    totalMaintenanceCost += material.maintenanceCostPerYear;
  });
  
  const avgMaintenanceCostPerM2 = totalMaintenanceCost / Object.keys(preset.materials).length;
  
  // Aplicar al área
  return avgMaintenanceCostPerM2 * areaM2;
}

/**
 * Calcula la vida útil promedio de los materiales
 * @param preset Preset de materiales seleccionado
 * @returns Vida útil promedio en años
 */
export function calculateAverageLifespan(preset: MaterialPreset): number {
  let totalLifespan = 0;
  
  Object.values(preset.materials).forEach(material => {
    totalLifespan += material.durabilityYears;
  });
  
  return totalLifespan / Object.keys(preset.materials).length;
}
