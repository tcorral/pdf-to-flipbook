/**
 * Flipbook HTML generator module
 */

import * as fs from 'fs';
import * as path from 'path';
import ejs from 'ejs';
import { FlipbookConfig } from './types.js';

export class FlipbookGenerator {
  /**
   * Generate the interactive flipbook HTML
   */
  static generateHTML(config: FlipbookConfig, templateDir?: string, themeDir?: string): string {
    // Load template and theme files
    const templateContent = this.loadTemplate(templateDir);
    const cssContent = this.loadTheme(config, themeDir);
    let jsContent = this.loadJavaScript(templateDir);

    // Prepare data for EJS template
    const templateData: any = {
      title: config.title,
      subtitle: config.subtitle,
      totalPages: config.totalPages,
      headerColor1: config.headerColor1,
      headerColor2: config.headerColor2,
      css: cssContent,
    };

    // Render JavaScript content with EJS first
    jsContent = ejs.render(jsContent, templateData);
    templateData.js = jsContent;

    // Render template with EJS
    return ejs.render(templateContent, templateData);
  }

  /**
   * Load HTML template from directory or use default
   */
  private static loadTemplate(templateDir?: string): string {
    // If custom template directory is provided, try to load from there
    if (templateDir) {
      const customTemplatePath = path.join(templateDir, 'default.html');
      if (fs.existsSync(customTemplatePath)) {
        return fs.readFileSync(customTemplatePath, 'utf-8');
      }
      // Try .ejs extension
      const customTemplateEjsPath = path.join(templateDir, 'default.ejs');
      if (fs.existsSync(customTemplateEjsPath)) {
        return fs.readFileSync(customTemplateEjsPath, 'utf-8');
      }
    }

    // No custom directory provided, or custom files not found - use default
    // Try multiple locations for compatibility with development and pkg executables
    const possiblePaths = [
      // Pkg executable: templates alongside executable (primary for distributed)
      path.join(path.dirname(process.execPath), 'templates', 'default.html'),
      // Development: templates in project root
      path.join(process.cwd(), 'templates', 'default.html'),
      // Alternative locations
      path.join(process.cwd(), 'src', 'templates', 'default.html'),
    ];

    for (const templatePath of possiblePaths) {
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf-8');
      }
    }

    throw new Error('No template found. Please ensure templates are available.');
  }

  /**
   * Load CSS theme from directory or use default
   */
  private static loadTheme(config: FlipbookConfig, themeDir?: string): string {
    let cssContent = '';

    // If custom theme directory is provided, try to load from there
    if (themeDir) {
      const customThemePath = path.join(themeDir, 'default.css');
      if (fs.existsSync(customThemePath)) {
        cssContent = fs.readFileSync(customThemePath, 'utf-8');
      }
    }

    // No custom directory provided, or custom theme not found - use default
    if (!cssContent) {
      // Try multiple locations for compatibility with development and pkg executables
      const possiblePaths = [
        // Development: themes in project root
        path.join(process.cwd(), 'themes', 'default.css'),
        // Pkg executable: themes alongside executable
        path.join(path.dirname(process.execPath), 'themes', 'default.css'),
        // Alternative locations
        path.join(process.cwd(), 'src', 'themes', 'default.css'),
      ];

      for (const themePath of possiblePaths) {
        if (fs.existsSync(themePath)) {
          cssContent = fs.readFileSync(themePath, 'utf-8');
          break;
        }
      }
    }

    if (!cssContent) {
      throw new Error('No theme found. Please ensure themes are available.');
    }

    // Render EJS variables in CSS if present
    const cssData = {
      headerColor1: config.headerColor1,
      headerColor2: config.headerColor2
    };

    return ejs.render(cssContent, cssData);
  }

  /**
   * Load JavaScript from template directory or use default
   */
  private static loadJavaScript(templateDir?: string): string {
    // If custom template directory is provided, try to load JavaScript from there
    if (templateDir) {
      const customJsPath = path.join(templateDir, 'flipbook.js');
      if (fs.existsSync(customJsPath)) {
        return fs.readFileSync(customJsPath, 'utf-8');
      }
    }

    // No custom directory provided, or custom JS not found - use default
    // Try multiple locations for compatibility with development and pkg executables
    const possiblePaths = [
      // Development: JavaScript in project root templates folder
      path.join(process.cwd(), 'templates', 'flipbook.js'),
      // Pkg executable: JavaScript alongside executable in templates folder
      path.join(path.dirname(process.execPath), 'templates', 'flipbook.js'),
      // Alternative locations
      path.join(process.cwd(), 'src', 'templates', 'flipbook.js'),
    ];

    for (const jsPath of possiblePaths) {
      if (fs.existsSync(jsPath)) {
        return fs.readFileSync(jsPath, 'utf-8');
      }
    }

    throw new Error('No JavaScript file found. Please ensure JavaScript templates are available.');
  }

  /**
   * Save HTML to file
   */
  static saveHTML(html: string, outputPath: string): void {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html, 'utf-8');
  }
}

