#!/bin/bash

################################################################################
# PDF to Flipbook - Prepare Distribution Package
# This script builds executables and creates distribution packages
# Usage: ./prepare-distribution.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
# Read version from package.json
VERSION=$(node -p "require('./package.json').version")
DIST_DIR="distribution"
PACKAGE_NAME="pdf-to-flipbook-${VERSION}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    PDF to Flipbook - Prepare Distribution Package v${VERSION}    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Prerequisites verified (Node.js $(node -v), npm $(npm -v))"
echo ""

# Step 2: Build executables
echo -e "${YELLOW}🔨 Step 2: Building executables...${NC}"
npm run clean 2>/dev/null || true
npm install
npm run pkg:build
echo -e "${GREEN}✓${NC} Executables built"
echo ""

# Step 3: Verify executables exist
echo -e "${YELLOW}📦 Step 3: Verifying executables...${NC}"
if [ ! -f "flipbook-macos-arm64" ]; then
    echo -e "${RED}❌ flipbook-macos-arm64 executable not found${NC}"
    exit 1
fi
if [ ! -f "flipbook-macos-x64" ]; then
    echo -e "${RED}❌ flipbook-macos-x64 executable not found${NC}"
    exit 1
fi
if [ ! -f "flipbook-linux-x64" ]; then
    echo -e "${RED}❌ flipbook-linux-x64 executable not found${NC}"
    exit 1
fi
if [ ! -f "flipbook-win-x64.exe" ]; then
    echo -e "${RED}❌ flipbook-win-x64.exe executable not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} All platform executables found"
echo ""

# Step 4: Create distribution directory structure
echo -e "${YELLOW}📁 Step 4: Creating distribution package...${NC}"
# Only remove the specific version directory, keep others
rm -rf "$DIST_DIR/$PACKAGE_NAME" 2>/dev/null || true
mkdir -p "$DIST_DIR/$PACKAGE_NAME"

# Copy executables
cp flipbook-macos-arm64 "$DIST_DIR/$PACKAGE_NAME/"
cp flipbook-macos-x64 "$DIST_DIR/$PACKAGE_NAME/"
cp flipbook-linux-x64 "$DIST_DIR/$PACKAGE_NAME/"
cp flipbook-win-x64.exe "$DIST_DIR/$PACKAGE_NAME/"

# Copy sharp vendor libraries (required for image processing)
echo -e "${YELLOW}  Copying native libraries...${NC}"
mkdir -p "$DIST_DIR/$PACKAGE_NAME/sharp"
cp -r node_modules/sharp/vendor "$DIST_DIR/$PACKAGE_NAME/sharp/" 2>/dev/null || true
cp -r node_modules/sharp/build "$DIST_DIR/$PACKAGE_NAME/sharp/" 2>/dev/null || true

# Copy documentation
cp README.md "$DIST_DIR/$PACKAGE_NAME/"

# Copy templates and themes for customization
cp -r templates "$DIST_DIR/$PACKAGE_NAME/" 2>/dev/null || echo "Warning: templates directory not found"
cp -r themes "$DIST_DIR/$PACKAGE_NAME/" 2>/dev/null || echo "Warning: themes directory not found"

echo -e "${GREEN}✓${NC} Distribution files copied"
echo ""

# Step 5: Create additional documentation files
echo -e "${YELLOW}📝 Step 5: Creating documentation files...${NC}"

# Create QUICK_START.md
cat > "$DIST_DIR/$PACKAGE_NAME/QUICK_START.md" << 'QUICKSTART'
# Quick Start Guide

## Setup (30 seconds)

### macOS/Linux
```bash
chmod +x flipbook-macos-arm64  # Make executable (Apple Silicon)
# or: chmod +x flipbook-macos-x64  (Intel Mac)
# or: chmod +x flipbook-linux-x64  (Linux)
```

### Windows
No setup needed - just use `flipbook-win-x64.exe` directly.

## Convert Your First PDF

```bash
# macOS (Apple Silicon)
./flipbook-macos-arm64 mybook.pdf

# macOS (Intel)
./flipbook-macos-x64 mybook.pdf

# Linux
./flipbook-linux-x64 mybook.pdf

# Windows
flipbook-win-x64.exe mybook.pdf
```

## View Your Flipbook

1. The conversion creates a folder (e.g., `mybook_flipbook/`)
2. Open `flipbook.html` in your web browser
3. Done! 🎉

## Common Commands

```bash
# Custom output directory
./flipbook-macos-arm64 mybook.pdf ./my-flipbook

# Add custom title
./flipbook-macos-arm64 mybook.pdf --title "My Book"

# High quality (slower, larger file)
./flipbook-macos-arm64 mybook.pdf --quality 95 --dpi 200

# Fast conversion (lower quality)
./flipbook-macos-arm64 mybook.pdf --quality 60 --dpi 100
```

## Next Steps

- See `README.md` for complete documentation
- Use `--theme-dir` to customize the look with your own CSS
- Use `--template-dir` to customize the HTML structure

For help:
```bash
./flipbook-macos-arm64 --help
```

Enjoy! 📚✨
QUICKSTART

echo -e "${GREEN}✓${NC} Documentation files created"
echo ""

# Step 5b: Create README.txt for clarity
echo -e "${YELLOW}📝 Step 5b: Creating README.txt...${NC}"
cat > "$DIST_DIR/$PACKAGE_NAME/README.txt" << EOF
╔══════════════════════════════════════════════════════════════════════════════╗
║                        PDF to Flipbook Converter v${VERSION}                      ║
║                  Convert PDFs into Interactive Web Flipbooks                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

WHAT'S INCLUDED
═══════════════════════════════════════════════════════════════════════════════

This package contains executables for all operating systems:

• flipbook-macos-arm64  - For Apple Silicon (M1/M2/M3) Macs
• flipbook-macos-x64    - For Intel Macs
• flipbook-linux-x64    - For 64-bit Linux
• flipbook-win-x64.exe  - For Windows (64-bit)
• README.md             - Documentation

GETTING STARTED
═══════════════════════════════════════════════════════════════════════════════

1. Select the correct executable for your operating system:
   - Apple Silicon Mac (M1/M2/M3): use "flipbook-macos-arm64"
   - Intel Mac: use "flipbook-macos-x64"
   - Linux: use "flipbook-linux-x64"
   - Windows: use "flipbook-win-x64.exe"

2. Make it executable (macOS/Linux only):
   chmod +x flipbook-macos-arm64
   (or the appropriate executable for your system)

3. Try a test conversion:
   ./flipbook-macos-arm64 mybook.pdf
   (or: flipbook-win-x64.exe mybook.pdf on Windows)

QUICK START
═══════════════════════════════════════════════════════════════════════════════

macOS (Apple Silicon):
  ./flipbook-macos-arm64 document.pdf

macOS (Intel):
  ./flipbook-macos-x64 document.pdf

Linux:
  ./flipbook-linux-x64 document.pdf

Windows:
  flipbook-win-x64.exe document.pdf

This creates a folder with an interactive flipbook. Open flipbook.html in your
browser to view it!

SYSTEM REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

• macOS 10.13 or later
• Linux with glibc 2.28+
• Windows 7 SP1 or later
• Modern web browser (Chrome, Firefox, Safari, Edge)
• 2GB RAM minimum

NEED HELP?
═══════════════════════════════════════════════════════════════════════════════

1. Review this README.txt file
2. Check the included README.md for more details
3. Run with --help flag for command options:
   ./flipbook-macos-arm64 --help (or your platform's executable)

SUPPORT
═══════════════════════════════════════════════════════════════════════════════

For questions or issues:
• Review the included README.md documentation
• Run: ./flipbook-macos-arm64 --help (for command options)
• Make sure you are using the correct executable for your OS

TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

"Command not found":
  Make sure the file is executable: chmod +x flipbook-macos-arm64

"Permission denied":
  chmod +x flipbook-macos-arm64

"Cannot execute binary file":
  Make sure you downloaded the correct version:
  - Apple Silicon Mac: flipbook-macos-arm64
  - Intel Mac: flipbook-macos-x64
  - Linux: flipbook-linux-x64
  - Windows: flipbook-win-x64.exe

═══════════════════════════════════════════════════════════════════════════════

Ready to convert PDFs? See README.md or QUICK_START.md for more information.

Happy flipping! 📚
EOF

chmod +x "$DIST_DIR/$PACKAGE_NAME/flipbook-macos-arm64"
chmod +x "$DIST_DIR/$PACKAGE_NAME/flipbook-macos-x64"
chmod +x "$DIST_DIR/$PACKAGE_NAME/flipbook-linux-x64"
echo -e "${GREEN}✓${NC} README.txt created and executables made executable"
echo ""

# Step 6: Generate checksums
echo -e "${YELLOW}🔐 Step 6: Generating checksums...${NC}"
cd "$DIST_DIR/$PACKAGE_NAME"
shasum -a 256 flipbook-macos-arm64 flipbook-macos-x64 flipbook-linux-x64 flipbook-win-x64.exe README.txt > SHA256SUMS 2>/dev/null || {
    echo -e "${YELLOW}⚠️  shasum not available, skipping checksums${NC}"
}
cd ../..
echo -e "${GREEN}✓${NC} Checksums generated (if available)"
echo ""

# Step 7: Create ZIP archives
echo -e "${YELLOW}📦 Step 7: Creating ZIP archives...${NC}"

# Unified package
if command -v zip &> /dev/null; then
    cd "$DIST_DIR"
    zip -r -q "${PACKAGE_NAME}.zip" "$PACKAGE_NAME"
    cd ..
    echo -e "${GREEN}✓${NC} Created ${PACKAGE_NAME}.zip"
else
    echo -e "${YELLOW}⚠️  zip command not found, skipping ZIP creation${NC}"
fi

echo ""

# Step 8: Display summary
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   ✅ Distribution Ready!                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📍 Distribution package location:${NC}"
echo "   $DIST_DIR/$PACKAGE_NAME/"
echo ""

echo -e "${BLUE}📊 Package contents:${NC}"
cd "$DIST_DIR/$PACKAGE_NAME"
du -h flipbook-macos-arm64 flipbook-macos-x64 flipbook-linux-x64 flipbook-win-x64.exe 2>/dev/null | while read size file; do
    echo "   • $file - $size"
done
echo ""
ls -1 *.md *.txt 2>/dev/null | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "   • $file - $size"
done
cd ../..
echo ""

if [ -f "$DIST_DIR/${PACKAGE_NAME}.zip" ]; then
    SIZE=$(du -h "$DIST_DIR/${PACKAGE_NAME}.zip" | cut -f1)
    echo -e "${BLUE}📦 ZIP archive:${NC}"
    echo "   ${PACKAGE_NAME}.zip - $SIZE"
    echo ""
fi

echo -e "${BLUE}🚀 Next steps:${NC}"
echo ""
echo "1. Test the distribution:"
echo "   cd $DIST_DIR/$PACKAGE_NAME"
echo "   ./flipbook --help"
echo ""
echo "2. Share the package:"
echo "   • Option A: Share entire folder"
echo "   • Option B: Create ZIP for distribution"
echo "   • Option C: Upload to GitHub Releases"
echo ""
echo "3. Distribute files:"
if [ -f "$DIST_DIR/${PACKAGE_NAME}.zip" ]; then
    echo "   $DIST_DIR/${PACKAGE_NAME}.zip"
else
    echo "   $DIST_DIR/$PACKAGE_NAME/ (as folder)"
fi
echo ""
echo "4. Include documentation:"
echo "   • INSTALL.md - Installation help"
echo "   • QUICK_START.md - Quick reference"
echo "   • DISTRIBUTION_README.md - Complete guide"
echo ""

echo -e "${YELLOW}💡 Pro tip: Use DISTRIBUTION_PACKAGE.md for packaging guidance${NC}"
echo ""

echo -e "${GREEN}✨ Ready to distribute! 📚${NC}"
echo ""

