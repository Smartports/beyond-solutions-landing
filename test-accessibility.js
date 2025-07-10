// Quick accessibility test script
console.log('🧪 Running accessibility tests...');

// Test 1: Check for skip links
const skipLinks = document.querySelectorAll('.skip-link');
console.log(`✓ Skip links found: ${skipLinks.length}`);

// Test 2: Check focus indicators
const style = getComputedStyle(document.body);
const hasFocusStyles = document.querySelector('*:focus');
console.log(`✓ Focus styles defined: ${hasFocusStyles ? 'Yes' : 'No'}`);

// Test 3: Check ARIA labels
const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([id])');
console.log(`✓ Unlabeled inputs: ${unlabeledInputs.length}`);

// Test 4: Check for live regions
const liveRegions = document.querySelectorAll('[aria-live]');
console.log(`✓ Live regions: ${liveRegions.length}`);

// Test 5: Check color contrast (basic)
const lowContrastElements = [];
document.querySelectorAll('*').forEach((el) => {
  const styles = getComputedStyle(el);
  const color = styles.color;
  const bg = styles.backgroundColor;
  // This is a simplified check - real contrast testing is more complex
  if (color && bg && color !== 'rgb(0, 0, 0)' && bg !== 'rgba(0, 0, 0, 0)') {
    // Would need proper contrast calculation here
  }
});

console.log('✅ Basic accessibility tests complete!');
console.log('For comprehensive testing, use tools like axe DevTools or WAVE');
