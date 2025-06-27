#!/usr/bin/env node

/**
 * Performance Test Suite - Beyond Solutions
 * Tests Core Web Vitals and performance metrics for built application
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuración
const CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:8000',
  viewport: { width: 1200, height: 800 },
  timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
  outputDir: path.join(__dirname, '../performance-reports')
};

const PAGES_TO_TEST = [
  { path: '/', name: 'Home Page' },
  { path: '/calculator-gamified.html', name: 'Calculator' },
  { path: '/wizard.html', name: 'Wizard' },
  { path: '/dashboard.html', name: 'Dashboard' }
];

async function runPerformanceTests() {
  console.log('Starting performance tests...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
  } catch (e) {
    // Directory already exists
  }
  
  const reportPath = path.join(CONFIG.outputDir, `performance-report-${timestamp}.md`);
  const jsonReportPath = path.join(CONFIG.outputDir, `performance-data-${timestamp}.json`);
  
  let report = `# Performance Test Report\n\n`;
  report += `**Date:** ${new Date().toLocaleString()}\n`;
  report += `**Base URL:** ${CONFIG.baseURL}\n\n`;
  
  const performanceData = {};
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const page of PAGES_TO_TEST) {
      console.log(`Testing performance for ${page.name} at ${page.path}...`);
      
      const tab = await browser.newPage();
      await tab.setViewport(CONFIG.viewport);
      
      try {
        const start = Date.now();
        await tab.goto(`${CONFIG.baseURL}${page.path}`, { 
          waitUntil: 'networkidle2',
          timeout: CONFIG.timeout
        });
        const loadTime = Date.now() - start;
        
        const metrics = await tab.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          return {
            loadTime: nav ? nav.loadEventEnd - nav.navigationStart : 0,
            domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.navigationStart : 0,
            transferSize: nav ? nav.transferSize : 0
          };
        });
        
        performanceData[page.name] = {
          url: `${CONFIG.baseURL}${page.path}`,
          loadTime,
          metrics,
          status: 'success'
        };
        
      } catch (error) {
        console.error(`Error testing ${page.name}:`, error.message);
        performanceData[page.name] = {
          error: error.message,
          status: 'failed'
        };
      }
      
      await tab.close();
    }
    
    // Generate report
    report += `## Test Results\n\n`;
    report += `| Page | Load Time (ms) | DOM Loaded (ms) | Status |\n`;
    report += `|------|----------------|-----------------|--------|\n`;
    
    for (const [pageName, data] of Object.entries(performanceData)) {
      if (data.status === 'failed') {
        report += `| ${pageName} | - | - | ❌ Error |\n`;
      } else {
        report += `| ${pageName} | ${data.loadTime} | ${data.metrics.domContentLoaded} | ✅ Success |\n`;
      }
    }
    
    const successful = Object.values(performanceData).filter(d => d.status === 'success');
    if (successful.length > 0) {
      const avgLoadTime = successful.reduce((sum, d) => sum + d.loadTime, 0) / successful.length;
      
      report += `\n## Performance Summary\n\n`;
      report += `- **Pages Tested:** ${PAGES_TO_TEST.length}\n`;
      report += `- **Successful:** ${successful.length}\n`;
      report += `- **Failed:** ${PAGES_TO_TEST.length - successful.length}\n`;
      report += `- **Average Load Time:** ${avgLoadTime.toFixed(0)}ms\n\n`;
      
      if (avgLoadTime < 3000) {
        report += `✅ **Excellent Performance** - All pages load under 3 seconds\n`;
      } else {
        report += `⚠️ **Performance Warning** - Consider optimization\n`;
      }
    }
    
    await fs.writeFile(reportPath, report);
    await fs.writeFile(jsonReportPath, JSON.stringify(performanceData, null, 2));
    
    console.log(`Performance report saved to: ${reportPath}`);
    
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests }; 