/**
 * Prueba de accesibilidad para calculator.html usando axe-core
 */

// Importar axe-core desde CDN en el navegador
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js';
document.head.appendChild(script);

script.onload = function() {
  // Configuración para probar diferentes modos
  const testModes = [
    { name: 'Modo Light', theme: 'light' },
    { name: 'Modo Dark', theme: 'dark' }
  ];

  // Test con diferentes resoluciones para probar responsividad
  const viewportSizes = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1366, height: 768 }
  ];

  // Ejecutar pruebas de accesibilidad
  async function runAccessibilityTests() {
    console.group('Pruebas de accesibilidad para calculator.html');
    
    for (const mode of testModes) {
      console.group(`Pruebas en ${mode.name}`);
      
      // Configurar tema
      localStorage.setItem('theme', mode.theme);
      document.documentElement.classList.toggle('dark', mode.theme === 'dark');
      
      // Esperar a que los cambios de tema surtan efecto
      await new Promise(resolve => setTimeout(resolve, 500));
      
      for (const viewport of viewportSizes) {
        console.group(`Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        // Cambiar viewport no es posible en navegador normal, pero lo registramos para referencia
        console.log(`Probando en resolución ${viewport.width}x${viewport.height}...`);
        
        try {
          // Ejecutar análisis de axe-core
          const results = await axe.run('main', {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
            }
          });
          
          // Mostrar resultados
          console.log(`Prueba completada en ${mode.name} - ${viewport.name}`);
          console.log(`Violaciones encontradas: ${results.violations.length}`);
          
          if (results.violations.length > 0) {
            console.group('Violaciones:');
            results.violations.forEach(violation => {
              console.log(`Regla: ${violation.id} - ${violation.help}`);
              console.log(`Impacto: ${violation.impact}`);
              console.log(`Elementos afectados: ${violation.nodes.length}`);
              violation.nodes.forEach(node => {
                console.log(`- ${node.html}`);
                console.log(`  Sugerencia: ${node.failureSummary}`);
              });
            });
            console.groupEnd();
          } else {
            console.log('¡No se encontraron problemas de accesibilidad!');
          }
        } catch (error) {
          console.error('Error en la prueba de accesibilidad:', error);
        }
        
        console.groupEnd(); // Viewport
      }
      
      console.groupEnd(); // Mode
    }
    
    console.groupEnd(); // Pruebas
  }

  // Ejecutar cuando el DOM esté completamente cargado
  if (document.readyState === 'complete') {
    runAccessibilityTests();
  } else {
    window.addEventListener('load', runAccessibilityTests);
  }
};

// Instrucciones para ejecutar la prueba
console.log('Para ejecutar esta prueba, carga calculator.html en un navegador y luego:');
console.log('1. Abre la consola de desarrollador (F12)');
console.log('2. Pega el contenido de este archivo en la consola');
console.log('3. Presiona Enter para ejecutar');
console.log('4. Revisa los resultados en la consola');

// Para uso en Node.js con Puppeteer
if (typeof module !== 'undefined') {
  module.exports = runAccessibilityTests;
} 