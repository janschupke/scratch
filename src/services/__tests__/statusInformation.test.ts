import { describe, it, expect } from 'vitest';
import { StatusInformationService } from '../statusInformation';

describe('StatusInformationService', () => {
  const service = new StatusInformationService();

  describe('detectFileType', () => {
    it('should detect TypeScript files correctly', async () => {
      expect(await service.detectFileType('test.ts')).toBe('TypeScript');
      expect(await service.detectFileType('component.tsx')).toBe('TypeScript React');
    });

    it('should detect JavaScript files correctly', async () => {
      expect(await service.detectFileType('script.js')).toBe('JavaScript');
      expect(await service.detectFileType('component.jsx')).toBe('JavaScript React');
    });

    it('should detect other common file types', async () => {
      expect(await service.detectFileType('readme.md')).toBe('Markdown');
      expect(await service.detectFileType('config.json')).toBe('JSON');
      expect(await service.detectFileType('index.html')).toBe('HTML');
      expect(await service.detectFileType('styles.css')).toBe('CSS');
      expect(await service.detectFileType('script.py')).toBe('Python');
      expect(await service.detectFileType('main.java')).toBe('Java');
      expect(await service.detectFileType('app.cpp')).toBe('C++');
      expect(await service.detectFileType('main.c')).toBe('C');
      expect(await service.detectFileType('script.php')).toBe('PHP');
      expect(await service.detectFileType('app.rb')).toBe('Ruby');
      expect(await service.detectFileType('main.go')).toBe('Go');
      expect(await service.detectFileType('lib.rs')).toBe('Rust');
      expect(await service.detectFileType('app.swift')).toBe('Swift');
      expect(await service.detectFileType('main.kt')).toBe('Kotlin');
    });

    it('should return Plain Text for unknown extensions', async () => {
      expect(await service.detectFileType('unknown.xyz')).toBe('Plain Text');
      expect(await service.detectFileType('file')).toBe('Plain Text');
    });

    it('should handle case insensitive extensions', async () => {
      expect(await service.detectFileType('test.TS')).toBe('TypeScript');
      expect(await service.detectFileType('component.TSX')).toBe('TypeScript React');
      expect(await service.detectFileType('script.JS')).toBe('JavaScript');
    });
  });

  describe('detectEncoding', () => {
    it('should detect UTF-8 BOM', async () => {
      const content = '\uFEFFHello World';
      expect(await service.detectEncoding(content)).toBe('UTF-8 BOM');
    });

    it('should detect UTF-16 BOM', async () => {
      const content = '\uFFFEHello World';
      expect(await service.detectEncoding(content)).toBe('UTF-16');
    });

    it('should detect UTF-8 for non-ASCII content', async () => {
      const content = 'Hello World with émojis 🚀';
      expect(await service.detectEncoding(content)).toBe('UTF-8');
    });

    it('should detect ASCII for plain ASCII content', async () => {
      const content = 'Hello World';
      expect(await service.detectEncoding(content)).toBe('ASCII');
    });

    it('should handle empty content', async () => {
      expect(await service.detectEncoding('')).toBe('ASCII');
    });
  });

  describe('countLines', () => {
    it('should count lines correctly', () => {
      expect(service.countLines('')).toBe(0);
      expect(service.countLines('single line')).toBe(1);
      expect(service.countLines('line1\nline2')).toBe(2);
      expect(service.countLines('line1\nline2\nline3')).toBe(3);
    });

    it('should handle content with trailing newline', () => {
      expect(service.countLines('line1\nline2\n')).toBe(3);
    });

    it('should handle content with only newlines', () => {
      expect(service.countLines('\n\n\n')).toBe(4);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(service.formatFileSize(0)).toBe('0.0 B');
      expect(service.formatFileSize(1023)).toBe('1023.0 B');
      expect(service.formatFileSize(1024)).toBe('1.0 KB');
      expect(service.formatFileSize(1536)).toBe('1.5 KB');
      expect(service.formatFileSize(1048576)).toBe('1.0 MB');
      expect(service.formatFileSize(1572864)).toBe('1.5 MB');
      expect(service.formatFileSize(1073741824)).toBe('1.0 GB');
    });

    it('should handle large file sizes', () => {
      expect(service.formatFileSize(2147483648)).toBe('2.0 GB');
    });
  });

  describe('detectLanguage', () => {
    it('should detect PHP from content', async () => {
      const content = '<?php echo "Hello World"; ?>';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('PHP');
    });

    it('should detect Python from shebang', async () => {
      const content = '#!/usr/bin/env python\nprint("Hello World")';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('Python');
    });

    it('should detect Ruby from shebang', async () => {
      const content = '#!/usr/bin/env ruby\nputs "Hello World"';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('Ruby');
    });

    it('should detect JavaScript from shebang', async () => {
      const content = '#!/usr/bin/env node\nconsole.log("Hello World")';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('JavaScript');
    });

    it('should detect HTML from DOCTYPE', async () => {
      const content = '<!DOCTYPE html><html></html>';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('HTML');
    });

    it('should detect XML from XML declaration', async () => {
      const content = '<?xml version="1.0"?><root></root>';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('XML');
    });

    it('should detect Markdown from frontmatter', async () => {
      const content = '---\ntitle: Test\n---\n# Hello World';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('Markdown');
    });

    it('should detect JSON from content', async () => {
      const content = '{"name": "test", "value": 123}';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('JSON');
    });

    it('should detect JavaScript from function syntax', async () => {
      const content = 'function test() { return "hello"; }';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('JavaScript');
    });

    it('should detect JavaScript from import syntax', async () => {
      const content = 'import React from "react";';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('JavaScript');
    });

    it('should detect TypeScript from interface syntax', async () => {
      const content = 'interface Test { name: string; }';
      expect(await service.detectLanguage('unknown.txt', content)).toBe('TypeScript');
    });

    it('should fall back to file type detection', async () => {
      const content = 'plain text content';
      expect(await service.detectLanguage('test.ts', content)).toBe('TypeScript');
    });
  });

  describe('getFileInfo', () => {
    it('should return complete file information', async () => {
      const filePath = 'test.ts';
      const content = 'console.log("Hello World");\nconst x = 1;';
      
      const result = await service.getFileInfo(filePath, content);
      
      expect(result).toEqual({
        fileType: 'TypeScript',
        encoding: 'ASCII',
        lineCount: 2,
        fileSize: '40.0 B',
        language: 'TypeScript'
      });
    });

    it('should handle empty content', async () => {
      const filePath = 'empty.txt';
      const content = '';
      
      const result = await service.getFileInfo(filePath, content);
      
      expect(result).toEqual({
        fileType: 'Plain Text',
        encoding: 'ASCII',
        lineCount: 0,
        fileSize: '0.0 B',
        language: 'Plain Text'
      });
    });

    it('should handle UTF-8 content', async () => {
      const filePath = 'test.md';
      const content = '# Hello World with émojis 🚀';
      
      const result = await service.getFileInfo(filePath, content);
      
      expect(result).toEqual({
        fileType: 'Markdown',
        encoding: 'UTF-8',
        lineCount: 1,
        fileSize: '31.0 B',
        language: 'Markdown'
      });
    });
  });
}); 
