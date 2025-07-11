import { invoke } from '@tauri-apps/api/tauri';
import { useFileStore } from '../stores/fileStore';
import { useTabStore } from '../stores/tabStore';
import { useMenuStore } from '../stores/menuStore';

export class ShortcutActions {
  // File Operations
  static async newFile() {
    const { addTab } = useTabStore.getState();
    
    const newTab = {
      title: 'Untitled',
      path: '',
      isPinned: false,
      isModified: false,
      language: 'plaintext'
    };
    
    addTab(newTab);
  }

  static async openFile() {
    try {
      const selected = await invoke('open_file_dialog', {
        options: {
          title: 'Open File',
          filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'html', 'css'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        }
      });
      
      if (selected) {
        const { openFile } = useFileStore.getState();
        const { addRecentFile } = useMenuStore.getState();
        
        await openFile(selected as string);
        addRecentFile(selected as string);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }

  static async openFolder() {
    try {
      const { openFolder } = useFileStore.getState();
      await openFolder();
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  }

  static async saveFile() {
    const { tabs, activeTabId } = useTabStore.getState();
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    
    if (activeTab) {
      // For now, just mark as not modified since we don't have save functionality yet
      const { markTabAsModified } = useTabStore.getState();
      markTabAsModified(activeTab.id, false);
    }
  }

  static async saveFileAs() {
    try {
      const selected = await invoke('save_file_dialog', {
        options: {
          title: 'Save File As',
          filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'html', 'css'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        }
      });
      
      if (selected) {
        const { tabs, activeTabId } = useTabStore.getState();
        const activeTab = tabs.find(tab => tab.id === activeTabId);
        
        if (activeTab) {
          // For now, just mark as not modified since we don't have save functionality yet
          const { markTabAsModified } = useTabStore.getState();
          markTabAsModified(activeTab.id, false);
        }
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }

  static closeTab() {
    const { activeTabId, closeTab } = useTabStore.getState();
    if (activeTabId) {
      closeTab(activeTabId);
    }
  }

  static closeAllTabs() {
    const { closeAllTabs } = useTabStore.getState();
    closeAllTabs();
  }

  static async exit() {
    const { tabs } = useTabStore.getState();
    const hasUnsavedChanges = tabs.some(tab => tab.isModified);
    
    if (hasUnsavedChanges) {
      const confirmed = await this.showUnsavedChangesDialog();
      if (!confirmed) {
        return;
      }
    }
    
    await invoke('close_window');
  }
 
  static find() {
    // TODO: Implement find functionality
    console.log('Find shortcut triggered');
  }
 
  static replace() {
    // TODO: Implement replace functionality
    console.log('Replace shortcut triggered');
  }

  // Navigation Operations
  static switchToTab(tabIndex: number) {
    const { tabs, setActiveTab } = useTabStore.getState();
    const tab = tabs[tabIndex - 1]; // Convert 1-based to 0-based
    if (tab) {
      setActiveTab(tab.id);
    }
  }

  static previousTab() {
    const { tabs, activeTabId, setActiveTab } = useTabStore.getState();
    if (tabs.length > 1 && activeTabId) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      setActiveTab(tabs[previousIndex].id);
    }
  }

  static nextTab() {
    const { tabs, activeTabId, setActiveTab } = useTabStore.getState();
    if (tabs.length > 1 && activeTabId) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      setActiveTab(tabs[nextIndex].id);
    }
  }

  static toggleSidebar() {
    // This will be implemented when we have a layout store
    console.log('Toggle sidebar');
  }

  static toggleStatusBar() {
    // This will be implemented when we have a layout store
    console.log('Toggle status bar');
  }

  // Editor Operations
  static undo() {
    const { tabs, activeTabId } = useTabStore.getState();
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      // Trigger undo in Monaco editor
      const editor = (window as any).monaco?.editor?.getModel(activeTab.path);
      if (editor) {
        editor.undo();
      }
    }
  }

  static redo() {
    const { tabs, activeTabId } = useTabStore.getState();
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      // Trigger redo in Monaco editor
      const editor = (window as any).monaco?.editor?.getModel(activeTab.path);
      if (editor) {
        editor.redo();
      }
    }
  }

  static cut() {
    const { tabs, activeTabId } = useTabStore.getState();
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      // Trigger cut in Monaco editor
      const editor = (window as any).monaco?.editor?.getModel(activeTab.path);
      if (editor) {
        editor.trigger('keyboard', 'cut', {});
      }
    }
  }

  static copy() {
    const { tabs, activeTabId } = useTabStore.getState();
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      // Trigger copy in Monaco editor
      const editor = (window as any).monaco?.editor?.getModel(activeTab.path);
      if (editor) {
        editor.trigger('keyboard', 'copy', {});
      }
    }
  }

  static paste() {
    const { tabs, activeTabId } = useTabStore.getState();
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      // Trigger paste in Monaco editor
      const editor = (window as any).monaco?.editor?.getModel(activeTab.path);
      if (editor) {
        editor.trigger('keyboard', 'paste', {});
      }
    }
  }

  static selectAll() {
    const { tabs, activeTabId } = useTabStore.getState();
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      // Trigger select all in Monaco editor
      const editor = (window as any).monaco?.editor?.getModel(activeTab.path);
      if (editor) {
        editor.trigger('keyboard', 'selectAll', {});
      }
    }
  }

  private static async showUnsavedChangesDialog(): Promise<boolean> {
    // Implementation for unsaved changes dialog
    return true; // Placeholder
  }
} 
