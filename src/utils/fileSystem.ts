import { open } from '@tauri-apps/api/dialog';
import { readDir, readTextFile } from '@tauri-apps/api/fs';
import { basename } from '@tauri-apps/api/path';
import { FileNode } from '../types';
import { languageDetector } from './languageDetection';

export class FileSystemManager {
  private static instance: FileSystemManager;
  // private fileCache = new Map<string, FileNode>();

  static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager();
    }
    return FileSystemManager.instance;
  }

  async selectFolder(): Promise<string | null> {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Folder to Open'
      });

      if (selected && !Array.isArray(selected)) {
        return selected;
      }
      return null;
    } catch (error) {
      console.error('Error selecting folder:', error);
      return null;
    }
  }

  async readDirectory(path: string): Promise<FileNode[]> {
    try {
      const entries = await readDir(path, { recursive: false });
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        if (entry.children) {
          // Directory
          nodes.push({
            id: entry.path,
            name: await basename(entry.path),
            path: entry.path,
            type: 'folder',
            children: [],
            isOpen: false
          });
        } else {
          // File
          nodes.push({
            id: entry.path,
            name: await basename(entry.path),
            path: entry.path,
            type: 'file'
          });
        }
      }

      // Sort: folders first, then files alphabetically
      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      return await readTextFile(path);
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${path}`);
    }
  }

  getFileExtension(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    return ext;
  }

  getLanguageFromExtension(extension: string): string {
    return languageDetector.getLanguage(`file.${extension}`);
  }

  isTextFile(extension: string): boolean {
    return languageDetector.isTextFile(`file.${extension}`);
  }
} 
