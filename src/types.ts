/**
 * Type definitions for PDF to Flipbook converter
 */

export interface ConversionOptions {
  pdfPath: string;
  outputDir: string;
  dpi?: number;
  quality?: number;
  title?: string;
  subtitle?: string;
}

export interface ConversionResult {
  success: boolean;
  totalPages: number;
  outputPath: string;
  totalSize: number;
  duration: number;
  message: string;
}

export interface PageInfo {
  pageNumber: number;
  fileSize: number;
  filePath: string;
}

export interface FlipbookConfig {
  title: string;
  subtitle: string;
  totalPages: number;
  pageCount: number;
  headerColor1: string;
  headerColor2: string;
}

