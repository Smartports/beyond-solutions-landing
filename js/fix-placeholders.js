/**
 * Script to manually add missing placeholder keys to all translation files
 * Usage: node fix-placeholders.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const I18N_DIR = path.join(__dirname, '..', 'i18n');

// Get list of language files
const languageFiles = fs
  .readdirSync(I18N_DIR)
  .filter((file) => file.endsWith('.json') && !['config.json', 'languages.json'].includes(file));

console.log(`Found ${languageFiles.length} language files to process`);

// Define the missing keys and their default values
const missingKeys = {
  'calculator.step1.scope.select': {
    en: 'Select an option',
    es: 'Selecciona una opción',
    default: 'Select an option',
  },
  'calculator.step1.entity.select': {
    en: 'Select an option',
    es: 'Selecciona una opción',
    default: 'Select an option',
  },
  'calculator.step2.budget.placeholder': {
    en: '$10,000,000',
    es: '$10,000,000',
    default: '$10,000,000',
  },
  'calculator.step2.address.placeholder': {
    en: 'E.g.: J Rousseu 3, Anzures, CDMX',
    es: 'Ej: J Rousseu 3, Anzures, CDMX',
    default: 'E.g.: J Rousseu 3, Anzures, CDMX',
  },
  'calculator.step2.type.select': {
    en: 'Select a type',
    es: 'Selecciona un tipo',
    default: 'Select a type',
  },
  'calculator.step2.status.select': {
    en: 'Select a status',
    es: 'Selecciona un estatus',
    default: 'Select a status',
  },
  'calculator.step2.surface.placeholder': {
    en: '800',
    es: '800',
    default: '800',
  },
  'calculator.step2.usableSurface.placeholder': {
    en: '480',
    es: '480',
    default: '480',
  },
  'calculator.step2.use.placeholder': {
    en: 'H30/20/Z',
    es: 'H30/20/Z',
    default: 'H30/20/Z',
  },
  'calculator.step2.characteristics.placeholder': {
    en: 'Protected, Not Applicable...',
    es: 'Protegido, No aplica...',
    default: 'Protected, Not Applicable...',
  },
  'calculator.form.required_field': {
    en: 'This field is required to continue',
    es: 'Este campo es obligatorio para continuar',
    default: 'This field is required to continue',
  },
};

// Helper function to set a nested property in an object
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  let current = obj;

  // Navigate to the right location, creating objects as needed
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    } else if (typeof current[part] !== 'object') {
      // If it's not an object, make it one
      current[part] = {};
    }
    current = current[part];
  }

  // Set the value at the final property
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}

// Process each language file
let updatedFiles = 0;

languageFiles.forEach((file) => {
  const langCode = file.replace('.json', '');
  console.log(`\nProcessing ${file}...`);

  try {
    // Read the file
    const filePath = path.join(I18N_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    let changes = 0;

    // Add each missing key
    Object.entries(missingKeys).forEach(([key, values]) => {
      // Get the path parts (e.g., "calculator.step1.scope.select" -> ["calculator", "step1", "scope", "select"])
      const parts = key.split('.');

      // Check if the key already exists
      let current = data;
      let exists = true;

      for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
          exists = false;
          break;
        }
        current = current[part];
      }

      if (!exists) {
        // Key doesn't exist, add it
        const value = values[langCode] || values['default'];
        setNestedProperty(data, key, value);
        console.log(`  Added: ${key} = "${value}"`);
        changes++;
      }
    });

    if (changes > 0) {
      // Write the updated file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ Updated ${file} with ${changes} new keys`);
      updatedFiles++;
    } else {
      console.log(`ℹ️ No changes needed for ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}: ${error.message}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Updated ${updatedFiles} of ${languageFiles.length} files`);
if (updatedFiles > 0) {
  console.log(`✅ Successfully added missing placeholder keys to translation files`);
} else {
  console.log(`ℹ️ No files were updated. All keys might already be present.`);
}
