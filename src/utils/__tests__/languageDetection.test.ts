import { describe, it, expect } from 'vitest';
import { languageDetector, LanguageDetector } from '../languageDetection';

describe('LanguageDetector', () => {
  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = LanguageDetector.getInstance();
      const instance2 = LanguageDetector.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('detectLanguage', () => {
    it('should detect JavaScript files', () => {
      const result = languageDetector.detectLanguage('test.js');
      expect(result.language).toBe('javascript');
      expect(result.mimeType).toBe('application/javascript');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect TypeScript files', () => {
      const result = languageDetector.detectLanguage('test.ts');
      expect(result.language).toBe('typescript');
      expect(result.mimeType).toBe('application/typescript');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect JSX files', () => {
      const result = languageDetector.detectLanguage('component.jsx');
      expect(result.language).toBe('javascript');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect TSX files', () => {
      const result = languageDetector.detectLanguage('component.tsx');
      expect(result.language).toBe('typescript');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect HTML files', () => {
      const result = languageDetector.detectLanguage('index.html');
      expect(result.language).toBe('html');
      expect(result.mimeType).toBe('text/html');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect CSS files', () => {
      const result = languageDetector.detectLanguage('styles.css');
      expect(result.language).toBe('css');
      expect(result.mimeType).toBe('text/css');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect SCSS files', () => {
      const result = languageDetector.detectLanguage('styles.scss');
      expect(result.language).toBe('scss');
      expect(result.mimeType).toBe('text/x-scss');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect JSON files', () => {
      const result = languageDetector.detectLanguage('config.json');
      expect(result.language).toBe('json');
      expect(result.mimeType).toBe('application/json');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Markdown files', () => {
      const result = languageDetector.detectLanguage('README.md');
      expect(result.language).toBe('markdown');
      expect(result.mimeType).toBe('text/markdown');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Python files', () => {
      const result = languageDetector.detectLanguage('script.py');
      expect(result.language).toBe('python');
      expect(result.mimeType).toBe('text/x-python');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Java files', () => {
      const result = languageDetector.detectLanguage('Main.java');
      expect(result.language).toBe('java');
      expect(result.mimeType).toBe('text/x-java-source');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect C++ files', () => {
      const result = languageDetector.detectLanguage('main.cpp');
      expect(result.language).toBe('cpp');
      expect(result.mimeType).toBe('text/x-c++src');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect C files', () => {
      const result = languageDetector.detectLanguage('main.c');
      expect(result.language).toBe('c');
      expect(result.mimeType).toBe('text/x-csrc');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect PHP files', () => {
      const result = languageDetector.detectLanguage('index.php');
      expect(result.language).toBe('php');
      expect(result.mimeType).toBe('application/x-httpd-php');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Ruby files', () => {
      const result = languageDetector.detectLanguage('script.rb');
      expect(result.language).toBe('ruby');
      expect(result.mimeType).toBe('text/x-ruby');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Go files', () => {
      const result = languageDetector.detectLanguage('main.go');
      expect(result.language).toBe('go');
      expect(result.mimeType).toBe('text/x-go');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Rust files', () => {
      const result = languageDetector.detectLanguage('main.rs');
      expect(result.language).toBe('rust');
      expect(result.mimeType).toBe('text/x-rust');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect SQL files', () => {
      const result = languageDetector.detectLanguage('query.sql');
      expect(result.language).toBe('sql');
      expect(result.mimeType).toBe('text/x-sql');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect XML files', () => {
      const result = languageDetector.detectLanguage('config.xml');
      expect(result.language).toBe('xml');
      expect(result.mimeType).toBe('application/xml');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect YAML files', () => {
      const result = languageDetector.detectLanguage('config.yml');
      expect(result.language).toBe('yaml');
      expect(result.mimeType).toBe('text/yaml');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect TOML files', () => {
      const result = languageDetector.detectLanguage('Cargo.toml');
      expect(result.language).toBe('toml');
      expect(result.mimeType).toBe('text/x-toml');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect INI files', () => {
      const result = languageDetector.detectLanguage('config.ini');
      expect(result.language).toBe('ini');
      expect(result.mimeType).toBe('text/plain');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Shell files', () => {
      const result = languageDetector.detectLanguage('script.sh');
      expect(result.language).toBe('shell');
      expect(result.mimeType).toBe('text/x-sh');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect PowerShell files', () => {
      const result = languageDetector.detectLanguage('script.ps1');
      expect(result.language).toBe('powershell');
      expect(result.mimeType).toBe('text/x-powershell');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Batch files', () => {
      const result = languageDetector.detectLanguage('script.bat');
      expect(result.language).toBe('batch');
      expect(result.mimeType).toBe('text/x-batch');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Vue files', () => {
      const result = languageDetector.detectLanguage('component.vue');
      expect(result.language).toBe('vue');
      expect(result.mimeType).toBe('text/x-vue');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Svelte files', () => {
      const result = languageDetector.detectLanguage('component.svelte');
      expect(result.language).toBe('svelte');
      expect(result.mimeType).toBe('text/x-svelte');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect Astro files', () => {
      const result = languageDetector.detectLanguage('page.astro');
      expect(result.language).toBe('astro');
      expect(result.mimeType).toBe('text/x-astro');
      expect(result.isTextFile).toBe(true);
    });

    it('should detect plaintext files', () => {
      const result = languageDetector.detectLanguage('readme.txt');
      expect(result.language).toBe('plaintext');
      expect(result.mimeType).toBe('text/plain');
      expect(result.isTextFile).toBe(true);
    });

    it('should return plaintext for unknown extensions', () => {
      const result = languageDetector.detectLanguage('unknown.xyz');
      expect(result.language).toBe('plaintext');
      expect(result.mimeType).toBe('text/plain');
      expect(result.isTextFile).toBe(false);
    });

    it('should handle files without extensions', () => {
      const result = languageDetector.detectLanguage('Dockerfile');
      expect(result.language).toBe('plaintext');
      expect(result.mimeType).toBe('text/plain');
      expect(result.isTextFile).toBe(false);
    });

    it('should handle case insensitive extensions', () => {
      const result = languageDetector.detectLanguage('script.JS');
      expect(result.language).toBe('javascript');
      expect(result.isTextFile).toBe(true);
    });
  });

  describe('getLanguage', () => {
    it('should return language string', () => {
      const result = languageDetector.getLanguage('test.js');
      expect(result).toBe('javascript');
    });
  });

  describe('isTextFile', () => {
    it('should return true for text files', () => {
      expect(languageDetector.isTextFile('test.js')).toBe(true);
      expect(languageDetector.isTextFile('test.ts')).toBe(true);
      expect(languageDetector.isTextFile('test.html')).toBe(true);
    });

    it('should return false for unknown files', () => {
      expect(languageDetector.isTextFile('test.xyz')).toBe(false);
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return array of supported languages', () => {
      const languages = languageDetector.getSupportedLanguages();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain('javascript');
      expect(languages).toContain('typescript');
      expect(languages).toContain('html');
      expect(languages).toContain('css');
      expect(languages).toContain('json');
      expect(languages).toContain('markdown');
      expect(languages).toContain('python');
      expect(languages).toContain('java');
      expect(languages).toContain('cpp');
      expect(languages).toContain('c');
      expect(languages).toContain('php');
      expect(languages).toContain('ruby');
      expect(languages).toContain('go');
      expect(languages).toContain('rust');
      expect(languages).toContain('sql');
      expect(languages).toContain('xml');
      expect(languages).toContain('yaml');
      expect(languages).toContain('toml');
      expect(languages).toContain('ini');
      expect(languages).toContain('shell');
      expect(languages).toContain('powershell');
      expect(languages).toContain('batch');
      expect(languages).toContain('vue');
      expect(languages).toContain('svelte');
      expect(languages).toContain('astro');
      expect(languages).toContain('plaintext');
    });
  });
}); 
