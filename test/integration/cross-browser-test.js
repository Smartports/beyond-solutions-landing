/**
 * Cross-browser testing script for the Beyond Solutions color palette implementation
 * This script tests the color palette across different browsers and devices
 */

const { chromium, firefox, webkit } = require('playwright');
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
  `file://${baseDir}/docs/color-palette-showcase.html`
];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../integration-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Viewport sizes to test
const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1366, height: 768 }
];

console.log('Cross-browser testing script for the Beyond Solutions color palette implementation');
console.log('This script tests the color palette across different browsers and devices');
console.log(`Output will be saved to: ${outputDir}`);

async function runCrossBrowserTests() {
  console.log('Starting cross-browser tests for the color palette implementation...');
  
  const results = {
    chromium: {},
    firefox: {},
    webkit: {}
  };
  
  try {
    // Test in Chromium
    console.log('Testing with Chromium...');
    const chromiumBrowser = await chromium.launch();
    await testBrowser(chromiumBrowser, 'chromium', results.chromium);
    await chromiumBrowser.close();
    
    // Test in Firefox
    console.log('Testing with Firefox...');
    const firefoxBrowser = await firefox.launch();
    await testBrowser(firefoxBrowser, 'firefox', results.firefox);
    await firefoxBrowser.close();
    
    // Test in WebKit
    console.log('Testing with WebKit...');
    const webkitBrowser = await webkit.launch();
    await testBrowser(webkitBrowser, 'webkit', results.webkit);
    await webkitBrowser.close();
    
    // Generate report
    const report = generateReport(results);
    
    // Save report
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportPath = path.join(outputDir, `cross-browser-report-${timestamp}.md`);
    fs.writeFileSync(reportPath, report);
    
    console.log(`Cross-browser testing completed. Report saved to ${reportPath}`);
  } catch (error) {
    console.error('Error running cross-browser tests:', error);
    process.exit(1);
  }
}

async function testBrowser(browser, browserName, results) {
  for (const url of urls) {
    const pageName = url.split('/').pop().replace('.html', '');
    results[pageName] = {};
    
    for (const viewport of viewports) {
      console.log(`  Testing ${pageName} on ${browserName} at ${viewport.name} size...`);
      results[pageName][viewport.name] = {};
      
      // Test in light mode
      await testPageInMode(browser, url, viewport, 'light', results[pageName][viewport.name]);
      
      // Test in dark mode
      await testPageInMode(browser, url, viewport, 'dark', results[pageName][viewport.name]);
    }
  }
}

async function testPageInMode(browser, url, viewport, mode, results) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: mode
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to page
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Test CSS variables
    const cssVarsSupport = await page.evaluate(() => {
      return window.CSS && CSS.supports('color', 'var(--test)');
    });
    
    // Get computed colors
    const colors = await page.evaluate(() => {
      const elements = {
        body: document.body,
        heading: document.querySelector('h1, h2, h3'),
        paragraph: document.querySelector('p'),
        link: document.querySelector('a'),
        button: document.querySelector('button')
      };
      
      const result = {};
      
      for (const [name, element] of Object.entries(elements)) {
        if (element) {
          const style = window.getComputedStyle(element);
          result[name] = {
            color: style.color,
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor
          };
        } else {
          // Handle missing elements gracefully
          result[name] = {
            color: 'not found',
            backgroundColor: 'not found',
            borderColor: 'not found'
          };
        }
      }
      
      return result;
    });
    
    // Test dark mode detection
    const darkModeDetected = await page.evaluate(() => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    
    // Test RTL support
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
    });
    
    await page.waitForTimeout(500);
    
    let rtlSupport;
    try {
      rtlSupport = await page.evaluate(() => {
        const body = document.body;
        if (!body) return { direction: 'unknown', supported: false };
        
        const style = window.getComputedStyle(body);
        const direction = style.direction;
        
        // Reset direction
        document.documentElement.dir = 'ltr';
        
        return {
          direction,
          supported: direction === 'rtl'
        };
      });
    } catch (error) {
      console.error(`  Error testing RTL support: ${error.message}`);
      rtlSupport = { direction: 'error', supported: false };
    }
    
    results[mode] = {
      cssVarsSupport,
      colors,
      darkModeDetected,
      rtlSupport
    };
  } catch (error) {
    console.error(`  Error testing ${url} in ${mode} mode:`, error.message);
    results[mode] = { error: error.message };
  } finally {
    await context.close();
  }
}

function generateReport(results) {
  let report = '# Cross-Browser Testing Report\n\n';
  report += `Date: ${new Date().toLocaleString()}\n\n`;
  
  // Summary
  report += '## Summary\n\n';
  report += '| Feature | Chromium | Firefox | WebKit |\n';
  report += '|---------|----------|---------|--------|\n';
  
  const features = {
    'CSS Variables': checkFeatureSupport(results, 'cssVarsSupport'),
    'Dark Mode': checkFeatureSupport(results, 'darkModeDetected', 'dark'),
    'RTL Support': checkFeatureSupport(results, 'rtlSupport.supported')
  };
  
  for (const [feature, support] of Object.entries(features)) {
    report += `| ${feature} | ${formatSupport(support.chromium)} | ${formatSupport(support.firefox)} | ${formatSupport(support.webkit)} |\n`;
  }
  
  report += '\n';
  
  // Color consistency
  report += '## Color Consistency\n\n';
  
  for (const browser of ['chromium', 'firefox', 'webkit']) {
    report += `### ${capitalizeFirstLetter(browser)}\n\n`;
    
    // Check if colors are consistent across viewports
    const colorConsistency = checkColorConsistency(results[browser]);
    
    if (Object.keys(colorConsistency).length === 0) {
      report += '✅ **Colors are consistent across all viewports and pages.**\n\n';
    } else {
      report += '❌ **Color inconsistencies detected:**\n\n';
      
      for (const [page, inconsistencies] of Object.entries(colorConsistency)) {
        report += `#### ${page}\n\n`;
        report += '| Element | Property | Value 1 | Value 2 | Viewport 1 | Viewport 2 |\n';
        report += '|---------|----------|---------|---------|------------|------------|\n';
        
        for (const inconsistency of inconsistencies) {
          report += `| ${inconsistency.element} | ${inconsistency.property} | ${inconsistency.value1} | ${inconsistency.value2} | ${inconsistency.viewport1} | ${inconsistency.viewport2} |\n`;
        }
        
        report += '\n';
      }
    }
  }
  
  // Light vs Dark mode
  report += '## Light vs Dark Mode\n\n';
  
  for (const browser of ['chromium', 'firefox', 'webkit']) {
    report += `### ${capitalizeFirstLetter(browser)}\n\n`;
    
    const modeConsistency = checkModeConsistency(results[browser]);
    
    if (Object.keys(modeConsistency).length === 0) {
      report += '✅ **Dark mode is properly implemented across all pages.**\n\n';
    } else {
      report += '❌ **Dark mode inconsistencies detected:**\n\n';
      
      for (const [page, inconsistencies] of Object.entries(modeConsistency)) {
        report += `#### ${page}\n\n`;
        report += '| Element | Property | Light Mode | Dark Mode | Viewport |\n';
        report += '|---------|----------|------------|-----------|----------|\n';
        
        for (const inconsistency of inconsistencies) {
          report += `| ${inconsistency.element} | ${inconsistency.property} | ${inconsistency.lightValue} | ${inconsistency.darkValue} | ${inconsistency.viewport} |\n`;
        }
        
        report += '\n';
      }
    }
  }
  
  // Conclusion
  report += '## Conclusion\n\n';
  
  const allFeatures = Object.values(features).every(feature => 
    feature.chromium && feature.firefox && feature.webkit);
  
  const colorIssues = ['chromium', 'firefox', 'webkit'].some(browser => 
    Object.keys(checkColorConsistency(results[browser])).length > 0);
  
  const modeIssues = ['chromium', 'firefox', 'webkit'].some(browser => 
    Object.keys(checkModeConsistency(results[browser])).length > 0);
  
  if (allFeatures && !colorIssues && !modeIssues) {
    report += '✅ **The color palette implementation is consistent across all tested browsers and viewports.**\n\n';
    report += 'The implementation successfully supports:\n';
    report += '- CSS Variables\n';
    report += '- Dark Mode\n';
    report += '- RTL Languages\n';
    report += '- Responsive Design\n';
  } else {
    report += '❌ **The color palette implementation has issues that need to be addressed:**\n\n';
    
    if (!allFeatures) {
      report += '- Some features are not supported in all browsers\n';
    }
    
    if (colorIssues) {
      report += '- Color inconsistencies detected across viewports\n';
    }
    
    if (modeIssues) {
      report += '- Dark mode implementation is inconsistent\n';
    }
  }
  
  return report;
}

function checkFeatureSupport(results, featurePath, mode = 'light') {
  const support = {
    chromium: true,
    firefox: true,
    webkit: true
  };
  
  for (const browser of ['chromium', 'firefox', 'webkit']) {
    for (const page in results[browser]) {
      for (const viewport in results[browser][page]) {
        const modeResults = results[browser][page][viewport][mode];
        
        if (!modeResults || modeResults.error) {
          support[browser] = false;
          continue;
        }
        
        // Access nested properties using path string
        const paths = featurePath.split('.');
        let value = modeResults;
        
        for (const path of paths) {
          if (value && value[path] !== undefined) {
            value = value[path];
          } else {
            value = undefined;
            break;
          }
        }
        
        if (value !== true) {
          support[browser] = false;
        }
      }
    }
  }
  
  return support;
}

function checkColorConsistency(browserResults) {
  const inconsistencies = {};
  
  for (const page in browserResults) {
    const pageInconsistencies = [];
    const viewports = Object.keys(browserResults[page]);
    
    // Compare colors across viewports
    for (let i = 0; i < viewports.length; i++) {
      for (let j = i + 1; j < viewports.length; j++) {
        const viewport1 = viewports[i];
        const viewport2 = viewports[j];
        
        const lightMode1 = browserResults[page][viewport1].light;
        const lightMode2 = browserResults[page][viewport2].light;
        
        if (!lightMode1 || !lightMode2 || lightMode1.error || lightMode2.error) {
          continue;
        }
        
        // Compare colors for each element
        for (const element in lightMode1.colors) {
          if (!lightMode2.colors[element]) continue;
          
          for (const property in lightMode1.colors[element]) {
            const value1 = lightMode1.colors[element][property];
            const value2 = lightMode2.colors[element][property];
            
            if (value1 !== value2) {
              pageInconsistencies.push({
                element,
                property,
                value1,
                value2,
                viewport1,
                viewport2
              });
            }
          }
        }
      }
    }
    
    if (pageInconsistencies.length > 0) {
      inconsistencies[page] = pageInconsistencies;
    }
  }
  
  return inconsistencies;
}

function checkModeConsistency(browserResults) {
  const inconsistencies = {};
  
  for (const page in browserResults) {
    const pageInconsistencies = [];
    
    for (const viewport in browserResults[page]) {
      const lightMode = browserResults[page][viewport].light;
      const darkMode = browserResults[page][viewport].dark;
      
      if (!lightMode || !darkMode || lightMode.error || darkMode.error) {
        continue;
      }
      
      // Check if dark mode colors are different from light mode
      for (const element in lightMode.colors) {
        if (!darkMode.colors[element]) continue;
        
        for (const property in lightMode.colors[element]) {
          const lightValue = lightMode.colors[element][property];
          const darkValue = darkMode.colors[element][property];
          
          // Skip transparent or unset colors
          if (lightValue === 'rgba(0, 0, 0, 0)' || darkValue === 'rgba(0, 0, 0, 0)') {
            continue;
          }
          
          // If light and dark values are the same, it might indicate a problem
          if (lightValue === darkValue && property === 'color' || property === 'backgroundColor') {
            pageInconsistencies.push({
              element,
              property,
              lightValue,
              darkValue,
              viewport
            });
          }
        }
      }
    }
    
    if (pageInconsistencies.length > 0) {
      inconsistencies[page] = pageInconsistencies;
    }
  }
  
  return inconsistencies;
}

function formatSupport(supported) {
  return supported ? '✅' : '❌';
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Run the tests
runCrossBrowserTests(); 