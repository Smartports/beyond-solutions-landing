import React, { useState, useEffect, useCallback } from 'react';
import {
  FinancingScheme,
  FinancingType,
  createFinancingScheme,
  calculateAmortizationTable,
  AmortizationEntry,
  calculateTaxesAndFees,
  compareFinancingSchemes,
} from '../models/FinancingModel';

interface FinancingCalculatorProps {
  totalAmount: number;
  onSchemeChange?: (scheme: FinancingScheme) => void;
  initialScheme?: Partial<FinancingScheme>;
}

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({
  totalAmount,
  onSchemeChange,
  initialScheme,
}) => {
  const [financingType, setFinancingType] = useState<FinancingType>(
    initialScheme?.type || FinancingType.TRADITIONAL_MORTGAGE,
  );
  const [downPaymentPercentage, setDownPaymentPercentage] = useState<number>(
    initialScheme?.downPaymentPercentage || 20,
  );
  const [interestRate, setInterestRate] = useState<number>(initialScheme?.interestRate || 8.5);
  const [term, setTerm] = useState<number>(initialScheme?.term || 20);
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'quarterly' | 'annually'>(
    initialScheme?.paymentFrequency || 'monthly',
  );
  const [originationFee, setOriginationFee] = useState<number>(
    initialScheme?.originationFee || 1.5,
  );

  const [scheme, setScheme] = useState<FinancingScheme | null>(null);
  const [amortizationTable, setAmortizationTable] = useState<AmortizationEntry[]>([]);
  const [taxesAndFees, setTaxesAndFees] = useState<Record<string, number>>({});
  const [region, setRegion] = useState<string>('mexico_cdmx');
  const [activeTab, setActiveTab] = useState<'summary' | 'amortization' | 'taxes' | 'comparison'>(
    'summary',
  );
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Crear esquemas alternativos para comparación (memoized to satisfy react-hooks)
  const createAlternativeSchemes = useCallback((): FinancingScheme[] => {
    const schemes: FinancingScheme[] = [];

    // Esquema actual
    if (scheme) {
      schemes.push(scheme);
    }

    // Esquema con plazo más corto
    if (term > 10) {
      schemes.push(
        createFinancingScheme(
          financingType,
          totalAmount,
          downPaymentPercentage,
          interestRate + 0.5,
          term - 5,
          paymentFrequency,
          originationFee,
        ),
      );
    }

    // Esquema con mayor enganche
    if (downPaymentPercentage < 30) {
      schemes.push(
        createFinancingScheme(
          financingType,
          totalAmount,
          downPaymentPercentage + 10,
          interestRate - 0.5,
          term,
          paymentFrequency,
          originationFee,
        ),
      );
    }

    // Esquema con otro tipo de financiamiento
    const alternativeType =
      financingType === FinancingType.TRADITIONAL_MORTGAGE
        ? FinancingType.CONSTRUCTION_LOAN
        : FinancingType.TRADITIONAL_MORTGAGE;

    schemes.push(
      createFinancingScheme(
        alternativeType,
        totalAmount,
        downPaymentPercentage,
        interestRate + (alternativeType === FinancingType.CONSTRUCTION_LOAN ? 1.0 : -0.5),
        term,
        paymentFrequency,
        originationFee,
      ),
    );

    return schemes;
  }, [
    scheme,
    term,
    financingType,
    totalAmount,
    downPaymentPercentage,
    interestRate,
    paymentFrequency,
    originationFee,
  ]);

  useEffect(() => {
    // Crear esquema de financiamiento
    const newScheme = createFinancingScheme(
      financingType,
      totalAmount,
      downPaymentPercentage,
      interestRate,
      term,
      paymentFrequency,
      originationFee,
    );

    setScheme(newScheme);

    // Calcular tabla de amortización
    const table = calculateAmortizationTable(newScheme);
    setAmortizationTable(table);

    // Calcular impuestos y gastos
    const taxes = calculateTaxesAndFees(totalAmount, region);
    setTaxesAndFees(taxes);

    // Comparar con esquemas alternativos
    const alternativeSchemes = createAlternativeSchemes();
    if (alternativeSchemes.length > 1) {
      const comparison = compareFinancingSchemes(alternativeSchemes);
      setComparisonResult(comparison);
    }

    // Notificar cambio
    if (onSchemeChange) {
      onSchemeChange(newScheme);
    }
  }, [
    financingType,
    totalAmount,
    downPaymentPercentage,
    interestRate,
    term,
    paymentFrequency,
    originationFee,
    region,
    createAlternativeSchemes,
    onSchemeChange,
  ]);

  if (!scheme) {
    return <div className="p-4">Calculando financiamiento...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Calculadora de Financiamiento</h2>
        <p className="text-sm text-gray-600">Monto Total: ${totalAmount.toLocaleString()}</p>
      </div>

      <div className="p-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Financiamiento
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={financingType}
              onChange={(e) => setFinancingType(e.target.value as FinancingType)}
            >
              {Object.values(FinancingType).map((type) => (
                <option key={type} value={type}>
                  {getFinancingTypeName(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enganche (%)</label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={downPaymentPercentage}
              onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5%</span>
              <span>{downPaymentPercentage}%</span>
              <span>50%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tasa de Interés (%)
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3%</span>
              <span>{interestRate.toFixed(1)}%</span>
              <span>15%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (años)</label>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 años</span>
              <span>{term} años</span>
              <span>30 años</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia de Pagos
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={paymentFrequency}
              onChange={(e) =>
                setPaymentFrequency(e.target.value as 'monthly' | 'quarterly' | 'annually')
              }
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="annually">Anual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comisión por Apertura (%)
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={originationFee}
              onChange={(e) => setOriginationFee(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>{originationFee.toFixed(1)}%</span>
              <span>5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b">
        <div className="flex">
          {(['summary', 'amortization', 'taxes', 'comparison'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {getTabName(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'summary' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Enganche</p>
                <p className="text-2xl font-bold">${scheme.downPayment.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{scheme.downPaymentPercentage}% del total</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Monto del Préstamo</p>
                <p className="text-2xl font-bold">${scheme.loanAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {100 - scheme.downPaymentPercentage}% del total
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">
                  Pago {getPaymentFrequencyName(paymentFrequency)}
                </p>
                <p className="text-2xl font-bold">
                  $
                  {amortizationTable.length > 0
                    ? amortizationTable[0].payment.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })
                    : 0}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Interés Total</p>
                  <p className="text-lg font-semibold">
                    $
                    {amortizationTable
                      .reduce((sum, entry) => sum + entry.interest, 0)
                      .toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Comisión por Apertura</p>
                  <p className="text-lg font-semibold">
                    ${scheme.originationFeeAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plazo</p>
                  <p className="text-lg font-semibold">{scheme.term} años</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tasa de Interés</p>
                  <p className="text-lg font-semibold">{scheme.interestRate}% anual</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'amortization' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Tabla de Amortización</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Periodo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pago
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capital
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interés
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {amortizationTable.slice(0, 12).map((entry) => (
                    <tr key={entry.period}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${entry.payment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${entry.principal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${entry.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${entry.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {amortizationTable.length > 12 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Mostrando primeros 12 periodos de {amortizationTable.length} totales
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'taxes' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="mexico_cdmx">Ciudad de México</option>
                <option value="mexico_nuevo_leon">Nuevo León</option>
                <option value="mexico_jalisco">Jalisco</option>
              </select>
            </div>

            <h3 className="text-lg font-semibold mb-4">Impuestos y Gastos Notariales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(taxesAndFees).map(([name, amount]) => (
                <div key={name} className="flex justify-between border-b pb-2">
                  <span className="text-sm">{getTaxName(name)}</span>
                  <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comparison' && comparisonResult && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Comparativa de Esquemas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Esquema
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pago Mensual
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interés Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(comparisonResult.schemes).map(
                    ([schemeId, data]: [string, any]) => (
                      <tr key={schemeId} className={schemeId === scheme.type ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {data.name} {schemeId === scheme.type && '(Actual)'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          $
                          {data.monthlyPayment.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          $
                          {data.totalInterest.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          ${data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Mejores Opciones</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Menor Pago Mensual</p>
                  <p className="text-lg font-semibold">
                    {comparisonResult.bestOption.lowestMonthlyPayment.schemeId === scheme.type
                      ? 'Esquema Actual'
                      : getFinancingTypeName(
                          comparisonResult.bestOption.lowestMonthlyPayment
                            .schemeId as FinancingType,
                        )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Menor Interés Total</p>
                  <p className="text-lg font-semibold">
                    {comparisonResult.bestOption.lowestTotalInterest.schemeId === scheme.type
                      ? 'Esquema Actual'
                      : getFinancingTypeName(
                          comparisonResult.bestOption.lowestTotalInterest.schemeId as FinancingType,
                        )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Menor Costo Total</p>
                  <p className="text-lg font-semibold">
                    {comparisonResult.bestOption.lowestTotalCost.schemeId === scheme.type
                      ? 'Esquema Actual'
                      : getFinancingTypeName(
                          comparisonResult.bestOption.lowestTotalCost.schemeId as FinancingType,
                        )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Funciones auxiliares para obtener nombres legibles
function getFinancingTypeName(type: FinancingType): string {
  const names: Record<FinancingType, string> = {
    [FinancingType.TRADITIONAL_MORTGAGE]: 'Hipoteca Tradicional',
    [FinancingType.CONSTRUCTION_LOAN]: 'Préstamo de Construcción',
    [FinancingType.DEVELOPER_FINANCING]: 'Financiamiento del Desarrollador',
    [FinancingType.INVESTOR_EQUITY]: 'Capital de Inversores',
    [FinancingType.MIXED]: 'Financiamiento Mixto',
  };
  return names[type] || type;
}

function getTabName(tab: 'summary' | 'amortization' | 'taxes' | 'comparison'): string {
  const names = {
    summary: 'Resumen',
    amortization: 'Amortización',
    taxes: 'Impuestos',
    comparison: 'Comparativa',
  };
  return names[tab];
}

function getPaymentFrequencyName(frequency: 'monthly' | 'quarterly' | 'annually'): string {
  const names = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    annually: 'Anual',
  };
  return names[frequency];
}

function getTaxName(key: string): string {
  const names: Record<string, string> = {
    propertyTax: 'Impuesto Predial',
    transferTax: 'Impuesto de Transmisión',
    valueAddedTax: 'IVA',
    notaryFees: 'Gastos Notariales',
    registrationFees: 'Gastos de Registro',
    total: 'Total',
  };
  return names[key] || key;
}
