import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { createFileStore } from '../fileStore';

vi.mock('@tauri-apps/api/fs', () => ({
  readTextFile: vi.fn(),
  readBinaryFile: vi.fn()
}));

const mockFileSystem = {
  selectFolder: vi.fn(),
  readDirectory: vi.fn(),
  readFile: vi.fn(),
  getFileExtension: vi.fn(() => ''),
  getLanguageFromExtension: vi.fn(() => 'plaintext'),
  isTextFile: vi.fn(() => true)
};

const mockFileTypeDetector = {
  detectFileType: vi.fn(),
  analyzeFileContent: vi.fn(),
  prototype: {}
};

afterEach(() => {
  vi.clearAllMocks();
  mockFileSystem.selectFolder.mockReset();
  mockFileSystem.readDirectory.mockReset();
});

// Helper to wait for a store state condition
async function waitForState<T>(store: { getState: () => T }, predicate: (state: T) => boolean, timeout = 100) {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    function check() {
      if (predicate(store.getState())) return resolve();
      if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for state'));
      setTimeout(check, 1);
    }
    check();
  });
}

describe('FileStore', () => {
  describe('openFolder', () => {
    it('should open folder successfully', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockFolderPath = '/test/folder';
      const mockFiles = [
        { id: 'file1', name: 'test.txt', path: '/test/folder/test.txt', type: 'file' },
        { id: 'folder1', name: 'subfolder', path: '/test/folder/subfolder', type: 'folder', children: [] }
      ];
      mockFileSystem.selectFolder.mockResolvedValue(mockFolderPath);
      mockFileSystem.readDirectory.mockResolvedValue(mockFiles);
      const store = useFileStore.getState();
      await act(async () => {
        await store.openFolder();
      });
      try {
        await waitForState(useFileStore, s => s.currentFolder === mockFolderPath && !s.isLoading && !s.isOpeningFolder, 500);
      } catch (e) {
        // Debug output
        // eslint-disable-next-line no-console
        console.log('DEBUG STATE:', useFileStore.getState());
        throw e;
      }
      const finalState = useFileStore.getState();
      expect(finalState.currentFolder).toBe(mockFolderPath);
      expect(finalState.fileTree).toEqual(mockFiles);
      expect(finalState.error).toBeNull();
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isOpeningFolder).toBe(false);
    });

    it('should handle folder selection cancellation', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      mockFileSystem.selectFolder.mockResolvedValue(null);
      const store = useFileStore.getState();
      await act(async () => {
        await store.openFolder();
      });
      await waitForState(useFileStore, s => !s.isLoading && !s.isOpeningFolder);
      const finalState = useFileStore.getState();
      expect(finalState.currentFolder).toBeNull();
      expect(finalState.fileTree).toEqual([]);
      expect(finalState.error).toBeNull();
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isOpeningFolder).toBe(false);
    });

    it('should handle folder selection errors', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const errorMessage = 'Permission denied';
      mockFileSystem.selectFolder.mockRejectedValue(new Error(errorMessage));
      const store = useFileStore.getState();
      await act(async () => {
        await store.openFolder();
      });
      await waitForState(useFileStore, s => !!s.error && !s.isLoading && !s.isOpeningFolder);
      const finalState = useFileStore.getState();
      expect(finalState.error || '').toContain('Failed to open folder');
      expect(finalState.error || '').toContain(errorMessage);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isOpeningFolder).toBe(false);
    });

    it('should handle file tree loading errors', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockFolderPath = '/test/folder';
      const errorMessage = 'Directory not found';
      mockFileSystem.selectFolder.mockResolvedValue(mockFolderPath);
      mockFileSystem.readDirectory.mockRejectedValue(new Error(errorMessage));
      const store = useFileStore.getState();
      await act(async () => {
        await store.openFolder();
      });
      try {
        await waitForState(useFileStore, s => !!s.error && !s.isLoading && !s.isOpeningFolder, 500);
      } catch (e) {
        // Debug output
        // eslint-disable-next-line no-console
        console.log('DEBUG STATE:', useFileStore.getState());
        throw e;
      }
      const finalState = useFileStore.getState();
      expect(finalState.error || '').toContain('Failed to load file tree');
      expect(finalState.error || '').toContain(errorMessage);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isOpeningFolder).toBe(false);
    });

    it('should cancel previous folder operations', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockFolderPath = '/test/folder';
      const mockFiles = [{ id: 'file1', name: 'test.txt', path: '/test/folder/test.txt', type: 'file' }];
      mockFileSystem.selectFolder.mockResolvedValue(mockFolderPath);
      mockFileSystem.readDirectory.mockResolvedValue(mockFiles);
      const store = useFileStore.getState();
      const firstOperation = store.openFolder();
      const secondOperation = store.openFolder();
      await act(async () => {
        await Promise.all([firstOperation, secondOperation]);
      });
      await waitForState(useFileStore, s => s.currentFolder === mockFolderPath && !s.isLoading && !s.isOpeningFolder);
      const finalState = useFileStore.getState();
      expect(finalState.currentFolder).toBe(mockFolderPath);
      expect(finalState.fileTree).toEqual(mockFiles);
      expect(finalState.error).toBeNull();
    });
  });

  describe('loadFileTree', () => {
    it('should load file tree successfully', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath = '/test/folder';
      const mockFiles = [
        { id: 'file1', name: 'test.txt', path: '/test/folder/test.txt', type: 'file' }
      ];
      mockFileSystem.readDirectory.mockResolvedValue(mockFiles);
      const store = useFileStore.getState();
      await act(async () => {
        await store.loadFileTree(mockPath);
      });
      await waitForState(useFileStore, s => s.fileTree.length > 0 && !s.isLoading);
      const finalState = useFileStore.getState();
      expect(finalState.fileTree).toEqual(mockFiles);
      expect(finalState.error).toBeNull();
      expect(finalState.isLoading).toBe(false);
    });

    it('should handle file tree loading errors', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath = '/test/folder';
      const errorMessage = 'Directory not found';
      mockFileSystem.readDirectory.mockRejectedValue(new Error(errorMessage));
      const store = useFileStore.getState();
      await act(async () => {
        await store.loadFileTree(mockPath);
      });
      await waitForState(useFileStore, s => !!s.error && !s.isLoading);
      const finalState = useFileStore.getState();
      expect(finalState.error || '').toContain('Failed to load file tree');
      expect(finalState.error || '').toContain(errorMessage);
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('openFile', () => {
    it('should open text file successfully', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath = '/test/file.txt';
      const mockContent = 'Hello, World!';
      const mockFileInfo = {
        isText: true,
        encoding: 'utf-8',
        name: 'file.txt'
      };
      mockFileTypeDetector.detectFileType.mockResolvedValue(mockFileInfo);
      const { readTextFile } = await import('@tauri-apps/api/fs');
      (readTextFile as any).mockResolvedValue(mockContent);
      const store = useFileStore.getState();
      await act(async () => {
        await store.openFile(mockPath);
      });
      await waitForState(useFileStore, s => s.openTabs.length > 0 && !s.isLoading);
      const finalState = useFileStore.getState();
      expect(finalState.openTabs).toHaveLength(1);
      expect(finalState.openTabs[0].path).toBe(mockPath);
      expect(finalState.openTabs[0].content).toBe(mockContent);
      expect(finalState.openTabs[0].title).toBe('file.txt');
      expect(finalState.activeTabId).toBe(finalState.openTabs[0].id);
      expect(finalState.error).toBeNull();
      expect(finalState.isLoading).toBe(false);
    });

    it('should not open binary files', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath = '/test/file.bin';
      const mockFileInfo = {
        isText: false,
        encoding: 'binary',
        name: 'file.bin'
      };
      mockFileTypeDetector.detectFileType.mockResolvedValue(mockFileInfo);
      const store = useFileStore.getState();
      await act(async () => {
        await store.openFile(mockPath);
      });
      await waitForState(useFileStore, s => !!s.error && !s.isLoading);
      const finalState = useFileStore.getState();
      expect(finalState.openTabs).toHaveLength(0);
      expect(finalState.error).toBe('Cannot open binary or unsupported file type.');
      expect(finalState.isLoading).toBe(false);
    });

    it('should handle file opening errors', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath = '/test/file.txt';
      const errorMessage = 'File not found';
      mockFileTypeDetector.detectFileType.mockRejectedValue(new Error(errorMessage));
      const store = useFileStore.getState();
      await act(async () => {
        await store.openFile(mockPath);
      });
      await waitForState(useFileStore, s => !!s.error && !s.isLoading);
      const finalState = useFileStore.getState();
      expect(finalState.error || '').toContain('Failed to open file');
      expect(finalState.error || '').toContain(errorMessage);
      expect(finalState.isLoading).toBe(false);
    });

    it('should not open already open files', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath = '/test/file.txt';
      const mockContent = 'Hello, World!';
      const mockFileInfo = {
        isText: true,
        encoding: 'utf-8',
        name: 'file.txt'
      };
      mockFileTypeDetector.detectFileType.mockResolvedValue(mockFileInfo);
      const { readTextFile } = await import('@tauri-apps/api/fs');
      (readTextFile as any).mockResolvedValue(mockContent);
      const store = useFileStore.getState();
      await act(async () => {
        await store.openFile(mockPath);
      });
      await waitForState(useFileStore, s => s.openTabs.length > 0 && !s.isLoading);
      const firstState = useFileStore.getState();
      const firstTabId = firstState.activeTabId;
      await act(async () => {
        await store.openFile(mockPath);
      });
      await waitForState(useFileStore, s => s.openTabs.length === 1 && !s.isLoading);
      const finalState = useFileStore.getState();
      expect(finalState.openTabs).toHaveLength(1);
      expect(finalState.activeTabId).toBe(firstTabId);
    });
  });

  describe('closeTab', () => {
    it('should close tab successfully', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath = '/test/file.txt';
      const mockContent = 'Hello, World!';
      const mockFileInfo = {
        isText: true,
        encoding: 'utf-8',
        name: 'file.txt'
      };

      mockFileTypeDetector.detectFileType.mockResolvedValue(mockFileInfo);
      const { readTextFile } = await import('@tauri-apps/api/fs');
      (readTextFile as any).mockResolvedValue(mockContent);

      const store = useFileStore.getState();

      // Open a file first
      await act(async () => {
        await store.openFile(mockPath);
      });
      await waitForState(useFileStore, s => s.openTabs.length > 0 && !s.isLoading);
      const openState = useFileStore.getState();
      const tabId = openState.openTabs[0].id;
      expect(openState.openTabs).toHaveLength(1);

      // Close the tab
      act(() => {
        store.closeTab(tabId);
      });
      await waitForState(useFileStore, s => s.openTabs.length === 0);
      const finalState = useFileStore.getState();
      expect(finalState.openTabs).toHaveLength(0);
      expect(finalState.activeTabId).toBeNull();
    });

    it('should set new active tab when closing active tab', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath1 = '/test/file1.txt';
      const mockPath2 = '/test/file2.txt';
      const mockContent = 'Hello, World!';
      const mockFileInfo = {
        isText: true,
        encoding: 'utf-8',
        name: 'file.txt'
      };

      mockFileTypeDetector.detectFileType.mockResolvedValue(mockFileInfo);
      const { readTextFile } = await import('@tauri-apps/api/fs');
      (readTextFile as any).mockResolvedValue(mockContent);

      const store = useFileStore.getState();

      // Open two files
      await act(async () => {
        await store.openFile(mockPath1);
        await store.openFile(mockPath2);
      });
      await waitForState(useFileStore, s => s.openTabs.length === 2 && !s.isLoading);
      const openState = useFileStore.getState();
      expect(openState.openTabs).toHaveLength(2);
      const activeTabId = openState.activeTabId;
      const otherTabId = openState.openTabs.find(tab => tab.id !== activeTabId)?.id;

      // Close the active tab
      act(() => {
        store.closeTab(activeTabId!);
      });
      await waitForState(useFileStore, s => s.openTabs.length === 1);
      const finalState = useFileStore.getState();
      expect(finalState.openTabs).toHaveLength(1);
      expect(finalState.activeTabId).toBe(otherTabId);
    });
  });

  describe('setActiveTab', () => {
    it('should set active tab', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const mockPath = '/test/file.txt';
      const mockContent = 'Hello, World!';
      const mockFileInfo = {
        isText: true,
        encoding: 'utf-8',
        name: 'file.txt'
      };

      mockFileTypeDetector.detectFileType.mockResolvedValue(mockFileInfo);
      const { readTextFile } = await import('@tauri-apps/api/fs');
      (readTextFile as any).mockResolvedValue(mockContent);

      const store = useFileStore.getState();

      // Open a file
      await act(async () => {
        await store.openFile(mockPath);
      });
      await waitForState(useFileStore, s => s.openTabs.length > 0 && !s.isLoading);
      const openState = useFileStore.getState();
      const tabId = openState.openTabs[0].id;
      expect(openState.activeTabId).toBe(tabId);

      // Set active tab (should be same since it's the only tab)
      act(() => {
        store.setActiveTab(tabId);
      });
      const finalState = useFileStore.getState();
      expect(finalState.activeTabId).toBe(tabId);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const useFileStore = createFileStore({
        fileSystem: mockFileSystem,
        fileTypeDetector: mockFileTypeDetector
      });
      const store = useFileStore.getState();

      // Set an error first
      await act(async () => {
        mockFileSystem.selectFolder.mockRejectedValue(new Error('Test error'));
        await store.openFolder();
      });
      await waitForState(useFileStore, s => !!s.error && !s.isLoading && !s.isOpeningFolder);
      const errorState = useFileStore.getState();
      expect(!!errorState.error).toBe(true);

      // Clear the error
      act(() => {
        store.clearError();
      });
      const finalState = useFileStore.getState();
      expect(finalState.error).toBeNull();
    });
  });
}); 
