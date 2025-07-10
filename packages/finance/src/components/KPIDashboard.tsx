import React from 'react';
import { FinancialKPIs, generateKPIReport } from '../models/FinancialKPIs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, PolarArea, Radar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

interface KPIDashboardProps {
  kpis: FinancialKPIs;
  projectName: string;
  _totalRevenue: number;
  totalCost: number;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  kpis,
  projectName,
  _totalRevenue,
  totalCost,
}) => {
  const kpiReport = generateKPIReport(kpis);

  // Datos para gráfico de pastel (distribución de costos)
  const costDistributionData = {
    labels: ['Terreno', 'Construcción', 'Materiales', 'Indirectos', 'Financiamiento'],
    datasets: [
      {
        data: [15, 40, 25, 15, 5].map((percent) => totalCost * (percent / 100)), // Ejemplo simplificado
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Datos para gráfico de área polar (KPIs relativos)
  const kpiRelativeData = {
    labels: ['ROI', 'TIR', 'Margen', 'Cobertura', 'Cap Rate'],
    datasets: [
      {
        data: [
          normalizeKPI(kpis.roi, 0, 30),
          normalizeKPI(kpis.irr, 0, 25),
          normalizeKPI(kpis.profitMargin, 0, 40),
          normalizeKPI(kpis.debtServiceCoverageRatio, 0, 3),
          normalizeKPI(kpis.capRate, 0, 10),
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  // Datos para gráfico de radar (comparativa con benchmarks)
  const benchmarkData = {
    labels: ['ROI', 'TIR', 'Margen', 'Cobertura', 'Cap Rate'],
    datasets: [
      {
        label: 'Proyecto',
        data: [
          kpis.roi,
          kpis.irr,
          kpis.profitMargin,
          kpis.debtServiceCoverageRatio * 10, // Escalado para visualización
          kpis.capRate,
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
      },
      {
        label: 'Benchmark',
        data: [15, 12, 25, 15, 6], // Valores de benchmark de ejemplo
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Dashboard de KPIs Financieros</h2>
        <p className="text-sm text-gray-600">Proyecto: {projectName}</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">ROI</p>
            <p className="text-2xl font-bold">{kpis.roi.toFixed(2)}%</p>
            <p className="text-xs text-gray-500">Retorno sobre Inversión</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">TIR</p>
            <p className="text-2xl font-bold">{kpis.irr.toFixed(2)}%</p>
            <p className="text-xs text-gray-500">Tasa Interna de Retorno</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">VAN</p>
            <p className="text-2xl font-bold">${kpis.npv.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Valor Actual Neto</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Periodo de Recuperación</p>
            <p className="text-xl font-bold">
              {kpis.paybackPeriod === Infinity
                ? 'No se recupera'
                : `${Math.floor(kpis.paybackPeriod)} meses y ${Math.round((kpis.paybackPeriod % 1) * 30)} días`}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Margen de Beneficio</p>
            <p className="text-xl font-bold">{kpis.profitMargin.toFixed(2)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-2 text-center">Distribución de Costos</h3>
            <div className="h-64">
              <Pie data={costDistributionData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-center">KPIs Relativos</h3>
            <div className="h-64">
              <PolarArea data={kpiRelativeData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-center">Comparativa con Benchmark</h3>
            <div className="h-64">
              <Radar data={benchmarkData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Métricas Financieras</h3>
            <div className="space-y-3">
              {Object.entries(kpiReport)
                .slice(0, 6)
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Métricas por m²</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Costo por m²</span>
                <span className="font-medium">${kpis.costPerM2.toLocaleString()} / m²</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Ingreso por m²</span>
                <span className="font-medium">${kpis.revenuePerM2.toLocaleString()} / m²</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Beneficio por m²</span>
                <span className="font-medium">${kpis.profitPerM2.toLocaleString()} / m²</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Ratio de Cobertura</span>
                <span className="font-medium">{kpis.debtServiceCoverageRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Ocupación de Punto de Equilibrio</span>
                <span className="font-medium">{kpis.breakEvenOccupancy.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Tasa de Capitalización</span>
                <span className="font-medium">{kpis.capRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para normalizar valores de KPI para visualización
function normalizeKPI(value: number, min: number, max: number): number {
  // Limitar valor al rango [min, max]
  const clampedValue = Math.max(min, Math.min(max, value));

  // Normalizar a escala 0-100 para visualización
  return ((clampedValue - min) / (max - min)) * 100;
}
