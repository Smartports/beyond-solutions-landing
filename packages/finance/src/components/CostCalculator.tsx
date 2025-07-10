import React, { useState, useEffect } from 'react';
import {
  Budget,
  calculateBudget,
  IndirectCostType,
  calculateDetailedBreakdown,
} from '../models/CostEngine';
import { ConstructionSystem } from '../models/ConstructionSystem';
import { MaterialPreset } from '../models/Materials';

interface CostCalculatorProps {
  projectId: string;
  projectName: string;
  areaM2: number;
  constructionSystem: ConstructionSystem;
  materialPreset: MaterialPreset;
  landCost?: number;
  locationFactor?: number;
  yearOffset?: number;
  indirectCostPercentages?: Partial<Record<IndirectCostType, number>>;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  projectId,
  projectName,
  areaM2,
  constructionSystem,
  materialPreset,
  landCost = 0,
  locationFactor = 1.0,
  yearOffset = 0,
  indirectCostPercentages = {},
}) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'direct' | 'indirect' | 'breakdown'>(
    'summary',
  );
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});

  useEffect(() => {
    // Calcular presupuesto cuando cambien los inputs
    const calculatedBudget = calculateBudget(
      projectId,
      projectName,
      areaM2,
      constructionSystem,
      materialPreset,
      landCost,
      locationFactor,
      yearOffset,
      indirectCostPercentages,
    );

    setBudget(calculatedBudget);

    // Calcular desglose detallado
    const detailedBreakdown = calculateDetailedBreakdown(calculatedBudget);
    setBreakdown(detailedBreakdown);
  }, [
    projectId,
    projectName,
    areaM2,
    constructionSystem,
    materialPreset,
    landCost,
    locationFactor,
    yearOffset,
    indirectCostPercentages,
  ]);

  if (!budget) {
    return <div className="p-4">Calculando presupuesto...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Calculadora de Costos</h2>
        <p className="text-sm text-gray-600">
          Proyecto: {projectName} | Área: {areaM2.toLocaleString()} m²
        </p>
      </div>

      <div className="border-b">
        <div className="flex">
          {(['summary', 'direct', 'indirect', 'breakdown'] as const).map((tab) => (
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
                <p className="text-sm text-gray-500">Costos Directos</p>
                <p className="text-2xl font-bold">${budget.totalDirectCost.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Costos Indirectos</p>
                <p className="text-2xl font-bold">${budget.totalIndirectCost.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Costo Total</p>
                <p className="text-2xl font-bold">${budget.totalCost.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Costo por m²</p>
                  <p className="text-lg font-semibold">${budget.costPerM2.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Factor de Ubicación</p>
                  <p className="text-lg font-semibold">{budget.locationFactor.toFixed(2)}x</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Factor de Inflación</p>
                  <p className="text-lg font-semibold">{budget.inflationFactor.toFixed(2)}x</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última Actualización</p>
                  <p className="text-lg font-semibold">
                    {new Date(budget.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'direct' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Costos Directos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concepto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % del Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(budget.directCosts).map((cost) => (
                    <tr key={cost.type}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cost.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${cost.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {cost.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {((cost.amount / budget.totalCost) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Total Costos Directos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-900">
                      ${budget.totalDirectCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-900">
                      {((budget.totalDirectCost / budget.totalCost) * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'indirect' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Costos Indirectos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concepto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porcentaje
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(budget.indirectCosts).map((cost) => (
                    <tr key={cost.type}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cost.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {cost.percentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${cost.baseAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${cost.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Total Costos Indirectos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-900">
                      ${budget.totalIndirectCost.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Desglose Detallado de Partidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(breakdown).map(([name, amount]) => (
                <div key={name} className="flex justify-between border-b pb-2">
                  <span className="text-sm">{name}</span>
                  <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Función auxiliar para obtener nombres de pestañas
function getTabName(tab: 'summary' | 'direct' | 'indirect' | 'breakdown'): string {
  const names = {
    summary: 'Resumen',
    direct: 'Costos Directos',
    indirect: 'Costos Indirectos',
    breakdown: 'Desglose Detallado',
  };
  return names[tab];
}
