/**
 * Automated accessibility testing for the new color palette
 * Uses axe-core to check for WCAG 2.1 AA compliance
 */

const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// URLs to test - use file:// protocol to avoid requiring a local server
const baseDir = path.resolve(process.cwd());
const urls = [
  `file://${baseDir}/index.html`,
  `file://${baseDir}/calculator.html`,
  `file://${baseDir}/404.html`,
  `file://${baseDir}/docs/component-examples.html`,
];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../axe-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function runAccessibilityTests() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const results = {};

  console.log('Starting accessibility tests for the new color palette...');

  for (const url of urls) {
    const page = await browser.newPage();

    try {
      // Test in light mode
      console.log(`Testing ${url} in light mode...`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      const lightResults = await new AxePuppeteer(page).analyze();

      // Test in dark mode by setting the color scheme preference
      console.log(`Testing ${url} in dark mode...`);
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
      await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
      const darkResults = await new AxePuppeteer(page).analyze();

      results[url] = {
        light: lightResults,
        dark: darkResults,
      };
    } catch (error) {
      console.error(`Error testing ${url}:`, error.message);
      results[url] = {
        error: error.message,
      };
    } finally {
      await page.close();
    }
  }

  // Save results to file
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filePath = path.join(outputDir, `color-palette-a11y-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

  // Generate summary report
  const summary = generateSummary(results);
  const summaryPath = path.join(outputDir, `color-palette-a11y-summary-${timestamp}.md`);
  fs.writeFileSync(summaryPath, summary);

  console.log(`Accessibility tests completed. Results saved to ${filePath}`);
  console.log(`Summary report saved to ${summaryPath}`);

  await browser.close();
}

function generateSummary(results) {
  let summary = '# Color Palette Accessibility Test Summary\n\n';
  summary += `Date: ${new Date().toLocaleString()}\n\n`;

  let totalViolations = 0;
  let colorContrastViolations = 0;
  let errorCount = 0;

  for (const url in results) {
    summary += `## ${url}\n\n`;

    // Check for errors
    if (results[url].error) {
      summary += `⚠️ **Error testing this URL:** ${results[url].error}\n\n`;
      errorCount++;
      continue;
    }

    // Light mode results
    summary += '### Light Mode\n\n';
    const lightViolations = results[url].light.violations;
    const lightContrastViolations = lightViolations.filter((v) => v.id === 'color-contrast');

    summary += `- Total violations: ${lightViolations.length}\n`;
    summary += `- Color contrast violations: ${lightContrastViolations.length}\n\n`;

    if (lightContrastViolations.length > 0) {
      summary += '#### Color Contrast Issues\n\n';
      lightContrastViolations.forEach((violation) => {
        summary += `- ${violation.nodes.length} elements with insufficient contrast\n`;
      });
      summary += '\n';
    }

    // Dark mode results
    summary += '### Dark Mode\n\n';
    const darkViolations = results[url].dark.violations;
    const darkContrastViolations = darkViolations.filter((v) => v.id === 'color-contrast');

    summary += `- Total violations: ${darkViolations.length}\n`;
    summary += `- Color contrast violations: ${darkContrastViolations.length}\n\n`;

    if (darkContrastViolations.length > 0) {
      summary += '#### Color Contrast Issues\n\n';
      darkContrastViolations.forEach((violation) => {
        summary += `- ${violation.nodes.length} elements with insufficient contrast\n`;
      });
      summary += '\n';
    }

    totalViolations += lightViolations.length + darkViolations.length;
    colorContrastViolations += lightContrastViolations.length + darkContrastViolations.length;
  }

  summary += '## Overall Summary\n\n';
  summary += `- Total pages tested: ${Object.keys(results).length}\n`;
  summary += `- Pages with errors: ${errorCount}\n`;
  summary += `- Total violations: ${totalViolations}\n`;
  summary += `- Total color contrast violations: ${colorContrastViolations}\n\n`;

  if (errorCount > 0) {
    summary += '⚠️ Some pages could not be tested. Please check the detailed report.\n\n';
  }

  if (colorContrastViolations === 0 && errorCount === 0) {
    summary +=
      '✅ No color contrast issues found! The new color palette appears to be WCAG 2.1 AA compliant.\n';
  } else if (colorContrastViolations === 0) {
    summary += '✅ No color contrast issues found in the pages that could be tested.\n';
  } else {
    summary +=
      '❌ Color contrast issues found. Please review the detailed report and make necessary adjustments.\n';
  }

  return summary;
}

// Run the tests
runAccessibilityTests().catch((err) => {
  console.error('Error running accessibility tests:', err);
  process.exit(1);
});
