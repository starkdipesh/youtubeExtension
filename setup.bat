@echo off
REM YouTube Channel Restrictor - Setup Script (Windows)
REM This script helps prepare the extension for installation

echo.
echo 4d 3 YouTube Channel Restrictor - Setup
echo ==========================================
echo.

REM Check for Python
echo 5c Checking prerequisites...

python --version >nul 2>&1
if errorlevel 1 (
    echo 26a Python not found in PATH
    echo    Please ensure Python is installed and added to PATH
    set PYTHON_CMD=
) else (
    set PYTHON_CMD=python
    echo e Python found
)

echo.

REM Try to generate icons
if defined PYTHON_CMD (
    echo 1f8 Generating extension icons...
    pushd icons
    
    %PYTHON_CMD% generate_icons.py
    if errorlevel 0 (
        echo e Icons generated successfully
    ) else (
        echo 26a Could not generate icons automatically
        echo    Icons are optional but recommended
    )
    
    popd
) else (
    echo 26a Skipping icon generation
    echo    Run this in PowerShell as Administrator and set Python path, then:
    echo    python icons/generate_icons.py
)

echo.
echo 17c Next steps:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable Developer mode (toggle in top-right)
echo 3. Click Load unpacked
echo 4. Select this extension folder
echo 5. Click the extension icon to configure
echo.
echo f Setup complete! Happy watching! 1f4
echo.
pause
