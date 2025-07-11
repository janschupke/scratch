import { useFileStore } from '../stores/fileStore';
import { FileTypeDetector } from '../utils/fileDetection';

export interface FileNavigationOptions {
  forceNewTab?: boolean;
  preview?: boolean;
  focus?: boolean;
}

export interface FileNavigationResult {
  success: boolean;
  tabId?: string;
  error?: string;
  fileInfo?: any;
}

export class FileNavigationService {
  static async openFile(path: string, options?: FileNavigationOptions): Promise<FileNavigationResult> {
    try {
      const { openTabs, openFile, setActiveTab } = useFileStore.getState();
      const existingTab = openTabs.find(tab => tab.path === path);
      const fileInfo = await FileTypeDetector.detectFileType(path);

      if (!fileInfo.isText) {
        return { success: false, error: 'Cannot open binary or unsupported file type.' };
      }
      if (fileInfo.size && fileInfo.size > 2 * 1024 * 1024) {
        return { success: false, error: 'File is too large to open in the editor.' };
      }

      if (existingTab && !options?.forceNewTab) {
        setActiveTab(existingTab.id);
        return { success: true, tabId: existingTab.id, fileInfo };
      }

      await openFile(path);
      const { activeTabId } = useFileStore.getState();
      return { success: true, tabId: activeTabId || undefined, fileInfo };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to open file.' };
    }
  }

  static async closeFile(tabId: string): Promise<void> {
    const { closeTab } = useFileStore.getState();
    closeTab(tabId);
  }

  static focusTab(tabId: string): void {
    const { setActiveTab } = useFileStore.getState();
    setActiveTab(tabId);
  }

  static getOpenFiles(): string[] {
    const { openTabs } = useFileStore.getState();
    return openTabs.map(tab => tab.path);
  }

  static isFileOpen(path: string): boolean {
    const { openTabs } = useFileStore.getState();
    return !!openTabs.find(tab => tab.path === path);
  }
} 
