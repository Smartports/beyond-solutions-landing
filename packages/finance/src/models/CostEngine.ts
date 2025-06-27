import { ConstructionSystem, calculateBaseConstructionCost } from './ConstructionSystem';
import { MaterialPreset, calculateMaterialsCost } from './Materials';

/**
 * Tipos de costos directos
 */
export enum DirectCostType {
  LAND = 'land',
  CONSTRUCTION = 'construction',
  MATERIALS = 'materials',
  LABOR = 'labor',
  EQUIPMENT = 'equipment',
  PERMITS = 'permits'
}

/**
 * Tipos de costos indirectos
 */
export enum IndirectCostType {
  DESIGN = 'design',
  ENGINEERING = 'engineering',
  PROJECT_MANAGEMENT = 'project_management',
  SUPERVISION = 'supervision',
  LEGAL = 'legal',
  MARKETING = 'marketing',
  FINANCING = 'financing',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  CONTINGENCY = 'contingency'
}

/**
 * Interfaz para un costo directo
 */
export interface DirectCost {
  type: DirectCostType;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

/**
 * Interfaz para un costo indirecto
 */
export interface IndirectCost {
  type: IndirectCostType;
  name: string;
  percentage: number;
  baseAmount: number;
  amount: number;
  notes?: string;
}

/**
 * Interfaz para el presupuesto completo
 */
export interface Budget {
  projectId: string;
  projectName: string;
  totalArea: number;
  directCosts: Record<DirectCostType, DirectCost>;
  indirectCosts: Record<IndirectCostType, IndirectCost>;
  totalDirectCost: number;
  totalIndirectCost: number;
  totalCost: number;
  costPerM2: number;
  locationFactor: number;
  inflationFactor: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Factores de ubicación para ajustar costos por región
 */
export const LOCATION_FACTORS: Record<string, number> = {
  'urban_premium': 1.3,
  'urban': 1.0,
  'suburban': 0.9,
  'rural': 0.8,
  'remote': 0.7
};

/**
 * Factores de inflación para proyecciones temporales
 */
export const INFLATION_FACTORS: Record<number, number> = {
  0: 1.0,    // Año actual
  1: 1.03,   // 1 año después
  2: 1.06,   // 2 años después
  3: 1.09,   // 3 años después
  4: 1.12,   // 4 años después
  5: 1.15    // 5 años después
};

/**
 * Porcentajes por defecto para costos indirectos
 */
export const DEFAULT_INDIRECT_COST_PERCENTAGES: Record<IndirectCostType, number> = {
  [IndirectCostType.DESIGN]: 3.0,
  [IndirectCostType.ENGINEERING]: 2.5,
  [IndirectCostType.PROJECT_MANAGEMENT]: 5.0,
  [IndirectCostType.SUPERVISION]: 4.0,
  [IndirectCostType.LEGAL]: 1.5,
  [IndirectCostType.MARKETING]: 2.0,
  [IndirectCostType.FINANCING]: 3.5,
  [IndirectCostType.INSURANCE]: 1.0,
  [IndirectCostType.TAXES]: 2.0,
  [IndirectCostType.CONTINGENCY]: 5.0
};

/**
 * Calcula el presupuesto completo para un proyecto
 * @param projectId ID del proyecto
 * @param projectName Nombre del proyecto
 * @param areaM2 Área en metros cuadrados
 * @param constructionSystem Sistema constructivo seleccionado
 * @param materialPreset Preset de materiales seleccionado
 * @param landCost Costo del terreno (opcional)
 * @param locationFactor Factor de ubicación (opcional)
 * @param yearOffset Años de proyección para inflación (opcional)
 * @param indirectCostPercentages Porcentajes personalizados para costos indirectos (opcional)
 * @returns Presupuesto completo
 */
export function calculateBudget(
  projectId: string,
  projectName: string,
  areaM2: number,
  constructionSystem: ConstructionSystem,
  materialPreset: MaterialPreset,
  landCost: number = 0,
  locationFactor: number = 1.0,
  yearOffset: number = 0,
  indirectCostPercentages: Partial<Record<IndirectCostType, number>> = {}
): Budget {
  // Aplicar factores de ajuste
  const inflationFactor = INFLATION_FACTORS[yearOffset] || 1.0;
  
  // Calcular costos directos base
  const baseConstructionCost = calculateBaseConstructionCost(constructionSystem);
  const baseMaterialsCost = calculateMaterialsCost(materialPreset, areaM2);
  
  // Aplicar factores a los costos base
  const adjustedConstructionCost = baseConstructionCost * areaM2 * locationFactor * inflationFactor;
  const adjustedMaterialsCost = baseMaterialsCost * locationFactor * inflationFactor;
  
  // Calcular costos de mano de obra y equipos (estimaciones simplificadas)
  const laborCost = adjustedConstructionCost * 0.4; // 40% del costo de construcción
  const equipmentCost = adjustedConstructionCost * 0.15; // 15% del costo de construcción
  const permitsCost = adjustedConstructionCost * 0.05; // 5% del costo de construcción
  
  // Crear objeto de costos directos
  const directCosts: Record<DirectCostType, DirectCost> = {
    [DirectCostType.LAND]: {
      type: DirectCostType.LAND,
      name: 'Terreno',
      amount: landCost,
      unit: 'total'
    },
    [DirectCostType.CONSTRUCTION]: {
      type: DirectCostType.CONSTRUCTION,
      name: 'Construcción',
      amount: adjustedConstructionCost,
      unit: 'total'
    },
    [DirectCostType.MATERIALS]: {
      type: DirectCostType.MATERIALS,
      name: 'Materiales',
      amount: adjustedMaterialsCost,
      unit: 'total'
    },
    [DirectCostType.LABOR]: {
      type: DirectCostType.LABOR,
      name: 'Mano de Obra',
      amount: laborCost,
      unit: 'total'
    },
    [DirectCostType.EQUIPMENT]: {
      type: DirectCostType.EQUIPMENT,
      name: 'Equipos',
      amount: equipmentCost,
      unit: 'total'
    },
    [DirectCostType.PERMITS]: {
      type: DirectCostType.PERMITS,
      name: 'Permisos',
      amount: permitsCost,
      unit: 'total'
    }
  };
  
  // Calcular total de costos directos
  const totalDirectCost = Object.values(directCosts).reduce((sum, cost) => sum + cost.amount, 0);
  
  // Calcular costos indirectos
  const indirectCosts: Record<IndirectCostType, IndirectCost> = {} as Record<IndirectCostType, IndirectCost>;
  let totalIndirectCost = 0;
  
  Object.values(IndirectCostType).forEach(costType => {
    // Usar porcentaje personalizado si existe, o el valor por defecto
    const percentage = indirectCostPercentages[costType] !== undefined 
      ? indirectCostPercentages[costType]! 
      : DEFAULT_INDIRECT_COST_PERCENTAGES[costType];
    
    const amount = totalDirectCost * (percentage / 100);
    
    indirectCosts[costType] = {
      type: costType,
      name: getCostTypeName(costType),
      percentage,
      baseAmount: totalDirectCost,
      amount
    };
    
    totalIndirectCost += amount;
  });
  
  // Calcular totales
  const totalCost = totalDirectCost + totalIndirectCost;
  const costPerM2 = areaM2 > 0 ? totalCost / areaM2 : 0;
  
  // Crear presupuesto
  const budget: Budget = {
    projectId,
    projectName,
    totalArea: areaM2,
    directCosts,
    indirectCosts,
    totalDirectCost,
    totalIndirectCost,
    totalCost,
    costPerM2,
    locationFactor,
    inflationFactor,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return budget;
}

/**
 * Obtiene el nombre descriptivo para un tipo de costo
 * @param costType Tipo de costo
 * @returns Nombre descriptivo
 */
function getCostTypeName(costType: IndirectCostType): string {
  const names: Record<IndirectCostType, string> = {
    [IndirectCostType.DESIGN]: 'Diseño',
    [IndirectCostType.ENGINEERING]: 'Ingeniería',
    [IndirectCostType.PROJECT_MANAGEMENT]: 'Gestión de Proyecto',
    [IndirectCostType.SUPERVISION]: 'Supervisión',
    [IndirectCostType.LEGAL]: 'Legal',
    [IndirectCostType.MARKETING]: 'Marketing',
    [IndirectCostType.FINANCING]: 'Financiamiento',
    [IndirectCostType.INSURANCE]: 'Seguros',
    [IndirectCostType.TAXES]: 'Impuestos',
    [IndirectCostType.CONTINGENCY]: 'Contingencia'
  };
  
  return names[costType] || costType;
}

/**
 * Calcula el desglose detallado de partidas
 * @param budget Presupuesto calculado
 * @returns Desglose detallado de partidas
 */
export function calculateDetailedBreakdown(budget: Budget): Record<string, number> {
  // Implementación simplificada para desglose de partidas
  const breakdown: Record<string, number> = {};
  
  // Desglosar construcción
  const constructionCost = budget.directCosts[DirectCostType.CONSTRUCTION].amount;
  breakdown['Cimentación'] = constructionCost * 0.15;
  breakdown['Estructura'] = constructionCost * 0.25;
  breakdown['Cerramientos'] = constructionCost * 0.20;
  breakdown['Cubiertas'] = constructionCost * 0.10;
  breakdown['Instalaciones MEP'] = constructionCost * 0.30;
  
  // Desglosar materiales
  const materialsCost = budget.directCosts[DirectCostType.MATERIALS].amount;
  breakdown['Materiales estructurales'] = materialsCost * 0.30;
  breakdown['Acabados'] = materialsCost * 0.40;
  breakdown['Equipamiento'] = materialsCost * 0.30;
  
  return breakdown;
}
