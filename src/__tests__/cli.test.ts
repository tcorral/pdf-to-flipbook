/**
 * Unit tests for CLI module
 */

import * as path from 'path';
import { PDFToFlipbookConverter } from '../index.js';

// Mock dependencies
jest.mock('../index.js');
jest.mock('path');
jest.mock('fs');

const mockedPDFToFlipbookConverter = PDFToFlipbookConverter as jest.Mocked<typeof PDFToFlipbookConverter>;
const mockedPath = path as jest.Mocked<typeof path>;

describe('CLI', () => {
  let originalArgv: string[];
  let originalExit: (code?: number) => never;
  let originalCwd: () => string;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock process.argv, process.exit, and process.cwd
    originalArgv = process.argv;
    originalExit = process.exit;
    originalCwd = process.cwd;

    process.exit = jest.fn().mockImplementation((code?: number) => {
      throw new Error(`Process exited with code ${code}`);
    }) as any;
    process.cwd = jest.fn().mockReturnValue('/current/dir');

    // Mock path methods
    mockedPath.parse.mockReturnValue({
      name: 'test',
      dir: '/path',
      ext: '.pdf',
      base: 'test.pdf',
    } as any);
    mockedPath.resolve.mockImplementation((...args) => args.join('/'));
    mockedPath.join.mockImplementation((...args) => args.join('/'));

    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    process.cwd = originalCwd;
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('parseArgs', () => {
    // Import the exported functions directly
    let parseArgs: any;
    let printHelp: any;

    beforeAll(async () => {
      // Import the CLI module to access exported functions
      const cliModule = await import('../cli.js');
      parseArgs = cliModule.parseArgs;
      printHelp = cliModule.printHelp;
    });

    it('should parse basic positional arguments', () => {
      process.argv = ['node', 'cli.js', 'test.pdf', './output'];

      const result = parseArgs();

      expect(result.pdfPath).toBe('test.pdf');
      expect(result.outputDir).toBe('./output');
      expect(result.dpi).toBe(150);
      expect(result.quality).toBe(85);
      expect(result.title).toBe('Flipbook');
      expect(result.subtitle).toBe('Interactive Flipbook Viewer');
    });

    it('should parse all long form options', () => {
      process.argv = [
        'node', 'cli.js',
        '--pdf', 'input.pdf',
        '--output', '/custom/output',
        '--dpi', '300',
        '--quality', '90',
        '--title', 'Custom Title',
        '--subtitle', 'Custom Subtitle'
      ];

      const result = parseArgs();

      expect(result.pdfPath).toBe('input.pdf');
      expect(result.outputDir).toBe('/custom/output');
      expect(result.dpi).toBe(300);
      expect(result.quality).toBe(90);
      expect(result.title).toBe('Custom Title');
      expect(result.subtitle).toBe('Custom Subtitle');
    });

    it('should parse short form options', () => {
      process.argv = [
        'node', 'cli.js',
        '-p', 'input.pdf',
        '-o', '/custom/output',
        '-q', '95',
        '-t', 'Short Title',
        '-s', 'Short Subtitle'
      ];

      const result = parseArgs();

      expect(result.pdfPath).toBe('input.pdf');
      expect(result.outputDir).toBe('/custom/output');
      expect(result.quality).toBe(95);
      expect(result.title).toBe('Short Title');
      expect(result.subtitle).toBe('Short Subtitle');
    });

    it('should use default output directory when not provided', () => {
      process.argv = ['node', 'cli.js', 'test.pdf'];

      const result = parseArgs();

      expect(result.pdfPath).toBe('test.pdf');
      expect(result.outputDir).toBe('/current/dir/test_flipbook');
    });

    it('should handle --help flag', () => {
      process.argv = ['node', 'cli.js', '--help'];

      expect(() => parseArgs()).toThrow('Process exited with code 0');
    });

    it('should handle -h flag', () => {
      process.argv = ['node', 'cli.js', '-h'];

      expect(() => parseArgs()).toThrow('Process exited with code 0');
    });

    it('should exit with error when PDF path is not provided', () => {
      process.argv = ['node', 'cli.js', '--unknown-flag'];

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => parseArgs()).toThrow('Process exited with code 1');
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error: PDF path is required');

      consoleErrorSpy.mockRestore();
    });

    it('should handle mixed positional and named arguments', () => {
      process.argv = [
        'node', 'cli.js',
        'positional.pdf',
        './positional-output',
        '--quality', '88',
        '--title', 'Mixed Title'
      ];

      const result = parseArgs();

      expect(result.pdfPath).toBe('positional.pdf');
      expect(result.outputDir).toBe('./positional-output');
      expect(result.quality).toBe(88);
      expect(result.title).toBe('Mixed Title');
      expect(result.subtitle).toBe('Interactive Flipbook Viewer'); // default
    });
  });

  describe('printHelp', () => {
    let printHelp: any;

    beforeAll(async () => {
      const cliModule = await import('../cli.js');
      printHelp = (cliModule as any).printHelp;
    });

    it('should print help information', () => {
      printHelp();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PDF to Flipbook Converter (TypeScript/Node.js)')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('USAGE')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('--help, -h')
      );
    });
  });

  describe('main', () => {
    let main: any;

    beforeAll(async () => {
      const cliModule = await import('../cli.js');
      main = (cliModule as any).main;
    });

    it('should successfully run conversion', async () => {
      process.argv = ['node', 'cli.js', 'test.pdf', './output'];

      (mockedPDFToFlipbookConverter.convert as jest.Mock).mockResolvedValue({
        success: true,
        totalPages: 5,
        outputPath: './output',
        totalSize: 100000,
        duration: 2.5,
        message: 'Success',
      });

      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      process.exit = jest.fn() as any;

      await main();

      expect(mockedPDFToFlipbookConverter.convert).toHaveBeenCalledWith({
        pdfPath: 'test.pdf',
        outputDir: './output',
        dpi: 150,
        quality: 85,
        title: 'Flipbook',
        subtitle: 'Interactive Flipbook Viewer',
      });

      expect(process.exit).toHaveBeenCalledWith(0);

      process.exit = originalExit;
    });

    it('should handle conversion failure', async () => {
      process.argv = ['node', 'cli.js', 'test.pdf'];

      (mockedPDFToFlipbookConverter.convert as jest.Mock).mockResolvedValue({
        success: false,
        totalPages: 0,
        outputPath: './output',
        totalSize: 0,
        duration: 0.1,
        message: 'Conversion failed',
      });

      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      process.exit = jest.fn() as any;

      await main();

      expect(process.exit).toHaveBeenCalledWith(1);

      process.exit = originalExit;
    });

    it('should handle fatal errors', async () => {
      process.argv = ['node', 'cli.js', 'test.pdf'];

      (mockedPDFToFlipbookConverter.convert as jest.Mock).mockRejectedValue(new Error('Fatal error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      process.exit = jest.fn() as any;

      await main();

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Fatal error:', 'Fatal error');
      expect(process.exit).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      process.exit = originalExit;
    });
  });
});
