/**
 * Unit tests for PDFToFlipbookConverter class
 */

import * as fs from 'fs';
import { PDFToFlipbookConverter } from '../index.js';
import { PDFConverter } from '../pdfConverter.js';
import { FlipbookGenerator } from '../flipbookGenerator.js';
import { ConversionOptions, ConversionResult } from '../types.js';

// Mock dependencies
jest.mock('fs');
jest.mock('../pdfConverter.js');
jest.mock('../flipbookGenerator.js');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPDFConverter = PDFConverter as jest.MockedClass<typeof PDFConverter>;
const mockedFlipbookGenerator = FlipbookGenerator as jest.Mocked<typeof FlipbookGenerator>;

describe('PDFToFlipbookConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fs methods
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.rmSync.mockImplementation();
  });

  describe('convert', () => {
    it('should successfully convert PDF to flipbook', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
        dpi: 150,
        quality: 85,
        title: 'Test Flipbook',
        subtitle: 'Test Subtitle',
      };

      // Mock PDFConverter
      const mockConverterInstance = {
        validatePDF: jest.fn().mockResolvedValue(5),
        convertToWebP: jest.fn().mockResolvedValue([
          { pageNumber: 1, fileSize: 1000, filePath: 'page1.webp' },
          { pageNumber: 2, fileSize: 2000, filePath: 'page2.webp' },
        ]),
        calculateTotalSize: jest.fn().mockReturnValue(3000),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      // Mock FlipbookGenerator
      (mockedFlipbookGenerator.generateHTML as jest.Mock).mockReturnValue('<html>Test HTML</html>');
      (mockedFlipbookGenerator.saveHTML as jest.Mock).mockImplementation();

      // Mock Date.now for duration calculation
      const mockDateNow = jest.spyOn(Date, 'now');
      mockDateNow.mockReturnValueOnce(1000).mockReturnValueOnce(1500);

      const result = await PDFToFlipbookConverter.convert(options);

      expect(result.success).toBe(true);
      expect(result.totalPages).toBe(5);
      expect(result.outputPath).toBe('/path/to/output');
      expect(result.totalSize).toBe(3000);
      expect(result.duration).toBe(0.5);
      expect(result.message).toContain('Successfully converted PDF to flipbook');

      // Verify PDFConverter was instantiated correctly
      expect(mockedPDFConverter).toHaveBeenCalledWith(
        '/path/to/test.pdf',
        '/path/to/output',
        150,
        85
      );

      // Verify FlipbookGenerator calls
      expect(mockedFlipbookGenerator.generateHTML).toHaveBeenCalledWith({
        title: 'Test Flipbook',
        subtitle: 'Test Subtitle',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      }, undefined, undefined);
      expect(mockedFlipbookGenerator.saveHTML).toHaveBeenCalled();

      mockDateNow.mockRestore();
    });

    it('should use default values when options are not provided', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
      };

      const mockConverterInstance = {
        validatePDF: jest.fn().mockResolvedValue(3),
        convertToWebP: jest.fn().mockResolvedValue([]),
        calculateTotalSize: jest.fn().mockReturnValue(0),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      (mockedFlipbookGenerator.generateHTML as jest.Mock).mockReturnValue('<html></html>');
      (mockedFlipbookGenerator.saveHTML as jest.Mock).mockImplementation();

      const mockDateNow = jest.spyOn(Date, 'now');
      mockDateNow.mockReturnValueOnce(1000).mockReturnValueOnce(2000);

      await PDFToFlipbookConverter.convert(options);

      expect(mockedPDFConverter).toHaveBeenCalledWith(
        '/path/to/test.pdf',
        '/path/to/output',
        150, // default dpi
        85   // default quality
      );

      expect(mockedFlipbookGenerator.generateHTML).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Flipbook',
          subtitle: 'Interactive Flipbook Viewer',
        }),
        undefined, undefined
      );

      mockDateNow.mockRestore();
    });

    it('should handle PDF file not found', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/nonexistent.pdf',
        outputDir: '/path/to/output',
      };

      mockedFs.existsSync.mockReturnValue(false);

      const result = await PDFToFlipbookConverter.convert(options);

      expect(result.success).toBe(false);
      expect(result.totalPages).toBe(0);
      expect(result.message).toContain('PDF file not found');
    });

    it('should handle PDFConverter validation errors', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
      };

      const mockConverterInstance = {
        validatePDF: jest.fn().mockRejectedValue(new Error('PDF validation failed')),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      const result = await PDFToFlipbookConverter.convert(options);

      expect(result.success).toBe(false);
      expect(result.message).toContain('PDF validation failed');
    });

    it('should handle conversion errors', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
      };

      const mockConverterInstance = {
        validatePDF: jest.fn().mockResolvedValue(5),
        convertToWebP: jest.fn().mockRejectedValue(new Error('Conversion failed')),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      const result = await PDFToFlipbookConverter.convert(options);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Conversion failed');
    });

    it('should clean existing output directory', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
      };

      const mockConverterInstance = {
        validatePDF: jest.fn().mockResolvedValue(1),
        convertToWebP: jest.fn().mockResolvedValue([]),
        calculateTotalSize: jest.fn().mockReturnValue(0),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      (mockedFlipbookGenerator.generateHTML as jest.Mock).mockReturnValue('<html></html>');
      (mockedFlipbookGenerator.saveHTML as jest.Mock).mockImplementation();

      await PDFToFlipbookConverter.convert(options);

      expect(mockedFs.rmSync).toHaveBeenCalledWith('/path/to/output', {
        recursive: true,
        force: true,
      });
    });

    it('should create README and Quick Start files', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
      };

      const mockConverterInstance = {
        validatePDF: jest.fn().mockResolvedValue(3),
        convertToWebP: jest.fn().mockResolvedValue([]),
        calculateTotalSize: jest.fn().mockReturnValue(0),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      (mockedFlipbookGenerator.generateHTML as jest.Mock).mockReturnValue('<html></html>');
      (mockedFlipbookGenerator.saveHTML as jest.Mock).mockImplementation();

      // Mock fs.writeFileSync for README and Quick Start
      mockedFs.writeFileSync.mockImplementation();

      await PDFToFlipbookConverter.convert(options);

      // Verify README was created
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('README.md'),
        expect.stringContaining('# Interactive Flipbook Viewer'),
        'utf-8'
      );

      // Verify Quick Start was created
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('QUICK_START.txt'),
        expect.stringContaining('INTERACTIVE FLIPBOOK VIEWER'),
        'utf-8'
      );
    });

    it('should pass custom template directory to FlipbookGenerator', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
        templateDir: '/custom/templates',
      };

      const mockConverterInstance = {
        validatePDF: jest.fn().mockResolvedValue(5),
        convertToWebP: jest.fn().mockResolvedValue([]),
        calculateTotalSize: jest.fn().mockReturnValue(0),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      (mockedFlipbookGenerator.generateHTML as jest.Mock).mockReturnValue('<html></html>');
      (mockedFlipbookGenerator.saveHTML as jest.Mock).mockImplementation();

      await PDFToFlipbookConverter.convert(options);

      expect(mockedFlipbookGenerator.generateHTML).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Flipbook',
          subtitle: 'Interactive Flipbook Viewer',
          totalPages: 5,
          pageCount: 5,
        }),
        '/custom/templates', // templateDir should be passed
        undefined // themeDir should be undefined
      );
    });

    it('should pass custom theme directory to FlipbookGenerator', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
        themeDir: '/custom/themes',
      };

      const mockConverterInstance = {
        validatePDF: jest.fn().mockResolvedValue(5),
        convertToWebP: jest.fn().mockResolvedValue([]),
        calculateTotalSize: jest.fn().mockReturnValue(0),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      (mockedFlipbookGenerator.generateHTML as jest.Mock).mockReturnValue('<html></html>');
      (mockedFlipbookGenerator.saveHTML as jest.Mock).mockImplementation();

      await PDFToFlipbookConverter.convert(options);

      expect(mockedFlipbookGenerator.generateHTML).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Flipbook',
          subtitle: 'Interactive Flipbook Viewer',
          totalPages: 5,
          pageCount: 5,
        }),
        undefined, // templateDir should be undefined
        '/custom/themes' // themeDir should be passed
      );
    });

    it('should pass both custom template and theme directories to FlipbookGenerator', async () => {
      const options: ConversionOptions = {
        pdfPath: '/path/to/test.pdf',
        outputDir: '/path/to/output',
        templateDir: '/custom/templates',
        themeDir: '/custom/themes',
        title: 'Custom Book',
        subtitle: 'Custom Subtitle',
      };

      const mockConverterInstance = {
        validatePDF: jest.fn().mockResolvedValue(3),
        convertToWebP: jest.fn().mockResolvedValue([]),
        calculateTotalSize: jest.fn().mockReturnValue(0),
      };
      mockedPDFConverter.mockImplementation(() => mockConverterInstance as any);

      (mockedFlipbookGenerator.generateHTML as jest.Mock).mockReturnValue('<html></html>');
      (mockedFlipbookGenerator.saveHTML as jest.Mock).mockImplementation();

      await PDFToFlipbookConverter.convert(options);

      expect(mockedFlipbookGenerator.generateHTML).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Custom Book',
          subtitle: 'Custom Subtitle',
          totalPages: 3,
          pageCount: 3,
        }),
        '/custom/templates', // templateDir should be passed
        '/custom/themes' // themeDir should be passed
      );
    });
  });
});
