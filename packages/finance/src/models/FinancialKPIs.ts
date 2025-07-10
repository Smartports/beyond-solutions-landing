import { CashFlowEntry } from './SalesProjection';

/**
 * Interfaz para los KPIs financieros
 */
export interface FinancialKPIs {
  roi: number; // Retorno sobre inversión (%)
  irr: number; // Tasa interna de retorno (%)
  npv: number; // Valor actual neto
  paybackPeriod: number; // Periodo de recuperación (meses)
  profitMargin: number; // Margen de beneficio (%)
  costPerM2: number; // Costo por metro cuadrado
  revenuePerM2: number; // Ingreso por metro cuadrado
  profitPerM2: number; // Beneficio por metro cuadrado
  debtServiceCoverageRatio: number; // Ratio de cobertura del servicio de deuda
  breakEvenOccupancy: number; // Ocupación de punto de equilibrio (%)
  capRate: number; // Tasa de capitalización (%)
}

/**
 * Calcula el Retorno sobre Inversión (ROI)
 * @param totalRevenue Ingresos totales
 * @param totalCost Costos totales
 * @returns ROI como porcentaje
 */
export function calculateROI(totalRevenue: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return ((totalRevenue - totalCost) / totalCost) * 100;
}

/**
 * Calcula la Tasa Interna de Retorno (TIR)
 * @param cashFlows Array de flujos de caja (valores positivos son ingresos, negativos son egresos)
 * @param initialInvestment Inversión inicial (valor positivo)
 * @returns TIR como porcentaje
 */
export function calculateIRR(cashFlows: number[], initialInvestment: number): number {
  // Preparar flujos de caja con inversión inicial como primer flujo negativo
  const flows = [-initialInvestment, ...cashFlows];

  // Implementación simplificada del método de Newton para calcular TIR
  const maxIterations = 1000;
  const tolerance = 0.0000001;

  let guess = 0.1; // Suposición inicial (10%)

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPVWithRate(flows, guess);
    if (Math.abs(npv) < tolerance) {
      return guess * 100; // Convertir a porcentaje
    }

    const derivativeNPV = calculateNPVDerivative(flows, guess);
    if (derivativeNPV === 0) break;

    const newGuess = guess - npv / derivativeNPV;
    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess * 100; // Convertir a porcentaje
    }

    guess = newGuess;
  }

  // Si no converge, devolver estimación aproximada
  return guess * 100;
}

/**
 * Calcula el NPV con una tasa específica
 * @param cashFlows Array de flujos de caja
 * @param rate Tasa de descuento
 * @returns NPV
 */
function calculateNPVWithRate(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((npv, flow, index) => {
    return npv + flow / Math.pow(1 + rate, index);
  }, 0);
}

/**
 * Calcula la derivada del NPV con respecto a la tasa
 * @param cashFlows Array de flujos de caja
 * @param rate Tasa de descuento
 * @returns Derivada del NPV
 */
function calculateNPVDerivative(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((derivative, flow, index) => {
    if (index === 0) return derivative;
    return derivative - (index * flow) / Math.pow(1 + rate, index + 1);
  }, 0);
}

/**
 * Calcula el Valor Actual Neto (VAN)
 * @param cashFlows Array de flujos de caja
 * @param discountRate Tasa de descuento anual (%)
 * @param initialInvestment Inversión inicial (valor positivo)
 * @returns VAN
 */
export function calculateNPV(
  cashFlows: number[],
  discountRate: number,
  initialInvestment: number,
): number {
  const monthlyRate = discountRate / 100 / 12;

  const presentValue = cashFlows.reduce((pv, flow, index) => {
    return pv + flow / Math.pow(1 + monthlyRate, index + 1);
  }, 0);

  return presentValue - initialInvestment;
}

/**
 * Calcula el Periodo de Recuperación (Payback Period)
 * @param cashFlows Array de flujos de caja mensuales
 * @param initialInvestment Inversión inicial (valor positivo)
 * @returns Periodo de recuperación en meses
 */
export function calculatePaybackPeriod(cashFlows: number[], initialInvestment: number): number {
  let cumulativeFlow = -initialInvestment;
  let month = 0;

  // Encontrar el mes donde el flujo acumulado se vuelve positivo
  for (let i = 0; i < cashFlows.length; i++) {
    cumulativeFlow += cashFlows[i];
    if (cumulativeFlow >= 0) {
      month = i + 1;
      break;
    }
  }

  // Si nunca se recupera, devolver un valor que indique esto
  if (cumulativeFlow < 0) {
    return Infinity;
  }

  // Ajustar para obtener una fracción de mes más precisa
  if (month > 1 && cashFlows[month - 1] > 0) {
    const previousCumulativeFlow = cumulativeFlow - cashFlows[month - 1];
    const fraction = (0 - previousCumulativeFlow) / cashFlows[month - 1];
    month = month - 1 + fraction;
  }

  return month;
}

/**
 * Calcula todos los KPIs financieros para un proyecto
 * @param cashFlow Array de entradas de flujo de caja
 * @param totalRevenue Ingresos totales
 * @param totalCost Costos totales
 * @param initialInvestment Inversión inicial
 * @param discountRate Tasa de descuento anual (%)
 * @param totalAreaM2 Área total en metros cuadrados
 * @param annualDebtService Servicio de deuda anual
 * @param operatingIncome Ingreso operativo anual
 * @returns Objeto con todos los KPIs financieros
 */
export function calculateAllKPIs(
  cashFlow: CashFlowEntry[],
  totalRevenue: number,
  totalCost: number,
  initialInvestment: number,
  discountRate: number,
  totalAreaM2: number,
  annualDebtService: number,
  operatingIncome: number,
): FinancialKPIs {
  // Extraer flujos de caja netos
  const netCashFlows = cashFlow.map((entry) => entry.netCashFlow);

  // Calcular ROI
  const roi = calculateROI(totalRevenue, totalCost);

  // Calcular TIR
  const irr = calculateIRR(netCashFlows, initialInvestment);

  // Calcular VAN
  const npv = calculateNPV(netCashFlows, discountRate, initialInvestment);

  // Calcular periodo de recuperación
  const paybackPeriod = calculatePaybackPeriod(netCashFlows, initialInvestment);

  // Calcular margen de beneficio
  const profit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Calcular métricas por metro cuadrado
  const costPerM2 = totalAreaM2 > 0 ? totalCost / totalAreaM2 : 0;
  const revenuePerM2 = totalAreaM2 > 0 ? totalRevenue / totalAreaM2 : 0;
  const profitPerM2 = totalAreaM2 > 0 ? profit / totalAreaM2 : 0;

  // Calcular ratio de cobertura del servicio de deuda
  const debtServiceCoverageRatio = annualDebtService > 0 ? operatingIncome / annualDebtService : 0;

  // Calcular ocupación de punto de equilibrio
  const fixedCosts = totalCost * 0.4; // Estimación simplificada: 40% de los costos son fijos
  const variableCosts = totalCost * 0.6; // Estimación simplificada: 60% de los costos son variables
  const contributionMargin = totalRevenue - variableCosts;
  const breakEvenOccupancy = contributionMargin > 0 ? (fixedCosts / contributionMargin) * 100 : 0;

  // Calcular tasa de capitalización (Cap Rate)
  const annualNetOperatingIncome = operatingIncome - totalCost * 0.05; // NOI = Ingreso operativo - gastos operativos
  const propertyValue = totalRevenue * 10; // Valor estimado de la propiedad (simplificado)
  const capRate = propertyValue > 0 ? (annualNetOperatingIncome / propertyValue) * 100 : 0;

  return {
    roi,
    irr,
    npv,
    paybackPeriod,
    profitMargin,
    costPerM2,
    revenuePerM2,
    profitPerM2,
    debtServiceCoverageRatio,
    breakEvenOccupancy,
    capRate,
  };
}

/**
 * Genera un reporte de KPIs en formato legible
 * @param kpis Objeto con KPIs financieros
 * @returns Reporte en formato legible
 */
export function generateKPIReport(kpis: FinancialKPIs): Record<string, string> {
  return {
    ROI: `${kpis.roi.toFixed(2)}%`,
    TIR: `${kpis.irr.toFixed(2)}%`,
    VAN: `$${kpis.npv.toLocaleString()}`,
    'Periodo de Recuperación':
      kpis.paybackPeriod === Infinity
        ? 'No se recupera'
        : `${Math.floor(kpis.paybackPeriod)} meses y ${Math.round((kpis.paybackPeriod % 1) * 30)} días`,
    'Margen de Beneficio': `${kpis.profitMargin.toFixed(2)}%`,
    'Costo por m²': `$${kpis.costPerM2.toLocaleString()} / m²`,
    'Ingreso por m²': `$${kpis.revenuePerM2.toLocaleString()} / m²`,
    'Beneficio por m²': `$${kpis.profitPerM2.toLocaleString()} / m²`,
    'Ratio de Cobertura de Servicio de Deuda': kpis.debtServiceCoverageRatio.toFixed(2),
    'Ocupación de Punto de Equilibrio': `${kpis.breakEvenOccupancy.toFixed(2)}%`,
    'Tasa de Capitalización': `${kpis.capRate.toFixed(2)}%`,
  };
}
