/**
 * Color Palette Consistency Check
 *
 * This script analyzes all HTML, CSS, and JS files to ensure consistent use of the color palette.
 * It identifies:
 * - Hardcoded color values that should use CSS variables
 * - Inconsistent color values
 * - Missing color variables
 * - Deprecated color usages
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

// Define the expected color palette
const colorPalette = {
  'primary-900': '#192525',
  'primary-800': '#243b44',
  'primary-700': '#334b4e',
  'primary-600': '#54676d',
  'primary-500': '#68767c',
  'primary-400': '#8c979c',
  'primary-300': '#adb3b7',
  'primary-200': '#bac4c3',
  'primary-100': '#cccfcf',
};

// File patterns to check
const filePatterns = {
  html: /\.(html|htm)$/i,
  css: /\.(css|scss|less)$/i,
  js: /\.(js|jsx|ts|tsx)$/i,
};

// Directories to exclude
const excludeDirs = ['node_modules', '.git', 'test', 'dist', 'build'];

// Output file path
const outputDir = path.join(__dirname, '../consistency-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Results storage
const results = {
  hardcodedColors: [],
  inconsistentColors: [],
  missingVariables: [],
  deprecatedColors: [],
  fileStats: {
    totalFiles: 0,
    filesWithIssues: 0,
    issuesByFileType: {
      html: 0,
      css: 0,
      js: 0,
    },
  },
};

console.log('Color palette consistency check script initialized');
console.log('This script will analyze all HTML, CSS, and JS files for consistent color usage');
console.log('Output will be saved to:', outputDir);

// Regex patterns for finding colors
const colorPatterns = {
  hex6: /#([0-9a-f]{6})\b/gi,
  hex3: /#([0-9a-f]{3})\b/gi,
  rgb: /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi,
  rgba: /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/gi,
  cssVar: /var\(\s*--color-([a-z0-9-]+)\s*\)/gi,
  cssVarDef: /--color-([a-z0-9-]+)\s*:\s*([^;]+);/gi,
};

// Normalize color to hex format
function normalizeColor(color) {
  // Remove whitespace
  color = color.trim().toLowerCase();

  // Handle hex shorthand (#abc -> #aabbcc)
  if (/^#[0-9a-f]{3}$/.test(color)) {
    return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  // Handle rgb format
  const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  return color;
}

// Check if a color is in our palette
function isInPalette(color) {
  const normalizedColor = normalizeColor(color);
  return Object.values(colorPalette).some(
    (paletteColor) => normalizeColor(paletteColor) === normalizedColor,
  );
}

// Get the variable name for a color if it exists in the palette
function getVariableNameForColor(color) {
  const normalizedColor = normalizeColor(color);
  for (const [name, value] of Object.entries(colorPalette)) {
    if (normalizeColor(value) === normalizedColor) {
      return `--color-${name}`;
    }
  }
  return null;
}

// Find all files recursively
async function findFiles(dir) {
  const files = [];

  async function scan(directory) {
    const entries = await readdir(directory);

    for (const entry of entries) {
      // Skip excluded directories
      if (excludeDirs.some((exclude) => entry === exclude)) {
        continue;
      }

      const fullPath = path.join(directory, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await scan(fullPath);
      } else if (stats.isFile()) {
        // Check if file matches any of our patterns
        if (
          filePatterns.html.test(entry) ||
          filePatterns.css.test(entry) ||
          filePatterns.js.test(entry)
        ) {
          files.push(fullPath);
        }
      }
    }
  }

  await scan(dir);
  return files;
}

// Analyze a file for color consistency
async function analyzeFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const relPath = path.relative(process.cwd(), filePath);
  const fileType = getFileType(filePath);
  const issues = [];

  // Find hardcoded colors
  const hexMatches = [...content.matchAll(colorPatterns.hex6)];
  const hex3Matches = [...content.matchAll(colorPatterns.hex3)];
  const rgbMatches = [...content.matchAll(colorPatterns.rgb)];
  const rgbaMatches = [...content.matchAll(colorPatterns.rgba)];

  // Check hex colors
  for (const match of hexMatches) {
    const color = match[0];
    const lineInfo = getLineInfo(content, match.index);

    if (isInPalette(color)) {
      const variableName = getVariableNameForColor(color);
      issues.push({
        type: 'hardcodedColor',
        color,
        suggestion: `var(${variableName})`,
        line: lineInfo.line,
        column: lineInfo.column,
        context: lineInfo.context,
      });

      results.hardcodedColors.push({
        file: relPath,
        color,
        suggestion: `var(${variableName})`,
        line: lineInfo.line,
        context: lineInfo.context,
      });
    }
  }

  // Check hex3 colors
  for (const match of hex3Matches) {
    const color = match[0];
    const expandedColor = normalizeColor(color);
    const lineInfo = getLineInfo(content, match.index);

    if (isInPalette(expandedColor)) {
      const variableName = getVariableNameForColor(expandedColor);
      issues.push({
        type: 'hardcodedColor',
        color,
        suggestion: `var(${variableName})`,
        line: lineInfo.line,
        column: lineInfo.column,
        context: lineInfo.context,
      });

      results.hardcodedColors.push({
        file: relPath,
        color,
        suggestion: `var(${variableName})`,
        line: lineInfo.line,
        context: lineInfo.context,
      });
    }
  }

  // Check rgb colors
  for (const match of rgbMatches) {
    const color = match[0];
    const normalizedColor = normalizeColor(color);
    const lineInfo = getLineInfo(content, match.index);

    if (isInPalette(normalizedColor)) {
      const variableName = getVariableNameForColor(normalizedColor);
      issues.push({
        type: 'hardcodedColor',
        color,
        suggestion: `var(${variableName})`,
        line: lineInfo.line,
        column: lineInfo.column,
        context: lineInfo.context,
      });

      results.hardcodedColors.push({
        file: relPath,
        color,
        suggestion: `var(${variableName})`,
        line: lineInfo.line,
        context: lineInfo.context,
      });
    }
  }

  // Check for CSS variable usage
  const cssVarMatches = [...content.matchAll(colorPatterns.cssVar)];
  for (const match of cssVarMatches) {
    const varName = match[1];
    const lineInfo = getLineInfo(content, match.index);

    // Check if the variable is in our palette
    if (!Object.keys(colorPalette).includes(varName)) {
      issues.push({
        type: 'missingVariable',
        variable: `--color-${varName}`,
        line: lineInfo.line,
        column: lineInfo.column,
        context: lineInfo.context,
      });

      results.missingVariables.push({
        file: relPath,
        variable: `--color-${varName}`,
        line: lineInfo.line,
        context: lineInfo.context,
      });
    }
  }

  // Check for deprecated color names (old color system)
  const deprecatedColorPatterns = [
    /primary-color/g,
    /secondary-color/g,
    /accent-color/g,
    /\bblue-\d+\b/g,
    /\bgreen-\d+\b/g,
    /\bgray-\d+\b/g,
    /\bgrey-\d+\b/g,
  ];

  for (const pattern of deprecatedColorPatterns) {
    const matches = [...content.matchAll(pattern)];
    for (const match of matches) {
      const deprecatedColor = match[0];
      const lineInfo = getLineInfo(content, match.index);

      issues.push({
        type: 'deprecatedColor',
        color: deprecatedColor,
        line: lineInfo.line,
        column: lineInfo.column,
        context: lineInfo.context,
      });

      results.deprecatedColors.push({
        file: relPath,
        color: deprecatedColor,
        line: lineInfo.line,
        context: lineInfo.context,
      });
    }
  }

  // Check for inconsistent color definitions in CSS files
  if (filePatterns.css.test(filePath)) {
    const cssVarDefMatches = [...content.matchAll(colorPatterns.cssVarDef)];
    for (const match of cssVarDefMatches) {
      const varName = match[1];
      const value = match[2].trim();
      const lineInfo = getLineInfo(content, match.index);

      // Check if this is a color palette variable
      if (Object.keys(colorPalette).includes(varName)) {
        const expectedValue = colorPalette[varName];
        if (normalizeColor(value) !== normalizeColor(expectedValue)) {
          issues.push({
            type: 'inconsistentColor',
            variable: `--color-${varName}`,
            value,
            expectedValue,
            line: lineInfo.line,
            column: lineInfo.column,
            context: lineInfo.context,
          });

          results.inconsistentColors.push({
            file: relPath,
            variable: `--color-${varName}`,
            value,
            expectedValue,
            line: lineInfo.line,
            context: lineInfo.context,
          });
        }
      }
    }
  }

  // Update file stats
  if (issues.length > 0) {
    results.fileStats.filesWithIssues++;
    results.fileStats.issuesByFileType[fileType]++;
  }

  return issues;
}

// Get line and column information for a position in text
function getLineInfo(text, position) {
  const lines = text.substring(0, position).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;

  // Get context (the line containing the match)
  const allLines = text.split('\n');
  const contextLine = allLines[line - 1];

  return {
    line,
    column,
    context: contextLine.trim(),
  };
}

// Determine file type based on extension
function getFileType(filePath) {
  if (filePatterns.html.test(filePath)) return 'html';
  if (filePatterns.css.test(filePath)) return 'css';
  if (filePatterns.js.test(filePath)) return 'js';
  return 'unknown';
}

// Generate markdown report
function generateReport() {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  let report = '# Color Palette Consistency Report\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  // Summary
  report += '## Summary\n\n';
  report += `- Total files analyzed: ${results.fileStats.totalFiles}\n`;
  report += `- Files with issues: ${results.fileStats.filesWithIssues}\n`;
  report += `- HTML files with issues: ${results.fileStats.issuesByFileType.html}\n`;
  report += `- CSS files with issues: ${results.fileStats.issuesByFileType.css}\n`;
  report += `- JS files with issues: ${results.fileStats.issuesByFileType.js}\n\n`;

  report += `- Hardcoded colors: ${results.hardcodedColors.length}\n`;
  report += `- Inconsistent color definitions: ${results.inconsistentColors.length}\n`;
  report += `- Missing variables: ${results.missingVariables.length}\n`;
  report += `- Deprecated color usages: ${results.deprecatedColors.length}\n\n`;

  // Color palette reference
  report += '## Color Palette Reference\n\n';
  report += '| Variable | Hex Value |\n';
  report += '|----------|----------|\n';

  for (const [name, value] of Object.entries(colorPalette)) {
    report += `| --color-${name} | ${value} |\n`;
  }

  // Hardcoded colors
  if (results.hardcodedColors.length > 0) {
    report += '\n## Hardcoded Colors\n\n';
    report +=
      'These are colors from our palette that are hardcoded instead of using CSS variables.\n\n';
    report += '| File | Line | Color | Suggested Variable | Context |\n';
    report += '|------|------|-------|-------------------|--------|\n';

    for (const issue of results.hardcodedColors) {
      report += `| ${issue.file} | ${issue.line} | \`${issue.color}\` | \`${issue.suggestion}\` | \`${issue.context}\` |\n`;
    }
  }

  // Inconsistent colors
  if (results.inconsistentColors.length > 0) {
    report += '\n## Inconsistent Color Definitions\n\n';
    report += 'These are color variables with values that do not match the expected palette.\n\n';
    report += '| File | Line | Variable | Current Value | Expected Value | Context |\n';
    report += '|------|------|----------|--------------|----------------|--------|\n';

    for (const issue of results.inconsistentColors) {
      report += `| ${issue.file} | ${issue.line} | \`${issue.variable}\` | \`${issue.value}\` | \`${issue.expectedValue}\` | \`${issue.context}\` |\n`;
    }
  }

  // Missing variables
  if (results.missingVariables.length > 0) {
    report += '\n## Missing Variables\n\n';
    report += 'These are CSS variable references that are not defined in the color palette.\n\n';
    report += '| File | Line | Variable | Context |\n';
    report += '|------|------|----------|--------|\n';

    for (const issue of results.missingVariables) {
      report += `| ${issue.file} | ${issue.line} | \`${issue.variable}\` | \`${issue.context}\` |\n`;
    }
  }

  // Deprecated colors
  if (results.deprecatedColors.length > 0) {
    report += '\n## Deprecated Color Usage\n\n';
    report += 'These are references to the old color system that should be updated.\n\n';
    report += '| File | Line | Deprecated Color | Context |\n';
    report += '|------|------|-----------------|--------|\n';

    for (const issue of results.deprecatedColors) {
      report += `| ${issue.file} | ${issue.line} | \`${issue.color}\` | \`${issue.context}\` |\n`;
    }
  }

  // Recommendations
  report += '\n## Recommendations\n\n';

  if (results.hardcodedColors.length > 0) {
    report += '### Replace Hardcoded Colors\n\n';
    report +=
      'Replace all hardcoded color values with CSS variables to ensure consistency and easier updates in the future.\n\n';
    report += 'Example:\n\n';
    report += '```css\n';
    report += '/* Before */\n';
    report += 'color: #334b4e;\n\n';
    report += '/* After */\n';
    report += 'color: var(--color-primary-700);\n';
    report += '```\n\n';
  }

  if (results.inconsistentColors.length > 0) {
    report += '### Fix Inconsistent Color Definitions\n\n';
    report += 'Update all inconsistent color definitions to match the official color palette.\n\n';
    report += 'Example:\n\n';
    report += '```css\n';
    report += '/* Before */\n';
    report += ':root {\n';
    report += '  --color-primary-700: #324b4d;\n';
    report += '}\n\n';
    report += '/* After */\n';
    report += ':root {\n';
    report += '  --color-primary-700: #334b4e;\n';
    report += '}\n';
    report += '```\n\n';
  }

  if (results.missingVariables.length > 0) {
    report += '### Fix Missing Variables\n\n';
    report +=
      'Either define the missing variables or update the references to use variables from the official color palette.\n\n';
  }

  if (results.deprecatedColors.length > 0) {
    report += '### Update Deprecated Color References\n\n';
    report +=
      'Replace all references to the old color system with the new color palette variables.\n\n';
    report += 'Example:\n\n';
    report += '```css\n';
    report += '/* Before */\n';
    report += 'color: var(--primary-color);\n\n';
    report += '/* After */\n';
    report += 'color: var(--color-primary-700);\n';
    report += '```\n\n';
  }

  return report;
}

// Main function
async function main() {
  console.log('Starting color palette consistency check...');

  try {
    // Find all files
    const files = await findFiles(process.cwd());
    results.fileStats.totalFiles = files.length;

    console.log(`Found ${files.length} files to analyze.`);

    // Analyze each file
    for (const file of files) {
      console.log(`Analyzing ${path.relative(process.cwd(), file)}...`);
      await analyzeFile(file);
    }

    // Generate report
    const report = generateReport();
    const reportPath = path.join(
      outputDir,
      `color-consistency-report-${new Date().toISOString().replace(/:/g, '-')}.md`,
    );
    fs.writeFileSync(reportPath, report);

    console.log(`Analysis complete. Report saved to ${reportPath}`);

    // Output summary
    console.log('\nSummary:');
    console.log(
      `- Files with issues: ${results.fileStats.filesWithIssues}/${results.fileStats.totalFiles}`,
    );
    console.log(`- Hardcoded colors: ${results.hardcodedColors.length}`);
    console.log(`- Inconsistent color definitions: ${results.inconsistentColors.length}`);
    console.log(`- Missing variables: ${results.missingVariables.length}`);
    console.log(`- Deprecated color usages: ${results.deprecatedColors.length}`);
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

// Run the script
main().catch(console.error);
