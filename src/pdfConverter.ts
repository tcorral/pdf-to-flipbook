/**
 * PDF to WebP conversion module
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { createCanvas } from 'canvas';
import { spawn } from 'child_process';
import { PageInfo } from './types.js';

export class PDFConverter {
  private pdfPath: string;
  private outputDir: string;
  private dpi: number;
  private quality: number;

  constructor(pdfPath: string, outputDir: string, dpi: number = 150, quality: number = 85) {
    this.pdfPath = pdfPath;
    this.outputDir = outputDir;
    this.dpi = dpi;
    this.quality = quality;
  }

  /**
   * Validate PDF file and return page count
   */
  async validatePDF(): Promise<number> {
    try {
      // Extract actual page count from PDF using pdftoppm
      const tempDir = path.join(this.outputDir, '.temp-validate');
      
      // Clean up if exists
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        // Run pdftoppm to count pages
        const result = await this.runPdftoppmTest(tempDir);
        const pageCount = result;
        
        console.log(`✅ PDF validated successfully!`);
        console.log(`📄 Total pages: ${pageCount}`);
        return pageCount;
      } finally {
        // Clean up temp directory
        try {
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      console.error(`❌ Error validating PDF: ${error}`);
      throw new Error('Failed to validate PDF file');
    }
  }

  /**
   * Test pdftoppm to count pages
   */
  private runPdftoppmTest(tempDir: string): Promise<number> {
    return new Promise((resolve) => {
      const args = [
        '-png',
        '-r', '72',
        this.pdfPath,
        path.join(tempDir, 'test')
      ];

      const pdftoppm = spawn('pdftoppm', args);

      pdftoppm.on('close', () => {
        try {
          // Count generated files
          const files = fs.readdirSync(tempDir).filter(f => f.startsWith('test-') && f.endsWith('.png'));
          resolve(files.length > 0 ? files.length : 1);
        } catch (e) {
          resolve(1); // Fallback to 1 page
        }
      });

      pdftoppm.on('error', () => {
        resolve(1); // Fallback to 1 page
      });
    });
  }

  /**
   * Convert PDF pages to WebP images using pdftoppm and ImageMagick
   */
  async convertToWebP(): Promise<PageInfo[]> {
    const pagesDir = path.join(this.outputDir, 'files', 'page');
    
    try {
      // Ensure output directory exists
      fs.mkdirSync(pagesDir, { recursive: true });

      console.log(`\n🔄 Converting PDF to WebP format...`);
      console.log(`📁 Output directory: ${pagesDir}`);
      
      const pageCount = await this.validatePDF();
      const pages: PageInfo[] = [];

      // Use pdftoppm to render PDF pages to PPM (then convert to WebP)
      const tempDir = path.join(this.outputDir, '.temp');
      fs.mkdirSync(tempDir, { recursive: true });

      // Render PDF to PNG files using pdftoppm
      await this.renderPDFWithPdftoppm(tempDir, pageCount);
      
      // Detect the file naming format used by pdftoppm
      // pdftoppm uses dynamic padding: 1-99 pages = 2 digits, 100+ pages = 3 digits, etc.
      const paddingDigits = this.detectPdftoppmPadding(tempDir, pageCount);
      
      // Convert PNG files to WebP
      for (let i = 1; i <= pageCount; i++) {
        // pdftoppm generates files with dynamic padding based on page count
        const pageNum = String(i).padStart(paddingDigits, '0');
        const pngPath = path.join(tempDir, `page-${pageNum}.png`);
        const outputPath = path.join(pagesDir, `${String(i).padStart(3, '0')}.webp`);
        
        if (fs.existsSync(pngPath)) {
          // Convert PNG to WebP using sharp
          await sharp(pngPath)
            .webp({ quality: this.quality })
            .toFile(outputPath);
          
          const actualSize = fs.statSync(outputPath).size;
          const progress = (i / pageCount) * 100;
          console.log(`  ✓ Page ${i}/${pageCount} (${progress.toFixed(1)}%) - ${(actualSize / 1024).toFixed(1)} KB`);
          
          pages.push({
            pageNumber: i,
            fileSize: actualSize,
            filePath: outputPath,
          });
        } else {
          console.warn(`⚠️  Warning: PNG file not found for page ${i}: ${pngPath}`);
        }
      }
      
      // Clean up temporary PNG files after conversion
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      console.log(`\n✅ All pages converted successfully!`);
      return pages;
    } catch (error) {
      console.error(`❌ Error converting PDF: ${error}`);
      throw error;
    }
  }

  /**
   * Detect the padding digits used by pdftoppm for file naming
   * pdftoppm dynamically adjusts padding: 1-99 = 2 digits, 100-999 = 3 digits, etc.
   */
  private detectPdftoppmPadding(tempDir: string, pageCount: number): number {
    try {
      const files = fs.readdirSync(tempDir).filter(f => f.startsWith('page-') && f.endsWith('.png'));
      if (files.length === 0) {
        // Fallback based on page count
        return pageCount > 99 ? 3 : 2;
      }
      
      // Extract the numeric part from the first file
      // e.g., "page-01.png" → "01" → length 2
      const firstFile = files[0];
      const match = firstFile.match(/page-(\d+)\.png/);
      if (match) {
        return match[1].length;
      }
      
      // Fallback
      return pageCount > 99 ? 3 : 2;
    } catch (e) {
      // Fallback based on page count
      return pageCount > 99 ? 3 : 2;
    }
  }

  /**
   * Render PDF using pdftoppm command
   */
  private renderPDFWithPdftoppm(outputDir: string, pageCount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // pdftoppm: -png output PNG format (better than PPM), -r DPI resolution
      const args = [
        '-png',
        '-r', String(this.dpi),
        this.pdfPath,
        path.join(outputDir, 'page')
      ];

      const pdftoppm = spawn('pdftoppm', args);
      
      let stderrOutput = '';
      let stdoutOutput = '';

      pdftoppm.stdout.on('data', (data) => {
        stdoutOutput += data.toString();
      });

      pdftoppm.stderr.on('data', (data) => {
        stderrOutput += data.toString();
      });

      pdftoppm.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`pdftoppm failed with code ${code}: ${stderrOutput || stdoutOutput}`));
        }
      });

      pdftoppm.on('error', (err) => {
        reject(new Error(`Failed to execute pdftoppm. Make sure it's installed: ${err.message}`));
      });
    });
  }

  /**
   * Create a placeholder WebP image for demonstration
   */
  private async createPlaceholderWebP(outputPath: string, pageNum: number, totalPages: number): Promise<void> {
    const width = 1440;
    const height = 1920;
    
    // Create a canvas with page content
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, width, 100);

    // Page number text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Page ${pageNum}`, width / 2, 60);

    // Body text (simulate content)
    ctx.fillStyle = '#333333';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    
    const lines = [
      'Lorem ipsum dolor sit amet,',
      'consectetur adipiscing elit.',
      '',
      `This is page ${pageNum} of ${totalPages}`,
      'from the Los Caminantes PDF',
      '',
      'Converted using PDF to Flipbook',
      'TypeScript converter',
    ];

    let y = 200;
    lines.forEach((line) => {
      ctx.fillText(line, 100, y);
      y += 80;
    });

    // Footer
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, height - 40, width, 40);
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Page ${pageNum}/${totalPages}`, width / 2, height - 15);

    // Convert canvas to buffer and save as WebP
    const buffer = canvas.toBuffer('image/png');
    
    // Use sharp to convert PNG buffer to WebP
    await sharp(buffer)
      .webp({ quality: this.quality })
      .toFile(outputPath);
  }

  /**
   * Calculate total size of all converted pages
   */
  calculateTotalSize(pages: PageInfo[]): number {
    return pages.reduce((total, page) => total + page.fileSize, 0);
  }
}

