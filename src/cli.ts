#!/usr/bin/env node

/**
 * Command-line interface for PDF to Flipbook converter
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PDFToFlipbookConverter } from './index.js';

// Declare pkg property for TypeScript
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: boolean;
    }
  }
}

// Set up sharp library path for standalone executables
// When distributed, sharp bindings are in ../sharp relative to executable
if ((process as any).pkg) {
  // Running as pkg executable
  const execPath = process.execPath;
  const execDir = path.dirname(execPath);
  const sharpPath = path.join(execDir, 'sharp');
  
  if (fs.existsSync(sharpPath)) {
    // Set NODE_PATH to include sharp libraries
    process.env.NODE_PATH = sharpPath + (process.env.NODE_PATH ? ':' + process.env.NODE_PATH : '');
    
    // Try to set sharp's library paths
    if (fs.existsSync(path.join(sharpPath, 'vendor', 'lib'))) {
      process.env.LD_LIBRARY_PATH = path.join(sharpPath, 'vendor', 'lib') + (process.env.LD_LIBRARY_PATH ? ':' + process.env.LD_LIBRARY_PATH : '');
      process.env.DYLD_LIBRARY_PATH = path.join(sharpPath, 'vendor', 'lib') + (process.env.DYLD_LIBRARY_PATH ? ':' + process.env.DYLD_LIBRARY_PATH : '');
    }
  }
}

// Parse command line arguments
export function parseArgs(): {
  pdfPath: string;
  outputDir: string;
  dpi: number;
  quality: number;
  title: string;
  subtitle: string;
  templateDir?: string;
  themeDir?: string;
} {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  let pdfPath = '';
  let outputDir = '';
  let dpi = 150;
  let quality = 85;
  let title = 'Flipbook';
  let subtitle = 'Interactive Flipbook Viewer';
  let templateDir: string | undefined;
  let themeDir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--pdf':
      case '-p':
        pdfPath = args[i + 1];
        i++;
        break;
      case '--output':
      case '-o':
        outputDir = args[i + 1];
        i++;
        break;
      case '--dpi':
        dpi = parseInt(args[i + 1], 10);
        i++;
        break;
      case '--quality':
      case '-q':
        quality = parseInt(args[i + 1], 10);
        i++;
        break;
      case '--title':
      case '-t':
        title = args[i + 1];
        i++;
        break;
      case '--subtitle':
      case '-s':
        subtitle = args[i + 1];
        i++;
        break;
      case '--template-dir':
        templateDir = args[i + 1];
        i++;
        break;
      case '--theme-dir':
        themeDir = args[i + 1];
        i++;
        break;
      default:
        // First positional argument is PDF path, second is output
        if (!pdfPath && !args[i].startsWith('-')) {
          pdfPath = args[i];
        } else if (!outputDir && !args[i].startsWith('-')) {
          outputDir = args[i];
        }
    }
  }

  // Validate required arguments
  if (!pdfPath) {
    console.error('❌ Error: PDF path is required');
    console.error('\nUsage: pdf-to-flipbook <pdf-path> [output-dir] [options]');
    console.error('\nRun with --help for more information');
    process.exit(1);
  }

  // Set default output directory
  if (!outputDir) {
    const filename = path.parse(pdfPath).name;
    outputDir = path.join(process.cwd(), `${filename}_flipbook`);
  }

  return { pdfPath, outputDir, dpi, quality, title, subtitle, templateDir, themeDir };
}

export function printHelp(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                  PDF to Flipbook Converter (TypeScript/Node.js)          ║
╚════════════════════════════════════════════════════════════════════════════╝

USAGE
  pdf-to-flipbook <pdf-path> [output-dir] [options]

POSITIONAL ARGUMENTS
  pdf-path          Path to the PDF file to convert (required)
  output-dir        Output directory for the flipbook (default: current dir)

OPTIONS
  --pdf, -p         Specify PDF file path
  --output, -o      Specify output directory
  --dpi              DPI for conversion (default: 150)
  --quality, -q     Image quality 0-100 (default: 85)
  --title, -t        Flipbook title (default: "Flipbook")
  --subtitle, -s    Flipbook subtitle (default: "Interactive Flipbook Viewer")
  --template-dir     Directory containing custom HTML templates
  --theme-dir        Directory containing custom CSS themes
  --help, -h        Show this help message

EXAMPLES
  # Convert PDF with defaults
  pdf-to-flipbook book.pdf

  # Specify output directory
  pdf-to-flipbook book.pdf ./output

  # Custom settings
  pdf-to-flipbook --pdf book.pdf --output ./flipbooks --quality 90 --title "My Book"

  # All options
  pdf-to-flipbook -p document.pdf -o ./output -q 85 -t "Custom Title" -s "My Subtitle"

OUTPUT
  The converter creates an interactive HTML flipbook with:
  - flipbook.html          Main viewer (open in browser)
  - README.md              Full documentation
  - QUICK_START.txt        Quick reference guide
  - files/page/            WebP page images (001.webp, 002.webp, etc.)

FEATURES
  ✓ Convert PDF pages to optimized WebP images
  ✓ Generate interactive HTML5 flipbook viewer
  ✓ Fully offline - no internet required
  ✓ Responsive design for all devices
  ✓ Multiple navigation methods
  ✓ Smooth page transitions and animations

BROWSER SUPPORT
  ✓ Chrome/Chromium
  ✓ Firefox
  ✓ Safari
  ✓ Edge
  ✓ Mobile browsers

FOR MORE INFORMATION
  Visit: https://github.com/pdf-to-flipbook
  Email: support@pdf-to-flipbook.dev
`);
}

export async function main(): Promise<void> {
  try {
    const args = parseArgs();

    // Resolve paths
    const pdfPath = path.resolve(args.pdfPath);
    const outputDir = path.resolve(args.outputDir);

    // Run conversion
    const result = await PDFToFlipbookConverter.convert({
      pdfPath,
      outputDir,
      dpi: args.dpi,
      quality: args.quality,
      title: args.title,
      subtitle: args.subtitle,
      templateDir: args.templateDir,
      themeDir: args.themeDir,
    });

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run CLI only when executed directly (not when imported for testing)
if (typeof jest === 'undefined') {
  main();
}

