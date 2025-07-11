import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileOperations } from '../fileOperations';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

// Mock stores
const mockOpenFolder = vi.fn();
const mockOpenFile = vi.fn();
const mockAddRecentFile = vi.fn();
const mockMarkTabAsModified = vi.fn();
const mockUpdateTabContent = vi.fn();

vi.mock('../../stores/fileStore', () => ({
  useFileStore: {
    getState: () => ({
      openFolder: mockOpenFolder,
      openFile: mockOpenFile,
    }),
  },
}));

vi.mock('../../stores/tabStore', () => ({
  useTabStore: {
    getState: () => ({
      activeTabId: 'tab-1',
      tabs: [
        {
          id: 'tab-1',
          path: '/test/file.txt',
          title: 'file.txt',
          content: 'test content',
          isModified: true,
        },
      ],
      markTabAsModified: mockMarkTabAsModified,
      updateTabContent: mockUpdateTabContent,
    }),
  },
}));

vi.mock('../../stores/menuStore', () => ({
  useMenuStore: {
    getState: () => ({
      addRecentFile: mockAddRecentFile,
    }),
  },
}));

vi.mock('../../stores/editorStore', () => ({
  useEditorStore: {
    getState: () => ({
      editorInstance: {
        getValue: () => 'test content',
      },
    }),
  },
}));

describe('FileOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openFolder', () => {
    it('should successfully open a folder', async () => {
      mockOpenFolder.mockResolvedValue(undefined);

      const result = await FileOperations.openFolder();

      expect(result.success).toBe(true);
      expect(mockOpenFolder).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when opening folder', async () => {
      mockOpenFolder.mockRejectedValue(new Error('Permission denied'));

      const result = await FileOperations.openFolder();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });
  });

  describe('openFile', () => {
    it('should successfully open a file', async () => {
      mockOpenFile.mockResolvedValue(undefined);
      const { invoke } = await import('@tauri-apps/api/tauri');
      vi.mocked(invoke).mockResolvedValue('/test/file.txt');

      const result = await FileOperations.openFile();

      expect(result.success).toBe(true);
      expect(result.data?.filePath).toBe('/test/file.txt');
      expect(mockOpenFile).toHaveBeenCalledWith('/test/file.txt');
      expect(mockAddRecentFile).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should handle no file selected', async () => {
      const { invoke } = await import('@tauri-apps/api/tauri');
      vi.mocked(invoke).mockResolvedValue(null);

      const result = await FileOperations.openFile();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No file selected');
    });

    it('should handle errors when opening file', async () => {
      const { invoke } = await import('@tauri-apps/api/tauri');
      vi.mocked(invoke).mockRejectedValue(new Error('File not found'));

      const result = await FileOperations.openFile();

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
    });
  });

  describe('saveFile', () => {
    it('should successfully save a file', async () => {
      const { invoke } = await import('@tauri-apps/api/tauri');
      vi.mocked(invoke).mockResolvedValue(undefined);

      const result = await FileOperations.saveFile();

      expect(result.success).toBe(true);
      expect(result.data?.filePath).toBe('/test/file.txt');
      expect(vi.mocked(invoke)).toHaveBeenCalledWith('write_text_file', {
        path: '/test/file.txt',
        content: 'test content',
      });
      expect(mockMarkTabAsModified).toHaveBeenCalledWith('tab-1', false);
    });

    it('should handle save errors', async () => {
      const { invoke } = await import('@tauri-apps/api/tauri');
      vi.mocked(invoke).mockRejectedValue(new Error('Write permission denied'));

      const result = await FileOperations.saveFile();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Write permission denied');
    });
  });

  describe('saveFileAs', () => {
    it('should successfully save file as', async () => {
      const { invoke } = await import('@tauri-apps/api/tauri');
      vi.mocked(invoke)
        .mockResolvedValueOnce('/test/newfile.txt') // save_file_dialog
        .mockResolvedValueOnce(undefined); // write_text_file

      const result = await FileOperations.saveFileAs();

      expect(result.success).toBe(true);
      expect(result.data?.filePath).toBe('/test/newfile.txt');
      expect(vi.mocked(invoke)).toHaveBeenCalledWith('write_text_file', {
        path: '/test/newfile.txt',
        content: 'test content',
      });
      expect(mockMarkTabAsModified).toHaveBeenCalledWith('tab-1', false);
    });

    it('should handle no save path selected', async () => {
      const { invoke } = await import('@tauri-apps/api/tauri');
      vi.mocked(invoke).mockResolvedValue(null);

      const result = await FileOperations.saveFileAs();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No save path selected');
    });

    it('should handle save as errors', async () => {
      const { invoke } = await import('@tauri-apps/api/tauri');
      vi.mocked(invoke).mockRejectedValue(new Error('Save dialog failed'));

      const result = await FileOperations.saveFileAs();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Save dialog failed');
    });
  });
}); 
