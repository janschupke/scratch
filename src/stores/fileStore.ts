import { create } from 'zustand';
import { FileSystemManager } from '../utils/fileSystem';
import { FileNode } from '../types';
import { Tab } from '../types/tabs';
import { FileTypeDetector } from '../utils/fileDetection';

interface FileStoreDeps {
  fileSystem: typeof FileSystemManager.prototype;
  fileTypeDetector: {
    detectFileType: (path: string) => Promise<any>;
  };
}

interface FileStore {
  currentFolder: string | null;
  fileTree: FileNode[];
  openTabs: Tab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;
  isOpeningFolder: boolean;

  // Actions
  openFolder: () => Promise<void>;
  loadFileTree: (path: string) => Promise<void>;
  openFile: (path: string) => Promise<void>;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  clearError: () => void;
}

export function createFileStore({ fileSystem, fileTypeDetector }: FileStoreDeps) {
  let currentFolderRequest: AbortController | null = null;
  return create<FileStore>((set, get) => ({
    currentFolder: null,
    fileTree: [],
    openTabs: [],
    activeTabId: null,
    isLoading: false,
    error: null,
    isOpeningFolder: false,

    openFolder: async () => {
      if (currentFolderRequest) {
        currentFolderRequest.abort();
      }
      const abortController = new AbortController();
      currentFolderRequest = abortController;
      set({ isLoading: true, error: null, isOpeningFolder: true });
      try {
        const folderPath = await fileSystem.selectFolder();
        if (abortController.signal.aborted) return;
        set({ isOpeningFolder: false }); // Folder selection is done
        if (folderPath) {
          set({ currentFolder: folderPath });
          await get().loadFileTree(folderPath);
        }
      } catch (error: any) {
        if (!abortController.signal.aborted) {
          set({ error: `Failed to open folder: ${error.message || error}` });
          set({ isOpeningFolder: false });
        }
      } finally {
        if (!abortController.signal.aborted) {
          set({ isLoading: false });
        }
        currentFolderRequest = null;
      }
    },

    loadFileTree: async (path: string) => {
      if (currentFolderRequest) {
        currentFolderRequest.abort();
      }
      const abortController = new AbortController();
      currentFolderRequest = abortController;
      set({ isLoading: true, error: null });
      try {
        const nodes = await fileSystem.readDirectory(path);
        if (abortController.signal.aborted) return;
        set({ fileTree: nodes });
      } catch (error: any) {
        if (!abortController.signal.aborted) {
          set({ error: `Failed to load file tree: ${error.message || error}` });
        }
      } finally {
        if (!abortController.signal.aborted) {
          set({ isLoading: false });
        }
        currentFolderRequest = null;
      }
    },

    openFile: async (path: string) => {
      const { openTabs } = get();
      const existingTab = openTabs.find(tab => tab.path === path);
      if (existingTab) {
        get().setActiveTab(existingTab.id);
        return;
      }
      set({ isLoading: true, error: null });
      try {
        const fileInfo = await fileTypeDetector.detectFileType(path);
        if (!fileInfo.isText) {
          set({ error: 'Cannot open binary or unsupported file type.' });
          return;
        }
        let content = '';
        if (fileInfo.encoding === 'utf-8' || fileInfo.encoding === 'ascii') {
          const { readTextFile } = await import('@tauri-apps/api/fs');
          content = await readTextFile(path);
        } else if (fileInfo.encoding === 'utf-16le') {
          const { readBinaryFile } = await import('@tauri-apps/api/fs');
          const buffer = new Uint8Array(await readBinaryFile(path));
          content = new TextDecoder('utf-16le').decode(buffer);
        } else {
          set({ error: 'Unsupported file encoding.' });
          return;
        }
        const fileName = fileInfo.name;
        const language = fileName.split('.').pop() || 'plaintext';
        const newTab: Tab = {
          id: `tab-${Date.now()}-${Math.random()}`,
          title: fileName,
          path,
          isActive: true,
          isModified: false,
          isPinned: false,
          language,
          lastAccessed: Date.now(),
          content
        };
        const updatedTabs = [...openTabs, newTab];
        set({ openTabs: updatedTabs, activeTabId: newTab.id, isLoading: false });
      } catch (error: any) {
        set({ error: `Failed to open file: ${error.message || error}` });
      } finally {
        set({ isLoading: false });
      }
    },

    closeTab: (tabId: string) => {
      const { openTabs, activeTabId } = get();
      const updatedTabs = openTabs.filter(tab => tab.id !== tabId);
      let newActiveTabId = activeTabId;
      if (activeTabId === tabId) {
        newActiveTabId = updatedTabs.length > 0 ? updatedTabs[0].id : null;
      }
      set({ openTabs: updatedTabs, activeTabId: newActiveTabId });
    },

    setActiveTab: (tabId: string) => {
      set({ activeTabId: tabId });
    },

    clearError: () => {
      set({ error: null });
    }
  }));
}

// Default store instance for app use
export const useFileStore = createFileStore({
  fileSystem: FileSystemManager.getInstance(),
  fileTypeDetector: FileTypeDetector
}); 
