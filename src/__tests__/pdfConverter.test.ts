/**
 * Unit tests for PDFConverter class
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import sharp from 'sharp';
import { PDFConverter } from '../pdfConverter.js';

// Mock external dependencies
jest.mock('fs');
jest.mock('child_process');
jest.mock('sharp');
jest.mock('canvas', () => ({
  createCanvas: jest.fn(),
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockedSharp = sharp as jest.MockedFunction<typeof sharp>;

describe('PDFConverter', () => {
  let converter: PDFConverter;
  const testPdfPath = '/path/to/test.pdf';
  const testOutputDir = '/path/to/output';

  beforeEach(() => {
    jest.clearAllMocks();
    converter = new PDFConverter(testPdfPath, testOutputDir, 150, 85);

    // Reset all fs mocks to defaults
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.mkdirSync.mockImplementation();
    mockedFs.rmSync.mockImplementation();
    mockedFs.readdirSync.mockImplementation((dirPath: any) => {
      // Mock based on directory path and expected file patterns
      if (typeof dirPath === 'string' && dirPath.includes('.temp-validate')) {
        return ['test-001.png', 'test-002.png'] as any;
      }
      if (typeof dirPath === 'string' && dirPath.includes('.temp')) {
        return ['page-001.png', 'page-002.png'] as any;
      }
      return ['page-001.png', 'page-002.png'] as any;
    });
    mockedFs.statSync.mockReturnValue({ size: 102400 } as any);
  });

  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      expect(converter['pdfPath']).toBe(testPdfPath);
      expect(converter['outputDir']).toBe(testOutputDir);
      expect(converter['dpi']).toBe(150);
      expect(converter['quality']).toBe(85);
    });

    it('should use default values for dpi and quality', () => {
      const defaultConverter = new PDFConverter(testPdfPath, testOutputDir);
      expect(defaultConverter['dpi']).toBe(150);
      expect(defaultConverter['quality']).toBe(85);
    });
  });

  describe('validatePDF', () => {
    beforeEach(() => {
      // Mock spawn for pdftoppm
      const mockChildProcess = {
        on: jest.fn(),
      };
      mockChildProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // Success
        }
        return mockChildProcess;
      });

      mockedSpawn.mockReturnValue(mockChildProcess as any);
    });

    it('should validate PDF and return page count', async () => {
      // The mock is already set up in beforeEach to return 2 test files for .temp-validate directories
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const pageCount = await converter.validatePDF();

      expect(pageCount).toBe(2);
      expect(consoleSpy).toHaveBeenCalledWith('✅ PDF validated successfully!');
      expect(consoleSpy).toHaveBeenCalledWith('📄 Total pages: 2');

      consoleSpy.mockRestore();
    });

    it('should return 1 page when pdftoppm test returns 1', async () => {
      // Override the mock to return only 1 file for this specific test
      mockedFs.readdirSync.mockReturnValueOnce(['test-001.png'] as any);

      const pageCount = await converter.validatePDF();
      expect(pageCount).toBe(1);
    });

    it('should handle pdftoppm spawn errors', async () => {
      const mockChildProcess = {
        on: jest.fn(),
      };
      mockChildProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(1); // Error
        }
        return mockChildProcess;
      });

      mockedSpawn.mockReturnValue(mockChildProcess as any);

      // Override readdirSync to return empty array (simulating pdftoppm failure)
      mockedFs.readdirSync.mockReturnValueOnce([]);

      // Should still return 1 as fallback
      const result = await converter.validatePDF();
      expect(result).toBe(1);
    });
  });

  describe('runPdftoppmTest', () => {
    it('should return page count from pdftoppm output', async () => {
      const mockChildProcess = {
        on: jest.fn(),
      };
      mockChildProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // Success
        }
        return mockChildProcess;
      });

      mockedSpawn.mockReturnValue(mockChildProcess as any);
      // Override the mock for this specific test
      mockedFs.readdirSync.mockReturnValueOnce(['test-001.png', 'test-002.png', 'test-003.png'] as any);

      const result = await (converter as any).runPdftoppmTest('/temp/dir');
      expect(result).toBe(3);
    });

    it('should fallback to 1 page when no files found', async () => {
      const mockChildProcess = {
        on: jest.fn(),
      };
      mockChildProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // Success
        }
        return mockChildProcess;
      });

      mockedSpawn.mockReturnValue(mockChildProcess as any);
      // Override the mock for this specific test
      mockedFs.readdirSync.mockReturnValueOnce([]);

      const result = await (converter as any).runPdftoppmTest('/temp/dir');
      expect(result).toBe(1);
    });
  });

  describe('convertToWebP', () => {
    beforeEach(() => {
      // Reset sharp mock
      mockedSharp.mockClear();

      // Mock sharp to always return the same instance
      const mockSharpInstance = {
        webp: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined),
      };
      mockedSharp.mockImplementation(() => mockSharpInstance as any);

      // Mock spawn for pdftoppm
      const mockChildProcess = {
        on: jest.fn(),
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
      };
      mockChildProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // Success
        }
        return mockChildProcess;
      });

      mockedSpawn.mockReturnValue(mockChildProcess as any);
    });

    it('should convert PDF pages to WebP successfully', async () => {
      // The mocks are already set up correctly in beforeEach
      // validatePDF will return 2 pages, and renderPDFWithPdftoppm will create 2 PNG files
      mockedFs.existsSync.mockImplementation((filePath: any) => {
        // Return true for PNG files that should exist
        return typeof filePath === 'string' && (
          filePath.endsWith('page-001.png') ||
          filePath.endsWith('page-002.png') ||
          filePath.endsWith('001.webp') ||
          filePath.endsWith('002.webp')
        );
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await converter.convertToWebP();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        pageNumber: 1,
        fileSize: 102400,
        filePath: path.join(testOutputDir, 'files', 'page', '001.webp'),
      });
      expect(result[1]).toEqual({
        pageNumber: 2,
        fileSize: 102400,
        filePath: path.join(testOutputDir, 'files', 'page', '002.webp'),
      });

      consoleSpy.mockRestore();
    });

    it('should handle missing PNG files gracefully', async () => {
      // The readdirSync mock is already set up in beforeEach
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock existsSync to return false for page 2's PNG file
      mockedFs.existsSync.mockImplementation((filePath: any) => {
        // Return false only for page-002.png
        return !(typeof filePath === 'string' && filePath.endsWith('page-002.png'));
      });

      const result = await converter.convertToWebP();

      expect(result).toHaveLength(1);
      expect(result[0].pageNumber).toBe(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: PNG file not found for page 2')
      );

      consoleSpy.mockRestore();
    });

    it('should handle conversion errors', async () => {
      mockedSharp.mockImplementation(() => {
        throw new Error('Sharp conversion error');
      });

      await expect(converter.convertToWebP()).rejects.toThrow('Sharp conversion error');
    });
  });

  describe('detectPdftoppmPadding', () => {
    it('should detect 2-digit padding for small page counts', () => {
      mockedFs.readdirSync.mockReturnValueOnce(['page-01.png', 'page-02.png'] as any);

      const result = (converter as any).detectPdftoppmPadding('/temp/dir', 2);
      expect(result).toBe(2);
    });

    it('should detect 3-digit padding for larger page counts', () => {
      mockedFs.readdirSync.mockReturnValueOnce(['page-001.png', 'page-002.png'] as any);

      const result = (converter as any).detectPdftoppmPadding('/temp/dir', 150);
      expect(result).toBe(3);
    });

    it('should fallback based on page count when no files found', () => {
      mockedFs.readdirSync.mockReturnValueOnce([]);

      const result = (converter as any).detectPdftoppmPadding('/temp/dir', 150);
      expect(result).toBe(3);
    });
  });

  describe('renderPDFWithPdftoppm', () => {
    it('should execute pdftoppm successfully', async () => {
      const mockChildProcess = {
        on: jest.fn(),
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
      };
      mockChildProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // Success
        }
        return mockChildProcess;
      });

      mockedSpawn.mockReturnValue(mockChildProcess as any);

      await expect((converter as any).renderPDFWithPdftoppm('/output/dir', 5)).resolves.toBeUndefined();

      expect(mockedSpawn).toHaveBeenCalledWith('pdftoppm', [
        '-png',
        '-r', '150',
        testPdfPath,
        path.join('/output/dir', 'page')
      ]);
    });

    it('should handle pdftoppm errors', async () => {
      const mockChildProcess = {
        on: jest.fn(),
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
      };
      mockChildProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(1); // Error
        }
        return mockChildProcess;
      });

      mockedSpawn.mockReturnValue(mockChildProcess as any);

      await expect((converter as any).renderPDFWithPdftoppm('/output/dir', 5))
        .rejects.toThrow('pdftoppm failed with code 1');
    });
  });

  describe('calculateTotalSize', () => {
    it('should calculate total size of all pages', () => {
      const pages = [
        { pageNumber: 1, fileSize: 1000, filePath: 'page1.webp' },
        { pageNumber: 2, fileSize: 2000, filePath: 'page2.webp' },
        { pageNumber: 3, fileSize: 1500, filePath: 'page3.webp' },
      ];

      const result = converter.calculateTotalSize(pages);
      expect(result).toBe(4500);
    });

    it('should return 0 for empty pages array', () => {
      const result = converter.calculateTotalSize([]);
      expect(result).toBe(0);
    });
  });
});
