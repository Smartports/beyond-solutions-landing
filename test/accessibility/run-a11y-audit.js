/**
 * Comprehensive Accessibility Audit Runner
 * Runs accessibility tests across all major components of the application
 */

const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const { 
  runA11yTests, 
  generateA11yReport, 
  testKeyboardNavigation, 
  testColorContrast 
} = require('./a11y-helpers');
const fs = require('fs').promises;
const path = require('path');

// Configuración actualizada para usar el build
const CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:8000',
  viewport: {
    width: 1200,
    height: 800
  },
  timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
  outputDir: path.join(__dirname, '../accessibility-reports'),
  axeReportsDir: path.join(__dirname, '../axe-reports')
};

// Configuration
const BASE_URL = CONFIG.baseURL;
const PAGES_TO_TEST = [
  { path: '/', name: 'Home Page' },
  { path: '/calculator', name: 'Calculator' },
  { path: '/wizard', name: 'Wizard' },
  { path: '/terrain-viewer', name: 'Terrain Viewer' },
  { path: '/cost-calculator', name: 'Cost Calculator' },
  { path: '/3d-experience', name: '3D Experience' }
];

// Components to test specifically
const COMPONENTS_TO_TEST = [
  { selector: '.wizard-container', name: 'Wizard Component' },
  { selector: '.map-container', name: 'Map Component' },
  { selector: '.terrain-viewer', name: 'Terrain Viewer Component' },
  { selector: '.cost-calculator', name: 'Cost Calculator Component' },
  { selector: '.immersive-viewer', name: '3D Viewer Component' },
  { selector: '.dashboard', name: 'Dashboard Component' }
];

// Elements that must be keyboard accessible
const CRITICAL_INTERACTIVE_ELEMENTS = [
  'button',
  'a',
  'input',
  'select',
  '.select-card',
  '.map-control',
  '.tab-button',
  '.accordion-header'
];

async function runFullAudit() {
  console.log('Starting comprehensive accessibility audit...');
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const summaryReportPath = path.join(process.cwd(), 'test', 'accessibility-reports', `summary-a11y-audit-${timestamp}.md`);
  
  let summaryReport = `# Comprehensive Accessibility Audit Summary\n\n`;
  summaryReport += `Date: ${new Date().toLocaleString()}\n\n`;
  summaryReport += `## Overview\n\n`;
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const violationsByPage = {};
  const keyboardNavIssues = {};
  const contrastIssues = {};
  
  try {
    // Test each page
    for (const page of PAGES_TO_TEST) {
      console.log(`Testing ${page.name} at ${page.path}...`);
      
      const tab = await browser.newPage();
      await tab.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle2' });
      
      // Run axe-core tests
      const results = await runA11yTests(tab);
      const reportPath = await generateA11yReport(results, page.name);
      
      violationsByPage[page.name] = results.violations.length;
      
      // Test keyboard navigation
      const keyboardResults = await testKeyboardNavigation(tab, CRITICAL_INTERACTIVE_ELEMENTS);
      if (keyboardResults.unreachableElements.length > 0) {
        keyboardNavIssues[page.name] = keyboardResults.unreachableElements;
      }
      
      // Test color contrast
      const contrastResults = await testColorContrast(tab);
      // Filter to only include potential issues (simplified for example)
      const potentialContrastIssues = contrastResults.slice(0, 5); // Just for demo
      if (potentialContrastIssues.length > 0) {
        contrastIssues[page.name] = potentialContrastIssues.length;
      }
      
      // Test specific components on this page
      for (const component of COMPONENTS_TO_TEST) {
        const hasComponent = await tab.evaluate((selector) => {
          return document.querySelector(selector) !== null;
        }, component.selector);
        
        if (hasComponent) {
          console.log(`Testing component: ${component.name}`);
          const componentResults = await runA11yTests(tab, component.selector);
          await generateA11yReport(componentResults, `${page.name} - ${component.name}`);
        }
      }
      
      await tab.close();
    }
    
    // Generate summary report
    summaryReport += `### Violations by Page\n\n`;
    summaryReport += `| Page | Violations |\n`;
    summaryReport += `|------|------------|\n`;
    
    let totalViolations = 0;
    for (const [pageName, violations] of Object.entries(violationsByPage)) {
      summaryReport += `| ${pageName} | ${violations} |\n`;
      totalViolations += violations;
    }
    
    summaryReport += `\n**Total violations:** ${totalViolations}\n\n`;
    
    if (Object.keys(keyboardNavIssues).length > 0) {
      summaryReport += `### Keyboard Navigation Issues\n\n`;
      for (const [pageName, issues] of Object.entries(keyboardNavIssues)) {
        summaryReport += `#### ${pageName}\n\n`;
        summaryReport += `Elements not reachable by keyboard:\n\n`;
        issues.forEach(issue => {
          summaryReport += `- \`${issue}\`\n`;
        });
        summaryReport += `\n`;
      }
    }
    
    if (Object.keys(contrastIssues).length > 0) {
      summaryReport += `### Potential Contrast Issues\n\n`;
      summaryReport += `| Page | Potential Issues |\n`;
      summaryReport += `|------|------------------|\n`;
      
      for (const [pageName, count] of Object.entries(contrastIssues)) {
        summaryReport += `| ${pageName} | ${count} |\n`;
      }
    }
    
    // Write summary report (fs is promises API)
    await fs.writeFile(summaryReportPath, summaryReport, 'utf8');
    console.log(`Accessibility audit complete. Summary report saved to: ${summaryReportPath}`);
    
  } catch (error) {
    console.error('Error during accessibility audit:', error);
  } finally {
    await browser.close();
  }
}

// Run the audit
if (require.main === module) {
  runFullAudit().catch(console.error);
}

module.exports = { runFullAudit }; 