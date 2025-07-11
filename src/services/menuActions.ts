import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { useFileStore } from '../stores/fileStore';
import { useTabStore } from '../stores/tabStore';
import { useMenuStore } from '../stores/menuStore';

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
      // Handle error
    }
  }

  static async openFolder() {
    try {
      const { openFolder } = useFileStore.getState();
      await openFolder();
    } catch (error) {}
  }

  static async save() {
    // Implement save logic via editor or file store
    // Placeholder: not implemented
  }

  static async saveAs() {
    // Implement save as dialog and logic
    // Placeholder: just call save for now
    await this.save();
  }

  static async exit() {
    await appWindow.close();
  }

  static async undo() {
    // Implement undo via editor instance
    // Placeholder: not implemented
  }

  static async redo() {
    // Implement redo via editor instance
    // Placeholder: not implemented
  }

  static async cut() {
    // Implement cut via editor instance
    // Placeholder: not implemented
  }

  static async copy() {
    // Implement copy via editor instance
    // Placeholder: not implemented
  }

  static async paste() {
    // Implement paste via editor instance
    // Placeholder: not implemented
  }

  static async find() {
    // Implement find dialog
    // Placeholder: not implemented
  }

  static async replace() {
    // Implement replace dialog
    // Placeholder: not implemented
  }

  static async selectAll() {
    // Implement select all in editor
    // Placeholder: not implemented
  }

  static async toggleSidebar() {
    // Implement sidebar toggle
    // Placeholder: not implemented
  }

  static async toggleStatusBar() {
    // Implement status bar toggle
    // Placeholder: not implemented
  }

  static async zoomIn() {
    // Implement zoom in
    // Placeholder: not implemented
  }

  static async zoomOut() {
    // Implement zoom out
    // Placeholder: not implemented
  }

  static async resetZoom() {
    // Implement reset zoom
    // Placeholder: not implemented
  }

  static async fullScreen() {
    const isFullscreen = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!isFullscreen);
  }

  static async about() {
    // Show about dialog
    // Placeholder: not implemented
  }

  static async documentation() {
    // Open documentation URL
    // Placeholder: not implemented
  }

  static async shortcuts() {
    // Show keyboard shortcuts dialog
    // Placeholder: not implemented
  }

  static async checkForUpdates() {
    // Implement update check
    // Placeholder: not implemented
  }
} 
