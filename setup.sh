#!/bin/bash

# YouTube Channel Restrictor - Setup Script
# This script helps prepare the extension for installation

echo "🎬 YouTube Channel Restrictor - Setup"
echo "====================================="
echo ""

# Check for Python
echo "📦 Checking prerequisites..."

if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    echo "✅ Python 3 found"
else
    echo "⚠️  Python 3 not found"
    echo "   Please install Python 3 to generate icons"
    PYTHON_CMD=""
fi

echo ""

# Try to generate icons
if [ -n "$PYTHON_CMD" ]; then
    echo "🎨 Generating extension icons..."
    cd "$(dirname "$0")/icons"
    
    if $PYTHON_CMD generate_icons.py; then
        echo "✅ Icons generated successfully"
    else
        echo "⚠️  Could not generate icons automatically"
        echo "   Icons are optional but recommended"
        echo "   You can generate them manually or skip for now"
    fi
    
    cd ..
else
    echo "⚠️  Skipping icon generation (Python 3 required)"
    echo "   You can generate icons later by running:"
    echo "   python3 icons/generate_icons.py"
fi

echo ""
echo "📋 Next steps:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (top-right toggle)"
echo "3. Click 'Load unpacked'"
echo "4. Select this extension folder"
echo "5. Click the extension icon to configure"
echo ""
echo "✨ Setup complete! Happy watching! 🎥"
