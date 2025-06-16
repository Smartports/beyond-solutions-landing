/**
 * Script para actualizar todos los archivos de traducción
 * Asegura que todos los archivos tengan las mismas claves para los valores de selectores
 */

const fs = require('fs');
const path = require('path');

// Directorio de archivos de traducción
const i18nDir = path.join(__dirname, '..', 'i18n');

// Cargar el archivo de español como base
const esPath = path.join(i18nDir, 'es.json');
const esContent = JSON.parse(fs.readFileSync(esPath, 'utf8'));

// Obtener la estructura de valores
const valuesStructure = esContent.calculator.values;

// Lista de archivos a procesar (excluir es.json que ya tiene la estructura)
const files = fs.readdirSync(i18nDir)
  .filter(file => file.endsWith('.json') && file !== 'es.json' && file !== 'config.json' && file !== 'languages.json');

console.log(`Procesando ${files.length} archivos de traducción...`);

// Procesar cada archivo
files.forEach(file => {
  const filePath = path.join(i18nDir, file);
  try {
    // Leer el archivo
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Asegurar que existe la estructura calculator
    if (!content.calculator) {
      content.calculator = {};
    }
    
    // Asegurar que existe la estructura values
    if (!content.calculator.values) {
      content.calculator.values = {};
    }
    
    // Copiar la estructura de valores si no existe
    const values = content.calculator.values;
    
    // Procesar cada tipo de valor
    Object.keys(valuesStructure).forEach(valueType => {
      if (!values[valueType]) {
        values[valueType] = {};
      }
      
      // Copiar cada valor individual
      Object.keys(valuesStructure[valueType]).forEach(key => {
        if (!values[valueType][key]) {
          // Si no existe, usar el valor en inglés o español como fallback
          if (file === 'en.json') {
            // Para inglés, traducir los valores
            switch (valueType) {
              case 'scope':
                values[valueType][key] = key === 'patrimonial' ? 'Patrimonial' : 'Investment';
                break;
              case 'entity':
                values[valueType][key] = key.toUpperCase(); // B2B, B2C
                break;
              case 'type':
                values[valueType][key] = key === 'own' ? 'Owned' : (key === 'notown' ? 'Not Owned' : 'Foreclosure');
                break;
              case 'status':
                values[valueType][key] = key === 'construccion' ? 'Construction' : 
                                        (key === 'demolicion' ? 'Demolition' : 'Reconversion');
                break;
              case 'materialesLevel':
                values[valueType][key] = key === 'low' ? 'Low Cost' : 
                                        (key === 'medium' ? 'Medium Cost' : 
                                        (key === 'high' ? 'High Cost' : 'Custom'));
                break;
              default:
                values[valueType][key] = valuesStructure[valueType][key];
            }
          } else {
            // Para otros idiomas, usar el valor en español como fallback
            values[valueType][key] = valuesStructure[valueType][key];
          }
        }
      });
    });
    
    // Guardar el archivo actualizado
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`✅ Actualizado: ${file}`);
  } catch (error) {
    console.error(`❌ Error procesando ${file}:`, error);
  }
});

console.log('Proceso completado.'); 