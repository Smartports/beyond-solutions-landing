# Beyond Calculator – Implementation Blueprint

## 1. **Overview**
Implement a new, fully accessible, multi-language, and style-consistent calculator page for the Beyond Solutions landing site. This document details the pseudocode, structure, integration steps, and best practices for building the "Beyond Calculator" tool, ensuring compliance with UI/UX, accessibility, and code quality guidelines.

---

## 2. **Objectives**
- Provide a user-friendly, step-by-step calculator for real estate project budgeting.
- Ensure full compatibility with the current i18n system (18+ languages, RTL support).
- Match the visual and interactive style of the existing landing page (TailwindCSS, Alpine.js, AOS, dark/light modes).
- Comply with accessibility and code quality standards (WCAG 2.1 AA+, ADA, Section 508, IDEA, AODA, SOLID, etc).

---

## 3. **Page Structure & User Flow**

### **A. Page Route**
- New page: `/calculator.html`
- Add navigation link from main site (with i18n support)

### **B. Main Sections**
1. **Introduction**
   - Brief description, instructions, and benefits (i18n)
2. **Step-by-Step Form**
   - Step 1: Project Scope & Entity
   - Step 2: Budget & Land Data
   - Step 3: Cost Breakdown (Materials, Construction, etc.)
   - Step 4: Results & Summary
   - Step 5: Export/Share
3. **Accessibility & Help**
   - Contextual help, tooltips, ARIA labels, keyboard navigation

---

## 4. **Pseudocode & Component Structure**

### **A. Data Model**
```js
const calculatorState = {
  language: 'es', // or from i18n system
  scope: '', // 'Patrimonial' | 'Inversion'
  entity: '', // 'B2B' | 'B2C'
  budgetTotal: 0,
  land: {
    address: '',
    type: '', // 'Propio' | 'No Propio' | 'Remate'
    status: '', // 'Construcción' | 'Demolición' | 'Reconversión'
    surface: 0,
    use: '',
    characteristics: '',
    usableSurface: 0,
  },
  costs: {
    regulatorio: { percent: 0.05, value: 0 },
    materiales: { percent: 0.53, value: 0, level: 'Low' },
    construccion: { percent: 0.3, value: 0 },
    arquitectura: { percent: 0.07, value: 0 },
    diseno: { percent: 0.05, value: 0 },
    arte: { percent: 0.05, value: 0 },
  },
  paymentCycles: { /* ... */ },
  results: {
    totalCost: 0,
    totalSell: 0,
    profit: 0,
    m2Cost: 0,
    m2Sell: 0,
  },
  notes: [],
};
```

### **B. UI Components**
- `<CalculatorIntro />` – i18n intro, instructions
- `<StepForm />` – Multi-step form (Alpine.js x-data or Vue/React if SPA)
  - `<Step1ScopeEntity />`
  - `<Step2BudgetLand />`
  - `<Step3CostBreakdown />`
  - `<Step4Results />`
  - `<Step5Export />`
- `<SummarySidebar />` – Live summary, sticky on desktop
- `<HelpTooltip />` – Contextual help, ARIA, keyboard accessible

### **C. Calculation Logic (Pseudocode)**
```js
function calculateCosts(state) {
  // For each cost category
  for (let key in state.costs) {
    state.costs[key].value = state.budgetTotal * state.costs[key].percent;
  }
  // Totals
  state.results.totalCost = Object.values(state.costs).reduce((sum, c) => sum + c.value, 0);
  state.results.profit = state.results.totalSell - state.results.totalCost;
  state.results.m2Cost = state.results.totalCost / state.land.usableSurface;
  state.results.m2Sell = state.results.totalSell / state.land.usableSurface;
}
```

---

## 5. **Integration Steps**

### **A. Preparation**
1. **Pattern Search**: Review project for similar forms/components (see Creation Protocol).
2. **Utility Check**: Reuse i18n, form, and style utilities.
3. **Config Review**: Ensure new page is registered in navigation and i18n configs.

### **B. Implementation**
1. **Create new HTML page** (`calculator.html`), copy base structure from `index.html`.
2. **Add TailwindCSS, Alpine.js, AOS, and i18n scripts** (reuse CDN/config).
3. **Build multi-step form** using Alpine.js (`x-data`, `x-show`, `x-transition`).
4. **Bind all text and labels to i18n keys** (use `data-i18n`, `data-i18n-attr`).
5. **Implement calculation logic** in JS module (`js/calculator.js`).
6. **Add accessibility features**:
   - ARIA roles/labels
   - Keyboard navigation (tab order, skip links)
   - Sufficient color contrast (Tailwind)
   - Focus indicators
   - Responsive for screen readers
7. **Integrate with i18n system**:
   - Add translation keys for all new text
   - Add language selector to page
   - Support RTL languages
8. **Style to match landing page**:
   - Use same color palette, typography, spacing
   - Animate with AOS for transitions
   - Responsive/mobile-first layout
9. **Testing**:
   - Manual and automated accessibility checks (axe, Lighthouse)
   - Linter and code quality tools
   - Cross-browser and device testing
10. **Documentation**:
    - Update README, i18n/README, and add this implementation doc
    - Add cross-reference comments in code

---

## 6. **UI/UX & Accessibility Best Practices**
- **WCAG 2.1 AA+**: All interactive elements must be keyboard accessible, have visible focus, and provide sufficient contrast.
- **ARIA**: Use ARIA roles, labels, and live regions for dynamic content.
- **ADA/Section 508/AODA/IDEA**: Ensure compatibility with assistive technologies, provide error messages, and avoid time-based interactions.
- **SOLID Principles**: Modular, single-responsibility JS functions/components.
- **No Magic Numbers**: All constants configurable.
- **Responsive Design**: Mobile-first, test on all breakpoints.
- **RTL Support**: All layouts and components must work in RTL languages.
- **i18n**: All text, labels, and messages must be translatable.
- **Form Validation**: Real-time, accessible error messages.
- **Help & Guidance**: Tooltips, inline help, and clear instructions.
- **Export/Share**: Allow users to export results (PDF/CSV) and share (email/WA).
- **Performance**: Lazy load non-critical assets, debounce heavy calculations.
- **Tooltips accesibles:** Campos clave del formulario incluyen tooltips con ARIA y soporte i18n.
- **Guardar/restaurar simulación:** Botones para persistir y restaurar el estado de la simulación en localStorage.
- **Feedback visual:** Mensajes accesibles para acciones y errores, con soporte i18n.
- **Animación de paso:** Transición visual al cambiar de paso, respetando prefers-reduced-motion.
- **Pruebas automáticas de accesibilidad:** Integración de axe-core para validar WCAG/ARIA en CI/manual.

---

## 7. **Change Manifest & Documentation Matrix**
- **New page**: `calculator.html`
- **New JS module**: `js/calculator.js`
- **i18n updates**: Add keys to all language files
- **Navigation**: Add link to calculator in main nav (with i18n)
- **Docs**: Update README, i18n/README, and add this doc
- **Preservation**: No changes to existing APIs/interfaces; all additions are backward compatible
- **Alternatives considered**: SPA vs. static page; chose static for compatibility

---

## 8. **References & Further Reading**
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [TailwindCSS Accessibility](https://tailwindcss.com/docs/accessibility)
- [Alpine.js Accessibility](https://alpinejs.dev/directives/bind#accessibility)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Beyond Solutions i18n System](i18n/README.md)

---

> **This document must be kept up to date with all changes to the calculator implementation. All contributors must review and follow these guidelines for any related work.** 