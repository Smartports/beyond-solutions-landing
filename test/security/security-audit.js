/**
 * Security Audit Script
 * Performs security tests on the application
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const { exec } = require('child_process');
const execAsync = promisify(exec);

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8000';
const PAGES_TO_TEST = [
  { path: '/', name: 'Home Page' },
  { path: '/calculator-gamified.html', name: 'Calculator' },
  { path: '/wizard.html', name: 'Wizard' },
  { path: '/dashboard.html', name: 'Dashboard' },
];

// Security tests to run
const SECURITY_TESTS = [
  { name: 'Content Security Policy', test: testCSP },
  { name: 'XSS Vulnerabilities', test: testXSS },
  { name: 'Dependency Vulnerabilities', test: testDependencies },
  { name: 'Local Storage Security', test: testLocalStorage },
  { name: 'Input Validation', test: testInputValidation },
  { name: 'API Access Controls', test: testAPIAccess },
];

/**
 * Runs security audit
 */
async function runSecurityAudit() {
  console.log('Starting security audit...');
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportDir = path.join(process.cwd(), 'test', 'security-reports');

  if (!fs.existsSync(reportDir)) {
    await mkdir(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, `security-audit-${timestamp}.md`);

  let report = `# Security Audit Report\n\n`;
  report += `Date: ${new Date().toLocaleString()}\n\n`;

  const results = {
    pages: {},
    dependencies: null,
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // Test dependencies first
    console.log('Testing dependencies for vulnerabilities...');
    results.dependencies = await testDependencies();

    if (results.dependencies.status === 'passed') {
      results.summary.passed++;
    } else if (results.dependencies.status === 'warning') {
      results.summary.warnings++;
    } else {
      results.summary.failed++;
    }

    results.summary.total++;

    // Test each page
    for (const page of PAGES_TO_TEST) {
      console.log(`Testing ${page.name} at ${page.path}...`);
      results.pages[page.name] = { tests: {} };

      const browserPage = await browser.newPage();

      try {
        // Enable request interception for CSP testing
        await browserPage.setRequestInterception(true);

        browserPage.on('request', (request) => {
          request.continue();
        });

        browserPage.on('console', (msg) => {
          if (msg.type() === 'error') {
            console.log(`Console error on ${page.name}: ${msg.text()}`);
          }
        });

        await browserPage.goto(`${BASE_URL}${page.path}`, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });

        // Run security tests
        for (const test of SECURITY_TESTS) {
          // Skip dependency test as it's already run
          if (test.name === 'Dependency Vulnerabilities') {
            continue;
          }

          console.log(`  Running ${test.name} test...`);

          try {
            const testResult = await test.test(browserPage, page);
            results.pages[page.name].tests[test.name] = testResult;

            if (testResult.status === 'passed') {
              results.summary.passed++;
            } else if (testResult.status === 'warning') {
              results.summary.warnings++;
            } else {
              results.summary.failed++;
            }

            results.summary.total++;
          } catch (error) {
            console.error(`Error running ${test.name} test:`, error);
            results.pages[page.name].tests[test.name] = {
              status: 'failed',
              message: `Error: ${error.message}`,
              details: [],
            };

            results.summary.failed++;
            results.summary.total++;
          }
        }
      } catch (error) {
        console.error(`Error testing ${page.name}:`, error);
        results.pages[page.name].error = error.message;
      } finally {
        await browserPage.close();
      }
    }

    // Generate report
    report += `## Summary\n\n`;
    report += `- Total tests: ${results.summary.total}\n`;
    report += `- Passed: ${results.summary.passed}\n`;
    report += `- Failed: ${results.summary.failed}\n`;
    report += `- Warnings: ${results.summary.warnings}\n\n`;

    // Dependency vulnerabilities section
    report += `## Dependency Vulnerabilities\n\n`;
    report += `Status: ${formatStatus(results.dependencies.status)}\n\n`;
    report += `${results.dependencies.message}\n\n`;

    if (results.dependencies.details && results.dependencies.details.length > 0) {
      report += `### Details\n\n`;
      report += `| Package | Vulnerability | Severity | Recommended Version |\n`;
      report += `|---------|---------------|----------|---------------------|\n`;

      for (const detail of results.dependencies.details) {
        report += `| ${detail.package} | ${detail.vulnerability} | ${detail.severity} | ${detail.recommendedVersion} |\n`;
      }

      report += `\n`;
    }

    // Page-specific results
    report += `## Page-Specific Results\n\n`;

    for (const [pageName, pageData] of Object.entries(results.pages)) {
      report += `### ${pageName}\n\n`;

      if (pageData.error) {
        report += `⚠️ Error testing page: ${pageData.error}\n\n`;
        continue;
      }

      report += `| Test | Status | Message |\n`;
      report += `|------|--------|--------|\n`;

      for (const [testName, testResult] of Object.entries(pageData.tests)) {
        report += `| ${testName} | ${formatStatus(testResult.status)} | ${testResult.message} |\n`;
      }

      report += `\n`;

      // Add details for failed tests
      for (const [testName, testResult] of Object.entries(pageData.tests)) {
        if (testResult.status === 'failed' || testResult.status === 'warning') {
          if (testResult.details && testResult.details.length > 0) {
            report += `#### ${testName} Details\n\n`;

            for (const detail of testResult.details) {
              report += `- ${detail}\n`;
            }

            report += `\n`;
          }
        }
      }
    }

    // Recommendations
    report += `## Security Recommendations\n\n`;

    const recommendations = generateRecommendations(results);

    if (recommendations.critical.length > 0) {
      report += `### Critical Issues\n\n`;
      for (const rec of recommendations.critical) {
        report += `- 🔴 ${rec}\n`;
      }
      report += `\n`;
    }

    if (recommendations.important.length > 0) {
      report += `### Important Issues\n\n`;
      for (const rec of recommendations.important) {
        report += `- 🟠 ${rec}\n`;
      }
      report += `\n`;
    }

    if (recommendations.moderate.length > 0) {
      report += `### Moderate Issues\n\n`;
      for (const rec of recommendations.moderate) {
        report += `- 🟡 ${rec}\n`;
      }
      report += `\n`;
    }

    // Write report
    await writeFile(reportPath, report);
    console.log(`Security audit complete. Report saved to: ${reportPath}`);
  } catch (error) {
    console.error('Error during security audit:', error);
  } finally {
    await browser.close();
  }

  return { reportPath, results };
}

/**
 * Format status for display in report
 */
function formatStatus(status) {
  if (status === 'passed') {
    return '✅ Passed';
  } else if (status === 'warning') {
    return '⚠️ Warning';
  } else {
    return '❌ Failed';
  }
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(results) {
  const recommendations = {
    critical: [],
    important: [],
    moderate: [],
  };

  // Check for dependency vulnerabilities
  if (results.dependencies.status === 'failed') {
    recommendations.critical.push('Update vulnerable dependencies immediately.');
  } else if (results.dependencies.status === 'warning') {
    recommendations.important.push('Review and update dependencies with minor vulnerabilities.');
  }

  // Check for CSP issues
  for (const [pageName, pageData] of Object.entries(results.pages)) {
    if (
      pageData.tests['Content Security Policy'] &&
      pageData.tests['Content Security Policy'].status === 'failed'
    ) {
      recommendations.critical.push(`Implement proper Content Security Policy for ${pageName}.`);
    } else if (
      pageData.tests['Content Security Policy'] &&
      pageData.tests['Content Security Policy'].status === 'warning'
    ) {
      recommendations.important.push(`Strengthen Content Security Policy for ${pageName}.`);
    }

    // Check for XSS vulnerabilities
    if (
      pageData.tests['XSS Vulnerabilities'] &&
      pageData.tests['XSS Vulnerabilities'].status === 'failed'
    ) {
      recommendations.critical.push(`Fix XSS vulnerabilities in ${pageName}.`);
    }

    // Check for local storage security
    if (
      pageData.tests['Local Storage Security'] &&
      pageData.tests['Local Storage Security'].status === 'failed'
    ) {
      recommendations.important.push(`Improve local storage security in ${pageName}.`);
    }

    // Check for input validation
    if (
      pageData.tests['Input Validation'] &&
      pageData.tests['Input Validation'].status === 'failed'
    ) {
      recommendations.important.push(`Implement proper input validation in ${pageName}.`);
    }

    // Check for API access controls
    if (
      pageData.tests['API Access Controls'] &&
      pageData.tests['API Access Controls'].status === 'failed'
    ) {
      recommendations.critical.push(`Fix API access control issues in ${pageName}.`);
    } else if (
      pageData.tests['API Access Controls'] &&
      pageData.tests['API Access Controls'].status === 'warning'
    ) {
      recommendations.moderate.push(`Review API access controls in ${pageName}.`);
    }
  }

  return recommendations;
}

/**
 * Test Content Security Policy
 */
async function testCSP(page) {
  // Get CSP headers
  const response = await page.goto(page.url(), { waitUntil: 'networkidle2' });
  const headers = response.headers();

  const cspHeader = headers['content-security-policy'] || '';
  const cspROHeader = headers['content-security-policy-report-only'] || '';

  // Check if CSP is implemented
  if (!cspHeader && !cspROHeader) {
    return {
      status: 'failed',
      message: 'No Content Security Policy implemented',
      details: ['No CSP header found in response'],
    };
  }

  // Parse CSP directives
  const csp = cspHeader || cspROHeader;
  const directives = {};

  csp.split(';').forEach((directive) => {
    const [name, ...values] = directive.trim().split(/\s+/);
    if (name) {
      directives[name] = values;
    }
  });

  // Check for unsafe directives
  const unsafeDirectives = [];

  if (
    directives['script-src'] &&
    (directives['script-src'].includes("'unsafe-inline'") ||
      directives['script-src'].includes("'unsafe-eval'"))
  ) {
    unsafeDirectives.push("script-src contains 'unsafe-inline' or 'unsafe-eval'");
  }

  if (directives['default-src'] && directives['default-src'].includes('*')) {
    unsafeDirectives.push("default-src contains wildcard '*'");
  }

  // Check for missing critical directives
  const missingDirectives = [];

  if (!directives['script-src'] && !directives['default-src']) {
    missingDirectives.push('No script-src or default-src directive');
  }

  if (!directives['frame-ancestors']) {
    missingDirectives.push('No frame-ancestors directive (clickjacking protection)');
  }

  if (unsafeDirectives.length > 0 || missingDirectives.length > 0) {
    return {
      status: unsafeDirectives.length > 0 ? 'failed' : 'warning',
      message:
        unsafeDirectives.length > 0
          ? 'CSP contains unsafe directives'
          : 'CSP missing recommended directives',
      details: [...unsafeDirectives, ...missingDirectives],
    };
  }

  return {
    status: 'passed',
    message: 'Content Security Policy properly implemented',
    details: [],
  };
}

/**
 * Test for XSS vulnerabilities
 */
async function testXSS(page, pageConfig) {
  const xssPayloads = [
    '<script>alert(1)</script>',
    '"><script>alert(1)</script>',
    '<img src="x" onerror="alert(1)">',
    '"><img src="x" onerror="alert(1)">',
    'javascript:alert(1)',
  ];

  const vulnerabilities = [];

  // Find input fields
  const inputFields = await page.$$('input:not([type="hidden"]), textarea');

  if (inputFields.length === 0) {
    return {
      status: 'passed',
      message: 'No input fields found to test',
      details: [],
    };
  }

  // Test each input field with XSS payloads
  for (let i = 0; i < inputFields.length; i++) {
    const inputField = inputFields[i];

    const inputType = await page.evaluate((el) => el.type, inputField);
    const inputName = await page.evaluate((el) => el.name || el.id || `input-${i}`, inputField);

    // Skip certain input types
    if (['checkbox', 'radio', 'file', 'button', 'submit'].includes(inputType)) {
      continue;
    }

    for (const payload of xssPayloads) {
      // Clear previous input
      await inputField.click({ clickCount: 3 });
      await inputField.press('Backspace');

      // Type XSS payload
      await inputField.type(payload);

      // Try to submit the form or trigger event
      const form = await page.evaluate((el) => {
        const form = el.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
          return true;
        }
        el.dispatchEvent(new Event('change'));
        el.dispatchEvent(new Event('blur'));
        return false;
      }, inputField);

      if (form) {
        // Click submit button if exists
        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          await submitButton.click().catch(() => {});
        }
      }

      // Check if XSS payload was reflected unescaped
      const bodyHTML = await page.evaluate(() => document.body.innerHTML);

      if (bodyHTML.includes(payload)) {
        vulnerabilities.push(
          `Potential XSS in ${inputName}: payload "${payload}" was reflected unescaped`,
        );
      }

      // Check for alert dialogs
      page.on('dialog', async (dialog) => {
        vulnerabilities.push(`XSS confirmed in ${inputName}: alert dialog triggered`);
        await dialog.dismiss();
      });

      await page.waitForTimeout(500);
    }
  }

  if (vulnerabilities.length > 0) {
    return {
      status: 'failed',
      message: `${vulnerabilities.length} potential XSS vulnerabilities found`,
      details: vulnerabilities,
    };
  }

  return {
    status: 'passed',
    message: 'No XSS vulnerabilities detected',
    details: [],
  };
}

/**
 * Test for dependency vulnerabilities
 */
async function testDependencies() {
  try {
    // Run npm audit
    const { stdout } = await execAsync('npm audit --json');
    const auditResult = JSON.parse(stdout);

    if (auditResult.vulnerabilities) {
      const vulnerabilities = Object.values(auditResult.vulnerabilities);

      if (vulnerabilities.length === 0) {
        return {
          status: 'passed',
          message: 'No vulnerabilities found in dependencies',
          details: [],
        };
      }

      // Check for high or critical vulnerabilities
      const highOrCritical = vulnerabilities.filter(
        (v) => v.severity === 'high' || v.severity === 'critical',
      );

      if (highOrCritical.length > 0) {
        const details = highOrCritical.map((v) => ({
          package: v.name,
          vulnerability: v.title,
          severity: v.severity,
          recommendedVersion: v.recommendation || 'Update to latest',
        }));

        return {
          status: 'failed',
          message: `${highOrCritical.length} high or critical vulnerabilities found`,
          details,
        };
      }

      // Only low or moderate vulnerabilities
      const details = vulnerabilities.map((v) => ({
        package: v.name,
        vulnerability: v.title,
        severity: v.severity,
        recommendedVersion: v.recommendation || 'Update to latest',
      }));

      return {
        status: 'warning',
        message: `${vulnerabilities.length} low or moderate vulnerabilities found`,
        details,
      };
    }

    return {
      status: 'passed',
      message: 'No vulnerabilities found in dependencies',
      details: [],
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error running dependency check: ${error.message}`,
      details: [],
    };
  }
}

/**
 * Test local storage security
 */
async function testLocalStorage(page) {
  // Check what data is stored in local storage
  const localStorage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      data[key] = window.localStorage.getItem(key);
    }
    return data;
  });

  const sensitivePatterns = [
    /password/i,
    /token/i,
    /auth/i,
    /api[_-]?key/i,
    /secret/i,
    /credential/i,
    /social[_-]?security/i,
    /ssn/i,
    /credit[_-]?card/i,
    /card[_-]?number/i,
    /cvv/i,
  ];

  const sensitiveData = [];

  // Check for sensitive data in local storage
  for (const [key, value] of Object.entries(localStorage)) {
    for (const pattern of sensitivePatterns) {
      if (pattern.test(key)) {
        sensitiveData.push(`Sensitive data found in localStorage key: ${key}`);
        break;
      }
    }

    // Try to parse JSON values
    try {
      const parsedValue = JSON.parse(value);

      if (typeof parsedValue === 'object' && parsedValue !== null) {
        for (const [innerKey, innerValue] of Object.entries(parsedValue)) {
          for (const pattern of sensitivePatterns) {
            if (pattern.test(innerKey)) {
              sensitiveData.push(`Sensitive data found in localStorage JSON: ${key}.${innerKey}`);
              break;
            }
          }
        }
      }
    } catch (e) {
      // Not JSON, continue
    }
  }

  if (sensitiveData.length > 0) {
    return {
      status: 'failed',
      message: `${sensitiveData.length} instances of potentially sensitive data found in localStorage`,
      details: sensitiveData,
    };
  }

  return {
    status: 'passed',
    message: 'No sensitive data found in localStorage',
    details: [],
  };
}

/**
 * Test input validation
 */
async function testInputValidation(page, pageConfig) {
  // Find input fields
  const inputFields = await page.$$('input:not([type="hidden"]), textarea, select');

  if (inputFields.length === 0) {
    return {
      status: 'passed',
      message: 'No input fields found to test',
      details: [],
    };
  }

  const invalidInputs = [
    { type: 'text', value: 'a'.repeat(10000), name: 'Very long string' },
    { type: 'text', value: '<script>alert(1)</script>', name: 'Script tag' },
    { type: 'email', value: 'not-an-email', name: 'Invalid email' },
    { type: 'number', value: 'abc', name: 'Non-numeric for number input' },
    { type: 'url', value: 'not-a-url', name: 'Invalid URL' },
    { type: 'text', value: '../../etc/passwd', name: 'Path traversal' },
    { type: 'text', value: '"; DROP TABLE users; --', name: 'SQL injection' },
  ];

  const validationIssues = [];

  // Test each input field with invalid inputs
  for (let i = 0; i < inputFields.length; i++) {
    const inputField = inputFields[i];

    const inputType = await page.evaluate((el) => el.type || el.tagName.toLowerCase(), inputField);
    const inputName = await page.evaluate((el) => el.name || el.id || `input-${i}`, inputField);

    // Find appropriate invalid inputs for this field type
    const applicableInputs = invalidInputs.filter((input) => {
      if (input.type === 'email' && inputType !== 'email') return false;
      if (input.type === 'number' && inputType !== 'number') return false;
      if (input.type === 'url' && inputType !== 'url') return false;
      return true;
    });

    for (const input of applicableInputs) {
      // Skip if select element
      if (inputType === 'select') continue;

      // Clear previous input
      await inputField.click({ clickCount: 3 });
      await inputField.press('Backspace');

      // Type invalid input
      await inputField.type(input.value);

      // Try to submit the form
      const form = await page.evaluate((el) => {
        const form = el.closest('form');
        if (form) {
          const isValid = form.checkValidity();
          form.dispatchEvent(new Event('submit', { cancelable: true }));
          return { hasForm: true, isValid };
        }
        el.dispatchEvent(new Event('change'));
        el.dispatchEvent(new Event('blur'));
        return { hasForm: false, isValid: el.checkValidity() };
      }, inputField);

      if (form.hasForm) {
        // Click submit button if exists
        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          await submitButton.click().catch(() => {});
        }

        // Check if form was submitted despite invalid input
        const url = page.url();
        if (url.includes('?') || url.includes('#')) {
          if (!form.isValid) {
            validationIssues.push(
              `Form submitted with invalid input "${input.name}" in field "${inputName}"`,
            );
          }
        }
      } else {
        // For non-form inputs, check if there's client-side validation
        const hasError = await page.evaluate((el) => {
          return el.validity && !el.validity.valid;
        }, inputField);

        if (!hasError && !form.isValid) {
          validationIssues.push(
            `No validation error for invalid input "${input.name}" in field "${inputName}"`,
          );
        }
      }
    }
  }

  if (validationIssues.length > 0) {
    return {
      status: 'failed',
      message: `${validationIssues.length} input validation issues found`,
      details: validationIssues,
    };
  }

  return {
    status: 'passed',
    message: 'Input validation working correctly',
    details: [],
  };
}

/**
 * Test API access controls
 */
async function testAPIAccess(page) {
  // Collect API endpoints called by the page
  const apiCalls = [];

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/') || url.includes('graphql')) {
      apiCalls.push({
        url,
        method: request.method(),
        headers: request.headers(),
      });
    }
  });

  // Wait for any API calls to happen
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // If no API calls were detected, skip this test
  if (apiCalls.length === 0) {
    return {
      status: 'passed',
      message: 'No API calls detected to test',
      details: [],
    };
  }

  const accessIssues = [];

  // Check for authentication headers
  for (const call of apiCalls) {
    const hasAuth = call.headers.authorization || call.headers['x-api-key'] || call.headers.cookie;

    if (
      !hasAuth &&
      (call.method !== 'GET' || call.url.includes('user') || call.url.includes('admin'))
    ) {
      accessIssues.push(`API call to ${call.url} with method ${call.method} has no authentication`);
    }
  }

  // Try to access API endpoints directly without authentication
  for (const call of apiCalls) {
    try {
      const response = await fetch(call.url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 401 && response.status !== 403) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          accessIssues.push(`API endpoint ${call.url} accessible without authentication`);
        }
      }
    } catch (error) {
      // Network error or CORS, which is good
    }
  }

  if (accessIssues.length > 0) {
    return {
      status: 'failed',
      message: `${accessIssues.length} API access control issues found`,
      details: accessIssues,
    };
  }

  return {
    status: 'passed',
    message: 'API access controls implemented correctly',
    details: [],
  };
}

// Run the audit
if (require.main === module) {
  runSecurityAudit().catch(console.error);
}

module.exports = { runSecurityAudit };
