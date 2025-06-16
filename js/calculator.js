import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm';

/* Exponemos dependencias en window para que el resto del código las use */
window.jsPDF  = jsPDF;
window.Papa   = Papa;

// Define calculator form component globally before Alpine initialization
document.addEventListener('alpine:init', () => {
    // Crear un store para i18n si no existe
    if (!Alpine.store('i18n')) {
        Alpine.store('i18n', {
            ready: false,
            timestamp: 0
        });
    }
    
    Alpine.data('calculatorForm', () => ({
  // Estado reactivo
  costItems: [
    { key: 'landPreparation', label: 'Preparación del terreno', defaultPercent: 10 },
    { key: 'materials',       label: 'Materiales',               defaultPercent: 40 },
    { key: 'labor',           label: 'Mano de obra',             defaultPercent: 30 },
    { key: 'contingency',     label: 'Contingencia',             defaultPercent: 20 },
  ],
  steps: [
    { id: 'scope',    label: '1. Tipo de Proyecto' }, // Will be translated dynamically
    { id: 'land',     label: '2. Datos del Terreno' }, // Will be translated dynamically
    { id: 'costs',    label: '3. Desglose de Costos' }, // Will be translated dynamically
    { id: 'results',  label: '4. Resultados' }, // Will be translated dynamically
  ],
  
  // Update steps after i18n is ready
  updateSteps() {},
  currentStep: 0,
  form: {
    scope: '',
    entity: '',
    budgetTotal: null,
    land: {
      address: '',
      type: '',
      status: '',
      surface: null,
      use: '',
      characteristics: '',
      usableSurface: null,
    },
    costs: {
      regulatorio: { percent: 0.05, value: 0 },
      materiales: { percent: 0.53, value: 0, level: 'low' },
      construccion: { percent: 0.3, value: 0 },
      arquitectura: { percent: 0.07, value: 0 },
      diseno: { percent: 0.05, value: 0 },
      arte: { percent: 0.05, value: 0 },
    },
  },
  costKeys: ['regulatorio', 'materiales', 'construccion', 'arquitectura', 'diseno', 'arte'],
  costLabels: {
    regulatorio: 'Regulatorio',
    materiales: 'Materiales',
    construccion: 'Construcción',
    arquitectura: 'Arquitectura',
    diseno: 'Diseño',
    arte: 'Arte',
  },
  
  // Estas funciones ya no se usan directamente, se centraliza en updateAllTranslations
  updateCostLabels() {},
  updatePlaceholders() {},
  updateSelectOptions() {},
  updateTooltips() {},

  // Función de ayuda para traducir de forma segura. Se hace reactiva al store.
  safeTranslate(key, fallback = '') {
    // La dependencia de `this.$store.i18n.revision` fuerza la re-evaluación.
    const revision = this.$store.i18n.revision;
    if (!window.t) {
      return fallback || key;
    }
    return window.t(key, {}, fallback || key);
  },

  // Función para traducir atributos no reactivos (placeholders, options).
  updateAllTranslations() {
    // Force a delay to ensure the DOM is fully rendered
    setTimeout(() => {
        console.log('Updating translations for calculator step:', this.currentStep);
        const t = window.t;
        if (!t) return;

        // Translate all placeholders based on data-i18n-attr attributes
        this.$el.querySelectorAll('[data-i18n-attr*="placeholder"]').forEach(input => {
            const attr = input.getAttribute('data-i18n-attr');
            if (attr) {
                const match = attr.match(/placeholder:([^,]+)/);
                if (match && match[1]) {
                    const key = match[1];
                    input.placeholder = t(key);
                }
            }
        });
        
        // Special case for characteristics field
        const charInput = this.$el.querySelector('#characteristics');
        if(charInput) {
            charInput.placeholder = t('calculator.step2.characteristics.placeholder');
        }

        // Translate all select options
        this.$el.querySelectorAll('select').forEach(select => {
            // Translate disabled/placeholder options
            const disabledOption = select.querySelector('option[disabled]');
            if (disabledOption) {
                const key = disabledOption.getAttribute('data-i18n');
                if (key) {
                    disabledOption.textContent = t(key);
                }
            }
            
            // Translate all regular options
            select.querySelectorAll('option[data-i18n]').forEach(option => {
                const key = option.getAttribute('data-i18n');
                if (key) {
                    option.textContent = t(key);
                }
            });
        });
        
        // Update all regular text nodes with data-i18n attribute
        this.$el.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key && el.tagName !== 'OPTION') { // Skip options as they're handled above
                el.textContent = t(key);
            }
        });
        
        // Update attributes like aria-label that have translations
        this.$el.querySelectorAll('[data-i18n-attr]').forEach(el => {
            const attrSpec = el.getAttribute('data-i18n-attr');
            if (attrSpec) {
                attrSpec.split(',').forEach(spec => {
                    const [attr, key] = spec.trim().split(':');
                    if (attr && key && attr !== 'placeholder') { // Skip placeholders as they're handled above
                        el.setAttribute(attr, t(key));
                    }
                });
            }
        });
        
        // Use the i18n translation function if available
        if (window.i18n && window.i18n.translateNode) {
            window.i18n.translateNode(this.$el);
        }
    }, 50);
  },

  results: {
    totalCost: 0,
    totalSell: 0,
    profit: 0,
    m2Cost: 0,
    m2Sell: 0,
  },
  profitMargin: 0.3, // Default
  errors: {},
  tooltipTexts: {
    budgetTotal: window.t ? window.t('calculator.tooltips.budgetTotal') : 'Incluye terreno y construcción, sin regulatorio.',
    usableSurface: window.t ? window.t('calculator.tooltips.usableSurface') : 'Superficie útil construible según uso de suelo.',
    materialesLevel: window.t ? window.t('calculator.tooltips.materialesLevel') : 'Define el rango de calidad y costo de materiales.',
  },
  feedbackMessage: '',
  feedbackType: '',
  init() {
    this.costItems.forEach(item => {
        this.form.costs[item.key] = {
          percent: item.defaultPercent,
          amount:  0,
        };
    });

    this.form.costs.materiales.level = 'low';
    this.calculateResults();

    // Las traducciones ya estarán listas, solo aplicamos una vez y nos suscribimos a cambios
    this.updateAllTranslations();
    
    // Listen for language changes and update translations
    const languageChangedHandler = () => {
      console.log('Language changed event detected in calculator');
      this.updateAllTranslations();
    };
    
    // Add multiple event listeners to ensure we catch all language change events
    document.addEventListener('i18n:languageChanged', languageChangedHandler);
    window.addEventListener('i18n:languageChanged', languageChangedHandler);
    document.addEventListener('i18n:ready', languageChangedHandler);
    
    // Force translation update shortly after initialization to catch any lazy-loaded translations
    setTimeout(() => {
      this.updateAllTranslations();
    }, 500);

    this.$watch('form.budgetTotal', () => this.calculateResults());
    this.$watch('form.land.usableSurface', () => this.calculateResults());
    this.$watch('form.costs', () => this.calculateResults(), { deep:true });
  },
  validateStep() {
    this.errors = {};
    if (this.currentStep === 0) {
      if (!this.form.scope) this.errors.scope = window.t ? window.t('calculator.errors.scope') : 'Project type is required.';
      if (!this.form.entity) this.errors.entity = window.t ? window.t('calculator.errors.entity') : 'Entity is required.';
    }
    if (this.currentStep === 1) {
      if (!this.form.budgetTotal || this.form.budgetTotal <= 0) this.errors.budgetTotal = window.t ? window.t('calculator.errors.budgetTotal') : 'Total budget is required.';
      if (!this.form.land.address) this.errors.address = window.t ? window.t('calculator.errors.address') : 'Address is required.';
      if (!this.form.land.type) this.errors.type = window.t ? window.t('calculator.errors.type') : 'Land type is required.';
      if (!this.form.land.status) this.errors.status = window.t ? window.t('calculator.errors.status') : 'Status is required.';
      if (!this.form.land.surface || this.form.land.surface <= 0) this.errors.surface = window.t ? window.t('calculator.errors.surface') : 'Surface is required.';
      if (!this.form.land.usableSurface || this.form.land.usableSurface <= 0) this.errors.usableSurface = window.t ? window.t('calculator.errors.usableSurface') : 'Usable surface is required.';
    }
    if (this.currentStep === 2) {
      for (const key of this.costKeys) {
        if (this.form.costs[key].percent === null || this.form.costs[key].percent < 0) {
          this.errors[key] = window.t ? window.t('calculator.errors.percent') : 'Percentage is required.';
        }
      }
    }
    return Object.keys(this.errors).length === 0;
  },
  nextStep() {
    if (this.validateStep()) {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        if (this.currentStep === 3) this.calculateResults();
        this.animateStep();
        // Apply translations after step change
        this.$nextTick(() => {
          this.updateAllTranslations();
        });
      }
    } else {
      this.$nextTick(() => {
        const firstError = Object.keys(this.errors)[0];
        const el = document.getElementById(firstError);
        if (el) el.focus();
      });
    }
  },
  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      // Apply translations after step change
      this.$nextTick(() => {
        this.updateAllTranslations();
      });
    }
  },
  goToStep(idx) {
    if (idx >= 0 && idx < this.steps.length) {
      this.currentStep = idx;
      if (this.currentStep === 3) this.calculateResults();
      // Apply translations after step change
      this.$nextTick(() => {
        this.updateAllTranslations();
      });
    }
  },
  resetForm() {
    this.form = {
      scope: '',
      entity: '',
      budgetTotal: null,
      land: {
        address: '',
        type: '',
        status: '',
        surface: null,
        use: '',
        characteristics: '',
        usableSurface: null,
      },
      costs: {
        regulatorio: { percent: 0.05, value: 0 },
        materiales: { percent: 0.53, value: 0, level: 'low' },
        construccion: { percent: 0.3, value: 0 },
        arquitectura: { percent: 0.07, value: 0 },
        diseno: { percent: 0.05, value: 0 },
        arte: { percent: 0.05, value: 0 },
      },
    };
    this.results = {
      totalCost: 0,
      totalSell: 0,
      profit: 0,
      m2Cost: 0,
      m2Sell: 0,
    };
    this.currentStep = 0;
    // Asegurar que las traducciones se apliquen después de resetear.
    this.updateAllTranslations();
  },
  calculateResults() {
    // Calcular valores de cada rubro
    let totalCost = 0;
    for (const key of this.costKeys) {
      const percent = parseFloat(this.form.costs[key].percent) || 0;
      const value = (parseFloat(this.form.budgetTotal) || 0) * percent;
      this.form.costs[key].value = value;
      totalCost += value;
    }
    // Precio de venta estimado
    const totalSell = totalCost * (1 + this.profitMargin);
    // Utilidad bruta
    const profit = totalSell - totalCost;
    // Costo y venta por m2
    const m2 = parseFloat(this.form.land.usableSurface) || 1;
    const m2Cost = totalCost / m2;
    const m2Sell = totalSell / m2;
    this.results = {
      totalCost,
      totalSell,
      profit,
      m2Cost,
      m2Sell,
    };
  },
  exportPDF() {
    try {
      const doc = new window.jsPDF();
      const t = window.t || ((k) => k);
      doc.setFontSize(16);
      doc.text(t('calculator.title'), 10, 15);
      doc.setFontSize(12);
      let y = 30;
      doc.text(`${t('calculator.summary.scope')} ${this.form.scope ? t(`calculator.values.scope.${this.form.scope}`) || this.form.scope : ''}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.entity')} ${this.form.entity ? t(`calculator.values.entity.${this.form.entity}`) || this.form.entity : ''}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.budget')} ${this.form.budgetTotal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.address')} ${this.form.land.address}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.surface')} ${this.form.land.surface} m²`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.usableSurface')} ${this.form.land.usableSurface} m²`, 10, y);
      y += 8;
      doc.text(`${t('calculator.summary.use')} ${this.form.land.use}`, 10, y);
      y += 12;
      doc.text(t('calculator.step3.title'), 10, y);
      y += 8;
      for (const key of this.costKeys) {
        doc.text(`${this.costLabels[key]}: ${(this.form.costs[key].value || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})} (${((this.form.costs[key].percent || 0) * 100).toFixed(2)}%)`, 10, y);
        y += 8;
      }
      y += 4;
      doc.text(t('calculator.step4.title'), 10, y);
      y += 8;
      doc.text(`${t('calculator.result.totalCost')} ${(this.results.totalCost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.result.totalSell')} ${(this.results.totalSell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.result.profit')} ${(this.results.profit || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.result.m2Cost')} ${(this.results.m2Cost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      y += 8;
      doc.text(`${t('calculator.result.m2Sell')} ${(this.results.m2Sell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`, 10, y);
      doc.save('beyond-calculator.pdf');
      this.showFeedback(window.t ? window.t('calculator.feedback.pdfSuccess') : 'PDF generado.', 'success');
    } catch (e) {
      this.showFeedback(window.t ? window.t('calculator.feedback.pdfError') : 'Error al exportar PDF.', 'error');
    }
  },
  exportCSV() {
    try {
      const t = window.t || ((k) => k);
      const data = [
        [t('calculator.summary.scope'), this.form.scope],
        [t('calculator.summary.entity'), this.form.entity],
        [t('calculator.summary.budget'), this.form.budgetTotal],
        [t('calculator.summary.address'), this.form.land.address],
        [t('calculator.summary.surface'), this.form.land.surface],
        [t('calculator.summary.usableSurface'), this.form.land.usableSurface],
        [t('calculator.summary.use'), this.form.land.use],
        [],
        [t('calculator.step3.title')],
        ...this.costKeys.map(key => [this.costLabels[key], (this.form.costs[key].value || 0), ((this.form.costs[key].percent || 0) * 100).toFixed(2) + '%']),
        [],
        [t('calculator.step4.title')],
        [t('calculator.result.totalCost'), this.results.totalCost],
        [t('calculator.result.totalSell'), this.results.totalSell],
        [t('calculator.result.profit'), this.results.profit],
        [t('calculator.result.m2Cost'), this.results.m2Cost],
        [t('calculator.result.m2Sell'), this.results.m2Sell],
      ];
      const csv = window.Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'beyond-calculator.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showFeedback(window.t ? window.t('calculator.feedback.csvSuccess') : 'CSV generado.', 'success');
    } catch (e) {
      this.showFeedback(window.t ? window.t('calculator.feedback.csvError') : 'Error al exportar CSV.', 'error');
    }
  },
  shareWA() {
    try {
      const t = window.t || ((k) => k);
      const lines = [
        `${t('calculator.title')}`,
        `${t('calculator.summary.scope')} ${this.form.scope}`,
        `${t('calculator.summary.entity')} ${this.form.entity}`,
        `${t('calculator.summary.budget')} ${this.form.budgetTotal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.summary.address')} ${this.form.land.address}`,
        `${t('calculator.summary.surface')} ${this.form.land.surface} m²`,
        `${t('calculator.summary.usableSurface')} ${this.form.land.usableSurface} m²`,
        `${t('calculator.summary.use')} ${this.form.land.use}`,
        '',
        t('calculator.step3.title'),
        ...this.costKeys.map(key => `${this.costLabels[key]}: ${(this.form.costs[key].value || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})} (${((this.form.costs[key].percent || 0) * 100).toFixed(2)}%)`),
        '',
        t('calculator.step4.title'),
        `${t('calculator.result.totalCost')} ${(this.results.totalCost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.totalSell')} ${(this.results.totalSell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.profit')} ${(this.results.profit || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.m2Cost')} ${(this.results.m2Cost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.m2Sell')} ${(this.results.m2Sell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`
      ];
      const text = encodeURIComponent(lines.join('\n'));
      const waUrl = `https://api.whatsapp.com/send?text=${text}`;
      window.open(waUrl, '_blank');
      this.showFeedback(window.t ? window.t('calculator.feedback.waSuccess') : 'WhatsApp abierto.', 'success');
    } catch (e) {
      this.showFeedback(window.t ? window.t('calculator.feedback.waError') : 'Error al compartir en WhatsApp.', 'error');
    }
  },
  shareEmail() {
    try {
      const t = window.t || ((k) => k);
      const subject = encodeURIComponent(t('calculator.title'));
      const lines = [
        `${t('calculator.title')}`,
        `${t('calculator.summary.scope')} ${this.form.scope}`,
        `${t('calculator.summary.entity')} ${this.form.entity}`,
        `${t('calculator.summary.budget')} ${this.form.budgetTotal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.summary.address')} ${this.form.land.address}`,
        `${t('calculator.summary.surface')} ${this.form.land.surface} m²`,
        `${t('calculator.summary.usableSurface')} ${this.form.land.usableSurface} m²`,
        `${t('calculator.summary.use')} ${this.form.land.use}`,
        '',
        t('calculator.step3.title'),
        ...this.costKeys.map(key => `${this.costLabels[key]}: ${(this.form.costs[key].value || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})} (${((this.form.costs[key].percent || 0) * 100).toFixed(2)}%)`),
        '',
        t('calculator.step4.title'),
        `${t('calculator.result.totalCost')} ${(this.results.totalCost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.totalSell')} ${(this.results.totalSell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.profit')} ${(this.results.profit || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.m2Cost')} ${(this.results.m2Cost || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
        `${t('calculator.result.m2Sell')} ${(this.results.m2Sell || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`
      ];
      const body = encodeURIComponent(lines.join('\n'));
      const mailto = `mailto:?subject=${subject}&body=${body}`;
      window.open(mailto, '_blank');
      this.showFeedback(window.t ? window.t('calculator.feedback.emailSuccess') : 'Email abierto.', 'success');
    } catch (e) {
      this.showFeedback(window.t ? window.t('calculator.feedback.emailError') : 'Error al compartir por Email.', 'error');
    }
  },
  saveSimulation() {
    try {
      localStorage.setItem('beyondCalcForm', JSON.stringify(this.form));
      localStorage.setItem('beyondCalcResults', JSON.stringify(this.results));
      this.showFeedback(window.t ? window.t('calculator.feedback.saved') : 'Simulación guardada.', 'success');
    } catch (e) {
      this.showFeedback(window.t ? window.t('calculator.feedback.saveError') : 'Error al guardar.', 'error');
    }
  },
  restoreSimulation() {
    try {
      const form = JSON.parse(localStorage.getItem('beyondCalcForm'));
      const results = JSON.parse(localStorage.getItem('beyondCalcResults'));
      if (form && results) {
        this.form = form;
        this.results = results;
        this.currentStep = 3;
        this.showFeedback(window.t ? window.t('calculator.feedback.restored') : 'Simulación restaurada.', 'success');
      } else {
        this.showFeedback(window.t ? window.t('calculator.feedback.noSaved') : 'No hay simulación guardada.', 'info');
      }
    } catch (e) {
      this.showFeedback(window.t ? window.t('calculator.feedback.restoreError') : 'Error al restaurar.', 'error');
    }
  },
  showFeedback(msg, type) {
    this.feedbackMessage = msg;
    this.feedbackType = type;
    setTimeout(() => { this.feedbackMessage = ''; this.feedbackType = ''; }, 4000);
  },
  animateStep() {
    const main = document.querySelector('main');
    if (main && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      main.classList.add('animate-step');
      setTimeout(() => main.classList.remove('animate-step'), 400);
    }
  },
  // Observa cambios relevantes para recalcular
  $watch: {
    'form.budgetTotal': function () { this.calculateResults(); },
    'form.land.usableSurface': function () { this.calculateResults(); },
    'form.costs': {
      deep: true,
      handler() { this.calculateResults(); }
    },
    // Watch for i18n store changes to update translations
    '$store.i18n.revision': function() {
      console.log('i18n store revision changed, updating translations');
      this.updateAllTranslations();
    }
  }

}))});
