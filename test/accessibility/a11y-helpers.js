/**
 * Accessibility Testing Helpers
 * Utilities for running accessibility tests across the application
 */

const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

/**
 * Runs axe-core accessibility tests on a given page
 * @param {Object} page - Puppeteer page object
 * @param {String} context - Context for the test (e.g., 'full-page', 'wizard-component')
 * @param {Object} options - Additional options for axe-core
 * @returns {Object} - Accessibility test results
 */
async function runA11yTests(page, context = 'full-page', options = {}) {
  // Translate shorthand contexts to valid axe-core context objects
  let axeContext = context;
  if (context === 'full-page' || context === 'document' || context === 'page') {
    axeContext = 'html'; // select entire document
  }
  await page.addScriptTag({ content: axeCore.source });
  
  const results = await page.evaluate((ctx, opts) => {
    return new Promise(resolve => {
      axe.run(ctx, opts, (err, results) => {
        if (err) throw err;
        resolve(results);
      });
    });
  }, axeContext, options);
  
  return results;
}

/**
 * Generates a report from accessibility test results
 * @param {Object} results - Accessibility test results from axe-core
 * @param {String} testName - Name of the test
 * @returns {String} - Path to the generated report
 */
async function generateA11yReport(results, testName) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportDir = path.join(process.cwd(), 'test', 'accessibility-reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, `accessibility-report-${timestamp}.md`);
  const jsonReportPath = path.join(reportDir, `accessibility-data-${timestamp}.json`);
  
  // Save raw data
  await writeFile(jsonReportPath, JSON.stringify(results, null, 2));
  
  // Generate markdown report
  let report = `# Accessibility Audit Report: ${testName}\n\n`;
  report += `Date: ${new Date().toLocaleString()}\n\n`;
  
  // Summary
  report += `## Summary\n\n`;
  report += `- Total violations: ${results.violations.length}\n`;
  report += `- Total passes: ${results.passes.length}\n`;
  report += `- Total incomplete: ${results.incomplete.length}\n\n`;
  
  // Violations
  if (results.violations.length > 0) {
    report += `## Violations\n\n`;
    results.violations.forEach((violation, index) => {
      report += `### ${index + 1}. ${violation.id}: ${violation.help}\n\n`;
      report += `**Impact:** ${violation.impact}\n\n`;
      report += `**Description:** ${violation.description}\n\n`;
      report += `**WCAG:** ${violation.tags.filter(tag => tag.startsWith('wcag')).join(', ')}\n\n`;
      report += `**Elements affected:** ${violation.nodes.length}\n\n`;
      report += `**Help URL:** ${violation.helpUrl}\n\n`;
      report += `**Suggested Fix:** ${violation.help}\n\n`;
      
      if (violation.nodes.length > 0) {
        report += `#### Sample HTML:\n\n`;
        report += `\`\`\`html\n${violation.nodes[0].html}\n\`\`\`\n\n`;
      }
    });
  }
  
  await writeFile(reportPath, report);
  return reportPath;
}

/**
 * Tests keyboard navigation on a page
 * @param {Object} page - Puppeteer page object
 * @param {Array} selectors - Array of selectors that should be focusable
 * @returns {Object} - Results of keyboard navigation test
 */
async function testKeyboardNavigation(page, selectors) {
  const results = {
    focusableElements: 0,
    unreachableElements: [],
    focusOrder: []
  };
  
  // Tab through all focusable elements
  await page.keyboard.press('Tab');
  let focusedElement = await page.evaluate(() => {
    return document.activeElement ? document.activeElement.outerHTML : null;
  });
  
  while (focusedElement) {
    results.focusableElements++;
    results.focusOrder.push(focusedElement);
    
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => {
      return document.activeElement ? document.activeElement.outerHTML : null;
    });
    
    // Break if we've cycled through all elements
    if (results.focusOrder.includes(focusedElement)) {
      break;
    }
  }
  
  // Check if all required selectors are focusable
  for (const selector of selectors) {
    const isFocusable = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return Array.from(document.querySelectorAll(':focus-visible')).includes(element);
    }, selector);
    
    if (!isFocusable) {
      results.unreachableElements.push(selector);
    }
  }
  
  return results;
}

/**
 * Tests color contrast across the application
 * @param {Object} page - Puppeteer page object
 * @returns {Object} - Results of contrast testing
 */
async function testColorContrast(page) {
  return await page.evaluate(() => {
    const contrastResults = [];
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const foreground = style.color;
      const background = style.backgroundColor;
      
      if (foreground && background && background !== 'rgba(0, 0, 0, 0)') {
        // Simple contrast calculation - in real implementation use a proper algorithm
        contrastResults.push({
          element: element.tagName,
          foreground,
          background,
          text: element.textContent.trim().substring(0, 50)
        });
      }
    });
    
    return contrastResults;
  });
}

module.exports = {
  runA11yTests,
  generateA11yReport,
  testKeyboardNavigation,
  testColorContrast
}; 