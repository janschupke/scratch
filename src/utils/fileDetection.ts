import { readBinaryFile } from '@tauri-apps/api/fs';
import * as path from '@tauri-apps/api/path';

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  isText: boolean;
  encoding: string;
  mimeType?: string;
}

export class FileTypeDetector {
  private static readonly TEXT_EXTENSIONS = [
    '.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css',
    '.scss', '.sass', '.less', '.xml', '.yaml', '.yml', '.toml', '.ini',
    '.cfg', '.conf', '.config', '.env', '.gitignore', '.dockerignore',
    '.editorconfig', '.eslintrc', '.prettierrc', '.babelrc', '.npmrc',
    '.gitattributes', '.gitmodules', '.gitconfig', '.bashrc', '.zshrc',
    '.profile', '.bash_profile', '.vimrc', '.emacs', '.tmux.conf',
    '.ssh/config', '.ssh/known_hosts', '.ssh/authorized_keys'
  ];

  private static readonly BINARY_EXTENSIONS = [
    '.exe', '.dll', '.so', '.dylib', '.bin', '.dat', '.db', '.sqlite',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg', '.pdf',
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar',
    '.tar', '.gz', '.bz2', '.7z', '.mp3', '.mp4', '.avi', '.mov'
  ];

  static async detectFileType(filePath: string): Promise<FileInfo> {
    const name = await path.basename(filePath);
    const extension = (await path.extname(filePath)).toLowerCase();
    // Read first 4KB to analyze content and get file size
    const buffer = new Uint8Array(await readBinaryFile(filePath));
    const size = buffer.length; // Approximate file size (accurate for small files)
    
    // Check if it's a known binary extension
    if (this.BINARY_EXTENSIONS.includes(extension)) {
      return {
        path: filePath,
        name,
        extension,
        size,
        isText: false,
        encoding: 'binary'
      };
    }

    // Check if it's a known text extension
    if (this.TEXT_EXTENSIONS.includes(extension)) {
      return {
        path: filePath,
        name,
        extension,
        size,
        isText: true,
        encoding: 'utf-8'
      };
    }

    // For unknown extensions, analyze content
    return await this.analyzeFileContent(filePath, name, extension, size);
  }

  private static async analyzeFileContent(
    filePath: string, 
    name: string, 
    extension: string, 
    size: number
  ): Promise<FileInfo> {
    try {
      // Read first 4KB to analyze content
      const buffer = new Uint8Array(await readBinaryFile(filePath));
      
      // Check for null bytes (indicates binary)
      if (buffer.includes(0)) {
        return {
          path: filePath,
          name,
          extension,
          size,
          isText: false,
          encoding: 'binary'
        };
      }

      // Try to decode as UTF-8
      try {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        decoder.decode(buffer);
        return {
          path: filePath,
          name,
          extension,
          size,
          isText: true,
          encoding: 'utf-8'
        };
      } catch {
        // Try UTF-16
        try {
          const decoder = new TextDecoder('utf-16le', { fatal: true });
          decoder.decode(buffer);
          return {
            path: filePath,
            name,
            extension,
            size,
            isText: true,
            encoding: 'utf-16le'
          };
        } catch {
          return {
            path: filePath,
            name,
            extension,
            size,
            isText: false,
            encoding: 'unknown'
          };
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to analyze file: ${error.message}`);
    }
  }
} 
