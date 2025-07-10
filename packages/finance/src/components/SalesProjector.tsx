import React, { useState, useEffect } from 'react';
import {
  SalesProjectionConfig,
  generateSalesProjection,
  distributeConstructionCosts,
  calculateOptimalSalesVelocity,
} from '../models/SalesProjection';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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

interface SalesProjectorProps {
  totalConstructionCost: number;
  totalIndirectCost: number;
  initialConfig?: Partial<SalesProjectionConfig>;
  onProjectionChange?: (projection: any) => void;
}

export const SalesProjector: React.FC<SalesProjectorProps> = ({
  totalConstructionCost,
  totalIndirectCost,
  initialConfig,
  onProjectionChange,
}) => {
  const [config, setConfig] = useState<SalesProjectionConfig>({
    totalUnits: initialConfig?.totalUnits || 50,
    unitPrice: initialConfig?.unitPrice || 200000,
    salesStartDate: initialConfig?.salesStartDate || new Date(),
    salesVelocity: initialConfig?.salesVelocity || 3,
    priceIncreaseRate: initialConfig?.priceIncreaseRate || 3.0,
    reservationFee: initialConfig?.reservationFee || 5,
    downPayment: initialConfig?.downPayment || 15,
    installmentMonths: initialConfig?.installmentMonths || 12,
    projectDuration: initialConfig?.projectDuration || 30,
  });

  const [projection, setProjection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'cashflow' | 'metrics'>('sales');
  const [distributionPattern, setDistributionPattern] = useState<
    'linear' | 'frontloaded' | 'backloaded' | 'bell'
  >('bell');

  useEffect(() => {
    // Distribuir costos según el patrón seleccionado
    const constructionCosts = distributeConstructionCosts(
      totalConstructionCost,
      config.projectDuration,
      distributionPattern,
    );

    // Distribuir costos indirectos (más uniformes)
    const indirectCosts = distributeConstructionCosts(
      totalIndirectCost,
      config.projectDuration,
      'linear',
    );

    // Generar proyección de ventas
    const result = generateSalesProjection(config, constructionCosts, indirectCosts);
    setProjection(result);

    // Notificar cambio
    if (onProjectionChange) {
      onProjectionChange(result);
    }
  }, [config, totalConstructionCost, totalIndirectCost, distributionPattern, onProjectionChange]);

  const handleConfigChange = (field: keyof SalesProjectionConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOptimizeVelocity = () => {
    // Calcular velocidad óptima basada en unidades totales y duración del proyecto
    const optimalVelocity = calculateOptimalSalesVelocity(
      config.totalUnits,
      config.projectDuration,
      5, // Tasa de absorción del mercado (ejemplo)
    );

    handleConfigChange('salesVelocity', optimalVelocity);
  };

  if (!projection) {
    return <div className="p-4">Generando proyección...</div>;
  }

  // Preparar datos para gráficos
  const months = projection.monthlySales.map((sale: any) => {
    const date = new Date(sale.date);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  });

  const salesData = {
    labels: months,
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: projection.monthlySales.map((sale: any) => sale.unitsSold),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const cumulativeSalesData = {
    labels: months,
    datasets: [
      {
        label: 'Unidades Acumuladas',
        data: projection.monthlySales.map((sale: any) => sale.cumulativeUnitsSold),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const cashFlowData = {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        data: projection.cashFlow.map((entry: any) => entry.totalInflow),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Egresos',
        data: projection.cashFlow.map((entry: any) => entry.totalOutflow),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };

  const cumulativeCashFlowData = {
    labels: months,
    datasets: [
      {
        label: 'Flujo Acumulado',
        data: projection.cashFlow.map((entry: any) => entry.cumulativeCashFlow),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Proyección de Ventas y Flujo de Caja</h2>
      </div>

      <div className="p-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidades Totales</label>
            <input
              type="number"
              min="1"
              value={config.totalUnits}
              onChange={(e) => handleConfigChange('totalUnits', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio por Unidad ($)
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={config.unitPrice}
              onChange={(e) => handleConfigChange('unitPrice', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Velocidad de Ventas (unidades/mes)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={config.salesVelocity}
                onChange={(e) => handleConfigChange('salesVelocity', Number(e.target.value))}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={handleOptimizeVelocity}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Optimizar velocidad de ventas"
              >
                Optimizar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Incremento Anual de Precio (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={config.priceIncreaseRate}
              onChange={(e) => handleConfigChange('priceIncreaseRate', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración del Proyecto (meses)
            </label>
            <input
              type="number"
              min="1"
              value={config.projectDuration}
              onChange={(e) => handleConfigChange('projectDuration', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patrón de Distribución de Costos
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={distributionPattern}
              onChange={(e) => setDistributionPattern(e.target.value as any)}
            >
              <option value="linear">Lineal</option>
              <option value="frontloaded">Mayor al Inicio</option>
              <option value="backloaded">Mayor al Final</option>
              <option value="bell">Campana (Mayor al Medio)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reservación (% del precio)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={config.reservationFee}
              onChange={(e) => handleConfigChange('reservationFee', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enganche (% del precio)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={config.downPayment}
              onChange={(e) => handleConfigChange('downPayment', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meses para Pagos (resto)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.installmentMonths}
              onChange={(e) => handleConfigChange('installmentMonths', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div className="border-b">
        <div className="flex">
          {(['sales', 'cashflow', 'metrics'] as const).map((tab) => (
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
        {activeTab === 'sales' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Unidades Totales</p>
                <p className="text-2xl font-bold">{config.totalUnits}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Ingresos Totales</p>
                <p className="text-2xl font-bold">
                  ${projection.metrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Absorción Promedio</p>
                <p className="text-2xl font-bold">
                  {projection.metrics.averageAbsorptionRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Ventas Mensuales</h3>
                <div className="h-80">
                  <Bar data={salesData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Ventas Acumuladas</h3>
                <div className="h-80">
                  <Line data={cumulativeSalesData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Punto de Equilibrio</p>
                <p className="text-2xl font-bold">
                  {projection.metrics.breakEvenMonth
                    ? `Mes ${projection.metrics.breakEvenMonth}`
                    : 'No alcanzado'}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Flujo Neto Final</p>
                <p className="text-2xl font-bold">
                  $
                  {projection.cashFlow[
                    projection.cashFlow.length - 1
                  ].cumulativeCashFlow.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Duración de Ventas</p>
                <p className="text-2xl font-bold">{projection.metrics.salesDuration} meses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Ingresos vs Egresos</h3>
                <div className="h-80">
                  <Bar data={cashFlowData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Flujo Acumulado</h3>
                <div className="h-80">
                  <Line data={cumulativeCashFlowData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Métricas de Ventas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Unidades Totales</span>
                    <span className="font-medium">{config.totalUnits}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Precio por Unidad</span>
                    <span className="font-medium">${config.unitPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Ingresos Totales</span>
                    <span className="font-medium">
                      ${projection.metrics.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Velocidad de Ventas</span>
                    <span className="font-medium">{config.salesVelocity} unidades/mes</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Duración de Ventas</span>
                    <span className="font-medium">{projection.metrics.salesDuration} meses</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Absorción Promedio</span>
                    <span className="font-medium">
                      {projection.metrics.averageAbsorptionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Métricas de Flujo de Caja</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Punto de Equilibrio</span>
                    <span className="font-medium">
                      {projection.metrics.breakEvenMonth
                        ? `Mes ${projection.metrics.breakEvenMonth}`
                        : 'No alcanzado'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Fecha de Punto de Equilibrio</span>
                    <span className="font-medium">
                      {projection.metrics.breakEvenDate
                        ? new Date(projection.metrics.breakEvenDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Costo Total de Construcción</span>
                    <span className="font-medium">${totalConstructionCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Costo Total Indirecto</span>
                    <span className="font-medium">${totalIndirectCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Flujo Neto Final</span>
                    <span className="font-medium">
                      $
                      {projection.cashFlow[
                        projection.cashFlow.length - 1
                      ].cumulativeCashFlow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Patrón de Costos</span>
                    <span className="font-medium">
                      {getDistributionPatternName(distributionPattern)}
                    </span>
                  </div>
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
function getTabName(tab: 'sales' | 'cashflow' | 'metrics'): string {
  const names = {
    sales: 'Ventas',
    cashflow: 'Flujo de Caja',
    metrics: 'Métricas',
  };
  return names[tab];
}

function getDistributionPatternName(
  pattern: 'linear' | 'frontloaded' | 'backloaded' | 'bell',
): string {
  const names = {
    linear: 'Lineal',
    frontloaded: 'Mayor al Inicio',
    backloaded: 'Mayor al Final',
    bell: 'Campana (Mayor al Medio)',
  };
  return names[pattern];
}
