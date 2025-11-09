#!/bin/bash

################################################################################
# PDF to Flipbook - Force Rebuild with Node.js 18
# This script ensures Node.js 18 is used and rebuilds everything cleanly
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        PDF to Flipbook - Force Rebuild with Node.js 18        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if nvm is available
if command -v nvm &> /dev/null || [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo -e "${YELLOW}📦 Switching to Node.js 18 with nvm...${NC}"

    # Source nvm if it's not already in the environment
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    nvm use 18
    echo -e "${GREEN}✅ Switched to:$(node --version)${NC}"
else
    echo -e "${YELLOW}⚠️  nvm not found. Please ensure Node.js 18 is active.${NC}"
    echo -e "${YELLOW}   Current version:$(node --version)${NC}"

    # Check if we're already on Node.js 18
    NODE_VERSION=$(node --version | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_VERSION" != "18" ]; then
        echo -e "${RED}❌ Please switch to Node.js 18 manually: nvm use 18${NC}"
        exit 1
    fi
fi

echo ""

# Clean everything
echo -e "${YELLOW}🧹 Cleaning build artifacts and dependencies...${NC}"
npm run clean
rm -rf node_modules package-lock.json
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# Reinstall dependencies
echo -e "${YELLOW}📦 Reinstalling dependencies with Node.js 18...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Build
echo -e "${YELLOW}🔨 Building executables...${NC}"
npm run pkg:build
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Verify
echo -e "${YELLOW}🔍 Verifying executables...${NC}"
if [ -f "flipbook-macos-arm64" ] && [ -f "flipbook-macos-x64" ] && [ -f "flipbook-linux-x64" ] && [ -f "flipbook-win-x64.exe" ]; then
    echo -e "${GREEN}✅ All executables created successfully${NC}"

    echo ""
    echo -e "${BLUE}📊 Executable sizes:${NC}"
    ls -lh flipbook-* flipbook-win-*.exe 2>/dev/null | awk '{print "   • " $9 " - " $5}'
    echo ""
else
    echo -e "${RED}❌ Some executables are missing${NC}"
    exit 1
fi

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   🎉 Rebuild Complete!                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}🚀 Test the build:${NC}"
echo "   ./flipbook-macos-arm64 --help"
echo ""
echo -e "${BLUE}📦 Ready for distribution!${NC}"
