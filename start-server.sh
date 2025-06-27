#!/bin/bash

# Beyond Solutions - Server Startup Script
# This script safely starts the development server with intelligent port management

echo "🚀 Starting Beyond Solutions development server..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Navigate to the project root
cd "$SCRIPT_DIR"

echo "📁 Project directory: $SCRIPT_DIR"

# Function to check if a port is in use
check_port() {
    local port=$1
    lsof -ti:$port > /dev/null 2>&1
    return $?
}

# Function to kill process using a port
kill_port_process() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "⚠️  Port $port is in use by process $pid"
        echo "🔄 Attempting to terminate process..."
        kill -TERM $pid 2>/dev/null
        sleep 2
        
        # Check if process is still running
        if kill -0 $pid 2>/dev/null; then
            echo "💀 Process still running, force killing..."
            kill -KILL $pid 2>/dev/null
            sleep 1
        fi
        
        # Verify port is now free
        if check_port $port; then
            echo "❌ Failed to free port $port"
            return 1
        else
            echo "✅ Port $port is now free"
            return 0
        fi
    fi
    return 0
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local max_attempts=10
    
    for ((i=0; i<max_attempts; i++)); do
        local test_port=$((start_port + i))
        if ! check_port $test_port; then
            echo $test_port
            return 0
        fi
    done
    
    echo "❌ No available ports found in range $start_port-$((start_port + max_attempts - 1))"
    return 1
}

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found. Building project..."
    node build.js
fi

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. Please check the build process."
    exit 1
fi

# Navigate to dist directory
cd dist

# Start port management
TARGET_PORT=8000

echo "🔍 Checking port $TARGET_PORT availability..."

if check_port $TARGET_PORT; then
    echo "⚠️  Port $TARGET_PORT is currently in use"
    
    # Try to free the port
    if kill_port_process $TARGET_PORT; then
        FINAL_PORT=$TARGET_PORT
        echo "✅ Successfully freed port $TARGET_PORT"
    else
        echo "🔄 Finding alternative port..."
        FINAL_PORT=$(find_available_port 8001)
        if [ $? -ne 0 ]; then
            echo "❌ Cannot find available port. Exiting."
            exit 1
        fi
        echo "📡 Using alternative port: $FINAL_PORT"
    fi
else
    FINAL_PORT=$TARGET_PORT
    echo "✅ Port $TARGET_PORT is available"
fi

echo ""
echo "🌐 Starting HTTP server on port $FINAL_PORT..."
echo "📱 Open http://localhost:$FINAL_PORT/calculator-gamified.html to test the app"
echo "🏠 Open http://localhost:$FINAL_PORT/ for the main landing page"
echo "🎮 Open http://localhost:$FINAL_PORT/dashboard.html for project management"
echo "🧙 Open http://localhost:$FINAL_PORT/wizard.html to create new projects"
echo ""
echo "🧪 Phase 6 Testing URLs:"
echo "   📋 http://localhost:$FINAL_PORT/test-phase6-integration.html"
echo "   ♿ Accessibility features: Enable with keyboard navigation and screen reader"
echo "   📱 Mobile features: Test touch gestures and responsive design"
echo ""
echo "📊 Available test tools:"
echo "   🔍 Run test suite: node test/run-all-tests.js"
echo "   ♿ Accessibility audit: node test/accessibility/run-a11y-audit.js"
echo "   📈 Performance report: Check browser DevTools > Lighthouse"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 -m http.server $FINAL_PORT 