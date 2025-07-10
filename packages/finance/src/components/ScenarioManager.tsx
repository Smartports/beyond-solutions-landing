import React, { useState, useEffect } from 'react';
import {
  Scenario,
  ScenarioType,
  ScenarioConfig,
  createPredefinedScenario,
  simulateScenario,
  compareScenarios,
  generateFiveYearProjection,
} from '../models/ScenarioSimulator';
import { ConstructionSystem } from '../models/ConstructionSystem';
import { MaterialPreset } from '../models/Materials';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ScenarioManagerProps {
  constructionSystem: ConstructionSystem;
  materialPreset: MaterialPreset;
  projectId: string;
  projectName: string;
  totalAreaM2: number;
  landCost: number;
  onScenarioSelect?: (scenario: Scenario) => void;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  constructionSystem,
  materialPreset,
  projectId,
  projectName,
  totalAreaM2,
  landCost,
  onScenarioSelect,
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [fiveYearProjection, setFiveYearProjection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'comparison' | 'projection'>(
    'scenarios',
  );

  // Crear escenarios predefinidos al inicio
  useEffect(() => {
    const baseConfig: Partial<ScenarioConfig> = {
      constructionSystem,
      materialPreset,
      projectId,
      projectName,
      totalAreaM2,
      landCost,
      salesConfig: {
        totalUnits: 50,
        unitPrice: totalAreaM2 * 1200, // Precio estimado basado en el área
        salesStartDate: new Date(),
        salesVelocity: 3,
        priceIncreaseRate: 3.0,
        reservationFee: 5,
        downPayment: 15,
        installmentMonths: 12,
        projectDuration: 30,
      },
    };

    // Crear escenarios predefinidos
    const optimisticConfig = createPredefinedScenario(ScenarioType.OPTIMISTIC, baseConfig);
    const realisticConfig = createPredefinedScenario(ScenarioType.REALISTIC, baseConfig);
    const pessimisticConfig = createPredefinedScenario(ScenarioType.PESSIMISTIC, baseConfig);

    // Simular escenarios
    const optimisticScenario = simulateScenario(optimisticConfig);
    const realisticScenario = simulateScenario(realisticConfig);
    const pessimisticScenario = simulateScenario(pessimisticConfig);

    // Guardar escenarios
    const newScenarios = [optimisticScenario, realisticScenario, pessimisticScenario];
    setScenarios(newScenarios);

    // Seleccionar escenario realista por defecto
    setSelectedScenarioId(realisticScenario.id);
    if (onScenarioSelect) {
      onScenarioSelect(realisticScenario);
    }

    // Comparar escenarios
    const scenarioComparison = compareScenarios(newScenarios);
    setComparison(scenarioComparison);

    // Generar proyección a 5 años para el escenario realista
    const projection = generateFiveYearProjection(realisticScenario);
    setFiveYearProjection(projection);
  }, [
    constructionSystem,
    materialPreset,
    projectId,
    projectName,
    totalAreaM2,
    landCost,
    onScenarioSelect,
  ]);

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario && onScenarioSelect) {
      onScenarioSelect(scenario);
    }

    // Actualizar proyección a 5 años
    if (scenario) {
      const projection = generateFiveYearProjection(scenario);
      setFiveYearProjection(projection);
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  // Preparar datos para gráficos de comparación
  const comparisonData = {
    labels: scenarios.map((s) => s.name),
    datasets: [
      {
        label: 'ROI (%)',
        data: scenarios.map((s) => s.kpis.roi),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
      {
        label: 'TIR (%)',
        data: scenarios.map((s) => s.kpis.irr),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Margen (%)',
        data: scenarios.map((s) => s.kpis.profitMargin),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1,
      },
    ],
  };

  // Preparar datos para gráfico de proyección a 5 años
  const projectionData = fiveYearProjection
    ? {
        labels: Object.keys(fiveYearProjection.years).map((year) => `Año ${year}`),
        datasets: [
          {
            label: 'Ingresos',
            data: Object.values(fiveYearProjection.years).map((yearData: any) => yearData.revenue),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
          },
          {
            label: 'Costos',
            data: Object.values(fiveYearProjection.years).map((yearData: any) => yearData.costs),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
          },
          {
            label: 'Beneficio',
            data: Object.values(fiveYearProjection.years).map((yearData: any) => yearData.profit),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const cumulativeProjectionData = fiveYearProjection
    ? {
        labels: Object.keys(fiveYearProjection.years).map((year) => `Año ${year}`),
        datasets: [
          {
            label: 'Flujo Acumulado',
            data: (() => {
              const data: number[] = [];
              let cumulative = 0;
              Object.values(fiveYearProjection.years).forEach((yearData: any) => {
                cumulative += yearData.cashFlow;
                data.push(cumulative);
              });
              return data;
            })(),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgb(153, 102, 255)',
            borderWidth: 2,
            tension: 0.1,
          },
        ],
      }
    : { labels: [], datasets: [] };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Simulador de Escenarios</h2>
        <p className="text-sm text-gray-600">
          Proyecto: {projectName} | Área: {totalAreaM2.toLocaleString()} m²
        </p>
      </div>

      <div className="p-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedScenarioId === scenario.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleScenarioSelect(scenario.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{scenario.name}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${getScenarioTypeBadgeClass(scenario.type)}`}
                >
                  {getScenarioTypeLabel(scenario.type)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">ROI:</span>
                  <span className="font-medium ml-1">{scenario.kpis.roi.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">TIR:</span>
                  <span className="font-medium ml-1">{scenario.kpis.irr.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">VAN:</span>
                  <span className="font-medium ml-1">${scenario.kpis.npv.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Payback:</span>
                  <span className="font-medium ml-1">
                    {scenario.kpis.paybackPeriod === Infinity
                      ? 'N/A'
                      : `${Math.floor(scenario.kpis.paybackPeriod)} meses`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b">
        <div className="flex">
          {(['scenarios', 'comparison', 'projection'] as const).map((tab) => (
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
        {activeTab === 'scenarios' && selectedScenario && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Costo Total</p>
                <p className="text-2xl font-bold">
                  ${selectedScenario.budget.totalCost.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Ingresos Totales</p>
                <p className="text-2xl font-bold">
                  ${selectedScenario.salesProjection.metrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Beneficio</p>
                <p className="text-2xl font-bold">
                  $
                  {(
                    selectedScenario.salesProjection.metrics.totalRevenue -
                    selectedScenario.budget.totalCost
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Parámetros del Escenario</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Tipo de Estructura</span>
                    <span className="font-medium">
                      {selectedScenario.constructionSystem.structure}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Nivel de Materiales</span>
                    <span className="font-medium">{selectedScenario.materialPreset.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Velocidad de Ventas</span>
                    <span className="font-medium">
                      {selectedScenario.salesConfig.salesVelocity} unidades/mes
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Incremento de Precio</span>
                    <span className="font-medium">
                      {selectedScenario.salesConfig.priceIncreaseRate}% anual
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Duración del Proyecto</span>
                    <span className="font-medium">
                      {selectedScenario.salesConfig.projectDuration} meses
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Financiamiento</span>
                    <span className="font-medium">{selectedScenario.financingScheme.name}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">KPIs Principales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">ROI</span>
                    <span className="font-medium">{selectedScenario.kpis.roi.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">TIR</span>
                    <span className="font-medium">{selectedScenario.kpis.irr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">VAN</span>
                    <span className="font-medium">
                      ${selectedScenario.kpis.npv.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Periodo de Recuperación</span>
                    <span className="font-medium">
                      {selectedScenario.kpis.paybackPeriod === Infinity
                        ? 'No se recupera'
                        : `${Math.floor(selectedScenario.kpis.paybackPeriod)} meses y ${Math.round((selectedScenario.kpis.paybackPeriod % 1) * 30)} días`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Margen de Beneficio</span>
                    <span className="font-medium">
                      {selectedScenario.kpis.profitMargin.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Costo por m²</span>
                    <span className="font-medium">
                      ${selectedScenario.kpis.costPerM2.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && comparison && (
          <div>
            <h3 className="text-lg font-medium mb-4">Comparativa de Escenarios</h3>

            <div className="h-80 mb-6">
              <Bar data={comparisonData} options={{ maintainAspectRatio: false }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Mejor ROI</p>
                <p className="text-xl font-bold">
                  {comparison.bestScenarios.highestROI?.scenarioName || 'N/A'}
                </p>
                <p className="text-sm">{comparison.bestScenarios.highestROI?.value.toFixed(2)}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Mejor TIR</p>
                <p className="text-xl font-bold">
                  {comparison.bestScenarios.highestIRR?.scenarioName || 'N/A'}
                </p>
                <p className="text-sm">{comparison.bestScenarios.highestIRR?.value.toFixed(2)}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Mejor Margen</p>
                <p className="text-xl font-bold">
                  {comparison.bestScenarios.highestMargin?.scenarioName || 'N/A'}
                </p>
                <p className="text-sm">
                  {comparison.bestScenarios.highestMargin?.value.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escenario
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficio
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payback
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(comparison.scenarios).map(([id, data]: [string, any]) => (
                    <tr key={id} className={id === selectedScenarioId ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {data.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${data.totalCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${data.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${data.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {data.roi.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {data.paybackPeriod === Infinity
                          ? 'N/A'
                          : `${Math.floor(data.paybackPeriod)} meses`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'projection' && fiveYearProjection && (
          <div>
            <h3 className="text-lg font-medium mb-4">Proyección a 5 Años</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Ingresos Acumulados</p>
                <p className="text-2xl font-bold">
                  ${fiveYearProjection.cumulativeValues.revenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Beneficio Acumulado</p>
                <p className="text-2xl font-bold">
                  ${fiveYearProjection.cumulativeValues.profit.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">ROI Acumulado</p>
                <p className="text-2xl font-bold">
                  {fiveYearProjection.cumulativeValues.roi.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium mb-2">Ingresos, Costos y Beneficios Anuales</h4>
                <div className="h-80">
                  <Bar data={projectionData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium mb-2">Flujo de Caja Acumulado</h4>
                <div className="h-80">
                  <Line data={cumulativeProjectionData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-medium mb-2">Detalle por Año</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Año
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingresos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beneficio
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Flujo de Caja
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ROI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(fiveYearProjection.years).map(([year, data]: [string, any]) => (
                      <tr key={year}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Año {year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          ${data.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          ${data.costs.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          ${data.profit.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          ${data.cashFlow.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {data.roi.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Funciones auxiliares para obtener nombres legibles
function getScenarioTypeLabel(type: ScenarioType): string {
  const labels: Record<ScenarioType, string> = {
    [ScenarioType.OPTIMISTIC]: 'Optimista',
    [ScenarioType.REALISTIC]: 'Realista',
    [ScenarioType.PESSIMISTIC]: 'Pesimista',
    [ScenarioType.CUSTOM]: 'Personalizado',
  };
  return labels[type] || type;
}

function getScenarioTypeBadgeClass(type: ScenarioType): string {
  const classes: Record<ScenarioType, string> = {
    [ScenarioType.OPTIMISTIC]: 'bg-green-100 text-green-800',
    [ScenarioType.REALISTIC]: 'bg-blue-100 text-blue-800',
    [ScenarioType.PESSIMISTIC]: 'bg-red-100 text-red-800',
    [ScenarioType.CUSTOM]: 'bg-purple-100 text-purple-800',
  };
  return classes[type] || '';
}

function getTabName(tab: 'scenarios' | 'comparison' | 'projection'): string {
  const names = {
    scenarios: 'Escenarios',
    comparison: 'Comparativa',
    projection: 'Proyección a 5 Años',
  };
  return names[tab];
}
