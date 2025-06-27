import { Budget, calculateBudget } from './CostEngine';
import { ConstructionSystem } from './ConstructionSystem';
import { MaterialPreset } from './Materials';
import { SalesProjectionConfig, generateSalesProjection, distributeConstructionCosts } from './SalesProjection';
import { FinancingScheme, createFinancingScheme, FinancingType } from './FinancingModel';
import { FinancialKPIs, calculateAllKPIs } from './FinancialKPIs';

/**
 * Tipos de escenarios predefinidos
 */
export enum ScenarioType {
  OPTIMISTIC = 'optimistic',
  REALISTIC = 'realistic',
  PESSIMISTIC = 'pessimistic',
  CUSTOM = 'custom'
}

/**
 * Interfaz para un escenario completo
 */
export interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  constructionSystem: ConstructionSystem;
  materialPreset: MaterialPreset;
  salesConfig: SalesProjectionConfig;
  financingScheme: FinancingScheme;
  budget: Budget;
  salesProjection: any; // SalesProjectionResult
  kpis: FinancialKPIs;
}

/**
 * Interfaz para la configuración de un escenario
 */
export interface ScenarioConfig {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  constructionSystem: ConstructionSystem;
  materialPreset: MaterialPreset;
  projectId: string;
  projectName: string;
  totalAreaM2: number;
  landCost: number;
  locationFactor: number;
  salesConfig: {
    totalUnits: number;
    unitPrice: number;
    salesStartDate: Date;
    salesVelocity: number;
    priceIncreaseRate: number;
    reservationFee: number;
    downPayment: number;
    installmentMonths: number;
    projectDuration: number;
  };
  financingConfig: {
    type: FinancingType;
    downPaymentPercentage: number;
    interestRate: number;
    term: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'annually';
    originationFee: number;
  };
  discountRate: number;
}

/**
 * Crea un escenario predefinido basado en el tipo
 * @param type Tipo de escenario
 * @param baseConfig Configuración base para personalizar
 * @returns Configuración del escenario
 */
export function createPredefinedScenario(
  type: ScenarioType,
  baseConfig: Partial<ScenarioConfig>
): ScenarioConfig {
  // Valores por defecto para cada tipo de escenario
  const defaults: Record<ScenarioType, Partial<ScenarioConfig>> = {
    [ScenarioType.OPTIMISTIC]: {
      name: 'Escenario Optimista',
      description: 'Proyección con condiciones favorables de mercado y ventas aceleradas.',
      salesConfig: {
        salesVelocity: baseConfig.salesConfig?.totalUnits ? baseConfig.salesConfig.totalUnits / 12 : 5,
        priceIncreaseRate: 5.0,
        projectDuration: 24
      },
      financingConfig: {
        interestRate: 7.5,
        downPaymentPercentage: 15
      },
      locationFactor: 1.1,
      discountRate: 8
    } as Partial<ScenarioConfig>,
    [ScenarioType.REALISTIC]: {
      name: 'Escenario Realista',
      description: 'Proyección con condiciones normales de mercado y ventas estables.',
      salesConfig: {
        salesVelocity: baseConfig.salesConfig?.totalUnits ? baseConfig.salesConfig.totalUnits / 18 : 3,
        priceIncreaseRate: 3.0,
        projectDuration: 30
      },
      financingConfig: {
        interestRate: 8.5,
        downPaymentPercentage: 20
      },
      locationFactor: 1.0,
      discountRate: 10
    } as Partial<ScenarioConfig>,
    [ScenarioType.PESSIMISTIC]: {
      name: 'Escenario Pesimista',
      description: 'Proyección con condiciones desfavorables de mercado y ventas lentas.',
      salesConfig: {
        salesVelocity: baseConfig.salesConfig?.totalUnits ? baseConfig.salesConfig.totalUnits / 24 : 2,
        priceIncreaseRate: 1.5,
        projectDuration: 36
      },
      financingConfig: {
        interestRate: 9.5,
        downPaymentPercentage: 25
      },
      locationFactor: 0.9,
      discountRate: 12
    } as Partial<ScenarioConfig>,
    [ScenarioType.CUSTOM]: {
      name: 'Escenario Personalizado',
      description: 'Proyección personalizada con parámetros definidos por el usuario.'
    } as Partial<ScenarioConfig>
  };
  
  // Crear ID único si no se proporciona
  const id = baseConfig.id || `scenario-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Combinar valores por defecto con configuración base
  const config: ScenarioConfig = {
    id,
    type,
    name: defaults[type]?.name || 'Escenario',
    description: defaults[type]?.description || '',
    constructionSystem: baseConfig.constructionSystem!,
    materialPreset: baseConfig.materialPreset!,
    projectId: baseConfig.projectId || 'project-default',
    projectName: baseConfig.projectName || 'Proyecto Sin Nombre',
    totalAreaM2: baseConfig.totalAreaM2 || 1000,
    landCost: baseConfig.landCost || 0,
    locationFactor: defaults[type]?.locationFactor || baseConfig.locationFactor || 1.0,
    salesConfig: {
      totalUnits: baseConfig.salesConfig?.totalUnits || 50,
      unitPrice: baseConfig.salesConfig?.unitPrice || 200000,
      salesStartDate: baseConfig.salesConfig?.salesStartDate || new Date(),
      salesVelocity: defaults[type]?.salesConfig?.salesVelocity || baseConfig.salesConfig?.salesVelocity || 3,
      priceIncreaseRate: defaults[type]?.salesConfig?.priceIncreaseRate || baseConfig.salesConfig?.priceIncreaseRate || 3.0,
      reservationFee: baseConfig.salesConfig?.reservationFee || 5,
      downPayment: baseConfig.salesConfig?.downPayment || 15,
      installmentMonths: baseConfig.salesConfig?.installmentMonths || 12,
      projectDuration: defaults[type]?.salesConfig?.projectDuration || baseConfig.salesConfig?.projectDuration || 30
    },
    financingConfig: {
      type: baseConfig.financingConfig?.type || FinancingType.TRADITIONAL_MORTGAGE,
      downPaymentPercentage: defaults[type]?.financingConfig?.downPaymentPercentage || baseConfig.financingConfig?.downPaymentPercentage || 20,
      interestRate: defaults[type]?.financingConfig?.interestRate || baseConfig.financingConfig?.interestRate || 8.5,
      term: baseConfig.financingConfig?.term || 20,
      paymentFrequency: baseConfig.financingConfig?.paymentFrequency || 'monthly',
      originationFee: baseConfig.financingConfig?.originationFee || 1.5
    },
    discountRate: defaults[type]?.discountRate || baseConfig.discountRate || 10
  };
  
  return config;
}

/**
 * Simula un escenario completo
 * @param config Configuración del escenario
 * @returns Escenario simulado
 */
export function simulateScenario(config: ScenarioConfig): Scenario {
  // Calcular presupuesto
  const budget = calculateBudget(
    config.projectId,
    config.projectName,
    config.totalAreaM2,
    config.constructionSystem,
    config.materialPreset,
    config.landCost,
    config.locationFactor
  );
  
  // Crear esquema de financiamiento
  const financingScheme = createFinancingScheme(
    config.financingConfig.type,
    budget.totalCost,
    config.financingConfig.downPaymentPercentage,
    config.financingConfig.interestRate,
    config.financingConfig.term,
    config.financingConfig.paymentFrequency,
    config.financingConfig.originationFee
  );
  
  // Distribuir costos de construcción
  const constructionCosts = distributeConstructionCosts(
    budget.directCosts.construction.amount,
    config.salesConfig.projectDuration,
    'bell'
  );
  
  // Distribuir costos indirectos (más uniformes)
  const indirectCosts = distributeConstructionCosts(
    budget.totalIndirectCost,
    config.salesConfig.projectDuration,
    'linear'
  );
  
  // Generar proyección de ventas
  const salesProjection = generateSalesProjection(
    config.salesConfig,
    constructionCosts,
    indirectCosts
  );
  
  // Calcular KPIs financieros
  const kpis = calculateAllKPIs(
    salesProjection.cashFlow,
    salesProjection.metrics.totalRevenue,
    budget.totalCost,
    budget.directCosts.land.amount + budget.totalDirectCost * 0.3, // Inversión inicial: terreno + 30% de costos directos
    config.discountRate,
    config.totalAreaM2,
    financingScheme.loanAmount * 0.08, // Estimación simple del servicio anual de deuda
    salesProjection.metrics.totalRevenue * 0.7 // Estimación simple del ingreso operativo
  );
  
  // Crear escenario completo
  const scenario: Scenario = {
    id: config.id,
    name: config.name,
    type: config.type,
    description: config.description,
    constructionSystem: config.constructionSystem,
    materialPreset: config.materialPreset,
    salesConfig: config.salesConfig,
    financingScheme,
    budget,
    salesProjection,
    kpis
  };
  
  return scenario;
}

/**
 * Compara múltiples escenarios
 * @param scenarios Array de escenarios a comparar
 * @returns Objeto con comparativas
 */
export function compareScenarios(scenarios: Scenario[]): Record<string, any> {
  if (scenarios.length === 0) return {};
  
  const comparison: Record<string, any> = {
    scenarios: {},
    kpiComparison: {},
    bestScenarios: {}
  };
  
  // Recopilar datos de cada escenario
  scenarios.forEach(scenario => {
    comparison.scenarios[scenario.id] = {
      name: scenario.name,
      type: scenario.type,
      totalCost: scenario.budget.totalCost,
      totalRevenue: scenario.salesProjection.metrics.totalRevenue,
      profit: scenario.salesProjection.metrics.totalRevenue - scenario.budget.totalCost,
      roi: scenario.kpis.roi,
      irr: scenario.kpis.irr,
      paybackPeriod: scenario.kpis.paybackPeriod,
      breakEvenMonth: scenario.salesProjection.metrics.breakEvenMonth
    };
  });
  
  // Comparar KPIs específicos
  const kpiKeys: (keyof FinancialKPIs)[] = ['roi', 'irr', 'npv', 'paybackPeriod', 'profitMargin'];
  
  kpiKeys.forEach(kpi => {
    comparison.kpiComparison[kpi] = scenarios.map(s => ({
      scenarioId: s.id,
      scenarioName: s.name,
      value: s.kpis[kpi]
    }));
    
    // Ordenar según el KPI (algunos son mejores cuando son más altos, otros cuando son más bajos)
    if (kpi === 'paybackPeriod') {
      comparison.kpiComparison[kpi].sort((a: any, b: any) => a.value - b.value);
    } else {
      comparison.kpiComparison[kpi].sort((a: any, b: any) => b.value - a.value);
    }
  });
  
  // Identificar mejores escenarios por categoría
  comparison.bestScenarios = {
    highestROI: findBestScenario(scenarios, 'roi', 'max'),
    highestIRR: findBestScenario(scenarios, 'irr', 'max'),
    highestNPV: findBestScenario(scenarios, 'npv', 'max'),
    fastestPayback: findBestScenario(scenarios, 'paybackPeriod', 'min'),
    highestMargin: findBestScenario(scenarios, 'profitMargin', 'max')
  };
  
  return comparison;
}

/**
 * Encuentra el mejor escenario según un KPI específico
 * @param scenarios Array de escenarios
 * @param kpi KPI a evaluar
 * @param criteria Criterio de evaluación ('max' o 'min')
 * @returns Mejor escenario
 */
function findBestScenario(
  scenarios: Scenario[],
  kpi: keyof FinancialKPIs,
  criteria: 'max' | 'min'
): { scenarioId: string; scenarioName: string; value: number } | null {
  if (scenarios.length === 0) return null;
  
  let bestScenario = scenarios[0];
  let bestValue = scenarios[0].kpis[kpi];
  
  for (let i = 1; i < scenarios.length; i++) {
    const currentValue = scenarios[i].kpis[kpi];
    
    if ((criteria === 'max' && currentValue > bestValue) || 
        (criteria === 'min' && currentValue < bestValue)) {
      bestScenario = scenarios[i];
      bestValue = currentValue;
    }
  }
  
  return {
    scenarioId: bestScenario.id,
    scenarioName: bestScenario.name,
    value: bestValue
  };
}

/**
 * Genera una proyección a 5 años para un escenario
 * @param scenario Escenario base
 * @returns Proyección a 5 años
 */
export function generateFiveYearProjection(scenario: Scenario): Record<string, any> {
  const projection: Record<string, any> = {
    years: {},
    cumulativeValues: {
      revenue: 0,
      costs: 0,
      profit: 0,
      cashFlow: 0
    }
  };
  
  // Agrupar datos mensuales por año
  const yearlyData: Record<number, {
    revenue: number;
    costs: number;
    profit: number;
    cashFlow: number;
  }> = {};
  
  // Inicializar años
  for (let year = 1; year <= 5; year++) {
    yearlyData[year] = {
      revenue: 0,
      costs: 0,
      profit: 0,
      cashFlow: 0
    };
  }
  
  // Agrupar datos de flujo de caja por año
  scenario.salesProjection.cashFlow.forEach((entry: any, index: number) => {
    const year = Math.floor(index / 12) + 1;
    if (year <= 5) {
      yearlyData[year].revenue += entry.totalInflow;
      yearlyData[year].costs += entry.totalOutflow;
      yearlyData[year].profit += entry.totalInflow - entry.totalOutflow;
      yearlyData[year].cashFlow += entry.netCashFlow;
    }
  });
  
  // Generar proyección por año
  for (let year = 1; year <= 5; year++) {
    // Aplicar factores de ajuste para años futuros (simplificado)
    const inflationFactor = 1 + (0.03 * (year - 1)); // 3% de inflación anual
    
    const yearData = yearlyData[year];
    
    projection.years[year] = {
      revenue: yearData.revenue * inflationFactor,
      costs: yearData.costs * inflationFactor,
      profit: yearData.profit * inflationFactor,
      cashFlow: yearData.cashFlow * inflationFactor,
      roi: yearData.costs > 0 ? (yearData.profit / yearData.costs) * 100 : 0
    };
    
    // Actualizar valores acumulados
    projection.cumulativeValues.revenue += projection.years[year].revenue;
    projection.cumulativeValues.costs += projection.years[year].costs;
    projection.cumulativeValues.profit += projection.years[year].profit;
    projection.cumulativeValues.cashFlow += projection.years[year].cashFlow;
  }
  
  // Calcular ROI acumulado
  projection.cumulativeValues.roi = projection.cumulativeValues.costs > 0 
    ? (projection.cumulativeValues.profit / projection.cumulativeValues.costs) * 100 
    : 0;
  
  return projection;
}
