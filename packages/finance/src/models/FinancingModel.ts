/**
 * Tipos de financiamiento disponibles
 */
export enum FinancingType {
  TRADITIONAL_MORTGAGE = 'traditional_mortgage',
  CONSTRUCTION_LOAN = 'construction_loan',
  DEVELOPER_FINANCING = 'developer_financing',
  INVESTOR_EQUITY = 'investor_equity',
  MIXED = 'mixed',
}

/**
 * Interfaz para un esquema de financiamiento
 */
export interface FinancingScheme {
  type: FinancingType;
  name: string;
  description: string;
  loanAmount: number;
  downPayment: number;
  downPaymentPercentage: number;
  interestRate: number;
  term: number; // en años
  paymentFrequency: 'monthly' | 'quarterly' | 'annually';
  originationFee: number;
  originationFeeAmount: number;
}

/**
 * Interfaz para una entrada en la tabla de amortización
 */
export interface AmortizationEntry {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Interfaz para un modelo de impuestos
 */
export interface TaxModel {
  region: string;
  propertyTaxRate: number;
  transferTaxRate: number;
  incomeTaxRate: number;
  valueAddedTaxRate: number;
  capitalGainsTaxRate: number;
  notaryFees: number;
  registrationFees: number;
}

/**
 * Modelos de impuestos por región
 */
export const TAX_MODELS: Record<string, TaxModel> = {
  mexico_cdmx: {
    region: 'Ciudad de México',
    propertyTaxRate: 0.08, // % anual del valor catastral
    transferTaxRate: 2.0, // % del valor de la transacción
    incomeTaxRate: 35.0, // % sobre ganancias
    valueAddedTaxRate: 16.0, // IVA
    capitalGainsTaxRate: 25.0, // % sobre ganancias de capital
    notaryFees: 1.0, // % del valor de la propiedad
    registrationFees: 0.5, // % del valor de la propiedad
  },
  mexico_nuevo_leon: {
    region: 'Nuevo León',
    propertyTaxRate: 0.075,
    transferTaxRate: 1.8,
    incomeTaxRate: 35.0,
    valueAddedTaxRate: 16.0,
    capitalGainsTaxRate: 25.0,
    notaryFees: 0.9,
    registrationFees: 0.45,
  },
  mexico_jalisco: {
    region: 'Jalisco',
    propertyTaxRate: 0.07,
    transferTaxRate: 1.9,
    incomeTaxRate: 35.0,
    valueAddedTaxRate: 16.0,
    capitalGainsTaxRate: 25.0,
    notaryFees: 0.95,
    registrationFees: 0.48,
  },
};

/**
 * Crea un esquema de financiamiento
 * @param type Tipo de financiamiento
 * @param totalAmount Monto total del proyecto
 * @param downPaymentPercentage Porcentaje de enganche
 * @param interestRate Tasa de interés anual
 * @param term Plazo en años
 * @param paymentFrequency Frecuencia de pagos
 * @param originationFee Comisión por apertura (porcentaje)
 * @returns Esquema de financiamiento
 */
export function createFinancingScheme(
  type: FinancingType,
  totalAmount: number,
  downPaymentPercentage: number = 20,
  interestRate: number = 8.5,
  term: number = 20,
  paymentFrequency: 'monthly' | 'quarterly' | 'annually' = 'monthly',
  originationFee: number = 1.5,
): FinancingScheme {
  const downPayment = totalAmount * (downPaymentPercentage / 100);
  const loanAmount = totalAmount - downPayment;
  const originationFeeAmount = loanAmount * (originationFee / 100);

  const names: Record<FinancingType, string> = {
    [FinancingType.TRADITIONAL_MORTGAGE]: 'Hipoteca Tradicional',
    [FinancingType.CONSTRUCTION_LOAN]: 'Préstamo de Construcción',
    [FinancingType.DEVELOPER_FINANCING]: 'Financiamiento del Desarrollador',
    [FinancingType.INVESTOR_EQUITY]: 'Capital de Inversores',
    [FinancingType.MIXED]: 'Financiamiento Mixto',
  };

  const descriptions: Record<FinancingType, string> = {
    [FinancingType.TRADITIONAL_MORTGAGE]:
      'Préstamo hipotecario estándar con pagos mensuales fijos.',
    [FinancingType.CONSTRUCTION_LOAN]:
      'Préstamo específico para la fase de construcción con desembolsos por etapas.',
    [FinancingType.DEVELOPER_FINANCING]:
      'Financiamiento directo ofrecido por el desarrollador del proyecto.',
    [FinancingType.INVESTOR_EQUITY]: 'Participación de capital de inversores externos.',
    [FinancingType.MIXED]: 'Combinación de diferentes fuentes de financiamiento.',
  };

  return {
    type,
    name: names[type],
    description: descriptions[type],
    loanAmount,
    downPayment,
    downPaymentPercentage,
    interestRate,
    term,
    paymentFrequency,
    originationFee,
    originationFeeAmount,
  };
}

/**
 * Calcula la tabla de amortización para un esquema de financiamiento
 * @param scheme Esquema de financiamiento
 * @returns Tabla de amortización
 */
export function calculateAmortizationTable(scheme: FinancingScheme): AmortizationEntry[] {
  const table: AmortizationEntry[] = [];

  // Convertir tasa anual a tasa por periodo
  let periodsPerYear: number;
  switch (scheme.paymentFrequency) {
    case 'monthly':
      periodsPerYear = 12;
      break;
    case 'quarterly':
      periodsPerYear = 4;
      break;
    case 'annually':
      periodsPerYear = 1;
      break;
    default:
      periodsPerYear = 12;
  }

  const totalPeriods = scheme.term * periodsPerYear;
  const periodicRate = scheme.interestRate / 100 / periodsPerYear;

  // Calcular pago periódico (fórmula de amortización)
  const payment =
    (scheme.loanAmount * (periodicRate * Math.pow(1 + periodicRate, totalPeriods))) /
    (Math.pow(1 + periodicRate, totalPeriods) - 1);

  let balance = scheme.loanAmount;

  // Generar tabla de amortización
  for (let period = 1; period <= totalPeriods; period++) {
    const interest = balance * periodicRate;
    const principal = payment - interest;
    balance -= principal;

    table.push({
      period,
      payment,
      principal,
      interest,
      balance: balance > 0 ? balance : 0,
    });

    if (balance <= 0) break;
  }

  return table;
}

/**
 * Calcula los impuestos y gastos notariales para una propiedad
 * @param propertyValue Valor de la propiedad
 * @param region Región (código)
 * @returns Objeto con desglose de impuestos y gastos
 */
export function calculateTaxesAndFees(
  propertyValue: number,
  region: string = 'mexico_cdmx',
): Record<string, number> {
  // Obtener modelo de impuestos para la región
  const taxModel = TAX_MODELS[region] || TAX_MODELS['mexico_cdmx'];

  // Calcular impuestos y gastos
  const propertyTax = propertyValue * (taxModel.propertyTaxRate / 100);
  const transferTax = propertyValue * (taxModel.transferTaxRate / 100);
  const valueAddedTax = propertyValue * (taxModel.valueAddedTaxRate / 100);
  const notaryFees = propertyValue * (taxModel.notaryFees / 100);
  const registrationFees = propertyValue * (taxModel.registrationFees / 100);

  // Crear desglose
  const breakdown: Record<string, number> = {
    propertyTax,
    transferTax,
    valueAddedTax,
    notaryFees,
    registrationFees,
    total: propertyTax + transferTax + valueAddedTax + notaryFees + registrationFees,
  };

  return breakdown;
}

/**
 * Compara diferentes esquemas de financiamiento
 * @param schemes Array de esquemas de financiamiento
 * @returns Objeto con comparativa
 */
export function compareFinancingSchemes(schemes: FinancingScheme[]): Record<string, any> {
  const comparison: Record<string, any> = {
    schemes: {},
    bestOption: {
      lowestMonthlyPayment: { schemeId: '', amount: Infinity },
      lowestTotalInterest: { schemeId: '', amount: Infinity },
      lowestTotalCost: { schemeId: '', amount: Infinity },
    },
  };

  schemes.forEach((scheme) => {
    const amortizationTable = calculateAmortizationTable(scheme);

    // Calcular métricas
    const totalInterest = amortizationTable.reduce((sum, entry) => sum + entry.interest, 0);
    const totalCost =
      scheme.downPayment + scheme.originationFeeAmount + totalInterest + scheme.loanAmount;
    const monthlyPayment =
      scheme.paymentFrequency === 'monthly'
        ? amortizationTable[0].payment
        : amortizationTable[0].payment / (scheme.paymentFrequency === 'quarterly' ? 3 : 12);

    // Guardar resultados
    comparison.schemes[scheme.type] = {
      name: scheme.name,
      monthlyPayment,
      totalInterest,
      totalCost,
      downPayment: scheme.downPayment,
      loanAmount: scheme.loanAmount,
      term: scheme.term,
      interestRate: scheme.interestRate,
    };

    // Actualizar mejores opciones
    if (monthlyPayment < comparison.bestOption.lowestMonthlyPayment.amount) {
      comparison.bestOption.lowestMonthlyPayment = {
        schemeId: scheme.type,
        amount: monthlyPayment,
      };
    }

    if (totalInterest < comparison.bestOption.lowestTotalInterest.amount) {
      comparison.bestOption.lowestTotalInterest = { schemeId: scheme.type, amount: totalInterest };
    }

    if (totalCost < comparison.bestOption.lowestTotalCost.amount) {
      comparison.bestOption.lowestTotalCost = { schemeId: scheme.type, amount: totalCost };
    }
  });

  return comparison;
}
