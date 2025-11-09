@echo off
REM PDF to Flipbook - Prepare Distribution Package (Windows)
REM This script builds executables and creates distribution packages
REM Usage: prepare-distribution.bat

setlocal enabledelayedexpansion

set VERSION=1.0.0
set DIST_DIR=distribution
set PACKAGE_NAME=pdf-to-flipbook-%VERSION%

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║    PDF to Flipbook - Prepare Distribution Package v%VERSION%    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Check prerequisites
echo 📋 Step 1: Checking prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed
    exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm is not installed
    exit /b 1
)
echo ✓ Prerequisites verified
echo.

REM Step 2: Build executables
echo 🔨 Step 2: Building executables...
npm run clean 2>nul
npm install
npm run pkg:build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✓ Executables built
echo.

REM Step 3: Verify executables exist
echo 📦 Step 3: Verifying executables...
if not exist "flipbook" (
    echo ❌ flipbook executable not found
    exit /b 1
)
if not exist "flipbook.exe" (
    echo ❌ flipbook.exe executable not found
    exit /b 1
)
echo ✓ Both executables found
echo.

REM Step 4: Create distribution directory structure
echo 📁 Step 4: Creating distribution package...
rmdir /s /q "%DIST_DIR%" 2>nul
mkdir "%DIST_DIR%\%PACKAGE_NAME%"

REM Copy files
copy flipbook "%DIST_DIR%\%PACKAGE_NAME%\" >nul
copy flipbook.exe "%DIST_DIR%\%PACKAGE_NAME%\" >nul
copy DISTRIBUTION_README.md "%DIST_DIR%\%PACKAGE_NAME%\" >nul
copy QUICK_START.md "%DIST_DIR%\%PACKAGE_NAME%\" >nul
copy INSTALL.md "%DIST_DIR%\%PACKAGE_NAME%\" >nul
copy README.md "%DIST_DIR%\%PACKAGE_NAME%\" >nul
copy BUILD.md "%DIST_DIR%\%PACKAGE_NAME%\" >nul
copy DISTRIBUTION_PACKAGE.md "%DIST_DIR%\%PACKAGE_NAME%\" >nul

echo ✓ Distribution files copied
echo.

REM Step 5: Create README.txt
echo 📝 Step 5: Creating README.txt...
(
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                        PDF to Flipbook Converter v1.0.0                    ║
echo ║                  Convert PDFs into Interactive Web Flipbooks               ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo WHAT'S INCLUDED
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo This package contains executables for all operating systems:
echo.
echo • flipbook          - For macOS and Linux users
echo • flipbook.exe      - For Windows users
echo.
echo GETTING STARTED
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo 1. Select the correct executable for your operating system:
echo    - macOS users: use "flipbook"
echo    - Linux users: use "flipbook"
echo    - Windows users: use "flipbook.exe"
echo.
echo 2. Read the documentation:
echo    - INSTALL.md              ← Start here!
echo    - QUICK_START.md          ← Quick reference
echo    - DISTRIBUTION_README.md  ← Complete guide
echo.
echo 3. Make it executable (macOS/Linux only):
echo    chmod +x flipbook
echo.
echo 4. Try a test conversion:
echo    ./flipbook mybook.pdf
echo    (or: flipbook.exe mybook.pdf on Windows)
echo.
echo QUICK START
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo macOS/Linux:
echo   ./flipbook document.pdf
echo.
echo Windows:
echo   flipbook.exe document.pdf
echo.
echo This creates a folder with an interactive flipbook. Open flipbook.html in your
echo browser to view it!
echo.
echo SYSTEM REQUIREMENTS
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo • macOS 10.13 or later
echo • Linux with glibc 2.28+
echo • Windows 7 SP1 or later
echo • Modern web browser (Chrome, Firefox, Safari, Edge)
echo • 2GB RAM minimum
echo.
echo NEED HELP?
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo 1. Read INSTALL.md for detailed installation instructions
echo 2. See QUICK_START.md for common commands
echo 3. Check DISTRIBUTION_README.md for complete documentation
echo.
echo SUPPORT
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo For questions or issues:
echo • Review the included documentation
echo • Run: flipbook.exe --help (for command options)
echo • Check DISTRIBUTION_README.md (comprehensive guide)
echo.
echo TROUBLESHOOTING
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo "Cannot execute binary file":
echo   Make sure you downloaded the correct version for your OS
echo.
echo More troubleshooting in DISTRIBUTION_README.md
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo Ready to convert PDFs? See INSTALL.md to get started!
echo.
echo Happy flipping! 📚
) > "%DIST_DIR%\%PACKAGE_NAME%\README.txt"

echo ✓ README.txt created
echo.

REM Step 6: Display summary
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   ✅ Distribution Ready!                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 📍 Distribution package location:
echo    %DIST_DIR%\%PACKAGE_NAME%\
echo.

echo 📊 Package contents:
dir /b "%DIST_DIR%\%PACKAGE_NAME%\" | findstr /E "flipbook flipbook.exe \.md \.txt"
echo.

echo 🚀 Next steps:
echo.
echo 1. Test the distribution:
echo    cd %DIST_DIR%\%PACKAGE_NAME%
echo    flipbook.exe --help
echo.
echo 2. Share the package:
echo    • Option A: Share entire folder
echo    • Option B: Create ZIP for distribution
echo    • Option C: Upload to GitHub Releases
echo.
echo 3. Distribute files:
echo    %DIST_DIR%\%PACKAGE_NAME%\ ^(as folder^)
echo.
echo 4. Include documentation:
echo    • INSTALL.md - Installation help
echo    • QUICK_START.md - Quick reference
echo    • DISTRIBUTION_README.md - Complete guide
echo.

echo 💡 Pro tip: Use DISTRIBUTION_PACKAGE.md for packaging guidance
echo.

echo ✨ Ready to distribute! 📚
echo.

pause


