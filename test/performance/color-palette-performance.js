/**
 * Performance testing for the new color palette
 * Tests rendering performance, memory usage, and CSS efficiency
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Base directory
const baseDir = path.resolve(process.cwd());

// URLs to test
const urls = [
  `file://${baseDir}/index.html`,
  `file://${baseDir}/calculator.html`,
  `file://${baseDir}/404.html`,
  `file://${baseDir}/docs/component-examples.html`,
];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../performance-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function runPerformanceTests() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const results = {};

  console.log('Starting performance tests for the new color palette...');

  for (const url of urls) {
    console.log(`Testing ${url}...`);

    // Test in light mode
    const lightResults = await testPagePerformance(browser, url, 'light');

    // Test in dark mode
    const darkResults = await testPagePerformance(browser, url, 'dark');

    results[url] = {
      light: lightResults,
      dark: darkResults,
    };
  }

  // Save results to file
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filePath = path.join(outputDir, `color-palette-performance-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

  // Generate summary report
  const summary = generateSummary(results);
  const summaryPath = path.join(outputDir, `color-palette-performance-summary-${timestamp}.md`);
  fs.writeFileSync(summaryPath, summary);

  console.log(`Performance tests completed. Results saved to ${filePath}`);
  console.log(`Summary report saved to ${summaryPath}`);

  await browser.close();
}

async function testPagePerformance(browser, url, mode) {
  const page = await browser.newPage();

  try {
    // Set color scheme if testing dark mode
    if (mode === 'dark') {
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    }

    // Enable performance metrics
    await page.setCacheEnabled(false);

    // Navigate to the page
    const navigationStart = Date.now();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const navigationTime = Date.now() - navigationStart;

    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation');
      const paintEntries = performance.getEntriesByType('paint');

      return {
        domContentLoaded:
          perfEntries.length > 0
            ? perfEntries[0].domContentLoadedEventEnd - perfEntries[0].domContentLoadedEventStart
            : null,
        firstPaint: paintEntries.find((entry) => entry.name === 'first-paint')?.startTime || null,
        firstContentfulPaint:
          paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || null,
      };
    });

    // Measure rendering performance
    const renderingMetrics = await page.evaluate(() => {
      // Simulate scrolling to measure rendering performance
      const startTime = performance.now();

      // Force layout recalculation
      for (let i = 0; i < 10; i++) {
        window.scrollTo(0, i * 100);
        document.body.getBoundingClientRect();
      }

      window.scrollTo(0, 0);
      const endTime = performance.now();

      return {
        scrollingTime: endTime - startTime,
        layoutTime: performance
          .getEntriesByType('layout-shift')
          .reduce((sum, entry) => sum + entry.value, 0),
      };
    });

    // Measure memory usage
    const memoryInfo = await page.evaluate(() => {
      if (performance.memory) {
        return {
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          usedJSHeapSize: performance.memory.usedJSHeapSize,
        };
      }
      return null;
    });

    // Analyze CSS usage
    const cssInfo = await page.evaluate(() => {
      // Get all stylesheets
      const styleSheets = Array.from(document.styleSheets);
      const cssRules = [];

      // Count CSS rules
      styleSheets.forEach((sheet) => {
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach((rule) => {
              cssRules.push({
                type: rule.type,
                selectorText: rule.selectorText || null,
                cssText: rule.cssText,
              });
            });
          }
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      });

      // Count color-related rules
      const colorRules = cssRules.filter(
        (rule) =>
          rule.cssText &&
          (rule.cssText.includes('color') ||
            rule.cssText.includes('background') ||
            rule.cssText.includes('border') ||
            rule.cssText.includes('shadow')),
      );

      return {
        totalStyleSheets: styleSheets.length,
        totalRules: cssRules.length,
        colorRelatedRules: colorRules.length,
        cssVariables: document.documentElement.style.length,
      };
    });

    return {
      navigationTime,
      performanceMetrics,
      renderingMetrics,
      memoryInfo,
      cssInfo,
    };
  } catch (error) {
    console.error(`Error testing ${url} in ${mode} mode:`, error.message);
    return { error: error.message };
  } finally {
    await page.close();
  }
}

function generateSummary(results) {
  let summary = '# Color Palette Performance Test Summary\n\n';
  summary += `Date: ${new Date().toLocaleString()}\n\n`;

  let totalPages = Object.keys(results).length;
  let pagesWithErrors = 0;

  // Calculate averages
  const averages = {
    light: {
      navigationTime: 0,
      firstContentfulPaint: 0,
      scrollingTime: 0,
      colorRelatedRules: 0,
    },
    dark: {
      navigationTime: 0,
      firstContentfulPaint: 0,
      scrollingTime: 0,
      colorRelatedRules: 0,
    },
  };

  // Collect data for each page
  for (const url in results) {
    summary += `## ${url}\n\n`;

    // Light mode
    summary += '### Light Mode\n\n';
    if (results[url].light.error) {
      summary += `⚠️ **Error:** ${results[url].light.error}\n\n`;
      pagesWithErrors++;
    } else {
      const light = results[url].light;
      summary += '| Metric | Value |\n';
      summary += '|--------|-------|\n';
      summary += `| Navigation Time | ${light.navigationTime}ms |\n`;
      summary += `| First Contentful Paint | ${light.performanceMetrics.firstContentfulPaint || 'N/A'}ms |\n`;
      summary += `| DOM Content Loaded | ${light.performanceMetrics.domContentLoaded || 'N/A'}ms |\n`;
      summary += `| Scrolling Performance | ${light.renderingMetrics.scrollingTime.toFixed(2)}ms |\n`;
      summary += `| Total CSS Rules | ${light.cssInfo.totalRules} |\n`;
      summary += `| Color-Related Rules | ${light.cssInfo.colorRelatedRules} |\n\n`;

      // Update averages
      averages.light.navigationTime += light.navigationTime;
      averages.light.firstContentfulPaint += light.performanceMetrics.firstContentfulPaint || 0;
      averages.light.scrollingTime += light.renderingMetrics.scrollingTime;
      averages.light.colorRelatedRules += light.cssInfo.colorRelatedRules;
    }

    // Dark mode
    summary += '### Dark Mode\n\n';
    if (results[url].dark.error) {
      summary += `⚠️ **Error:** ${results[url].dark.error}\n\n`;
      pagesWithErrors++;
    } else {
      const dark = results[url].dark;
      summary += '| Metric | Value |\n';
      summary += '|--------|-------|\n';
      summary += `| Navigation Time | ${dark.navigationTime}ms |\n`;
      summary += `| First Contentful Paint | ${dark.performanceMetrics.firstContentfulPaint || 'N/A'}ms |\n`;
      summary += `| DOM Content Loaded | ${dark.performanceMetrics.domContentLoaded || 'N/A'}ms |\n`;
      summary += `| Scrolling Performance | ${dark.renderingMetrics.scrollingTime.toFixed(2)}ms |\n`;
      summary += `| Total CSS Rules | ${dark.cssInfo.totalRules} |\n`;
      summary += `| Color-Related Rules | ${dark.cssInfo.colorRelatedRules} |\n\n`;

      // Update averages
      averages.dark.navigationTime += dark.navigationTime;
      averages.dark.firstContentfulPaint += dark.performanceMetrics.firstContentfulPaint || 0;
      averages.dark.scrollingTime += dark.renderingMetrics.scrollingTime;
      averages.dark.colorRelatedRules += dark.cssInfo.colorRelatedRules;
    }
  }

  // Calculate final averages
  const validPages = totalPages - pagesWithErrors / 2; // Each page has light and dark mode
  if (validPages > 0) {
    averages.light.navigationTime /= validPages;
    averages.light.firstContentfulPaint /= validPages;
    averages.light.scrollingTime /= validPages;
    averages.light.colorRelatedRules /= validPages;

    averages.dark.navigationTime /= validPages;
    averages.dark.firstContentfulPaint /= validPages;
    averages.dark.scrollingTime /= validPages;
    averages.dark.colorRelatedRules /= validPages;
  }

  // Overall summary
  summary += '## Overall Summary\n\n';
  summary += `- Total pages tested: ${totalPages}\n`;
  summary += `- Pages with errors: ${pagesWithErrors / 2}\n\n`;

  summary += '### Average Metrics\n\n';
  summary += '| Metric | Light Mode | Dark Mode | Difference |\n';
  summary += '|--------|------------|-----------|------------|\n';
  summary += `| Navigation Time | ${averages.light.navigationTime.toFixed(2)}ms | ${averages.dark.navigationTime.toFixed(2)}ms | ${(averages.dark.navigationTime - averages.light.navigationTime).toFixed(2)}ms |\n`;
  summary += `| First Contentful Paint | ${averages.light.firstContentfulPaint.toFixed(2)}ms | ${averages.dark.firstContentfulPaint.toFixed(2)}ms | ${(averages.dark.firstContentfulPaint - averages.light.firstContentfulPaint).toFixed(2)}ms |\n`;
  summary += `| Scrolling Performance | ${averages.light.scrollingTime.toFixed(2)}ms | ${averages.dark.scrollingTime.toFixed(2)}ms | ${(averages.dark.scrollingTime - averages.light.scrollingTime).toFixed(2)}ms |\n`;
  summary += `| Color-Related Rules | ${averages.light.colorRelatedRules.toFixed(2)} | ${averages.dark.colorRelatedRules.toFixed(2)} | ${(averages.dark.colorRelatedRules - averages.light.colorRelatedRules).toFixed(2)} |\n\n`;

  // Conclusions
  summary += '## Conclusions\n\n';

  if (averages.dark.navigationTime > averages.light.navigationTime * 1.2) {
    summary +=
      '⚠️ **Dark mode is significantly slower than light mode.** Consider optimizing dark mode styles.\n\n';
  } else {
    summary +=
      '✅ **Dark mode performance is comparable to light mode.** The color palette implementation is efficient.\n\n';
  }

  if (averages.light.firstContentfulPaint > 1000 || averages.dark.firstContentfulPaint > 1000) {
    summary +=
      '⚠️ **First contentful paint is slow.** Consider optimizing critical CSS or reducing render-blocking resources.\n\n';
  } else {
    summary +=
      '✅ **First contentful paint is fast.** The color palette does not negatively impact initial rendering.\n\n';
  }

  return summary;
}

// Run the tests
runPerformanceTests().catch((err) => {
  console.error('Error running performance tests:', err);
  process.exit(1);
});
