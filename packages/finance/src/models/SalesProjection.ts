/**
 * Interfaz para configuración de proyección de ventas
 */
export interface SalesProjectionConfig {
  totalUnits: number;
  unitPrice: number;
  salesStartDate: Date;
  salesVelocity: number; // unidades por mes
  priceIncreaseRate: number; // % anual
  reservationFee: number; // % del precio
  downPayment: number; // % del precio
  installmentMonths: number; // meses para pagar el resto
  projectDuration: number; // meses totales del proyecto
}

/**
 * Interfaz para una entrada en el flujo de caja
 */
export interface CashFlowEntry {
  month: number;
  date: Date;
  inflows: Record<string, number>;
  outflows: Record<string, number>;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

/**
 * Interfaz para los resultados de la proyección de ventas
 */
export interface SalesProjectionResult {
  config: SalesProjectionConfig;
  monthlySales: Array<{
    month: number;
    date: Date;
    unitsSold: number;
    revenue: number;
    cumulativeUnitsSold: number;
    cumulativeRevenue: number;
    absorptionRate: number;
  }>;
  cashFlow: CashFlowEntry[];
  metrics: {
    totalRevenue: number;
    averageAbsorptionRate: number;
    salesDuration: number;
    breakEvenMonth: number | null;
    breakEvenDate: Date | null;
  };
}

/**
 * Genera una proyección de ventas y flujo de caja
 * @param config Configuración de la proyección
 * @param constructionCosts Costos de construcción mensuales
 * @param indirectCosts Costos indirectos mensuales
 * @returns Resultados de la proyección
 */
export function generateSalesProjection(
  config: SalesProjectionConfig,
  constructionCosts: number[],
  indirectCosts: number[]
): SalesProjectionResult {
  const monthlySales: SalesProjectionResult['monthlySales'] = [];
  const cashFlow: CashFlowEntry[] = [];
  
  let unitsSoldTotal = 0;
  let revenueTotal = 0;
  let cumulativeCashFlow = 0;
  let breakEvenMonth: number | null = null;
  let breakEvenDate: Date | null = null;
  
  // Asegurar que los arrays de costos tengan la longitud correcta
  const normalizedConstructionCosts = normalizeArray(constructionCosts, config.projectDuration);
  const normalizedIndirectCosts = normalizeArray(indirectCosts, config.projectDuration);
  
  // Generar proyección mes a mes
  for (let month = 0; month < config.projectDuration; month++) {
    const currentDate = addMonths(config.salesStartDate, month);
    
    // Calcular ventas del mes
    const unitsSold = Math.min(
      config.salesVelocity,
      config.totalUnits - unitsSoldTotal
    );
    
    // Aplicar incremento de precio anual
    const yearsPassed = month / 12;
    const priceAdjustment = Math.pow(1 + config.priceIncreaseRate / 100, yearsPassed);
    const currentUnitPrice = config.unitPrice * priceAdjustment;
    
    // Calcular ingresos del mes
    const reservationRevenue = unitsSold * currentUnitPrice * (config.reservationFee / 100);
    const downPaymentRevenue = unitsSold * currentUnitPrice * (config.downPayment / 100);
    
    // Calcular pagos de instalamentos de meses anteriores
    let installmentRevenue = 0;
    const installmentPercentage = (100 - config.reservationFee - config.downPayment) / config.installmentMonths;
    
    for (let i = 1; i <= config.installmentMonths; i++) {
      const pastMonth = month - i;
      if (pastMonth >= 0 && pastMonth < monthlySales.length) {
        const pastUnitsSold = monthlySales[pastMonth].unitsSold;
        const pastUnitPrice = config.unitPrice * Math.pow(1 + config.priceIncreaseRate / 100, pastMonth / 12);
        installmentRevenue += pastUnitsSold * pastUnitPrice * (installmentPercentage / 100);
      }
    }
    
    // Calcular ingresos totales del mes
    const monthlyRevenue = reservationRevenue + downPaymentRevenue + installmentRevenue;
    
    // Actualizar totales
    unitsSoldTotal += unitsSold;
    revenueTotal += monthlyRevenue;
    
    // Registrar ventas mensuales
    monthlySales.push({
      month,
      date: new Date(currentDate),
      unitsSold,
      revenue: monthlyRevenue,
      cumulativeUnitsSold: unitsSoldTotal,
      cumulativeRevenue: revenueTotal,
      absorptionRate: config.totalUnits > 0 ? (unitsSoldTotal / config.totalUnits) * 100 : 0
    });
    
    // Calcular flujo de caja
    const constructionCost = normalizedConstructionCosts[month];
    const indirectCost = normalizedIndirectCosts[month];
    
    const inflows = {
      reservations: reservationRevenue,
      downPayments: downPaymentRevenue,
      installments: installmentRevenue
    };
    
    const outflows = {
      construction: constructionCost,
      indirect: indirectCost
    };
    
    const totalInflow = Object.values(inflows).reduce((sum, value) => sum + value, 0);
    const totalOutflow = Object.values(outflows).reduce((sum, value) => sum + value, 0);
    const netCashFlow = totalInflow - totalOutflow;
    
    cumulativeCashFlow += netCashFlow;
    
    // Detectar punto de equilibrio
    if (breakEvenMonth === null && cumulativeCashFlow >= 0 && month > 0) {
      breakEvenMonth = month;
      breakEvenDate = new Date(currentDate);
    }
    
    cashFlow.push({
      month,
      date: new Date(currentDate),
      inflows,
      outflows,
      totalInflow,
      totalOutflow,
      netCashFlow,
      cumulativeCashFlow
    });
  }
  
  // Calcular métricas
  const metrics = {
    totalRevenue: revenueTotal,
    averageAbsorptionRate: config.totalUnits > 0 
      ? (unitsSoldTotal / config.totalUnits) * 100 / Math.min(config.projectDuration, monthlySales.length)
      : 0,
    salesDuration: unitsSoldTotal >= config.totalUnits 
      ? monthlySales.findIndex(m => m.cumulativeUnitsSold >= config.totalUnits) + 1
      : config.projectDuration,
    breakEvenMonth,
    breakEvenDate
  };
  
  return {
    config,
    monthlySales,
    cashFlow,
    metrics
  };
}

/**
 * Normaliza un array para que tenga la longitud especificada
 * @param array Array a normalizar
 * @param length Longitud deseada
 * @returns Array normalizado
 */
function normalizeArray(array: number[], length: number): number[] {
  if (array.length === length) return array;
  
  const result = new Array(length).fill(0);
  
  if (array.length === 0) return result;
  
  // Si el array es más corto, repetir los valores
  if (array.length < length) {
    for (let i = 0; i < length; i++) {
      result[i] = array[i % array.length];
    }
  } 
  // Si el array es más largo, truncar
  else {
    for (let i = 0; i < length; i++) {
      result[i] = array[i];
    }
  }
  
  return result;
}

/**
 * Añade meses a una fecha
 * @param date Fecha base
 * @param months Número de meses a añadir
 * @returns Nueva fecha
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Calcula la velocidad de ventas óptima basada en datos del mercado
 * @param totalUnits Unidades totales
 * @param targetSalesDuration Duración objetivo de ventas (meses)
 * @param marketAbsorptionRate Tasa de absorción del mercado (% mensual)
 * @returns Velocidad de ventas óptima (unidades por mes)
 */
export function calculateOptimalSalesVelocity(
  totalUnits: number,
  targetSalesDuration: number,
  marketAbsorptionRate: number
): number {
  // Calcular basado en duración objetivo
  const velocityByDuration = totalUnits / targetSalesDuration;
  
  // Calcular basado en tasa de absorción del mercado
  const velocityByMarket = totalUnits * (marketAbsorptionRate / 100);
  
  // Usar el valor más conservador
  return Math.min(velocityByDuration, velocityByMarket);
}

/**
 * Distribuye los costos de construcción a lo largo del tiempo del proyecto
 * @param totalConstructionCost Costo total de construcción
 * @param projectDuration Duración del proyecto en meses
 * @param distributionPattern Patrón de distribución ('linear', 'frontloaded', 'backloaded', 'bell')
 * @returns Array con costos mensuales
 */
export function distributeConstructionCosts(
  totalConstructionCost: number,
  projectDuration: number,
  distributionPattern: 'linear' | 'frontloaded' | 'backloaded' | 'bell' = 'bell'
): number[] {
  const costs: number[] = new Array(projectDuration).fill(0);
  
  switch (distributionPattern) {
    case 'linear':
      // Distribución uniforme
      const monthlyAmount = totalConstructionCost / projectDuration;
      for (let i = 0; i < projectDuration; i++) {
        costs[i] = monthlyAmount;
      }
      break;
      
    case 'frontloaded':
      // Mayor costo al inicio
      for (let i = 0; i < projectDuration; i++) {
        const factor = 1 - (i / projectDuration);
        costs[i] = (totalConstructionCost * 2 * factor) / projectDuration;
      }
      break;
      
    case 'backloaded':
      // Mayor costo al final
      for (let i = 0; i < projectDuration; i++) {
        const factor = i / projectDuration;
        costs[i] = (totalConstructionCost * 2 * factor) / projectDuration;
      }
      break;
      
    case 'bell':
      // Distribución en forma de campana (más costo en el medio)
      for (let i = 0; i < projectDuration; i++) {
        const middle = projectDuration / 2;
        const distance = Math.abs(i - middle);
        const maxDistance = middle;
        const factor = 1 - (distance / maxDistance) * 0.5; // 0.5 para suavizar la curva
        costs[i] = (totalConstructionCost * factor * 2) / projectDuration;
      }
      break;
  }
  
  // Normalizar para asegurar que la suma sea exactamente el costo total
  const sum = costs.reduce((acc, cost) => acc + cost, 0);
  const adjustmentFactor = totalConstructionCost / sum;
  
  return costs.map(cost => cost * adjustmentFactor);
}
