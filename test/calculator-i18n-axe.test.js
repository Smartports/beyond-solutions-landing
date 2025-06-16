// Script de validación de accesibilidad e i18n para calculator.html en todos los idiomas
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const axeSource = require('axe-core').source;

// Lista de códigos de idioma soportados (según i18n/README.md)
const languages = [
  'es', 'en', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru',
  'ar', 'pl', 'tr', 'sv', 'nl', 'hi', 'vi', 'el'
];

const BASE_URL = 'http://localhost:8080/calculator.html?lang=';
const OUT_DIR = path.join(__dirname, '../test/axe-reports');

async function runAxeForLang(lang) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(BASE_URL + lang);
  // Inyectar axe-core
  await page.addScriptTag({ content: axeSource });
  // Ejecutar axe
  const results = await page.evaluate(async () => {
    return await window.axe.run({
      runOnly: ['wcag2a', 'wcag2aa', 'section508'],
      resultTypes: ['violations', 'incomplete', 'passes']
    });
  });
  await browser.close();
  return results;
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  let summary = [];
  for (const lang of languages) {
    process.stdout.write(`Test [${lang}]... `);
    try {
      const results = await runAxeForLang(lang);
      const outFile = path.join(OUT_DIR, `axe-calculator-${lang}.json`);
      fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
      const violations = results.violations.length;
      const incomplete = results.incomplete.length;
      summary.push({ lang, violations, incomplete });
      console.log(`OK (${violations} violaciones, ${incomplete} incompletos)`);
    } catch (e) {
      summary.push({ lang, error: e.message });
      console.log('ERROR:', e.message);
    }
  }
  // Mostrar resumen
  console.log('\nResumen de accesibilidad e i18n:');
  summary.forEach(r => {
    if (r.error) {
      console.log(`[${r.lang}] ERROR: ${r.error}`);
    } else {
      console.log(`[${r.lang}] Violaciones: ${r.violations}, Incompletos: ${r.incomplete}`);
    }
  });
})(); 