/**
 * Finance Module - Motor de cálculos financieros para proyectos inmobiliarios
 * Implementa cálculos de ROI, TIR, VAN, flujos de caja y análisis de escenarios
 * @module FinanceModule
 */

(function () {
  'use strict';

  /**
   * Factory function para crear instancias del módulo Finance
   * @returns {Object} Instancia del módulo Finance
   */
  window.FinanceModule = function () {
    // Estado privado
    const state = {
      projectData: null,
      financialModel: {
        // Costos de construcción por m² (MXN)
        constructionCosts: {
          traditional: { basic: 8000, standard: 12000, premium: 18000, luxury: 25000 },
          prefab: { basic: 6000, standard: 9000, premium: 14000, luxury: 20000 },
          steel: { basic: 10000, standard: 15000, premium: 22000, luxury: 30000 },
          eco: { basic: 9000, standard: 13000, premium: 20000, luxury: 28000 },
        },
        // Costos adicionales (% del costo de construcción)
        additionalCosts: {
          permits: 0.05, // Permisos y licencias
          design: 0.08, // Diseño arquitectónico
          supervision: 0.06, // Supervisión de obra
          utilities: 0.1, // Instalaciones y conexiones
          landscaping: 0.05, // Paisajismo
          contingency: 0.1, // Contingencia
          marketing: 0.03, // Marketing y ventas
          legal: 0.02, // Gastos legales
          financial: 0.04, // Gastos financieros
        },
        // Parámetros de mercado
        marketParams: {
          inflationRate: 0.045, // Inflación anual
          discountRate: 0.12, // Tasa de descuento
          priceAppreciation: 0.06, // Apreciación anual
          rentalYield: 0.07, // Rendimiento por renta
          vacancyRate: 0.1, // Tasa de vacancia
          operatingExpenses: 0.25, // Gastos operativos (% de ingresos)
        },
        // Escenarios
        scenarios: {
          optimistic: {
            salesPriceMultiplier: 1.15,
            constructionTimeMultiplier: 0.85,
            costOverrunMultiplier: 0.95,
          },
          realistic: {
            salesPriceMultiplier: 1.0,
            constructionTimeMultiplier: 1.0,
            costOverrunMultiplier: 1.05,
          },
          pessimistic: {
            salesPriceMultiplier: 0.85,
            constructionTimeMultiplier: 1.2,
            costOverrunMultiplier: 1.15,
          },
        },
      },
      currentScenario: 'realistic',
      calculations: {},
      charts: {},
      callbacks: {
        onCalculationComplete: null,
        onScenarioChange: null,
        onExport: null,
      },
    };

    /**
     * Inicializa el módulo financiero
     * @param {Object} config - Configuración inicial
     * @returns {Promise<void>}
     */
    async function init(config = {}) {
      console.log('💰 Initializing Finance Module...');

      // Configurar callbacks
      if (config.callbacks) {
        Object.assign(state.callbacks, config.callbacks);
      }

      // Cargar parámetros de mercado actualizados
      await loadMarketData();

      // Inicializar charts si Chart.js está disponible
      if (window.Chart) {
        initializeCharts();
      }

      console.log('✅ Finance Module initialized');
    }

    /**
     * Carga datos de mercado actualizados
     */
    async function loadMarketData() {
      // En producción, esto podría cargar datos de una API
      // Por ahora, usar valores predefinidos con pequeña variación aleatoria
      const variation = () => (Math.random() - 0.5) * 0.02;

      state.financialModel.marketParams.inflationRate += variation();
      state.financialModel.marketParams.priceAppreciation += variation();
      state.financialModel.marketParams.rentalYield += variation();
    }

    /**
     * Configura los datos del proyecto
     * @param {Object} projectData - Datos del proyecto
     */
    function setProjectData(projectData) {
      state.projectData = projectData;

      // Calcular automáticamente si hay datos suficientes
      if (validateProjectData()) {
        calculateFinancials();
      }
    }

    /**
     * Valida que los datos del proyecto sean completos
     */
    function validateProjectData() {
      return (
        state.projectData &&
        state.projectData.terrainData &&
        state.projectData.terrainData.area > 0 &&
        state.projectData.constructionSystem &&
        state.projectData.materialLevel
      );
    }

    /**
     * Calcula todos los indicadores financieros
     */
    function calculateFinancials() {
      if (!validateProjectData()) {
        console.error('❌ Incomplete project data');
        return;
      }

      // Resetear cálculos
      state.calculations = {};

      // Calcular costos
      calculateCosts();

      // Calcular ingresos proyectados
      calculateRevenue();

      // Calcular flujos de caja
      calculateCashFlows();

      // Calcular indicadores (ROI, TIR, VAN)
      calculateIndicators();

      // Actualizar visualizaciones
      updateVisualizations();

      // Callback
      if (state.callbacks.onCalculationComplete) {
        state.callbacks.onCalculationComplete(state.calculations);
      }

      console.log('✅ Financial calculations complete:', state.calculations);
    }

    /**
     * Calcula los costos totales del proyecto
     */
    function calculateCosts() {
      const area = state.projectData.terrainData.area;
      const system = state.projectData.constructionSystem;
      const level = state.projectData.materialLevel;
      const scenario = state.financialModel.scenarios[state.currentScenario];

      // Costo base de construcción
      const baseCostPerM2 = state.financialModel.constructionCosts[system][level];
      const constructionCost = area * baseCostPerM2 * scenario.costOverrunMultiplier;

      // Costos adicionales
      const additionalCosts = {};
      let totalAdditional = 0;

      Object.entries(state.financialModel.additionalCosts).forEach(([key, percentage]) => {
        const cost = constructionCost * percentage;
        additionalCosts[key] = cost;
        totalAdditional += cost;
      });

      // Costo del terreno (estimado como 20-30% del proyecto total)
      const landCost = area * 5000; // $5,000 MXN/m² promedio

      // Costo total
      const totalCost = landCost + constructionCost + totalAdditional;

      state.calculations.costs = {
        landCost,
        constructionCost,
        additionalCosts,
        totalAdditional,
        totalCost,
        costPerM2: totalCost / area,
        breakdown: {
          land: (landCost / totalCost) * 100,
          construction: (constructionCost / totalCost) * 100,
          additional: (totalAdditional / totalCost) * 100,
        },
      };
    }

    /**
     * Calcula los ingresos proyectados
     */
    function calculateRevenue() {
      const area = state.projectData.terrainData.area;
      const scenario = state.financialModel.scenarios[state.currentScenario];
      const projectType = state.projectData.projectType || 'residential';

      // Precio de venta estimado por m²
      let basePricePerM2;
      switch (projectType) {
        case 'residential':
          basePricePerM2 = 25000; // MXN
          break;
        case 'commercial':
          basePricePerM2 = 35000;
          break;
        case 'mixed':
          basePricePerM2 = 30000;
          break;
        case 'industrial':
          basePricePerM2 = 15000;
          break;
        default:
          basePricePerM2 = 25000;
      }

      // Ajustar por escenario
      const salePricePerM2 = basePricePerM2 * scenario.salesPriceMultiplier;
      const totalSalesRevenue = area * salePricePerM2;

      // Ingresos por renta (si aplica)
      const monthlyRentPerM2 =
        (salePricePerM2 * state.financialModel.marketParams.rentalYield) / 12;
      const monthlyRentRevenue =
        area * monthlyRentPerM2 * (1 - state.financialModel.marketParams.vacancyRate);
      const annualRentRevenue = monthlyRentRevenue * 12;

      state.calculations.revenue = {
        salePricePerM2,
        totalSalesRevenue,
        monthlyRentPerM2,
        monthlyRentRevenue,
        annualRentRevenue,
        revenueType: 'mixed', // sale, rent, mixed
        breakEvenMonths: state.calculations.costs.totalCost / monthlyRentRevenue,
      };
    }

    /**
     * Calcula los flujos de caja proyectados
     */
    function calculateCashFlows() {
      const costs = state.calculations.costs;
      const revenue = state.calculations.revenue;
      const scenario = state.financialModel.scenarios[state.currentScenario];

      // Tiempo de construcción (meses)
      const constructionTime = Math.ceil(12 * scenario.constructionTimeMultiplier);

      // Proyección a 5 años
      const years = 5;
      const cashFlows = [];

      // Año 0: Inversión inicial
      cashFlows.push({
        year: 0,
        investment: -costs.landCost,
        construction: 0,
        revenue: 0,
        operatingExpenses: 0,
        netCashFlow: -costs.landCost,
      });

      // Años de construcción
      const constructionYears = Math.ceil(constructionTime / 12);
      const constructionCostPerYear =
        (costs.constructionCost + costs.totalAdditional) / constructionYears;

      for (let year = 1; year <= constructionYears; year++) {
        cashFlows.push({
          year,
          investment: 0,
          construction: -constructionCostPerYear,
          revenue: 0,
          operatingExpenses: 0,
          netCashFlow: -constructionCostPerYear,
        });
      }

      // Años de operación
      for (let year = constructionYears + 1; year <= years; year++) {
        const yearsSinceCompletion = year - constructionYears;

        // Aplicar apreciación
        const appreciation = Math.pow(
          1 + state.financialModel.marketParams.priceAppreciation,
          yearsSinceCompletion,
        );
        const yearRevenue = revenue.annualRentRevenue * appreciation;
        const operatingExpenses = yearRevenue * state.financialModel.marketParams.operatingExpenses;

        cashFlows.push({
          year,
          investment: 0,
          construction: 0,
          revenue: yearRevenue,
          operatingExpenses: -operatingExpenses,
          netCashFlow: yearRevenue - operatingExpenses,
        });
      }

      // Valor residual (venta al final)
      const lastYear = cashFlows[cashFlows.length - 1];
      const residualValue =
        revenue.totalSalesRevenue *
        Math.pow(1 + state.financialModel.marketParams.priceAppreciation, years);
      lastYear.residualValue = residualValue;
      lastYear.netCashFlow += residualValue;

      state.calculations.cashFlows = cashFlows;
    }

    /**
     * Calcula indicadores financieros (ROI, TIR, VAN)
     */
    function calculateIndicators() {
      const cashFlows = state.calculations.cashFlows;
      const discountRate = state.financialModel.marketParams.discountRate;

      // VAN (Valor Actual Neto)
      let npv = 0;
      cashFlows.forEach((cf) => {
        npv += cf.netCashFlow / Math.pow(1 + discountRate, cf.year);
      });

      // TIR (Tasa Interna de Retorno)
      const irr = calculateIRR(cashFlows.map((cf) => cf.netCashFlow));

      // ROI (Return on Investment)
      const totalInvestment = Math.abs(
        cashFlows.filter((cf) => cf.netCashFlow < 0).reduce((sum, cf) => sum + cf.netCashFlow, 0),
      );
      const totalReturn = cashFlows
        .filter((cf) => cf.netCashFlow > 0)
        .reduce((sum, cf) => sum + cf.netCashFlow, 0);
      const roi = ((totalReturn - totalInvestment) / totalInvestment) * 100;

      // Período de recuperación (Payback)
      let cumulativeCashFlow = 0;
      let paybackPeriod = 0;

      for (let i = 0; i < cashFlows.length; i++) {
        cumulativeCashFlow += cashFlows[i].netCashFlow;
        if (cumulativeCashFlow >= 0) {
          paybackPeriod =
            i +
            (cumulativeCashFlow - cashFlows[i].netCashFlow) / Math.abs(cashFlows[i].netCashFlow);
          break;
        }
      }

      state.calculations.indicators = {
        npv: Math.round(npv),
        irr: (irr * 100).toFixed(2),
        roi: roi.toFixed(2),
        paybackPeriod: paybackPeriod.toFixed(1),
        profitabilityIndex: (npv / totalInvestment + 1).toFixed(2),
      };
    }

    /**
     * Calcula la TIR usando el método de Newton-Raphson
     */
    function calculateIRR(cashFlows) {
      let rate = 0.1; // Estimación inicial 10%
      let tolerance = 0.00001;
      let maxIterations = 100;

      for (let i = 0; i < maxIterations; i++) {
        let npv = 0;
        let dnpv = 0;

        for (let j = 0; j < cashFlows.length; j++) {
          npv += cashFlows[j] / Math.pow(1 + rate, j);
          dnpv -= (j * cashFlows[j]) / Math.pow(1 + rate, j + 1);
        }

        let newRate = rate - npv / dnpv;

        if (Math.abs(newRate - rate) < tolerance) {
          return newRate;
        }

        rate = newRate;
      }

      return rate;
    }

    /**
     * Cambia el escenario de análisis
     * @param {string} scenario - 'optimistic', 'realistic', 'pessimistic'
     */
    function setScenario(scenario) {
      if (state.financialModel.scenarios[scenario]) {
        state.currentScenario = scenario;

        // Recalcular con nuevo escenario
        if (validateProjectData()) {
          calculateFinancials();
        }

        // Callback
        if (state.callbacks.onScenarioChange) {
          state.callbacks.onScenarioChange(scenario);
        }
      }
    }

    /**
     * Inicializa los gráficos
     */
    function initializeCharts() {
      // Configuración común para gráficos
      Chart.defaults.font.family = "'Inter', sans-serif";
      Chart.defaults.color = '#334155';
    }

    /**
     * Actualiza las visualizaciones
     */
    function updateVisualizations() {
      if (!window.Chart) return;

      // Actualizar gráfica de proyección de flujos
      updateCashFlowChart();

      // Actualizar gráfica de distribución de costos
      updateCostBreakdownChart();

      // Actualizar gráfica de indicadores
      updateIndicatorsChart();
    }

    /**
     * Actualiza la gráfica de flujos de caja
     */
    function updateCashFlowChart() {
      const canvas = document.getElementById('projection-chart');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const cashFlows = state.calculations.cashFlows;

      // Destruir gráfico anterior si existe
      if (state.charts.cashFlow) {
        state.charts.cashFlow.destroy();
      }

      // Preparar datos
      const labels = cashFlows.map((cf) => `Año ${cf.year}`);
      const data = cashFlows.map((cf) => cf.netCashFlow / 1000000); // En millones
      const cumulative = [];
      let sum = 0;

      data.forEach((value) => {
        sum += value;
        cumulative.push(sum);
      });

      // Colores según escenario
      const scenarioColors = {
        optimistic: 'rgba(34, 197, 94, 0.8)',
        realistic: 'rgba(59, 130, 246, 0.8)',
        pessimistic: 'rgba(239, 68, 68, 0.8)',
      };

      state.charts.cashFlow = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Flujo de Caja Anual',
              data,
              borderColor: scenarioColors[state.currentScenario],
              backgroundColor: scenarioColors[state.currentScenario].replace('0.8', '0.1'),
              borderWidth: 3,
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Flujo Acumulado',
              data: cumulative,
              borderColor: 'rgba(99, 102, 241, 0.8)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.4,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            title: {
              display: true,
              text: `Proyección de Flujos - Escenario ${state.currentScenario}`,
              font: { size: 16, weight: 'bold' },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}M MXN`;
                },
              },
            },
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Millones MXN',
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    /**
     * Actualiza la gráfica de distribución de costos
     */
    function updateCostBreakdownChart() {
      const canvas = document.getElementById('cost-breakdown-chart');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const costs = state.calculations.costs;

      if (state.charts.costBreakdown) {
        state.charts.costBreakdown.destroy();
      }

      state.charts.costBreakdown = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Terreno', 'Construcción', 'Costos Adicionales'],
          datasets: [
            {
              data: [
                costs.landCost / 1000000,
                costs.constructionCost / 1000000,
                costs.totalAdditional / 1000000,
              ],
              backgroundColor: [
                'rgba(249, 115, 22, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(139, 92, 246, 0.8)',
              ],
              borderWidth: 2,
              borderColor: '#fff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Distribución de Costos',
              font: { size: 16, weight: 'bold' },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const percentage =
                    costs.breakdown[context.label.toLowerCase().replace(' adicionales', '')];
                  return `${context.label}: $${context.parsed.toFixed(2)}M (${percentage.toFixed(1)}%)`;
                },
              },
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      });
    }

    /**
     * Actualiza la visualización de indicadores
     */
    function updateIndicatorsChart() {
      // Actualizar elementos DOM con los valores
      const indicators = state.calculations.indicators;

      // ROI
      const roiElement = document.querySelector('[data-indicator="roi"]');
      if (roiElement) {
        roiElement.textContent = `${indicators.roi}%`;
        updateIndicatorTrend(roiElement, indicators.roi, 20);
      }

      // TIR
      const irrElement = document.querySelector('[data-indicator="irr"]');
      if (irrElement) {
        irrElement.textContent = `${indicators.irr}%`;
        updateIndicatorTrend(irrElement, indicators.irr, 15);
      }

      // VAN
      const npvElement = document.querySelector('[data-indicator="npv"]');
      if (npvElement) {
        npvElement.textContent = `$${(indicators.npv / 1000000).toFixed(1)}M`;
        updateIndicatorTrend(npvElement, indicators.npv, 0);
      }

      // Payback
      const paybackElement = document.querySelector('[data-indicator="payback"]');
      if (paybackElement) {
        paybackElement.textContent = `${indicators.paybackPeriod} años`;
        updateIndicatorTrend(paybackElement, indicators.paybackPeriod, 4, true); // Inverso: menor es mejor
      }
    }

    /**
     * Actualiza el indicador de tendencia
     */
    function updateIndicatorTrend(element, value, threshold, inverse = false) {
      const parent = element.closest('.kpi-card');
      if (!parent) return;

      const trendElement = parent.querySelector('.trend');
      if (!trendElement) return;

      const isPositive = inverse ? value < threshold : value > threshold;

      trendElement.textContent = isPositive ? '↑' : '↓';
      trendElement.className = `trend ${isPositive ? 'text-green-600' : 'text-red-600'}`;
    }

    /**
     * Genera análisis de sensibilidad
     */
    function generateSensitivityAnalysis() {
      const baseNPV = state.calculations.indicators.npv;
      const variables = [
        { name: 'Precio de Venta', key: 'salesPrice', range: [-20, -10, 0, 10, 20] },
        { name: 'Costo de Construcción', key: 'constructionCost', range: [-20, -10, 0, 10, 20] },
        { name: 'Tiempo de Construcción', key: 'constructionTime', range: [-20, -10, 0, 10, 20] },
        { name: 'Tasa de Descuento', key: 'discountRate', range: [-20, -10, 0, 10, 20] },
      ];

      const results = {};

      variables.forEach((variable) => {
        results[variable.key] = variable.range.map((change) => {
          // Simular cambio y recalcular NPV
          // Por simplicidad, usar aproximación lineal
          let npvChange = baseNPV;

          switch (variable.key) {
            case 'salesPrice':
              npvChange = baseNPV * (1 + (change / 100) * 1.5);
              break;
            case 'constructionCost':
              npvChange = baseNPV * (1 - (change / 100) * 0.8);
              break;
            case 'constructionTime':
              npvChange = baseNPV * (1 - (change / 100) * 0.3);
              break;
            case 'discountRate':
              npvChange = baseNPV * (1 - (change / 100) * 0.5);
              break;
          }

          return {
            change,
            npv: npvChange,
            impact: (((npvChange - baseNPV) / baseNPV) * 100).toFixed(1),
          };
        });
      });

      return results;
    }

    /**
     * Exporta el análisis a PDF
     */
    async function exportToPDF() {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error('jsPDF not loaded');
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Título
      doc.setFontSize(20);
      doc.text('Análisis Financiero - Beyond Solutions', 20, 20);

      // Información del proyecto
      doc.setFontSize(12);
      doc.text(`Proyecto: ${state.projectData.projectName || 'Sin nombre'}`, 20, 40);
      doc.text(`Ubicación: ${state.projectData.location || 'No especificada'}`, 20, 50);
      doc.text(`Área: ${state.projectData.terrainData.area.toLocaleString()} m²`, 20, 60);
      doc.text(`Escenario: ${state.currentScenario}`, 20, 70);

      // Indicadores principales
      doc.setFontSize(14);
      doc.text('Indicadores Financieros', 20, 90);
      doc.setFontSize(11);
      doc.text(`ROI: ${state.calculations.indicators.roi}%`, 20, 100);
      doc.text(`TIR: ${state.calculations.indicators.irr}%`, 20, 110);
      doc.text(`VAN: $${(state.calculations.indicators.npv / 1000000).toFixed(2)}M MXN`, 20, 120);
      doc.text(
        `Período de Recuperación: ${state.calculations.indicators.paybackPeriod} años`,
        20,
        130,
      );

      // Resumen de costos
      doc.setFontSize(14);
      doc.text('Resumen de Costos', 20, 150);
      doc.setFontSize(11);
      doc.text(
        `Costo Total: $${(state.calculations.costs.totalCost / 1000000).toFixed(2)}M MXN`,
        20,
        160,
      );
      doc.text(
        `Costo por m²: $${state.calculations.costs.costPerM2.toLocaleString()} MXN`,
        20,
        170,
      );

      // Agregar gráficas si es posible
      if (state.charts.cashFlow) {
        const canvas = document.getElementById('projection-chart');
        if (canvas) {
          const imgData = canvas.toDataURL('image/png');
          doc.addPage();
          doc.text('Proyección de Flujos de Caja', 20, 20);
          doc.addImage(imgData, 'PNG', 20, 30, 170, 100);
        }
      }

      // Guardar PDF
      doc.save(`analisis_financiero_${Date.now()}.pdf`);

      // Callback
      if (state.callbacks.onExport) {
        state.callbacks.onExport('pdf');
      }
    }

    /**
     * Exporta el análisis a Excel
     */
    function exportToExcel() {
      // Crear datos para CSV (alternativa simple a Excel)
      const csvData = [];

      // Encabezados
      csvData.push(['Análisis Financiero - Beyond Solutions']);
      csvData.push([]);
      csvData.push(['Proyecto', state.projectData.projectName || 'Sin nombre']);
      csvData.push(['Ubicación', state.projectData.location || 'No especificada']);
      csvData.push(['Área (m²)', state.projectData.terrainData.area]);
      csvData.push(['Escenario', state.currentScenario]);
      csvData.push([]);

      // Indicadores
      csvData.push(['INDICADORES FINANCIEROS']);
      csvData.push(['ROI (%)', state.calculations.indicators.roi]);
      csvData.push(['TIR (%)', state.calculations.indicators.irr]);
      csvData.push(['VAN (MXN)', state.calculations.indicators.npv]);
      csvData.push(['Período de Recuperación (años)', state.calculations.indicators.paybackPeriod]);
      csvData.push([]);

      // Costos
      csvData.push(['RESUMEN DE COSTOS']);
      csvData.push(['Costo del Terreno', state.calculations.costs.landCost]);
      csvData.push(['Costo de Construcción', state.calculations.costs.constructionCost]);
      csvData.push(['Costos Adicionales', state.calculations.costs.totalAdditional]);
      csvData.push(['Costo Total', state.calculations.costs.totalCost]);
      csvData.push(['Costo por m²', state.calculations.costs.costPerM2]);
      csvData.push([]);

      // Flujos de caja
      csvData.push(['FLUJOS DE CAJA PROYECTADOS']);
      csvData.push([
        'Año',
        'Inversión',
        'Construcción',
        'Ingresos',
        'Gastos Operativos',
        'Flujo Neto',
      ]);

      state.calculations.cashFlows.forEach((cf) => {
        csvData.push([
          cf.year,
          cf.investment || 0,
          cf.construction || 0,
          cf.revenue || 0,
          cf.operatingExpenses || 0,
          cf.netCashFlow,
        ]);
      });

      // Convertir a CSV
      const csv = csvData.map((row) => row.join(',')).join('\n');

      // Descargar
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analisis_financiero_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      // Callback
      if (state.callbacks.onExport) {
        state.callbacks.onExport('excel');
      }
    }

    /**
     * Obtiene el resumen de cálculos
     */
    function getSummary() {
      if (!state.calculations.indicators) {
        return null;
      }

      return {
        scenario: state.currentScenario,
        indicators: state.calculations.indicators,
        costs: {
          total: state.calculations.costs.totalCost,
          perM2: state.calculations.costs.costPerM2,
          breakdown: state.calculations.costs.breakdown,
        },
        revenue: {
          salesPrice: state.calculations.revenue.totalSalesRevenue,
          monthlyRent: state.calculations.revenue.monthlyRentRevenue,
          breakEven: state.calculations.revenue.breakEvenMonths,
        },
        viability: {
          isViable:
            state.calculations.indicators.npv > 0 &&
            parseFloat(state.calculations.indicators.irr) > 12,
          riskLevel: getRiskLevel(),
          recommendation: getRecommendation(),
        },
      };
    }

    /**
     * Evalúa el nivel de riesgo
     */
    function getRiskLevel() {
      const irr = parseFloat(state.calculations.indicators.irr);
      const payback = parseFloat(state.calculations.indicators.paybackPeriod);

      if (irr > 20 && payback < 3) return 'Bajo';
      if (irr > 15 && payback < 4) return 'Moderado';
      if (irr > 10 && payback < 5) return 'Alto';
      return 'Muy Alto';
    }

    /**
     * Genera recomendación
     */
    function getRecommendation() {
      const irr = parseFloat(state.calculations.indicators.irr);
      const npv = state.calculations.indicators.npv;

      if (npv > 0 && irr > 20) {
        return 'Proyecto altamente recomendable con excelentes indicadores financieros.';
      } else if (npv > 0 && irr > 15) {
        return 'Proyecto viable con buenos retornos esperados.';
      } else if (npv > 0 && irr > 10) {
        return 'Proyecto aceptable, considerar optimizaciones para mejorar rentabilidad.';
      } else if (npv > 0) {
        return 'Proyecto marginalmente viable, se recomienda análisis detallado de riesgos.';
      } else {
        return 'Proyecto no recomendable en las condiciones actuales.';
      }
    }

    /**
     * Destruye el módulo y limpia recursos
     */
    function destroy() {
      // Destruir gráficos
      Object.values(state.charts).forEach((chart) => {
        if (chart) chart.destroy();
      });

      state.charts = {};
      state.calculations = {};
      state.projectData = null;

      console.log('🧹 Finance Module destroyed');
    }

    // API pública del módulo
    return {
      init,
      setProjectData,
      calculateFinancials,
      setScenario,
      generateSensitivityAnalysis,
      exportToPDF,
      exportToExcel,
      getSummary,
      destroy,
      // Getters
      getCalculations: () => ({ ...state.calculations }),
      getCurrentScenario: () => state.currentScenario,
      getIndicators: () => state.calculations.indicators || {},
      getCosts: () => state.calculations.costs || {},
      getCashFlows: () => state.calculations.cashFlows || [],
    };
  };

  console.log('✅ Finance Module loaded');
})();
