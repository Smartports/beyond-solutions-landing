/**
 * Translation Validation Script
 * Checks all translation files for consistency and missing keys
 * Usage: node update-translations.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const I18N_DIR = path.join(__dirname, '..', 'i18n');
const REFERENCE_LANG = 'en.json'; // The language file to use as reference
const DEBUG = true;

// Utility functions
function log(message) {
  if (DEBUG) console.log(message);
}

function error(message) {
  console.error(`❌ ERROR: ${message}`);
}

function warning(message) {
  console.warn(`⚠️ WARNING: ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

// Read all translation files
function readTranslations() {
  const files = fs.readdirSync(I18N_DIR)
    .filter(file => file.endsWith('.json') && !['config.json', 'languages.json'].includes(file))
    .map(file => path.join(I18N_DIR, file));
  
  const translations = {};
  
  files.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      const langCode = fileName.replace('.json', '');
      
      try {
        const parsed = JSON.parse(content);
        translations[langCode] = parsed;
        log(`Loaded ${fileName} (${Object.keys(parsed).length} root keys)`);
      } catch (parseError) {
        error(`Invalid JSON in ${fileName}: ${parseError.message}`);
      }
    } catch (readError) {
      error(`Failed to read ${filePath}: ${readError.message}`);
    }
  });
  
  return translations;
}

// Get all translation keys from an object recursively
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys = [...keys, ...getAllKeys(value, newKey)];
    } else {
      keys.push(newKey);
    }
  }
  
  return keys;
}

// Check if a key exists in an object using dot notation
function hasKey(obj, path) {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return false;
    }
    current = current[part];
  }
  
  return current !== undefined;
}

// Set a value at a path in an object using dot notation
function setValueAtPath(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  
  // Navigate to the right location, creating objects as needed
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }
  
  // Set the value at the final property
  current[parts[parts.length - 1]] = value;
}

// Get a value at a path in an object using dot notation
function getValueAtPath(obj, path) {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

// Find missing keys in target compared to reference
function findMissingKeys(referenceKeys, target) {
  return referenceKeys.filter(key => !hasKey(target, key));
}

// Analyze translations for consistency
function analyzeTranslations(translations) {
  const reference = translations[REFERENCE_LANG.replace('.json', '')];
  if (!reference) {
    error(`Reference language file ${REFERENCE_LANG} not found!`);
    return;
  }
  
  const referenceKeys = getAllKeys(reference);
  log(`Reference language (${REFERENCE_LANG}) has ${referenceKeys.length} unique keys`);
  
  const results = {
    complete: [],
    incomplete: [],
    statistics: {},
    missingKeys: {}
  };
  
  // Check each language file against the reference
  for (const [langCode, langData] of Object.entries(translations)) {
    if (langCode === REFERENCE_LANG.replace('.json', '')) continue;
    
    const missingKeys = findMissingKeys(referenceKeys, langData);
    
    const stats = {
      total: referenceKeys.length,
      present: referenceKeys.length - missingKeys.length,
      missing: missingKeys.length,
      completeness: ((referenceKeys.length - missingKeys.length) / referenceKeys.length) * 100
    };
    
    results.statistics[langCode] = stats;
    
    if (missingKeys.length > 0) {
      results.incomplete.push(langCode);
      results.missingKeys[langCode] = missingKeys;
    } else {
      results.complete.push(langCode);
    }
  }
  
  return results;
}

// Fix missing translations by adding missing keys from reference language
function fixMissingTranslations(translations, results) {
  const reference = translations[REFERENCE_LANG.replace('.json', '')];
  const fixedFiles = [];
  
  for (const langCode of results.incomplete) {
    const missingKeys = results.missingKeys[langCode];
    let needsSave = false;
    
    console.log(`Processing ${langCode} with ${missingKeys.length} missing keys...`);
    
    // Add each missing key with a placeholder value
    missingKeys.forEach(key => {
      const referenceValue = getValueAtPath(reference, key);
      
      // Only add text values, not objects or arrays
      if (typeof referenceValue === 'string') {
        // For placeholders, copy directly without translation brackets
        if (isPlaceholderKey(key)) {
          console.log(`  Adding placeholder key ${key} with value "${referenceValue}"`);
          setValueAtPath(translations[langCode], key, referenceValue);
        } else {
          console.log(`  Adding key ${key} with value "[${referenceValue}]"`);
          setValueAtPath(translations[langCode], key, `[${referenceValue}]`);
        }
        needsSave = true;
      } else if (Array.isArray(referenceValue)) {
        console.log(`  Adding array key ${key}`);
        setValueAtPath(translations[langCode], key, [...referenceValue]);
        needsSave = true;
      } else if (referenceValue !== null && typeof referenceValue === 'object') {
        console.log(`  Adding object key ${key}`);
        setValueAtPath(translations[langCode], key, {...referenceValue});
        needsSave = true;
      }
    });
    
    if (needsSave) {
      try {
        const filePath = path.join(I18N_DIR, `${langCode}.json`);
        console.log(`Writing updated translations to ${filePath}`);
        fs.writeFileSync(
          filePath, 
          JSON.stringify(translations[langCode], null, 2),
          'utf8'
        );
        fixedFiles.push(langCode);
        console.log(`✅ Updated ${langCode}.json successfully`);
      } catch (err) {
        warning(`Failed to save updated translations for ${langCode}: ${err.message}`);
      }
    } else {
      console.log(`No changes needed for ${langCode}`);
    }
  }
  
  return fixedFiles;
}

// Add missing placeholder keys directly to the en.json reference file
function addMissingPlaceholders() {
  console.log('Adding missing placeholder keys to reference file...');
  
  const refPath = path.join(I18N_DIR, REFERENCE_LANG);
  let enContent;
  
  try {
    enContent = JSON.parse(fs.readFileSync(refPath, 'utf8'));
  } catch (error) {
    console.error(`Failed to read reference file: ${error.message}`);
    return false;
  }
  
  // Add the missing keys to the English reference file
  const missingPlaceholders = {
    'step1.scope.select': 'Select an option',
    'step1.entity.select': 'Select an option',
    'step2.budget.placeholder': '$10,000,000',
    'step2.address.placeholder': 'E.g.: J Rousseu 3, Anzures, CDMX',
    'step2.type.select': 'Select a type',
    'step2.status.select': 'Select a status',
    'step2.surface.placeholder': '800',
    'step2.usableSurface.placeholder': '480',
    'step2.use.placeholder': 'H30/20/Z',
    'step2.characteristics.placeholder': 'Protected, Not Applicable...'
  };
  
  let hasChanges = false;
  
  // Add each placeholder to the calculator section
  for (const [key, value] of Object.entries(missingPlaceholders)) {
    const fullKey = `calculator.${key}`;
    if (!hasKey(enContent, fullKey)) {
      setValueAtPath(enContent, fullKey, value);
      hasChanges = true;
      console.log(`Added key: ${fullKey}`);
    }
  }
  
  if (hasChanges) {
    try {
      fs.writeFileSync(refPath, JSON.stringify(enContent, null, 2), 'utf8');
      console.log('✅ Updated reference file with missing placeholders');
      return true;
    } catch (error) {
      console.error(`Failed to write reference file: ${error.message}`);
      return false;
    }
  } else {
    console.log('No new placeholders needed in reference file');
    return false;
  }
}

// Check if a key is a placeholder key
function isPlaceholderKey(key) {
  const placeholderKeys = [
    'calculator.step1.scope.select',
    'calculator.step1.entity.select',
    'calculator.step2.budget.placeholder',
    'calculator.step2.address.placeholder',
    'calculator.step2.type.select',
    'calculator.step2.status.select',
    'calculator.step2.surface.placeholder',
    'calculator.step2.usableSurface.placeholder',
    'calculator.step2.use.placeholder',
    'calculator.step2.characteristics.placeholder'
  ];
  
  return placeholderKeys.includes(key);
}

// Main function
function main() {
  console.log('Translation Validation Script');
  console.log('============================');
  
  // First ensure reference file has all needed keys
  const placeholdersUpdated = addMissingPlaceholders();
  
  if (placeholdersUpdated) {
    console.log('Reference file was updated with placeholders. Reloading translations...');
  }
  
  const translations = readTranslations();
  const languages = Object.keys(translations);
  
  if (languages.length === 0) {
    error('No translation files found!');
    return;
  }
  
  console.log(`Found ${languages.length} language files: ${languages.join(', ')}`);
  
  const results = analyzeTranslations(translations);
  
  // Display results
  console.log('\nAnalysis Results:');
  console.log('----------------');
  
  if (results.complete && results.complete.length > 0) {
    success(`Complete translations (${results.complete.length}): ${results.complete.join(', ')}`);
  }
  
  if (results.incomplete && results.incomplete.length > 0) {
    warning(`Incomplete translations (${results.incomplete.length}): ${results.incomplete.join(', ')}`);
    
    // Show statistics for incomplete translations
    console.log('\nCompletion Statistics:');
    console.log('---------------------');
    
    for (const langCode of results.incomplete) {
      const stats = results.statistics[langCode];
      console.log(`${langCode}: ${stats.present}/${stats.total} keys (${stats.completeness.toFixed(1)}% complete)`);
      
      // If there are a reasonable number of missing keys, show them
      if (stats.missing < 20) {
        console.log(`  Missing keys: ${results.missingKeys[langCode].join(', ')}`);
      } else {
        console.log(`  Missing ${stats.missing} keys (too many to display)`);
      }
    }
    
    // Ask if we should fix missing translations
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nDo you want to add missing keys to incomplete translations? (y/N) ', (answer) => {
      readline.close();
      
      if (answer.toLowerCase() === 'y') {
        console.log('\nUpdating translation files with missing keys...');
        const fixedFiles = fixMissingTranslations(translations, results);
        
        if (fixedFiles.length > 0) {
          success(`\nFixed translations for: ${fixedFiles.join(', ')}`);
        } else {
          console.log('\nNo files were updated. This might be because:');
          console.log('1. The missing keys are not leaf nodes (they are parent objects)');
          console.log('2. There was an error writing to the files (check permissions)');
          console.log('3. The translation files are already up to date');
        }
      } else {
        console.log('\nNo files were modified.');
      }
    });
  } else {
    success('All translation files are complete!');
  }
}

// Run the script
main(); 