/**
 * Run All Tests Script
 * 
 * This script runs all the testing scripts sequentially and generates a summary report.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Output directory for the summary report
const outputDir = path.join(__dirname, 'test-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Tests to run
const tests = [
  { name: 'Accessibility (Color Palette)', command: 'npm', args: ['run', 'test:a11y'] },
  { name: 'Accessibility (Components)', command: 'npm', args: ['run', 'test:a11y:components'] },
  { name: 'Performance', command: 'npm', args: ['run', 'test:performance'] },
  { name: 'Accessibility Audit', command: 'npm', args: ['run', 'test:a11y:audit'] },
  { name: 'Cross-Browser Testing', command: 'npm', args: ['run', 'test:integration'] },
  { name: 'CSS Performance Analysis', command: 'npm', args: ['run', 'test:css-performance'] },
  { name: 'Color Consistency Check', command: 'npm', args: ['run', 'test:consistency'] }
];

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: tests.length,
    passed: 0,
    failed: 0,
    duration: 0
  }
};

// Run tests sequentially
async function runTests() {
  console.log('Starting all tests...');
  console.log('======================\n');
  
  const startTime = Date.now();
  
  for (const test of tests) {
    const testResult = await runTest(test);
    results.tests.push(testResult);
    
    if (testResult.status === 'passed') {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    
    console.log(`\n${test.name}: ${testResult.status.toUpperCase()}\n`);
    console.log('----------------------\n');
  }
  
  results.summary.duration = (Date.now() - startTime) / 1000;
  
  // Generate report
  generateReport();
  
  console.log(`\nAll tests completed in ${results.summary.duration.toFixed(2)} seconds.`);
  console.log(`Passed: ${results.summary.passed}, Failed: ${results.summary.failed}`);
  console.log(`Summary report saved to ${path.join(outputDir, 'summary-report.md')}`);
}

// Run a single test
function runTest(test) {
  return new Promise((resolve) => {
    console.log(`Running ${test.name}...`);
    
    const startTime = Date.now();
    const testProcess = spawn(test.command, test.args, { stdio: 'inherit' });
    
    testProcess.on('close', (code) => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      resolve({
        name: test.name,
        command: `${test.command} ${test.args.join(' ')}`,
        status: code === 0 ? 'passed' : 'failed',
        exitCode: code,
        duration
      });
    });
  });
}

// Generate summary report
function generateReport() {
  let report = '# Test Summary Report\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Overall summary
  report += '## Summary\n\n';
  report += `- **Total Tests:** ${results.summary.total}\n`;
  report += `- **Passed:** ${results.summary.passed}\n`;
  report += `- **Failed:** ${results.summary.failed}\n`;
  report += `- **Total Duration:** ${results.summary.duration.toFixed(2)} seconds\n\n`;
  
  // Test details
  report += '## Test Details\n\n';
  report += '| Test | Status | Duration (s) | Command |\n';
  report += '|------|--------|--------------|--------|\n';
  
  for (const test of results.tests) {
    const statusEmoji = test.status === 'passed' ? '✅' : '❌';
    report += `| ${test.name} | ${statusEmoji} ${test.status} | ${test.duration.toFixed(2)} | \`${test.command}\` |\n`;
  }
  
  // Recommendations
  report += '\n## Recommendations\n\n';
  
  if (results.summary.failed > 0) {
    report += '### Issues to Address\n\n';
    
    const failedTests = results.tests.filter(test => test.status === 'failed');
    for (const test of failedTests) {
      report += `- Fix issues in the ${test.name} test\n`;
    }
    
    report += '\nReview the individual test reports for detailed information about the failures.\n';
  } else {
    report += '✅ All tests passed! Continue to monitor and maintain the codebase.\n';
  }
  
  // Next steps
  report += '\n## Next Steps\n\n';
  report += '1. Review detailed reports in the respective test directories\n';
  report += '2. Address any failed tests\n';
  report += '3. Implement recommendations from individual test reports\n';
  report += '4. Schedule regular testing to maintain quality\n';
  
  // Save report
  const reportPath = path.join(outputDir, `summary-report-${new Date().toISOString().replace(/:/g, '-')}.md`);
  fs.writeFileSync(reportPath, report);
  
  // Also save as the default summary report
  fs.writeFileSync(path.join(outputDir, 'summary-report.md'), report);
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
}); 