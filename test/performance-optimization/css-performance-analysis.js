/**
 * CSS Performance Analysis Script
 * Analyzes CSS usage and performance for the color palette implementation
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
  `file://${baseDir}/docs/color-palette-showcase.html`
];

// CSS files to analyze
const cssFiles = [
  'css/colors.css',
  'css/rtl.css',
  'css/language-selector.css',
  'i18n/rtl.css'
];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../css-performance-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function analyzeCssPerformance() {
  console.log('Starting CSS performance analysis...');
  
  // Analyze CSS files statically
  console.log('Analyzing CSS files statically...');
  const staticAnalysis = analyzeStaticCss();
  
  try {
    // Analyze CSS usage in browser
    console.log('Analyzing CSS usage in browser...');
    const dynamicAnalysis = await analyzeDynamicCss();
    
    // Generate report
    const report = generateReport(staticAnalysis, dynamicAnalysis);
    
    // Save report
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportPath = path.join(outputDir, `css-performance-report-${timestamp}.md`);
    fs.writeFileSync(reportPath, report);
    
    console.log(`CSS performance analysis completed. Report saved to ${reportPath}`);
  } catch (error) {
    console.error('Error analyzing CSS performance:', error);
    process.exit(1);
  }
}

function analyzeStaticCss() {
  const results = {};
  
  cssFiles.forEach(file => {
    try {
      const filePath = path.join(process.cwd(), file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic analysis
      const rules = content.match(/{[^}]*}/g) || [];
      const selectors = content.match(/[^{]+{/g) || [];
      const colorProperties = (content.match(/(?:color|background|border|box-shadow):[^;]+;/g) || []).length;
      const cssVariables = (content.match(/var\(--[^)]+\)/g) || []).length;
      const mediaQueries = (content.match(/@media[^{]+{/g) || []).length;
      
      console.log(`  Analyzed ${file}: ${rules.length} rules, ${selectors.length} selectors`);
      
      results[file] = {
        rules: rules.length,
        selectors: selectors.length,
        colorProperties,
        cssVariables,
        mediaQueries,
        fileSize: content.length
      };
    } catch (error) {
      console.error(`  Error analyzing ${file}:`, error.message);
      results[file] = { error: error.message };
    }
  });
  
  return results;
}

async function analyzeDynamicCss() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const results = {};
  
  for (const url of urls) {
    console.log(`  Analyzing ${url}...`);
    const page = await browser.newPage();
    
    try {
      // Start CSS coverage
      await page.coverage.startCSSCoverage();
      
      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Get CSS coverage
      const coverage = await page.coverage.stopCSSCoverage();
      
      // Analyze coverage
      let totalBytes = 0;
      let usedBytes = 0;
      
      coverage.forEach(entry => {
        totalBytes += entry.text.length;
        usedBytes += entry.ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
      });
      
      // Get CSS variables usage
      const cssVarsUsage = await page.evaluate(() => {
        const computedStyles = window.getComputedStyle(document.documentElement);
        const cssVars = {};
        
        // Check for color-related CSS variables
        for (const prop of computedStyles) {
          if (prop.startsWith('--color-')) {
            cssVars[prop] = computedStyles.getPropertyValue(prop);
          }
        }
        
        // Count elements using CSS variables
        const allElements = document.querySelectorAll('*');
        let elementsUsingVars = 0;
        
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          for (const prop of ['color', 'background-color', 'border-color', 'box-shadow']) {
            const value = style.getPropertyValue(prop);
            if (value.includes('var(--')) {
              elementsUsingVars++;
              break;
            }
          }
        });
        
        return {
          cssVarsCount: Object.keys(cssVars).length,
          elementsUsingVars,
          totalElements: allElements.length
        };
      });
      
      results[url] = {
        totalBytes,
        usedBytes,
        unusedBytes: totalBytes - usedBytes,
        usagePercentage: (usedBytes / totalBytes) * 100,
        cssVarsUsage
      };
    } catch (error) {
      console.error(`  Error analyzing ${url}:`, error.message);
      results[url] = { error: error.message };
    } finally {
      await page.close();
    }
  }
  
  await browser.close();
  return results;
}

function generateReport(staticAnalysis, dynamicAnalysis) {
  let report = '# CSS Performance Analysis Report\n\n';
  report += `Date: ${new Date().toLocaleString()}\n\n`;
  
  // Static analysis section
  report += '## Static CSS Analysis\n\n';
  report += '| File | Rules | Selectors | Color Properties | CSS Variables | Media Queries | File Size |\n';
  report += '|------|-------|-----------|-----------------|--------------|--------------|----------|\n';
  
  let totalRules = 0;
  let totalSelectors = 0;
  let totalColorProps = 0;
  let totalCssVars = 0;
  let totalFileSize = 0;
  
  for (const file in staticAnalysis) {
    const analysis = staticAnalysis[file];
    
    if (analysis.error) {
      report += `| ${file} | Error: ${analysis.error} | - | - | - | - | - |\n`;
      continue;
    }
    
    report += `| ${file} | ${analysis.rules} | ${analysis.selectors} | ${analysis.colorProperties} | ${analysis.cssVariables} | ${analysis.mediaQueries} | ${formatBytes(analysis.fileSize)} |\n`;
    
    totalRules += analysis.rules;
    totalSelectors += analysis.selectors;
    totalColorProps += analysis.colorProperties;
    totalCssVars += analysis.cssVariables;
    totalFileSize += analysis.fileSize;
  }
  
  report += `| **Total** | **${totalRules}** | **${totalSelectors}** | **${totalColorProps}** | **${totalCssVars}** | - | **${formatBytes(totalFileSize)}** |\n\n`;
  
  // Dynamic analysis section
  report += '## Dynamic CSS Usage Analysis\n\n';
  
  for (const url in dynamicAnalysis) {
    const analysis = dynamicAnalysis[url];
    const pageName = url.split('/').pop();
    
    report += `### ${pageName}\n\n`;
    
    if (analysis.error) {
      report += `⚠️ **Error:** ${analysis.error}\n\n`;
      continue;
    }
    
    report += '#### CSS Coverage\n\n';
    report += `- Total CSS: ${formatBytes(analysis.totalBytes)}\n`;
    report += `- Used CSS: ${formatBytes(analysis.usedBytes)} (${analysis.usagePercentage.toFixed(2)}%)\n`;
    report += `- Unused CSS: ${formatBytes(analysis.unusedBytes)} (${(100 - analysis.usagePercentage).toFixed(2)}%)\n\n`;
    
    report += '#### CSS Variables Usage\n\n';
    report += `- CSS Color Variables: ${analysis.cssVarsUsage.cssVarsCount}\n`;
    report += `- Elements Using Variables: ${analysis.cssVarsUsage.elementsUsingVars} of ${analysis.cssVarsUsage.totalElements} (${((analysis.cssVarsUsage.elementsUsingVars / analysis.cssVarsUsage.totalElements) * 100).toFixed(2)}%)\n\n`;
  }
  
  // Recommendations
  report += '## Recommendations\n\n';
  
  const avgUsage = Object.values(dynamicAnalysis)
    .filter(a => !a.error)
    .reduce((sum, a) => sum + a.usagePercentage, 0) / 
    Object.values(dynamicAnalysis).filter(a => !a.error).length;
  
  if (avgUsage < 50) {
    report += '⚠️ **High amount of unused CSS detected.** Consider implementing CSS code splitting or removing unused styles.\n\n';
  } else if (avgUsage < 70) {
    report += '⚠️ **Moderate amount of unused CSS detected.** Consider reviewing and optimizing CSS usage.\n\n';
  } else {
    report += '✅ **Good CSS usage efficiency.** Most of the CSS is being utilized.\n\n';
  }
  
  if (totalCssVars > 50) {
    report += '⚠️ **High number of CSS variables.** While variables improve maintainability, too many can impact performance. Consider consolidating similar variables.\n\n';
  } else {
    report += '✅ **Reasonable number of CSS variables.** The current implementation balances maintainability and performance.\n\n';
  }
  
  if (totalFileSize > 50000) {
    report += '⚠️ **CSS files are quite large.** Consider minification and removing unused styles.\n\n';
  } else {
    report += '✅ **CSS file size is reasonable.** The color palette implementation is efficient in terms of file size.\n\n';
  }
  
  return report;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run analysis
analyzeCssPerformance(); 