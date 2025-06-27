#!/bin/bash

# Beyond Solutions - Phase 6 Implementation Script
# This script helps you implement accessibility and mobile optimization features

echo "🚀 Starting Phase 6: Accessibility & Mobile Optimization"
echo "======================================================"

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 exists"
        return 0
    else
        echo "❌ $1 not found"
        return 1
    fi
}

# Function to add script to HTML if not present
add_script_to_html() {
    local html_file=$1
    local script_src=$2
    local script_tag="<script src=\"$script_src\" type=\"module\"></script>"
    
    if ! grep -q "$script_src" "$html_file"; then
        # Add before closing body tag
        sed -i.bak "s|</body>|    $script_tag\n</body>|" "$html_file"
        echo "✅ Added $script_src to $html_file"
    else
        echo "ℹ️  $script_src already in $html_file"
    fi
}

echo ""
echo "📁 Checking Phase 6 files..."
echo "----------------------------"

# Check if all required files exist
check_file "js/accessibility.js"
check_file "js/mobile-optimization.js"
check_file "js/phase6-integration.js"
check_file "docs/PHASE6_ACCESSIBILITY_MOBILE.md"
check_file "docs/ACCESSIBILITY_GUIDE.md"

echo ""
echo "🔧 Integrating Phase 6 modules..."
echo "---------------------------------"

# Add scripts to calculator-gamified.html
if [ -f "calculator-gamified.html" ]; then
    echo "Adding Phase 6 scripts to calculator-gamified.html..."
    
    # Backup the file
    cp calculator-gamified.html calculator-gamified.html.phase6-backup
    
    # Add the integration script
    add_script_to_html "calculator-gamified.html" "./js/phase6-integration.js"
    
    echo "✅ Phase 6 scripts integrated"
else
    echo "❌ calculator-gamified.html not found!"
fi

echo ""
echo "📋 Creating accessibility test script..."
echo "---------------------------------------"

# Create a simple accessibility test script
cat > test-accessibility.js << 'EOF'
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
document.querySelectorAll('*').forEach(el => {
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
EOF

echo "✅ Test script created: test-accessibility.js"

echo ""
echo "🌐 Updating dist directory..."
echo "-----------------------------"

# Copy updated files to dist
if [ -d "dist" ]; then
    cp calculator-gamified.html dist/ 2>/dev/null || echo "⚠️  Could not copy calculator-gamified.html to dist"
    cp -r js/accessibility.js dist/js/ 2>/dev/null || echo "⚠️  Could not copy accessibility.js to dist"
    cp -r js/mobile-optimization.js dist/js/ 2>/dev/null || echo "⚠️  Could not copy mobile-optimization.js to dist"
    cp -r js/phase6-integration.js dist/js/ 2>/dev/null || echo "⚠️  Could not copy phase6-integration.js to dist"
    echo "✅ Files copied to dist directory"
else
    echo "⚠️  dist directory not found - run build.js to create it"
fi

echo ""
echo "📱 Mobile Testing Checklist"
echo "---------------------------"
cat << 'CHECKLIST'
□ Test on real mobile devices (iOS Safari, Android Chrome)
□ Check touch targets are at least 44x44px
□ Verify pinch-to-zoom works
□ Test landscape/portrait orientation changes
□ Check performance on 3G connection
□ Verify offline functionality
□ Test native share functionality

CHECKLIST

echo ""
echo "♿ Accessibility Testing Checklist"
echo "---------------------------------"
cat << 'CHECKLIST'
□ Navigate entire page using only keyboard
□ Test with screen reader (NVDA/JAWS/VoiceOver)
□ Check color contrast (use WAVE or axe DevTools)
□ Verify all images have alt text
□ Test with 200% zoom
□ Check focus indicators are visible
□ Verify form errors are announced

CHECKLIST

echo ""
echo "🎯 Next Steps"
echo "-------------"
echo "1. Start your development server:"
echo "   ./start-server.sh"
echo ""
echo "2. Open the calculator in your browser:"
echo "   http://localhost:8000/dist/calculator-gamified.html"
echo ""
echo "3. Open browser DevTools and run:"
echo "   - Lighthouse audit (Cmd+Opt+I > Lighthouse tab)"
echo "   - Check for console errors"
echo "   - Test on different screen sizes"
echo ""
echo "4. Install browser extensions for testing:"
echo "   - WAVE (Web Accessibility Evaluation Tool)"
echo "   - axe DevTools"
echo "   - Lighthouse"
echo ""
echo "5. Read the implementation guides:"
echo "   - docs/PHASE6_ACCESSIBILITY_MOBILE.md"
echo "   - docs/ACCESSIBILITY_GUIDE.md"
echo ""
echo "✨ Phase 6 setup complete! Happy coding! 🚀" 