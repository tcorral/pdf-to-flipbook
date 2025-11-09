# Developer Guide - PDF to Flipbook

For developers building and releasing new versions.

## 🔧 Prerequisites

- Node.js 18+ (https://nodejs.org/)
- npm (comes with Node.js)

### System Dependencies

**macOS:**
```bash
brew install pkg-config cairo pixman libpng jpeg giflib pango
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential pkg-config libcairo2-dev libpixman-1-dev libpng-dev libjpeg-dev libgif-dev
```

**CentOS/RHEL:**
```bash
sudo yum groupinstall "Development Tools"
sudo yum install pkgconfig cairo-devel pixman-devel libpng-devel libjpeg-turbo-devel giflib-devel
```

---

## 📦 Setup

```bash
cd pdf-to-flipbook
npm install
npm install -g pkg  # Install globally for distribution builds
```

---

## 🚀 Development

### Run with TypeScript
```bash
npm run dev
```

### Build TypeScript
```bash
npm run build
```

### Test Build
```bash
npm run start
```

---

## 🔨 Build Executables

### One Command (Recommended)
```bash
npm run pkg:build
```

This:
1. Compiles TypeScript → JavaScript
2. Bundles with esbuild
3. Creates executables for all platforms

Output:
- `flipbook` (macOS/Linux, ~80MB)
- `flipbook.exe` (Windows, ~80MB)

### Safe Rebuild (Handles Node.js Version Issues)
```bash
npm run pkg:rebuild
```

This:
1. Checks Node.js version (must be v18)
2. Cleans build artifacts
3. Removes and reinstalls dependencies (recompiles native modules)
4. Builds executables

### Force Rebuild with Auto Node.js Switching
```bash
npm run pkg:rebuild:force
```

This:
1. Automatically switches to Node.js 18 using nvm (if available)
2. Cleans everything
3. Reinstalls dependencies with correct Node.js version
4. Builds executables

### Step by Step
```bash
npm run build       # TypeScript → JavaScript
npm run bundle      # Bundle with esbuild
npm run pkg         # Create executables
```

### Platform-Specific
```bash
# macOS/Linux only
pkg --output flipbook dist/flipbook --targets node18-macos-arm64,node18-macos-x64,node18-linux-x64 --compress GZip

# Windows only
pkg --output flipbook.exe dist/flipbook --targets node18-win-x64 --compress GZip
```

---

## 🧹 Clean

Remove build artifacts:
```bash
npm run clean
```

Removes: `dist/`, `flipbook`, `flipbook.exe`

---

## 📂 Project Structure

```
pdf-to-flipbook/
├── src/
│   ├── cli.ts              # Command-line interface
│   ├── index.ts            # Main converter logic
│   ├── pdfConverter.ts     # PDF → WebP conversion
│   ├── flipbookGenerator.ts # HTML generation
│   └── types.ts            # TypeScript types
├── dist/                   # Compiled JavaScript (after build)
├── node_modules/           # Dependencies
├── package.json
├── tsconfig.json
├── README.md               # User guide
├── DEV_README.md          # This file
├── prepare-distribution.sh # Build helper (macOS/Linux)
└── prepare-distribution.bat # Build helper (Windows)
```

---

## 📝 Making Changes

1. Edit TypeScript files in `src/`
2. Test with `npm run dev`
3. When ready: `npm run pkg:build`
4. Test executables manually

---

## 🔄 Release Process

### 1. Update Version
Edit `package.json`:
```json
"version": "1.0.1"
```

Update version in `src/cli.ts` if displayed.

### 2. Build
```bash
npm run clean
npm run pkg:build
```

### 3. Test
```bash
./flipbook --help
./flipbook ../sample.pdf
```

Verify output:
- Help works
- Conversion works
- Output folder created properly

### 4. Create Distribution Package

**macOS/Linux:**
```bash
./prepare-distribution.sh
```

**Windows:**
```cmd
prepare-distribution.bat
```

Creates: `distribution/pdf-to-flipbook-X.X.X/`

### 5. Distribute

- Share distribution folder
- Upload to GitHub Releases
- Host on web server
- Include with release notes

---

## 📊 Executable Size

Each executable: ~60-100 MB (includes Node.js runtime)

This is normal for standalone Node.js applications. Size cannot be reduced significantly without affecting functionality.

---

## 🐛 Troubleshooting Build Issues

### npm install fails
```bash
# Update npm
npm install -g npm@latest

# Clear cache
npm cache clean --force

# Try again
npm install
```

### canvas build fails
Install system dependencies for your OS (see Prerequisites)

### esbuild fails
```bash
# Rebuild esbuild
npm rebuild esbuild

# Or reinstall
npm install esbuild@latest
```

### pkg fails
```bash
# Update pkg
npm install -g pkg@latest

# Or rebuild
npx pkg --version
```

### Node.js version mismatch (canvas/sharp native modules)
If executables fail with "ERR_DLOPEN_FAILED" or NODE_MODULE_VERSION errors:
```bash
# Option 1: Safe rebuild (checks Node.js version first)
npm run pkg:rebuild

# Option 2: Force rebuild with auto Node.js switching
npm run pkg:rebuild:force

# Option 3: Manual fix
nvm use 18                    # Switch to Node.js 18
rm -rf node_modules package-lock.json
npm install                   # Recompile native modules
npm run pkg:build            # Rebuild executables
```

**Why this happens:** Native modules (canvas, sharp) must be compiled with the same Node.js version that `pkg` targets (v18).

---

## 🔐 Distribution Checklist

Before releasing:

- [ ] Version updated in package.json
- [ ] All tests pass
- [ ] Builds complete successfully
- [ ] Executables tested on macOS
- [ ] Executables tested on Linux
- [ ] Executables tested on Windows
- [ ] Distribution package created
- [ ] Release notes prepared
- [ ] Documentation updated

---

## 📦 npm Scripts

```bash
npm run build              # Compile TypeScript
npm run dev               # Run with TypeScript (dev)
npm run start             # Run compiled version
npm run bundle            # Bundle with esbuild
npm run pkg               # Create executables (all platforms)
npm run pkg:build         # Build + bundle + pkg (one command)
npm run pkg:rebuild       # Safe rebuild with Node.js version check
npm run pkg:rebuild:force # Force rebuild with auto Node.js switching
npm run check:node        # Check Node.js version compatibility
npm run clean             # Remove build artifacts
```

---

## 🔗 Dependencies

### Production
- `sharp` - Image processing (PDF → WebP)
- `pdf-lib` - PDF manipulation
- `canvas` - Canvas rendering

### Development
- `typescript` - TypeScript compiler
- `ts-node` - Run TypeScript directly
- `esbuild` - Fast bundler
- `@types/node` - TypeScript Node.js types
- `pkg` - Create executables

---

## 🎯 Key Files to Know

- `package.json` - Version, scripts, dependencies
- `tsconfig.json` - TypeScript configuration
- `src/cli.ts` - Command-line entry point
- `src/index.ts` - Main converter logic
- `README.md` - User documentation
- `DEV_README.md` - This file

---

## 📚 Resources

- TypeScript: https://www.typescriptlang.org/
- esbuild: https://esbuild.github.io/
- pkg: https://github.com/vercel/pkg
- Node.js: https://nodejs.org/

---

## 💡 Tips

1. **Always test builds** on target platforms before releasing
2. **Keep executables in sync** - rebuild all platforms together
3. **Use semantic versioning** (MAJOR.MINOR.PATCH)
4. **Include release notes** with each distribution
5. **Test with sample PDFs** of various sizes
6. **Monitor file sizes** - report if they grow unexpectedly

---

## 🚀 Quick Reference

```bash
# Setup
npm install && npm install -g pkg

# Development
npm run dev

# Build & Release
npm run pkg:build
./prepare-distribution.sh   # macOS/Linux
# or
prepare-distribution.bat    # Windows

# Test
./flipbook --help
./flipbook ../sample.pdf
```

---

**Ready to release?** Follow the Release Process above. 🎉


