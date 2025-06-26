/**
 * Cross-Browser Compatibility Test Suite
 * Tests application functionality across different browsers and devices
 */

const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Configuration
const BASE_URL = 'http://localhost:3000';
const PAGES_TO_TEST = [
  { path: '/', name: 'Home Page' },
  { path: '/calculator', name: 'Calculator' },
  { path: '/wizard', name: 'Wizard' },
  { path: '/terrain-viewer', name: 'Terrain Viewer' },
  { path: '/cost-calculator', name: 'Cost Calculator' },
  { path: '/3d-experience', name: '3D Experience' }
];

// Browsers to test
const BROWSERS = [
  { name: 'Chromium', engine: 'chromium' },
  { name: 'Firefox', engine: 'firefox' },
  { name: 'WebKit', engine: 'webkit' }
];

// Device configurations
const DEVICES = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 }
];

// Test scenarios
const TEST_SCENARIOS = [
  { name: 'Page Load', test: testPageLoad },
  { name: 'UI Components', test: testUIComponents },
  { name: 'Interactivity', test: testInteractivity },
  { name: '3D Rendering', test: test3DRendering },
  { name: 'Responsive Layout', test: testResponsiveLayout }
];

/**
 * Runs cross-browser compatibility tests
 */
async function runCrossBrowserTests() {
  console.log('Starting cross-browser compatibility tests...');
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportDir = path.join(process.cwd(), 'test', 'integration-reports');
  
  if (!fs.existsSync(reportDir)) {
    await mkdir(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, `cross-browser-report-${timestamp}.md`);
  const screenshotsDir = path.join(reportDir, `screenshots-${timestamp}`);
  
  if (!fs.existsSync(screenshotsDir)) {
    await mkdir(screenshotsDir, { recursive: true });
  }
  
  let report = `# Cross-Browser Compatibility Test Report\n\n`;
  report += `Date: ${new Date().toLocaleString()}\n\n`;
  
  const results = {
    browsers: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    }
  };
  
  // Run tests for each browser
  for (const browser of BROWSERS) {
    console.log(`Testing on ${browser.name}...`);
    results.browsers[browser.name] = { devices: {} };
    
    const browserInstance = await playwright[browser.engine].launch({
      headless: true
    });
    
    try {
      // Test on each device configuration
      for (const device of DEVICES) {
        console.log(`  Testing on ${device.name}...`);
        results.browsers[browser.name].devices[device.name] = { pages: {} };
        
        const context = await browserInstance.newContext({
          viewport: { width: device.width, height: device.height },
          userAgent: `Playwright-${browser.name}-${device.name}-Test`
        });
        
        // Test each page
        for (const page of PAGES_TO_TEST) {
          console.log(`    Testing ${page.name}...`);
          results.browsers[browser.name].devices[device.name].pages[page.name] = { scenarios: {} };
          
          const browserPage = await context.newPage();
          
          try {
            await browserPage.goto(`${BASE_URL}${page.path}`, { 
              waitUntil: 'networkidle',
              timeout: 60000
            });
            
            // Take screenshot
            const screenshotPath = path.join(
              screenshotsDir, 
              `${browser.name}-${device.name}-${page.name.replace(/ /g, '-')}.png`
            );
            await browserPage.screenshot({ path: screenshotPath, fullPage: true });
            
            // Run test scenarios
            for (const scenario of TEST_SCENARIOS) {
              console.log(`      Running scenario: ${scenario.name}...`);
              
              try {
                // Skip 3D rendering tests on mobile devices for WebKit (known limitation)
                if (browser.name === 'WebKit' && device.name === 'Mobile' && 
                    scenario.name === '3D Rendering' && 
                    (page.name === '3D Experience' || page.name === 'Terrain Viewer')) {
                  results.browsers[browser.name].devices[device.name].pages[page.name].scenarios[scenario.name] = {
                    status: 'skipped',
                    message: 'WebGL limitations on WebKit mobile'
                  };
                  results.summary.skipped++;
                  continue;
                }
                
                const scenarioResult = await scenario.test(browserPage, page, device);
                results.browsers[browser.name].devices[device.name].pages[page.name].scenarios[scenario.name] = scenarioResult;
                
                if (scenarioResult.status === 'passed') {
                  results.summary.passed++;
                } else if (scenarioResult.status === 'failed') {
                  results.summary.failed++;
                } else {
                  results.summary.skipped++;
                }
                
                results.summary.total++;
  } catch (error) {
                results.browsers[browser.name].devices[device.name].pages[page.name].scenarios[scenario.name] = {
                  status: 'failed',
                  message: `Error: ${error.message}`
                };
                results.summary.failed++;
                results.summary.total++;
              }
            }
            
          } catch (error) {
            console.error(`Error testing ${page.name} on ${browser.name} ${device.name}:`, error);
            results.browsers[browser.name].devices[device.name].pages[page.name].error = error.message;
            
            // Mark all scenarios as failed
            for (const scenario of TEST_SCENARIOS) {
              results.browsers[browser.name].devices[device.name].pages[page.name].scenarios[scenario.name] = {
                status: 'failed',
                message: `Page failed to load: ${error.message}`
              };
              results.summary.failed++;
              results.summary.total++;
            }
          } finally {
            await browserPage.close();
          }
        }
        
        await context.close();
      }
    } finally {
      await browserInstance.close();
    }
  }
  
  // Generate report
  report += `## Summary\n\n`;
  report += `- Total tests: ${results.summary.total}\n`;
  report += `- Passed: ${results.summary.passed} (${(results.summary.passed / results.summary.total * 100).toFixed(2)}%)\n`;
  report += `- Failed: ${results.summary.failed} (${(results.summary.failed / results.summary.total * 100).toFixed(2)}%)\n`;
  report += `- Skipped: ${results.summary.skipped} (${(results.summary.skipped / results.summary.total * 100).toFixed(2)}%)\n\n`;
  
  report += `## Detailed Results\n\n`;
  
  for (const [browserName, browserData] of Object.entries(results.browsers)) {
    report += `### ${browserName}\n\n`;
    
    for (const [deviceName, deviceData] of Object.entries(browserData.devices)) {
      report += `#### ${deviceName}\n\n`;
      report += `| Page | Scenario | Status | Message |\n`;
      report += `|------|----------|--------|--------|\n`;
      
      for (const [pageName, pageData] of Object.entries(deviceData.pages)) {
        for (const [scenarioName, scenarioData] of Object.entries(pageData.scenarios)) {
          const status = scenarioData.status === 'passed' ? '✅' : 
                         scenarioData.status === 'skipped' ? '⚠️' : '❌';
          report += `| ${pageName} | ${scenarioName} | ${status} | ${scenarioData.message || ''} |\n`;
        }
      }
      
      report += `\n`;
    }
  }
  
  report += `## Browser-Specific Issues\n\n`;
  
  // Find browser-specific issues
  const browserIssues = {};
  
  for (const [browserName, browserData] of Object.entries(results.browsers)) {
    browserIssues[browserName] = [];
    
    for (const [deviceName, deviceData] of Object.entries(browserData.devices)) {
      for (const [pageName, pageData] of Object.entries(deviceData.pages)) {
        for (const [scenarioName, scenarioData] of Object.entries(pageData.scenarios)) {
          if (scenarioData.status === 'failed') {
            // Check if this is a browser-specific issue
            const isUnique = Object.entries(results.browsers)
              .filter(([otherBrowser]) => otherBrowser !== browserName)
              .every(([_, otherBrowserData]) => {
                return otherBrowserData.devices[deviceName]?.pages[pageName]?.scenarios[scenarioName]?.status === 'passed';
              });
            
            if (isUnique) {
              browserIssues[browserName].push({
                device: deviceName,
                page: pageName,
                scenario: scenarioName,
                message: scenarioData.message
              });
            }
          }
        }
      }
    }
  }
  
  // Add browser-specific issues to report
  for (const [browserName, issues] of Object.entries(browserIssues)) {
    if (issues.length > 0) {
      report += `### ${browserName}\n\n`;
      
      for (const issue of issues) {
        report += `- **${issue.page} / ${issue.scenario} (${issue.device})**: ${issue.message}\n`;
      }
      
      report += `\n`;
    }
  }
  
  // Write report
  await writeFile(reportPath, report);
  console.log(`Cross-browser tests complete. Report saved to: ${reportPath}`);
  
  return { reportPath, results };
}

/**
 * Test page load functionality
 */
async function testPageLoad(page) {
  try {
    // Check if page loaded without errors
    const hasError = await page.evaluate(() => {
      return document.querySelector('.error-message, .error-container') !== null;
    });
    
    if (hasError) {
      return {
        status: 'failed',
        message: 'Page loaded with error message'
      };
    }
    
    // Check if main content loaded
    const hasContent = await page.evaluate(() => {
      return document.querySelector('main, #root > *, .app-container') !== null;
    });
    
    if (!hasContent) {
      return {
        status: 'failed',
        message: 'Page loaded without main content'
      };
    }
    
    return {
      status: 'passed',
      message: 'Page loaded successfully'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error during page load test: ${error.message}`
    };
  }
}

/**
 * Test UI components
 */
async function testUIComponents(page, pageConfig) {
  try {
    // Define critical components for each page
    const criticalSelectors = {
      'Home Page': ['header', 'footer', 'main', '.hero-section'],
      'Calculator': ['.calculator-container', '.input-fields', '.results-section'],
      'Wizard': ['.wizard-container', '.step-indicator', '.navigation-buttons'],
      'Terrain Viewer': ['.terrain-viewer', '.controls-panel', '.map-container'],
      'Cost Calculator': ['.cost-calculator', '.input-section', '.results-section'],
      '3D Experience': ['.immersive-viewer', '.controls-panel', '.options-panel']
    };
    
    const selectors = criticalSelectors[pageConfig.name] || [];
    const missingComponents = [];
    
    // Check for each critical component
    for (const selector of selectors) {
      const exists = await page.evaluate((sel) => {
        return document.querySelector(sel) !== null;
      }, selector);
      
      if (!exists) {
        missingComponents.push(selector);
      }
    }
    
    if (missingComponents.length > 0) {
      return {
        status: 'failed',
        message: `Missing components: ${missingComponents.join(', ')}`
      };
    }
    
    return {
      status: 'passed',
      message: 'All critical UI components present'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error during UI components test: ${error.message}`
    };
  }
}

/**
 * Test interactivity
 */
async function testInteractivity(page, pageConfig) {
  try {
    // Define interactive elements for each page
    const interactiveElements = {
      'Home Page': [
        { selector: 'a.cta-button', action: 'click' },
        { selector: 'header nav a', action: 'click', expectNavigation: false }
      ],
      'Calculator': [
        { selector: 'input[type="number"]', action: 'type', value: '100' },
        { selector: 'button.calculate-button', action: 'click' }
      ],
      'Wizard': [
        { selector: '.select-card', action: 'click' },
        { selector: 'button.next-button', action: 'click' }
      ],
      'Terrain Viewer': [
        { selector: '.controls-panel button', action: 'click' },
        { selector: '.zoom-control', action: 'click' }
      ],
      'Cost Calculator': [
        { selector: 'select', action: 'select', value: '1' },
        { selector: 'input[type="range"]', action: 'fill', value: '50' }
      ],
      '3D Experience': [
        { selector: '.view-controls button', action: 'click' },
        { selector: '.day-night-toggle', action: 'click' }
      ]
    };
    
    const elements = interactiveElements[pageConfig.name] || [];
    const interactionFailures = [];
    
    // Test each interactive element
    for (const element of elements) {
      try {
        const elementExists = await page.evaluate((sel) => {
          return document.querySelector(sel) !== null;
        }, element.selector);
        
        if (!elementExists) {
          interactionFailures.push(`Element not found: ${element.selector}`);
          continue;
        }
        
        // Perform the action
        if (element.action === 'click') {
          if (element.expectNavigation !== false) {
            await Promise.all([
              page.waitForNavigation({ timeout: 5000 }).catch(() => {}),
              page.click(element.selector)
            ]);
          } else {
            await page.click(element.selector);
          }
        } else if (element.action === 'type') {
          await page.fill(element.selector, element.value);
        } else if (element.action === 'select') {
          await page.selectOption(element.selector, element.value);
        } else if (element.action === 'fill') {
          await page.fill(element.selector, element.value);
        }
        
      } catch (error) {
        interactionFailures.push(`Failed to interact with ${element.selector}: ${error.message}`);
      }
    }
    
    if (interactionFailures.length > 0) {
      return {
        status: 'failed',
        message: interactionFailures.join('; ')
      };
    }
    
    return {
      status: 'passed',
      message: 'All interactive elements working'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error during interactivity test: ${error.message}`
    };
  }
}

/**
 * Test 3D rendering capabilities
 */
async function test3DRendering(page, pageConfig) {
  try {
    // Only test 3D rendering on relevant pages
    if (!pageConfig.name.includes('3D') && !pageConfig.name.includes('Terrain')) {
      return {
        status: 'skipped',
        message: 'Not a 3D page'
      };
    }
    
    // Check for canvas element
    const hasCanvas = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    
    if (!hasCanvas) {
      return {
        status: 'failed',
        message: 'No canvas element found for 3D rendering'
      };
    }
    
    // Check if WebGL is available
    const webglAvailable = await page.evaluate(() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    });
    
    if (!webglAvailable) {
      return {
        status: 'failed',
        message: 'WebGL not available'
      };
    }
    
    // Check if the 3D viewer is rendering
    const isRendering = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      // A simple heuristic: a rendering canvas should have a reasonable size
      return canvas && canvas.width > 50 && canvas.height > 50;
    });
    
    if (!isRendering) {
      return {
        status: 'failed',
        message: '3D viewer canvas has invalid dimensions'
      };
    }
    
    return {
      status: 'passed',
      message: '3D rendering working'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error during 3D rendering test: ${error.message}`
    };
  }
}

/**
 * Test responsive layout
 */
async function testResponsiveLayout(page, pageConfig, device) {
  try {
    // Check for overflow issues
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    if (hasOverflow) {
      return {
        status: 'failed',
        message: 'Page has horizontal overflow'
      };
    }
    
    // Check for mobile menu on small devices
    if (device.name === 'Mobile' || device.name === 'Tablet') {
      const hasMobileMenu = await page.evaluate(() => {
        return document.querySelector('.mobile-menu, .hamburger-menu, .menu-toggle') !== null;
      });
      
      if (!hasMobileMenu) {
        return {
          status: 'failed',
          message: 'Mobile menu not found on small device'
        };
      }
    }
    
    // Check if critical content is visible
    const criticalContent = {
      'Home Page': '.hero-section, .main-cta',
      'Calculator': '.calculator-container',
      'Wizard': '.wizard-container',
      'Terrain Viewer': '.terrain-viewer',
      'Cost Calculator': '.cost-calculator',
      '3D Experience': '.immersive-viewer'
    };
    
    const selector = criticalContent[pageConfig.name];
    if (selector) {
      const isVisible = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }, selector);
      
      if (!isVisible) {
        return {
          status: 'failed',
          message: 'Critical content not visible'
        };
      }
    }
    
    return {
      status: 'passed',
      message: 'Responsive layout working correctly'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error during responsive layout test: ${error.message}`
    };
  }
}

// Run the tests
if (require.main === module) {
  runCrossBrowserTests().catch(console.error);
}

module.exports = { runCrossBrowserTests }; 