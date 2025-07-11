export interface LanguageInfo {
  language: string;
  mimeType?: string;
  extensions: string[];
  isTextFile: boolean;
}

export class LanguageDetector {
  private static instance: LanguageDetector;
  private languageMap: Map<string, LanguageInfo> = new Map();

  private constructor() {
    this.initializeLanguageMap();
  }

  static getInstance(): LanguageDetector {
    if (!LanguageDetector.instance) {
      LanguageDetector.instance = new LanguageDetector();
    }
    return LanguageDetector.instance;
  }

  private initializeLanguageMap() {
    const languages: LanguageInfo[] = [
      {
        language: 'javascript',
        mimeType: 'application/javascript',
        extensions: ['js', 'jsx', 'mjs'],
        isTextFile: true,
      },
      {
        language: 'typescript',
        mimeType: 'application/typescript',
        extensions: ['ts', 'tsx'],
        isTextFile: true,
      },
      {
        language: 'html',
        mimeType: 'text/html',
        extensions: ['html', 'htm', 'xhtml'],
        isTextFile: true,
      },
      {
        language: 'css',
        mimeType: 'text/css',
        extensions: ['css'],
        isTextFile: true,
      },
      {
        language: 'scss',
        mimeType: 'text/x-scss',
        extensions: ['scss', 'sass'],
        isTextFile: true,
      },
      {
        language: 'json',
        mimeType: 'application/json',
        extensions: ['json'],
        isTextFile: true,
      },
      {
        language: 'markdown',
        mimeType: 'text/markdown',
        extensions: ['md', 'markdown'],
        isTextFile: true,
      },
      {
        language: 'python',
        mimeType: 'text/x-python',
        extensions: ['py', 'pyw', 'pyi'],
        isTextFile: true,
      },
      {
        language: 'java',
        mimeType: 'text/x-java-source',
        extensions: ['java'],
        isTextFile: true,
      },
      {
        language: 'cpp',
        mimeType: 'text/x-c++src',
        extensions: ['cpp', 'cc', 'cxx', 'c++'],
        isTextFile: true,
      },
      {
        language: 'c',
        mimeType: 'text/x-csrc',
        extensions: ['c', 'h'],
        isTextFile: true,
      },
      {
        language: 'php',
        mimeType: 'application/x-httpd-php',
        extensions: ['php', 'phtml'],
        isTextFile: true,
      },
      {
        language: 'ruby',
        mimeType: 'text/x-ruby',
        extensions: ['rb', 'erb'],
        isTextFile: true,
      },
      {
        language: 'go',
        mimeType: 'text/x-go',
        extensions: ['go'],
        isTextFile: true,
      },
      {
        language: 'rust',
        mimeType: 'text/x-rust',
        extensions: ['rs'],
        isTextFile: true,
      },
      {
        language: 'sql',
        mimeType: 'text/x-sql',
        extensions: ['sql'],
        isTextFile: true,
      },
      {
        language: 'xml',
        mimeType: 'application/xml',
        extensions: ['xml', 'xsd', 'xsl'],
        isTextFile: true,
      },
      {
        language: 'yaml',
        mimeType: 'text/yaml',
        extensions: ['yaml', 'yml'],
        isTextFile: true,
      },
      {
        language: 'toml',
        mimeType: 'text/x-toml',
        extensions: ['toml'],
        isTextFile: true,
      },
      {
        language: 'ini',
        mimeType: 'text/plain',
        extensions: ['ini', 'cfg', 'conf'],
        isTextFile: true,
      },
      {
        language: 'shell',
        mimeType: 'text/x-sh',
        extensions: ['sh', 'bash', 'zsh', 'fish'],
        isTextFile: true,
      },
      {
        language: 'powershell',
        mimeType: 'text/x-powershell',
        extensions: ['ps1', 'psm1'],
        isTextFile: true,
      },
      {
        language: 'batch',
        mimeType: 'text/x-batch',
        extensions: ['bat', 'cmd'],
        isTextFile: true,
      },
      {
        language: 'vue',
        mimeType: 'text/x-vue',
        extensions: ['vue'],
        isTextFile: true,
      },
      {
        language: 'svelte',
        mimeType: 'text/x-svelte',
        extensions: ['svelte'],
        isTextFile: true,
      },
      {
        language: 'astro',
        mimeType: 'text/x-astro',
        extensions: ['astro'],
        isTextFile: true,
      },
      {
        language: 'plaintext',
        mimeType: 'text/plain',
        extensions: ['txt', 'log'],
        isTextFile: true,
      },
    ];

    // Build extension map
    languages.forEach(lang => {
      lang.extensions.forEach(ext => {
        this.languageMap.set(ext.toLowerCase(), lang);
      });
    });
  }

  detectLanguage(filePath: string): LanguageInfo {
    const extension = this.getFileExtension(filePath);
    const languageInfo = this.languageMap.get(extension);
    
    return languageInfo || {
      language: 'plaintext',
      mimeType: 'text/plain',
      extensions: [],
      isTextFile: this.isTextFile(extension),
    };
  }

  getLanguage(filePath: string): string {
    return this.detectLanguage(filePath).language;
  }

  isTextFile(filePath: string): boolean {
    const extension = this.getFileExtension(filePath);
    const languageInfo = this.languageMap.get(extension);
    return languageInfo?.isTextFile ?? false;
  }

  private getFileExtension(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() || '';
  }

  getSupportedLanguages(): string[] {
    const languages = new Set<string>();
    this.languageMap.forEach(lang => {
      languages.add(lang.language);
    });
    return Array.from(languages);
  }
}

// Export singleton instance
export const languageDetector = LanguageDetector.getInstance(); 
