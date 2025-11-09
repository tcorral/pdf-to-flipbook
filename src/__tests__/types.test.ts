/**
 * Unit tests for types.ts
 */

import { ConversionOptions, ConversionResult, PageInfo, FlipbookConfig } from '../types.js';

describe('Types', () => {
  describe('ConversionOptions interface', () => {
    it('should allow creation of valid ConversionOptions object', () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
        dpi: 150,
        quality: 85,
        title: 'Test Flipbook',
        subtitle: 'Test Subtitle'
      };

      expect(options.pdfPath).toBe('/path/to/test.pdf');
      expect(options.outputDir).toBe('/path/to/output');
      expect(options.dpi).toBe(150);
      expect(options.quality).toBe(85);
      expect(options.title).toBe('Test Flipbook');
      expect(options.subtitle).toBe('Test Subtitle');
      expect(options.templateDir).toBeUndefined();
      expect(options.themeDir).toBeUndefined();
    });

    it('should allow creation of ConversionOptions with custom templates and themes', () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
        templateDir: '/custom/templates',
        themeDir: '/custom/themes',
        title: 'Custom Flipbook',
        subtitle: 'Custom Subtitle'
      };

      expect(options.pdfPath).toBe('/path/to/test.pdf');
      expect(options.outputDir).toBe('/path/to/output');
      expect(options.templateDir).toBe('/custom/templates');
      expect(options.themeDir).toBe('/custom/themes');
      expect(options.title).toBe('Custom Flipbook');
      expect(options.subtitle).toBe('Custom Subtitle');
    });

    it('should allow partial ConversionOptions object', () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output'
      };

      expect(options.pdfPath).toBe('/path/to/test.pdf');
      expect(options.outputDir).toBe('/path/to/output');
      expect(options.dpi).toBeUndefined();
      expect(options.quality).toBeUndefined();
      expect(options.title).toBeUndefined();
      expect(options.subtitle).toBeUndefined();
    });
  });

  describe('ConversionResult interface', () => {
    it('should allow creation of valid ConversionResult object', () => {
      const result: ConversionResult = {
        success: true,
        totalPages: 10,
        outputPath: '/path/to/output',
        totalSize: 1024000,
        duration: 5.5,
        message: 'Conversion successful'
      };

      expect(result.success).toBe(true);
      expect(result.totalPages).toBe(10);
      expect(result.outputPath).toBe('/path/to/output');
      expect(result.totalSize).toBe(1024000);
      expect(result.duration).toBe(5.5);
      expect(result.message).toBe('Conversion successful');
    });

    it('should allow failed ConversionResult object', () => {
      const result: ConversionResult = {
        success: false,
        totalPages: 0,
        outputPath: '/path/to/output',
        totalSize: 0,
        duration: 0.1,
        message: 'Conversion failed: PDF not found'
      };

      expect(result.success).toBe(false);
      expect(result.totalPages).toBe(0);
      expect(result.totalSize).toBe(0);
      expect(result.duration).toBe(0.1);
    });
  });

  describe('PageInfo interface', () => {
    it('should allow creation of valid PageInfo object', () => {
      const pageInfo: PageInfo = {
        pageNumber: 5,
        fileSize: 51200,
        filePath: '/path/to/page/005.webp'
      };

      expect(pageInfo.pageNumber).toBe(5);
      expect(pageInfo.fileSize).toBe(51200);
      expect(pageInfo.filePath).toBe('/path/to/page/005.webp');
    });
  });

  describe('FlipbookConfig interface', () => {
    it('should allow creation of valid FlipbookConfig object', () => {
      const config: FlipbookConfig = {
        title: 'My Flipbook',
        subtitle: 'Interactive Viewer',
        totalPages: 20,
        pageCount: 20,
        headerColor1: '#667eea',
        headerColor2: '#764ba2'
      };

      expect(config.title).toBe('My Flipbook');
      expect(config.subtitle).toBe('Interactive Viewer');
      expect(config.totalPages).toBe(20);
      expect(config.pageCount).toBe(20);
      expect(config.headerColor1).toBe('#667eea');
      expect(config.headerColor2).toBe('#764ba2');
    });
  });
});
