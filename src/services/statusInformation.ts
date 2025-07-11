import path from 'path';

export interface StatusInformationResult {
  fileType: string;
  encoding: string;
  lineCount: number;
  fileSize: string;
  language: string;
}

export class StatusInformationService {
  async detectFileType(filePath: string): Promise<string> {
    const extension = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript React',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript React',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.less': 'Less',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.vue': 'Vue',
      '.svelte': 'Svelte',
      '.astro': 'Astro',
      '.yml': 'YAML',
      '.yaml': 'YAML',
      '.xml': 'XML',
      '.sql': 'SQL',
      '.sh': 'Shell',
      '.bash': 'Bash',
      '.zsh': 'Zsh',
      '.fish': 'Fish',
      '.ps1': 'PowerShell',
      '.bat': 'Batch',
      '.cmd': 'Batch',
      '.ini': 'INI',
      '.toml': 'TOML',
      '.lock': 'Lock File',
      '.gitignore': 'Git Ignore',
      '.dockerfile': 'Dockerfile',
      '.dockerignore': 'Docker Ignore'
    };

    return languageMap[extension] || 'Plain Text';
  }

  detectEncoding(content: string): Promise<string> {
    // Simple UTF-8 detection
    const hasUtf8Bom = content.startsWith('\uFEFF');
    const hasUtf16Bom = content.startsWith('\uFFFE') || content.startsWith('\uFEFF');
    
    if (hasUtf8Bom) return Promise.resolve('UTF-8 BOM');
    if (hasUtf16Bom) return Promise.resolve('UTF-16');
    
    // Check for non-ASCII characters
    const hasNonAscii = /[\u0080-\uFFFF]/.test(content);
    return Promise.resolve(hasNonAscii ? 'UTF-8' : 'ASCII');
  }

  countLines(content: string): number {
    if (!content) return 0;
    return content.split('\n').length;
  }

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  async detectLanguage(filePath: string, content: string): Promise<string> {
    // Use existing language detection or enhance it
    const fileType = await this.detectFileType(filePath);
    
    // Additional heuristics based on content
    if (fileType === 'Plain Text') {
      if (content.includes('<?php')) return 'PHP';
      if (content.includes('#!/usr/bin/env python')) return 'Python';
      if (content.includes('#!/usr/bin/env ruby')) return 'Ruby';
      if (content.includes('#!/usr/bin/env node')) return 'JavaScript';
      if (content.includes('#!/bin/bash')) return 'Bash';
      if (content.includes('#!/bin/zsh')) return 'Zsh';
      if (content.includes('#!/bin/fish')) return 'Fish';
      if (content.includes('#!/usr/bin/env powershell')) return 'PowerShell';
      if (content.includes('<!DOCTYPE html>')) return 'HTML';
      if (content.includes('<?xml')) return 'XML';
      if (content.includes('---') && content.includes('title:')) return 'Markdown';
      if (content.includes('{') && content.includes('}') && content.includes('"') && !content.includes('function')) return 'JSON';
      if (content.includes('function')) return 'JavaScript';
      if (content.includes('import') && content.includes('from')) return 'JavaScript';
      if (content.includes('export') && content.includes('default')) return 'JavaScript';
      if (content.includes('interface')) return 'TypeScript';
      if (content.includes('class') && content.includes('extends')) return 'TypeScript';
    }

    return fileType;
  }

  async getFileInfo(filePath: string, content: string): Promise<StatusInformationResult> {
    const [fileType, encoding, language] = await Promise.all([
      this.detectFileType(filePath),
      this.detectEncoding(content),
      this.detectLanguage(filePath, content)
    ]);

    const lineCount = this.countLines(content);
    const fileSize = this.formatFileSize(new Blob([content]).size);

    return {
      fileType,
      encoding,
      lineCount,
      fileSize,
      language
    };
  }
}

export const statusInformationService = new StatusInformationService(); 
