import { create } from 'zustand';
import { FileSystemManager } from '../utils/fileSystem';
import { FileNode } from '../types';
import { Tab } from '../types/tabs';

interface FileStore {
  currentFolder: string | null;
  fileTree: FileNode[];
  openTabs: Tab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  openFolder: () => Promise<void>;
  loadFileTree: (path: string) => Promise<void>;
  openFile: (path: string) => Promise<void>;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  clearError: () => void;
}

export const useFileStore = create<FileStore>((set, get) => {
  const fileSystem = FileSystemManager.getInstance();

  return {
    currentFolder: null,
    fileTree: [],
    openTabs: [],
    activeTabId: null,
    isLoading: false,
    error: null,

    openFolder: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const folderPath = await fileSystem.selectFolder();
        if (folderPath) {
          set({ currentFolder: folderPath });
          await get().loadFileTree(folderPath);
        }
      } catch (error) {
        set({ error: `Failed to open folder: ${error}` });
      } finally {
        set({ isLoading: false });
      }
    },

    loadFileTree: async (path: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const nodes = await fileSystem.readDirectory(path);
        set({ fileTree: nodes });
      } catch (error) {
        set({ error: `Failed to load file tree: ${error}` });
      } finally {
        set({ isLoading: false });
      }
    },

    openFile: async (path: string) => {
      const { openTabs } = get();
      
      // Check if file is already open
      const existingTab = openTabs.find(tab => tab.path === path);
      if (existingTab) {
        get().setActiveTab(existingTab.id);
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const extension = fileSystem.getFileExtension(path);
        const language = fileSystem.getLanguageFromExtension(extension);
        
        // Only open text files
        if (!fileSystem.isTextFile(extension)) {
          set({ error: 'Only text files can be opened in the editor' });
          return;
        }

        const content = await fileSystem.readFile(path);
        const fileName = path.split('/').pop() || 'Untitled';
        
        const newTab: Tab = {
          id: `tab-${Date.now()}`,
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
        set({ 
          openTabs: updatedTabs,
          activeTabId: newTab.id,
          isLoading: false 
        });
      } catch (error) {
        set({ error: `Failed to open file: ${error}` });
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

      set({ 
        openTabs: updatedTabs,
        activeTabId: newActiveTabId
      });
    },

    setActiveTab: (tabId: string) => {
      set({ activeTabId: tabId });
    },

    clearError: () => {
      set({ error: null });
    }
  };
}); 
