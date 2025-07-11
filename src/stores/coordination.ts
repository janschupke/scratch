import { useAppStore } from './appStore';
import { useFileStore } from './fileStore';
import { useTabStore } from './tabStore';
import { useEditorStore } from './editorStore';

// Centralized store coordination to prevent conflicts
export function useStoreCoordination() {
  const appStore = useAppStore();
  const fileStore = useFileStore();
  const tabStore = useTabStore();
  const editorStore = useEditorStore();

  // Coordinate file opening between stores
  const openFile = async (path: string) => {
    try {
      // Update file store
      await fileStore.openFile(path);
      
      // Get file info from file store state
      const { openTabs } = fileStore;
      const fileTab = openTabs.find(tab => tab.path === path);
      if (!fileTab) {
        throw new Error('File not found in store');
      }

      // Update tab store
      tabStore.addTab({
        title: fileTab.title,
        path: fileTab.path,
        language: fileTab.language,
        isModified: false,
        isPinned: false,
      });

      // Update app store
      appStore.addRecentFile(path);
      
      return true;
    } catch (error) {
      console.error('Failed to open file:', error);
      return false;
    }
  };

  // Coordinate file saving
  const saveFile = async (tabId: string) => {
    const { tabs } = tabStore;
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return false;

    try {
      // Get content from editor store
      const { editorInstance } = editorStore;
      if (!editorInstance) {
        throw new Error('No editor instance available');
      }

      const content = editorInstance.getValue();
      
      // Save using file system
      const { writeTextFile } = await import('@tauri-apps/api/fs');
      await writeTextFile(tab.path, content);
      
      tabStore.markTabAsModified(tabId, false);
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  };

  // Coordinate tab closing
  const closeTab = (tabId: string) => {
    const { tabs } = tabStore;
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    // Check if file is modified
    if (tab.isModified) {
      // Prompt user for save (implement confirmation dialog)
      const shouldSave = confirm('Save changes before closing?');
      if (shouldSave) {
        saveFile(tabId);
      }
    }

    tabStore.closeTab(tabId);
    // Note: Editor cleanup is handled by the editor component
  };

  return {
    openFile,
    saveFile,
    closeTab,
  };
} 
