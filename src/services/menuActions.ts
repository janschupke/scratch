import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { useFileStore } from '../stores/fileStore';
import { useTabStore } from '../stores/tabStore';
import { useMenuStore } from '../stores/menuStore';
import { useEditorStore } from '../stores/editorStore';
import { useAppStore } from '../stores/appStore';

export class MenuActions {
  static async newFile() {
    const { addTab } = useTabStore.getState();
    const newTab = {
      id: `tab-${Date.now()}`,
      path: '',
      title: 'Untitled',
      isPinned: false,
      isModified: false,
      language: 'plaintext',
      lastAccessed: Date.now(),
      content: '',
      isActive: true
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
        await openFile(selected as string);
        useMenuStore.getState().addRecentFile(selected as string);
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

  static async save() {
    try {
      const { activeTabId, tabs } = useTabStore.getState();
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      
      if (!activeTab || !activeTab.path) {
        return this.saveAs();
      }
      
      const { editorInstance } = useEditorStore.getState();
      const content = editorInstance?.getValue() || '';
      
      await invoke('write_text_file', {
        path: activeTab.path,
        content
      });
      
      // Update tab as saved
      useTabStore.getState().markTabAsModified(activeTabId!, false);
      console.log('File saved:', activeTab.path);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }

  static async saveAs() {
    try {
      const { activeTabId, tabs } = useTabStore.getState();
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      const { editorInstance } = useEditorStore.getState();
      const content = editorInstance?.getValue() || '';
      
      const savePath = await invoke('save_file_dialog', {
        options: {
          title: 'Save File As',
          filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'html', 'css'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        }
      });
      
      if (savePath) {
        await invoke('write_text_file', {
          path: savePath as string,
          content
        });
        
        // Update tab with new path
        if (activeTab) {
          useTabStore.getState().updateTabContent(activeTabId!, content);
          useTabStore.getState().markTabAsModified(activeTabId!, false);
        }
        
        console.log('File saved as:', savePath);
      }
    } catch (error) {
      console.error('Failed to save file as:', error);
    }
  }

  static async exit() {
    try {
      const { tabs } = useTabStore.getState();
      const hasUnsavedChanges = tabs.some(tab => tab.isModified);
      
      if (hasUnsavedChanges) {
        const confirmed = await invoke('show_confirm_dialog', {
          title: 'Unsaved Changes',
          message: 'Do you want to save your changes before exiting?'
        });
        
        if (confirmed) {
          await this.save();
        }
      }
      
      await appWindow.close();
    } catch (error) {
      console.error('Failed to exit:', error);
      await appWindow.close();
    }
  }

  static async undo() {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'undo', null);
    }
  }

  static async redo() {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'redo', null);
    }
  }

  static async cut() {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'cut', null);
    }
  }

  static async copy() {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'copy', null);
    }
  }

  static async paste() {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'paste', null);
    }
  }

  static async find() {
    // TODO: Show find/replace panel
    console.log('Find action triggered');
  }

  static async replace() {
    // TODO: Show find/replace panel in replace mode
    console.log('Replace action triggered');
  }

  static async selectAll() {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'selectAll', null);
    }
  }

  static async toggleSidebar() {
    const { isSidebarCollapsed } = useAppStore.getState();
    useAppStore.getState().updateWindowState({ isSidebarCollapsed: !isSidebarCollapsed });
  }

  static async toggleStatusBar() {
    // TODO: Implement status bar toggle
    console.log('Toggle status bar action triggered');
  }

  static async zoomIn() {
    // TODO: Implement zoom in functionality
    console.log('Zoom in action triggered');
  }

  static async zoomOut() {
    // TODO: Implement zoom out functionality
    console.log('Zoom out action triggered');
  }

  static async resetZoom() {
    // TODO: Implement reset zoom functionality
    console.log('Reset zoom action triggered');
  }

  static async fullScreen() {
    const isFullscreen = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!isFullscreen);
  }

  static async about() {
    await invoke('show_message_dialog', {
      title: 'About Scratch Editor',
      message: 'Scratch Editor v1.0.0\nA modern, lightweight code editor built with React, TypeScript, and Tauri.'
    });
  }

  static async documentation() {
    await invoke('open_url', {
      url: 'https://github.com/your-repo/scratch-editor'
    });
  }

  static async shortcuts() {
    await invoke('show_message_dialog', {
      title: 'Keyboard Shortcuts',
      message: 'Common shortcuts:\nCmd+N: New File\nCmd+O: Open File\nCmd+S: Save\nCmd+F: Find\nCmd+H: Replace\nCmd+Z: Undo\nCmd+Shift+Z: Redo'
    });
  }
} 
