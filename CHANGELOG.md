# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-09 - [https://github.com/pdf-to-flipbook/pdf-to-flipbook/releases/tag/v1.1.0]

### Added
- **Customizable Templates**: Support for custom HTML templates via `--template-dir` option
- **Theme System**: Custom CSS themes support via `--theme-dir` option
- **EJS Templating**: Dynamic content rendering with embedded JavaScript variables
- **Dark Theme**: Pre-built dark theme example in `fixtures/custom-themes/dark/`
- **Template Assets**: HTML templates and CSS themes bundled with standalone executables
- **QUICK_START.md**: Quick start guide included in all distributions
- **Template Variables**: Dynamic title, subtitle, page count, and color injection
- **Enhanced CLI**: New command-line options for template and theme customization

### Changed
- **Distribution Packages**: Now include templates/, themes/, and QUICK_START.md
- **Build System**: Added EJS dependency for template rendering
- **CLI Help**: Updated with new template and theme options
- **Asset Discovery**: Automatic detection of custom templates and themes

### Technical Enhancements
- **FlipbookGenerator**: Complete rewrite to support templating system
- **Asset Loading**: Multi-path fallback system for development and production
- **EJS Integration**: Server-side rendering of templates with dynamic variables
- **CSS Variables**: Dynamic color injection into themes


## [1.0.0] - 2025-11-08 - [https://github.com/pdf-to-flipbook/pdf-to-flipbook/releases/tag/v1.0.0]

### Added
- **PDF to WebP Conversion**: High-quality conversion of PDF pages to WebP images with configurable DPI (100-300) and quality (0-100)
- **Interactive Flipbook Viewer**: Complete HTML5 flipbook interface with page navigation, keyboard shortcuts, and responsive design
- **Cross-Platform Executables**: Standalone binaries for macOS (Intel + Apple Silicon), Linux, and Windows
- **Page Navigation**: Previous/Next buttons, keyboard arrow keys, mouse click navigation on page edges
- **Jump to Page**: Direct page number input functionality
- **Responsive Design**: Mobile-friendly interface that works on desktop and mobile browsers
- **Custom Branding**: Configurable title and subtitle options
- **Modern UI**: Clean interface with smooth animations and progress indicators
- **Quality Control**: Adjustable DPI and compression settings for output optimization
- **Batch Processing**: Automatic page detection and sequential processing for large PDFs
- **Memory Efficient**: Processes pages sequentially to handle large PDF documents
- **Self-Contained Output**: Generated flipbooks work completely offline

### Technical Features
- **TypeScript**: Full type safety and modern development experience
- **Node.js Runtime**: Bundled Node.js 18+ runtime in executables
- **Sharp Integration**: High-performance image processing for PDF conversion
- **PDF-lib**: PDF manipulation and page extraction
- **Canvas Rendering**: Image rendering capabilities
- **esbuild**: Fast bundling for distribution
- **pkg**: Standalone executable creation
- **Automated Builds**: Cross-platform build system
