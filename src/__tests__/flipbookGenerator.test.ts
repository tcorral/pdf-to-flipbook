/**
 * Unit tests for FlipbookGenerator class
 */

import * as fs from 'fs';
import * as path from 'path';
import { FlipbookGenerator } from '../flipbookGenerator.js';
import { FlipbookConfig } from '../types.js';

// Mock fs
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('FlipbookGenerator', () => {
  describe('generateHTML', () => {
    it('should generate valid HTML with provided config', () => {
      const config: FlipbookConfig = {
        title: 'Test Flipbook',
        subtitle: 'Test Subtitle',
        totalPages: 10,
        pageCount: 10,
        headerColor1: '#ff0000',
        headerColor2: '#00ff00',
      };

      const html = FlipbookGenerator.generateHTML(config);

      // Check basic HTML structure
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<title>Test Flipbook - Flipbook Viewer</title>');

      // Check config values are used
      expect(html).toContain('<h1>Test Flipbook</h1>');
      expect(html).toContain('<p>Test Subtitle</p>');
      expect(html).toContain('linear-gradient(135deg, #ff0000 0%, #00ff00 100%)');

      // Check totalPages is used in max attribute and display
      expect(html).toContain('max="10"');
      expect(html).toContain('/ 10');

      // Check JavaScript variables
      expect(html).toContain('const totalPages = 10;');
    });

    it('should include all required CSS and JavaScript', () => {
      const config: FlipbookConfig = {
        title: 'Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      const html = FlipbookGenerator.generateHTML(config);

      // Check CSS is present
      expect(html).toContain('<style>');
      expect(html).toContain('box-sizing: border-box');
      expect(html).toContain('.flipbook-wrapper');

      // Check JavaScript is present
      expect(html).toContain('<script>');
      expect(html).toContain('function initPages()');
      expect(html).toContain('function nextPage()');
      expect(html).toContain('function previousPage()');

      // Check keyboard shortcuts
      expect(html).toContain('ArrowRight');
      expect(html).toContain('ArrowLeft');
      expect(html).toContain('Space');
      expect(html).toContain('Home');
      expect(html).toContain('End');
    });

    it('should handle single page flipbook correctly', () => {
      const config: FlipbookConfig = {
        title: 'Single Page',
        subtitle: 'One Page Only',
        totalPages: 1,
        pageCount: 1,
        headerColor1: '#000000',
        headerColor2: '#ffffff',
      };

      const html = FlipbookGenerator.generateHTML(config);

      // Check single page logic in JavaScript
      expect(html).toContain('if (totalPages === 1)');
      expect(html).toContain('files/page/001.webp');
    });

    it('should include navigation controls', () => {
      const config: FlipbookConfig = {
        title: 'Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      const html = FlipbookGenerator.generateHTML(config);

      // Check navigation buttons
      expect(html).toContain('id="firstBtn"');
      expect(html).toContain('id="prevBtn"');
      expect(html).toContain('id="nextBtn"');
      expect(html).toContain('id="lastBtn"');

      // Check page input
      expect(html).toContain('id="pageInput"');
      expect(html).toContain('id="currentPage"');
      expect(html).toContain('id="progressFill"');
    });

    it('should include responsive design CSS', () => {
      const config: FlipbookConfig = {
        title: 'Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      const html = FlipbookGenerator.generateHTML(config);

      // Check media queries
      expect(html).toContain('@media (max-width: 1024px)');
      expect(html).toContain('@media (max-width: 768px)');
    });

    it('should include keyboard shortcut hints', () => {
      const config: FlipbookConfig = {
        title: 'Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      const html = FlipbookGenerator.generateHTML(config);

      // Check shortcuts section
      expect(html).toContain('shortcuts');
      expect(html).toContain('<kbd>←</kbd>');
      expect(html).toContain('<kbd>→</kbd>');
      expect(html).toContain('<kbd>Space</kbd>');
      expect(html).toContain('<kbd>Home</kbd>');
      expect(html).toContain('<kbd>End</kbd>');
    });
  });

  describe('saveHTML', () => {
    beforeEach(() => {
      mockedFs.mkdirSync.mockImplementation();
      mockedFs.writeFileSync.mockImplementation();
    });

    it('should create directory and save HTML file', () => {
      const html = '<html><body>Test</body></html>';
      const outputPath = '/path/to/output/flipbook.html';

      FlipbookGenerator.saveHTML(html, outputPath);

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(path.dirname(outputPath), { recursive: true });
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(outputPath, html, 'utf-8');
    });

    it('should handle nested directory paths', () => {
      const html = '<html><body>Test</body></html>';
      const outputPath = '/deep/nested/path/flipbook.html';

      FlipbookGenerator.saveHTML(html, outputPath);

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/deep/nested/path', { recursive: true });
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(outputPath, html, 'utf-8');
    });
  });
});
