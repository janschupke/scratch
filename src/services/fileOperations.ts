import { invoke } from '@tauri-apps/api/tauri';
import { useFileStore } from '../stores/fileStore';
import { useTabStore } from '../stores/tabStore';
import { useMenuStore } from '../stores/menuStore';
import { useEditorStore } from '../stores/editorStore';

export interface FileOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class FileOperations {
  static async openFolder(): Promise<FileOperationResult> {
    try {
      const { openFolder } = useFileStore.getState();
      await openFolder();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async openFile(): Promise<FileOperationResult> {
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
        
        return { 
          success: true, 
          data: { filePath: selected as string } 
        };
      }

      return { success: false, error: 'No file selected' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async saveFile(filePath?: string): Promise<FileOperationResult> {
    try {
      const { activeTabId, tabs } = useTabStore.getState();
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      
      if (!activeTab) {
        return { success: false, error: 'No active tab to save' };
      }

      const path = filePath || activeTab.path;
      if (!path) {
        return { success: false, error: 'No file path specified' };
      }

      const { editorInstance } = useEditorStore.getState();
      const content = editorInstance?.getValue() || activeTab.content || '';

      await invoke('write_text_file', {
        path,
        content
      });

      // Update tab as saved
      useTabStore.getState().markTabAsModified(activeTabId!, false);
      
      return { success: true, data: { filePath: path } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async saveFileAs(): Promise<FileOperationResult> {
    try {
      const { activeTabId, tabs } = useTabStore.getState();
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      
      if (!activeTab) {
        return { success: false, error: 'No active tab to save' };
      }

      const content = activeTab.content || '';

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
        useTabStore.getState().updateTabContent(activeTabId!, content);
        useTabStore.getState().markTabAsModified(activeTabId!, false);

        return { success: true, data: { filePath: savePath as string } };
      }

      return { success: false, error: 'No save path selected' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 
