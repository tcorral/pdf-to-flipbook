/**
 * Main PDF to Flipbook converter module
 */

import * as fs from 'fs';
import * as path from 'path';
import { PDFConverter } from './pdfConverter.js';
import { FlipbookGenerator } from './flipbookGenerator.js';
import { ConversionOptions, ConversionResult, FlipbookConfig } from './types.js';

export class PDFToFlipbookConverter {
  /**
   * Convert a PDF to an interactive flipbook
   */
  static async convert(options: ConversionOptions): Promise<ConversionResult> {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      if (!fs.existsSync(options.pdfPath)) {
        throw new Error(`PDF file not found: ${options.pdfPath}`);
      }

      const dpi = options.dpi || 150;
      const quality = options.quality || 85;
      const title = options.title || 'Flipbook';
      const subtitle = options.subtitle || 'Interactive Flipbook Viewer';

      console.log('\n' + '='.repeat(60));
      console.log('🚀 PDF to Flipbook Converter');
      console.log('='.repeat(60) + '\n');

      // Create converter instance
      const converter = new PDFConverter(options.pdfPath, options.outputDir, dpi, quality);

      // Validate PDF and get page count
      const pageCount = await converter.validatePDF();

      // Clean output directory if it exists
      if (fs.existsSync(options.outputDir)) {
        console.log(`\n🗑️  Removing existing output directory...`);
        fs.rmSync(options.outputDir, { recursive: true, force: true });
      }

      // Convert PDF pages to WebP
      const pages = await converter.convertToWebP();

      // Generate flipbook HTML
      console.log('\n📝 Generating flipbook HTML...');
      
      const flipbookConfig: FlipbookConfig = {
        title,
        subtitle,
        totalPages: pageCount,
        pageCount,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      const html = FlipbookGenerator.generateHTML(flipbookConfig);
      const htmlPath = path.join(options.outputDir, 'flipbook.html');
      FlipbookGenerator.saveHTML(html, htmlPath);
      console.log(`✅ HTML generated: ${htmlPath}`);

      // Create README
      this.createREADME(options.outputDir, pageCount);

      // Create QUICK_START
      this.createQuickStart(options.outputDir, pageCount);

      // Calculate total size
      const totalSize = converter.calculateTotalSize(pages);
      const duration = (Date.now() - startTime) / 1000;

      // Print summary
      console.log('\n' + '='.repeat(60));
      console.log('✅ FLIPBOOK CREATED SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log(`📊 Summary:`);
      console.log(`   • Total pages: ${pageCount}`);
      console.log(`   • Total size: ${(totalSize / (1024 * 1024)).toFixed(1)} MB`);
      console.log(`   • Output directory: ${options.outputDir}`);
      console.log(`   • Open: ${htmlPath}`);
      console.log(`   • Duration: ${duration.toFixed(2)}s`);
      console.log('\n' + '='.repeat(60) + '\n');

      return {
        success: true,
        totalPages: pageCount,
        outputPath: options.outputDir,
        totalSize,
        duration,
        message: `Successfully converted PDF to flipbook with ${pageCount} pages`,
      };
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      
      console.error(`\n❌ Conversion failed: ${message}`);
      
      return {
        success: false,
        totalPages: 0,
        outputPath: options.outputDir,
        totalSize: 0,
        duration,
        message: `Conversion failed: ${message}`,
      };
    }
  }

  /**
   * Create README.md file
   */
  private static createREADME(outputDir: string, pageCount: number): void {
    const readmeContent = `# Interactive Flipbook Viewer

## Overview

This is a fully offline, interactive flipbook viewer. The flipbook provides an authentic book-reading experience with smooth animations, intuitive navigation, and responsive design.

**📊 Document Statistics:**
- **Total Pages:** ${pageCount}
- **Format:** WebP images (optimized for web)
- **Resolution:** 150 DPI for optimal readability

## 🚀 Getting Started

### Opening the Flipbook

Simply open \`flipbook.html\` in any modern web browser:

1. **Double-click** \`flipbook.html\` to open in your default browser, OR
2. **Right-click** → **Open with** → Select your preferred browser (Chrome, Firefox, Safari, Edge, etc.)

The flipbook works **completely offline** after initial load—no internet connection required!

## 📖 Navigation Methods

### Button Controls
- **⏮ First** - Jump to the first page
- **◀ Previous** - Go to the previous page spread
- **Next ▶** - Go to the next page spread
- **Last ⏭** - Jump to the last page

### Keyboard Shortcuts
- \`←\` / \`→\` - Navigate between pages
- \`Space\` - Next page
- \`Home\` - First page
- \`End\` - Last page

### Mouse/Trackpad
- **Click left edge** - Go to previous page
- **Click right edge** - Go to next page

### Direct Navigation
- Enter a page number in the "Go to page" input field and press Enter

## 🎨 Display Modes

### Two-Page Spread
- **Interior pages** display as book-like two-page spreads
- Perfect for reading content across facing pages

### Single Page Display
- **Front cover** (page 1) displays alone on the right
- **Back cover** (last page) displays alone on the left
- Full-width viewing for cover pages

## 📱 Responsive Design

The flipbook automatically adapts to different screen sizes:

- **Desktop:** Optimized for widescreen monitors
- **Tablet:** Medium layout with touch-friendly buttons
- **Mobile:** Compact layout designed for smartphone viewing

## 📊 Progress Tracking

The bottom panel shows:
- **Page indicator:** Current page and total page count
- **Progress bar:** Visual representation of reading progress

## ✨ Features

✓ Beautiful two-page spread layout  
✓ Smooth page-flip animations  
✓ Works completely offline  
✓ Multiple navigation methods  
✓ Responsive design (works on desktop & mobile)  
✓ Progress bar shows where you are  
✓ No installation required  
✓ Keyboard shortcuts for power users  

## 🔧 Sharing & Distribution

Since this is a completely self-contained folder, you can:

1. **Share the entire folder** - Compress as ZIP and share
2. **Host on a web server** - Upload to any static hosting service
3. **Email the folder** - If size permits
4. **No conversion needed** - Works as-is in any environment

## 📄 Technical Details

### File Structure
\`\`\`
flipbook/
├── flipbook.html          # Main application (open this file!)
├── README.md              # This file
└── files/
    └── page/              # All page images (001.webp through ${String(pageCount).padStart(3, '0')}.webp)
\`\`\`

### Browser Compatibility
Works in all modern browsers:
- ✅ Google Chrome/Chromium
- ✅ Mozilla Firefox
- ✅ Apple Safari
- ✅ Microsoft Edge
- ✅ Mobile browsers

### Technology Stack
- **Pure HTML/CSS/JavaScript** - No build tools or dependencies required
- **WebP Format** - Modern image compression
- **CSS Animations** - Smooth page transitions
- **Responsive Layout** - Flexbox for adaptive design

## ❓ Troubleshooting

### Images not loading
- **Solution:** Keep the folder structure intact (don't move files around)

### Animations are slow
- **Solution:** Try updating your browser to the latest version

### Pages not displaying correctly
- **Solution:** Press \`Ctrl+Shift+R\` (or \`Cmd+Shift+R\` on Mac) to force refresh

---

**Created:** ${new Date().toISOString().split('T')[0]}  
**Pages:** ${pageCount}  
**Format:** Interactive WebP Flipbook  
**Offline Capable:** Yes ✓

Enjoy reading! 📚
`;

    fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent, 'utf-8');
  }

  /**
   * Create QUICK_START.txt file
   */
  private static createQuickStart(outputDir: string, pageCount: number): void {
    const quickStartContent = `╔════════════════════════════════════════════════════════════════════════════╗
║                       INTERACTIVE FLIPBOOK VIEWER                         ║
║                          QUICK START GUIDE                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

📖 HOW TO OPEN THE FLIPBOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ SIMPLEST METHOD:
   1. Double-click the file "flipbook.html"
   2. Your default browser will open it automatically
   3. That's it! Enjoy reading!

🔧 ALTERNATIVE METHODS:
   • Right-click flipbook.html → "Open with" → Choose your browser
   • Drag flipbook.html into an open browser window
   • Open your browser, then File → Open → Select flipbook.html


🎮 HOW TO NAVIGATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 USING BUTTONS:
   • Click "⏮ First" to jump to the first page
   • Click "◀ Previous" to go to the previous page
   • Click "Next ▶" to go to the next page
   • Click "Last ⏭" to jump to the last page

⌨️  KEYBOARD SHORTCUTS:
   • Press ← or → arrow keys to navigate
   • Press Space to go to next page
   • Press Home to go to first page
   • Press End to go to last page

🖱️  MOUSE CLICK:
   • Click the LEFT edge of the page to go backward
   • Click the RIGHT edge of the page to go forward

📍 JUMP TO SPECIFIC PAGE:
   • Type a page number in the "Go to page:" field
   • Press Enter to jump to that page


📊 DOCUMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Total Pages:  ${pageCount}
   Format:       Interactive Web Flipbook
   Works:        Offline (no internet needed)
   Browsers:     Chrome, Firefox, Safari, Edge, Mobile


✨ FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✓ Beautiful two-page spread layout
   ✓ Smooth page-flip animations
   ✓ Works completely offline
   ✓ Multiple navigation methods
   ✓ Responsive design (works on desktop & mobile)
   ✓ Progress bar shows where you are
   ✓ No installation required
   ✓ Keyboard shortcuts for power users


🌟 ENJOY YOUR READING! 📚
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Created: ${new Date().toISOString().split('T')[0]}
Pages: ${pageCount}
Status: Production Ready ✓
`;

    fs.writeFileSync(path.join(outputDir, 'QUICK_START.txt'), quickStartContent, 'utf-8');
  }
}

export { ConversionOptions, ConversionResult, FlipbookConfig };

