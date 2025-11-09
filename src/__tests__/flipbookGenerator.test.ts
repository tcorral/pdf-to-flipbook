/**
 * Unit tests for FlipbookGenerator class
 */

import * as fs from 'fs';
import * as path from 'path';
import { FlipbookGenerator } from '../flipbookGenerator.js';
import { FlipbookConfig } from '../types.js';

// Mock fs, path, and ejs
jest.mock('fs');
jest.mock('path');
jest.mock('ejs');
const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;
const mockedEjs = require('ejs');

describe('FlipbookGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock path functions
    mockedPath.dirname.mockImplementation((p) => p.split('/').slice(0, -1).join('/') || '.');
    mockedPath.join.mockImplementation((...args) => args.join('/'));
    mockedPath.dirname.mockImplementation((p) => p.split('/').slice(0, -1).join('/') || '.');

    // Mock fs functions for template/theme loading
    mockedFs.existsSync.mockReturnValue(true);

    // Mock different file contents based on what's being read
    mockedFs.readFileSync.mockImplementation((filePath: any) => {
      if (typeof filePath === 'string') {
        if (filePath.includes('default.html') || filePath.includes('default.ejs')) {
          return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title><%= title %> - Flipbook Viewer</title><style><%- css %></style></head><body><div class="header"><h1><%= title %></h1><p><%= subtitle %></p></div><div class="container"><div class="flipbook-wrapper"><div class="book"><div class="pages-container" id="pagesContainer"></div><div class="page-navigation left" id="navLeft"></div><div class="page-navigation right" id="navRight"></div></div></div></div><div class="controls"><div class="control-group"><button id="firstBtn" onclick="goToPage(1)">⏮ First</button><button id="prevBtn" onclick="previousPage()">◀ Previous</button><button id="nextBtn" onclick="nextPage()">Next ▶</button><button id="lastBtn" onclick="goToPage(<%= totalPages %>)">Last ⏭</button></div><div class="control-group"><label for="pageInput">Go to page:</label><input type="number" id="pageInput" class="page-input" min="1" max="<%= totalPages %>" onkeypress="if(event.key===\'Enter\') goToPage(parseInt(this.value))" /></div><div class="page-info"><span id="currentPage">1</span> / <%= totalPages %></div><div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div></div><div class="shortcuts"><div class="shortcut-item"><kbd>←</kbd> / <kbd>→</kbd> Previous/Next</div><div class="shortcut-item"><kbd>Space</kbd> Next page</div><div class="shortcut-item"><kbd>Home</kbd> / <kbd>End</kbd> First/Last</div><div class="shortcut-item">Click edges to navigate</div></div><script><%- js %></script></body></html>';
        } else if (filePath.includes('default.css')) {
          return '* { box-sizing: border-box; } body { background: linear-gradient(135deg, <%= headerColor1 %> 0%, <%= headerColor2 %> 100%); } .flipbook-wrapper { width: 100%; } button { background: linear-gradient(135deg, <%= headerColor1 %> 0%, <%= headerColor2 %> 100%); } .progress-fill { background: linear-gradient(90deg, <%= headerColor1 %> 0%, <%= headerColor2 %> 100%); } @media (max-width: 1024px) { .header h1 { font-size: 2em; } } @media (max-width: 768px) { .header h1 { font-size: 1.5em; } .controls { flex-direction: column; } }';
        } else if (filePath.includes('flipbook.js')) {
          return 'const totalPages = <%= totalPages %>; function initPages() { if (totalPages === 1) { showSinglePage(); } } function showSinglePage() { /* single page logic */ } function nextPage() { /* next page logic */ } function previousPage() { /* previous page logic */ } function goToPage(page) { /* go to page logic */ } document.addEventListener("keydown", function(event) { if (event.key === "ArrowRight") { nextPage(); } else if (event.key === "ArrowLeft") { previousPage(); } else if (event.key === " ") { nextPage(); } else if (event.key === "Home") { goToPage(1); } else if (event.key === "End") { goToPage(totalPages); } }); if (currentPageSpan) { /* optional element */ } if (progressFill) { /* optional element */ }';
        } else if (filePath.includes('custom/themes') && filePath.includes('default.css')) {
          // Custom theme with specific colors for testing
          return 'body { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); } * { box-sizing: border-box; } .flipbook-wrapper { width: 100%; }';
        }
      }
      return 'mock file content';
    });

    // Mock EJS render function - simulate actual EJS behavior
    mockedEjs.render = jest.fn((template: string, data: any) => {
      let result = template;

      // Replace all EJS variables
      if (data.title !== undefined) result = result.replace(/<%= title %>/g, data.title);
      if (data.subtitle !== undefined) result = result.replace(/<%= subtitle %>/g, data.subtitle);
      if (data.totalPages !== undefined) result = result.replace(/<%= totalPages %>/g, data.totalPages);
      if (data.headerColor1 !== undefined) result = result.replace(/<%= headerColor1 %>/g, data.headerColor1);
      if (data.headerColor2 !== undefined) result = result.replace(/<%= headerColor2 %>/g, data.headerColor2);

      // Replace unescaped content
      if (data.css !== undefined) result = result.replace(/<%- css %>/g, data.css);
      if (data.js !== undefined) result = result.replace(/<%- js %>/g, data.js);

      return result;
    });
  });

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
      expect(html).toContain('showSinglePage');
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

    it('should support custom template directory', () => {
      const config: FlipbookConfig = {
        title: 'Custom Template',
        subtitle: 'Custom Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      const customTemplatePath = '/custom/templates';
      const html = FlipbookGenerator.generateHTML(config, customTemplatePath);

      // Should generate HTML with custom template
      expect(html).toBeTruthy();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Custom Template');
    });

    it('should support custom theme directory', () => {
      const config: FlipbookConfig = {
        title: 'Custom Theme',
        subtitle: 'Custom Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#1a1a2e',
        headerColor2: '#16213e',
      };

      const customThemePath = '/custom/themes';
      const html = FlipbookGenerator.generateHTML(config, undefined, customThemePath);

      // Should generate HTML with custom theme colors
      expect(html).toBeTruthy();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('#1a1a2e');
      expect(html).toContain('#16213e');
    });

    it('should support both custom template and theme', () => {
      const config: FlipbookConfig = {
        title: 'Full Custom',
        subtitle: 'Complete Customization',
        totalPages: 10,
        pageCount: 10,
        headerColor1: '#000000',
        headerColor2: '#ffffff',
      };

      const customTemplatePath = '/custom/templates';
      const customThemePath = '/custom/themes';
      const html = FlipbookGenerator.generateHTML(config, customTemplatePath, customThemePath);

      // Should generate HTML with both custom template and theme
      expect(html).toBeTruthy();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Full Custom');
      expect(html).toContain('const totalPages = 10;');
    });

    it('should render EJS template variables correctly', () => {
      const config: FlipbookConfig = {
        title: 'EJS Test Book',
        subtitle: 'Testing EJS Variables',
        totalPages: 20,
        pageCount: 20,
        headerColor1: '#ff0000',
        headerColor2: '#0000ff',
      };

      const html = FlipbookGenerator.generateHTML(config);

      // Check that EJS variables are rendered, not present as template syntax
      expect(html).toContain('EJS Test Book');
      expect(html).toContain('Testing EJS Variables');
      expect(html).toContain('const totalPages = 20;');
      expect(html).not.toContain('<%= title %>');
      expect(html).not.toContain('<%= totalPages %>');
    });

    it('should handle optional DOM elements gracefully', () => {
      const config: FlipbookConfig = {
        title: 'Optional Elements Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      const html = FlipbookGenerator.generateHTML(config);

      // Check that JavaScript handles optional elements
      expect(html).toContain('if (currentPageSpan)');
      expect(html).toContain('if (progressFill)');
    });

    it('should handle non-existent custom template directory gracefully', () => {
      const config: FlipbookConfig = {
        title: 'Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      // Mock existsSync to return false for custom template but allow defaults
      mockedFs.existsSync.mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('/nonexistent/templates')) {
          return false;
        }
        // Allow default template/theme loading
        if (typeof path === 'string' && (path.includes('default.html') || path.includes('default.css') || path.includes('flipbook.js'))) {
          return true;
        }
        return false;
      });

      // Should fall back to default template
      const html = FlipbookGenerator.generateHTML(config, '/nonexistent/templates');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test');
    });

    it('should handle non-existent custom theme directory gracefully', () => {
      const config: FlipbookConfig = {
        title: 'Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      // Mock existsSync to return false for custom theme but allow defaults
      mockedFs.existsSync.mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('/nonexistent/themes')) {
          return false;
        }
        // Allow default template/theme loading
        if (typeof path === 'string' && (path.includes('default.html') || path.includes('default.css') || path.includes('flipbook.js'))) {
          return true;
        }
        return false;
      });

      // Should fall back to default theme
      const html = FlipbookGenerator.generateHTML(config, undefined, '/nonexistent/themes');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test');
    });

    it('should throw error when no templates are available at all', () => {
      const config: FlipbookConfig = {
        title: 'Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      // Mock existsSync to return false for all paths
      mockedFs.existsSync.mockReturnValue(false);

      expect(() => FlipbookGenerator.generateHTML(config)).toThrow('No template found');
    });

    it('should throw error when no themes are available at all', () => {
      const config: FlipbookConfig = {
        title: 'Test',
        subtitle: 'Test',
        totalPages: 5,
        pageCount: 5,
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
      };

      // Mock existsSync to return false for all paths
      mockedFs.existsSync.mockReturnValue(false);
      // But allow template to load
      mockedFs.existsSync.mockImplementation((path) => {
        if (typeof path === 'string' && (path.includes('default.html') || path.includes('default.ejs'))) {
          return true;
        }
        return false;
      });

      expect(() => FlipbookGenerator.generateHTML(config)).toThrow('No theme found');
    });
  });

  describe('loadTemplate', () => {
    it('should load custom template when provided', () => {
      const customTemplateDir = '/custom/templates';
      const result = (FlipbookGenerator as any).loadTemplate(customTemplateDir);

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/custom/templates/default.html', 'utf-8');
      expect(result).toContain('<!DOCTYPE html');
    });

    it('should load custom template with .ejs extension when provided', () => {
      const customTemplatePath = '/custom/templates';
      mockedFs.existsSync.mockImplementation((path) => path === '/custom/templates/default.html' ? false : true);

      const result = (FlipbookGenerator as any).loadTemplate(customTemplatePath);

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/custom/templates/default.ejs', 'utf-8');
      expect(result).toContain('<!DOCTYPE html');
    });

    it('should load default template when no custom template provided', () => {
      const result = (FlipbookGenerator as any).loadTemplate(undefined);

      // Should try the default locations
      expect(mockedFs.readFileSync).toHaveBeenCalled();
      expect(result).toContain('<!DOCTYPE html');
    });

    it('should throw error when no template found', () => {
      mockedFs.existsSync.mockReturnValue(false);

      expect(() => (FlipbookGenerator as any).loadTemplate('/nonexistent')).toThrow('No template found');
    });
  });

  describe('loadTheme', () => {
    const mockConfig: FlipbookConfig = {
      title: 'Test',
      subtitle: 'Test',
      totalPages: 5,
      pageCount: 5,
      headerColor1: '#ff0000',
      headerColor2: '#00ff00',
    };

    it('should load custom theme when provided', () => {
      const customThemePath = '/custom/themes';
      // Ensure existsSync returns true for custom theme path
      mockedFs.existsSync.mockImplementation((path) => {
        if (typeof path === 'string' && path === '/custom/themes/default.css') {
          return true;
        }
        return false; // Default to false for other paths
      });

      // Override readFileSync for this specific test
      mockedFs.readFileSync.mockImplementation((filePath: any) => {
        if (typeof filePath === 'string' && filePath === '/custom/themes/default.css') {
          return 'body { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); } * { box-sizing: border-box; } .flipbook-wrapper { width: 100%; }';
        }
        return 'mock file content';
      });

      const result = (FlipbookGenerator as any).loadTheme(mockConfig, customThemePath);

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/custom/themes/default.css', 'utf-8');
      expect(mockedEjs.render).toHaveBeenCalled();
      expect(result).toContain('#1a1a2e'); // From our custom theme mock
    });

    it('should load default theme when no custom theme provided', () => {
      const result = (FlipbookGenerator as any).loadTheme(mockConfig, undefined);

      expect(mockedFs.readFileSync).toHaveBeenCalled();
      expect(mockedEjs.render).toHaveBeenCalled();
      expect(result).toContain('box-sizing: border-box'); // From our default theme mock
    });

    it('should render EJS variables in theme', () => {
      (FlipbookGenerator as any).loadTheme(mockConfig, undefined);

      expect(mockedEjs.render).toHaveBeenCalledWith(
        expect.stringContaining('<%= headerColor1 %>'),
        { headerColor1: '#ff0000', headerColor2: '#00ff00' }
      );
    });

    it('should throw error when no theme found', () => {
      mockedFs.existsSync.mockReturnValue(false);

      expect(() => (FlipbookGenerator as any).loadTheme(mockConfig, '/nonexistent')).toThrow('No theme found');
    });
  });

  describe('loadJavaScript', () => {
    it('should load custom JavaScript when provided', () => {
      const customTemplatePath = '/custom/templates';
      const result = (FlipbookGenerator as any).loadJavaScript(customTemplatePath);

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/custom/templates/flipbook.js', 'utf-8');
      expect(result).toContain('const totalPages');
    });

    it('should load default JavaScript when no custom JavaScript provided', () => {
      const result = (FlipbookGenerator as any).loadJavaScript(undefined);

      expect(mockedFs.readFileSync).toHaveBeenCalled();
      expect(result).toContain('const totalPages');
    });

    it('should throw error when no JavaScript found', () => {
      mockedFs.existsSync.mockReturnValue(false);

      expect(() => (FlipbookGenerator as any).loadJavaScript('/nonexistent')).toThrow('No JavaScript file found');
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
