/**
 * Accessibility testing for calculator.html using axe-core
 */

const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../axe-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Path to calculator.html
const baseDir = path.resolve(process.cwd());
const calculatorUrl = `file://${baseDir}/calculator.html`;

// Test with different resolutions for responsiveness
const viewportSizes = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1366, height: 768 }
];

// Test modes
const testModes = [
  { name: 'Light Mode', theme: 'light' },
  { name: 'Dark Mode', theme: 'dark' }
];

async function runAccessibilityTests() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const results = {};

  console.log('Starting accessibility tests for calculator.html...');

  for (const viewport of viewportSizes) {
    console.log(`Testing at ${viewport.name} size (${viewport.width}x${viewport.height})...`);
    results[viewport.name] = {};

    for (const mode of testModes) {
      console.log(`  Testing in ${mode.name}...`);
      
      const page = await browser.newPage();
      await page.setViewport({ width: viewport.width, height: viewport.height });
      
      try {
        // Navigate to the page
        await page.goto(calculatorUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Set theme mode
        if (mode.theme === 'dark') {
          await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
          await page.reload({ waitUntil: 'networkidle0' });
        }
        
        // Run axe analysis
        const axeResults = await new AxePuppeteer(page)
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
          .analyze();
        
        // Store results
        results[viewport.name][mode.name] = axeResults;
        
        console.log(`    Violations found: ${axeResults.violations.length}`);
      } catch (error) {
        console.error(`    Error testing calculator in ${mode.name} at ${viewport.name} size:`, error.message);
        results[viewport.name][mode.name] = { error: error.message };
      } finally {
        await page.close();
      }
    }
  }

  // Save results to file
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filePath = path.join(outputDir, `calculator-a11y-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  
  // Generate summary report
  const summary = generateSummary(results);
  const summaryPath = path.join(outputDir, `calculator-a11y-summary-${timestamp}.md`);
  fs.writeFileSync(summaryPath, summary);

  console.log(`Accessibility tests completed. Results saved to ${filePath}`);
  console.log(`Summary report saved to ${summaryPath}`);

  await browser.close();
}

function generateSummary(results) {
  let summary = '# Calculator Accessibility Test Summary\n\n';
  summary += `Date: ${new Date().toLocaleString()}\n\n`;
  
  let totalViolations = 0;
  let colorContrastViolations = 0;
  let errorCount = 0;
  
  for (const viewport in results) {
    summary += `## ${viewport}\n\n`;
    
    for (const mode in results[viewport]) {
      summary += `### ${mode}\n\n`;
      
      // Check for errors
      if (results[viewport][mode].error) {
        summary += `⚠️ **Error testing in this mode:** ${results[viewport][mode].error}\n\n`;
        errorCount++;
        continue;
      }
      
      const violations = results[viewport][mode].violations || [];
      const contrastViolations = violations.filter(v => v.id === 'color-contrast');
      
      summary += `- Total violations: ${violations.length}\n`;
      summary += `- Color contrast violations: ${contrastViolations.length}\n\n`;
      
      if (contrastViolations.length > 0) {
        summary += '#### Color Contrast Issues\n\n';
        contrastViolations.forEach(violation => {
          summary += `- ${violation.nodes.length} elements with insufficient contrast\n`;
        });
        summary += '\n';
      }
      
      totalViolations += violations.length;
      colorContrastViolations += contrastViolations.length;
    }
  }
  
  summary += '## Overall Summary\n\n';
  summary += `- Total viewport/mode combinations tested: ${Object.keys(results).length * testModes.length}\n`;
  summary += `- Tests with errors: ${errorCount}\n`;
  summary += `- Total violations: ${totalViolations}\n`;
  summary += `- Total color contrast violations: ${colorContrastViolations}\n\n`;
  
  if (errorCount > 0) {
    summary += '⚠️ Some tests could not be completed. Please check the detailed report.\n\n';
  }
  
  if (colorContrastViolations === 0 && errorCount === 0) {
    summary += '✅ No color contrast issues found! The calculator appears to be WCAG 2.1 AA compliant.\n';
  } else if (colorContrastViolations === 0) {
    summary += '✅ No color contrast issues found in the tests that could be completed.\n';
  } else {
    summary += '❌ Color contrast issues found. Please review the detailed report and make necessary adjustments.\n';
  }
  
  return summary;
}

// Run the tests
runAccessibilityTests().catch(err => {
  console.error('Error running accessibility tests:', err);
  process.exit(1);
}); 