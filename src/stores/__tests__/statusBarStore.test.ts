import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStatusBarStore } from '../statusBarStore';
import { StatusItem, FileInfo, EditorState } from '../statusBarStore';

// Mock the status information service
vi.mock('../statusInformation', () => ({
  statusInformationService: {
    getFileInfo: vi.fn(),
    formatFileSize: vi.fn()
  }
}));

describe('StatusBarStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useStatusBarStore.setState({
      state: {
        isVisible: true,
        items: [],
        fileInfo: null,
        editorState: null,
        customItems: []
      }
    });
  });

  describe('setVisibility', () => {
    it('should update visibility state', () => {
      const store = useStatusBarStore.getState();
      
      store.setVisibility(false);
      
      expect(useStatusBarStore.getState().state.isVisible).toBe(false);
    });

    it('should toggle visibility', () => {
      const store = useStatusBarStore.getState();
      
      store.setVisibility(false);
      expect(useStatusBarStore.getState().state.isVisible).toBe(false);
      
      store.setVisibility(true);
      expect(useStatusBarStore.getState().state.isVisible).toBe(true);
    });
  });

  describe('updateFileInfo', () => {
    it('should update file info and trigger status items update', () => {
      const store = useStatusBarStore.getState();
      const mockFileInfo: FileInfo = {
        path: '/test/file.ts',
        name: 'file.ts',
        type: 'TypeScript',
        encoding: 'UTF-8',
        size: 1024,
        lineCount: 50,
        isModified: false,
        isReadOnly: false
      };

      store.updateFileInfo(mockFileInfo);

      const state = useStatusBarStore.getState().state;
      expect(state.fileInfo).toEqual(mockFileInfo);
      expect(state.items.length).toBeGreaterThan(0);
    });

    it('should create status items for file info', () => {
      const store = useStatusBarStore.getState();
      const mockFileInfo: FileInfo = {
        path: '/test/file.ts',
        name: 'file.ts',
        type: 'TypeScript',
        encoding: 'UTF-8',
        size: 1024,
        lineCount: 50,
        isModified: false,
        isReadOnly: false
      };

      store.updateFileInfo(mockFileInfo);

      const items = useStatusBarStore.getState().state.items;
      const fileTypeItem = items.find(item => item.id === 'file-type');
      const languageItem = items.find(item => item.id === 'language');
      const lineCountItem = items.find(item => item.id === 'line-count');
      const encodingItem = items.find(item => item.id === 'encoding');
      const fileSizeItem = items.find(item => item.id === 'file-size');

      expect(fileTypeItem).toBeDefined();
      expect(fileTypeItem?.value).toBe('TypeScript');
      expect(languageItem).toBeDefined();
      expect(languageItem?.value).toBe('TypeScript');
      expect(lineCountItem).toBeDefined();
      expect(lineCountItem?.value).toBe('50');
      expect(encodingItem).toBeDefined();
      expect(encodingItem?.value).toBe('UTF-8');
      expect(fileSizeItem).toBeDefined();
    });
  });

  describe('updateEditorState', () => {
    it('should update editor state and trigger status items update', () => {
      const store = useStatusBarStore.getState();
      const mockEditorState: EditorState = {
        cursorPosition: { line: 10, column: 5 },
        selection: null,
        zoomLevel: 1.0,
        indentation: '2 spaces',
        language: 'TypeScript'
      };

      store.updateEditorState(mockEditorState);

      const state = useStatusBarStore.getState().state;
      expect(state.editorState).toEqual(mockEditorState);
      expect(state.items.length).toBeGreaterThan(0);
    });

    it('should create status items for editor state', () => {
      const store = useStatusBarStore.getState();
      const mockEditorState: EditorState = {
        cursorPosition: { line: 10, column: 5 },
        selection: null,
        zoomLevel: 1.0,
        indentation: '2 spaces',
        language: 'TypeScript'
      };

      store.updateEditorState(mockEditorState);

      const items = useStatusBarStore.getState().state.items;
      const cursorItem = items.find(item => item.id === 'cursor-position');
      const indentItem = items.find(item => item.id === 'indentation');
      const zoomItem = items.find(item => item.id === 'zoom');

      expect(cursorItem).toBeDefined();
      expect(cursorItem?.value).toBe('10, Col 5');
      expect(indentItem).toBeDefined();
      expect(indentItem?.value).toBe('2 spaces');
      expect(zoomItem).toBeDefined();
      expect(zoomItem?.value).toBe('100%');
    });

    it('should handle selection information', () => {
      const store = useStatusBarStore.getState();
      const mockEditorState: EditorState = {
        cursorPosition: { line: 10, column: 5 },
        selection: {
          start: { line: 10, column: 5 },
          end: { line: 12, column: 10 }
        },
        zoomLevel: 1.0,
        indentation: '2 spaces',
        language: 'TypeScript'
      };

      store.updateEditorState(mockEditorState);

      const items = useStatusBarStore.getState().state.items;
      const selectionItem = items.find(item => item.id === 'selection');

      expect(selectionItem).toBeDefined();
      expect(selectionItem?.value).toBe('3 lines, 5 chars');
    });
  });

  describe('custom items management', () => {
    it('should add custom items', () => {
      const store = useStatusBarStore.getState();
      const customItem: StatusItem = {
        id: 'custom-test',
        label: 'Test',
        value: 'Value',
        clickable: true
      };

      store.addCustomItem(customItem);

      const state = useStatusBarStore.getState().state;
      expect(state.customItems).toContainEqual(customItem);
    });

    it('should remove custom items', () => {
      const store = useStatusBarStore.getState();
      const customItem: StatusItem = {
        id: 'custom-test',
        label: 'Test',
        value: 'Value',
        clickable: true
      };

      store.addCustomItem(customItem);
      expect(useStatusBarStore.getState().state.customItems).toHaveLength(1);

      store.removeCustomItem('custom-test');
      expect(useStatusBarStore.getState().state.customItems).toHaveLength(0);
    });

    it('should clear all custom items', () => {
      const store = useStatusBarStore.getState();
      const customItems: StatusItem[] = [
        { id: 'custom-1', label: 'Test 1', value: 'Value 1' },
        { id: 'custom-2', label: 'Test 2', value: 'Value 2' }
      ];

      customItems.forEach(item => store.addCustomItem(item));
      expect(useStatusBarStore.getState().state.customItems).toHaveLength(2);

      store.clearCustomItems();
      expect(useStatusBarStore.getState().state.customItems).toHaveLength(0);
    });
  });

  describe('getFileInfo', () => {
    it('should return file info with correct structure', async () => {
      const store = useStatusBarStore.getState();
      const filePath = '/test/file.ts';
      const content = 'console.log("Hello World");';

      const fileInfo = await store.getFileInfo(filePath, content);

      expect(fileInfo).toMatchObject({
        path: filePath,
        name: 'file.ts',
        type: expect.any(String),
        encoding: expect.any(String),
        size: expect.any(Number),
        lineCount: expect.any(Number),
        isModified: false,
        isReadOnly: false
      });
    });

    it('should handle empty content', async () => {
      const store = useStatusBarStore.getState();
      const filePath = '/test/empty.txt';
      const content = '';

      const fileInfo = await store.getFileInfo(filePath, content);

      expect(fileInfo.lineCount).toBe(0);
      expect(fileInfo.size).toBe(0);
    });

    it('should extract filename from path', async () => {
      const store = useStatusBarStore.getState();
      const filePath = '/deep/nested/path/file.ts';
      const content = 'test';

      const fileInfo = await store.getFileInfo(filePath, content);

      expect(fileInfo.name).toBe('file.ts');
    });

    it('should handle path without extension', async () => {
      const store = useStatusBarStore.getState();
      const filePath = '/test/file';
      const content = 'test';

      const fileInfo = await store.getFileInfo(filePath, content);

      expect(fileInfo.name).toBe('file');
    });
  });

  describe('updateStatusItems', () => {
    it('should update status items when called directly', () => {
      const store = useStatusBarStore.getState();
      
      // Set up file info and editor state
      const mockFileInfo: FileInfo = {
        path: '/test/file.ts',
        name: 'file.ts',
        type: 'TypeScript',
        encoding: 'UTF-8',
        size: 1024,
        lineCount: 50,
        isModified: false,
        isReadOnly: false
      };

      const mockEditorState: EditorState = {
        cursorPosition: { line: 10, column: 5 },
        selection: null,
        zoomLevel: 1.0,
        indentation: '2 spaces',
        language: 'TypeScript'
      };

      store.updateFileInfo(mockFileInfo);
      store.updateEditorState(mockEditorState);

      const items = useStatusBarStore.getState().state.items;
      expect(items.length).toBeGreaterThan(0);

      // Verify specific items are present
      const fileTypeItem = items.find(item => item.id === 'file-type');
      const cursorItem = items.find(item => item.id === 'cursor-position');
      
      expect(fileTypeItem).toBeDefined();
      expect(cursorItem).toBeDefined();
    });

    it('should handle missing file info gracefully', () => {
      const store = useStatusBarStore.getState();
      
      // Only set editor state
      const mockEditorState: EditorState = {
        cursorPosition: { line: 10, column: 5 },
        selection: null,
        zoomLevel: 1.0,
        indentation: '2 spaces',
        language: 'TypeScript'
      };

      store.updateEditorState(mockEditorState);

      const items = useStatusBarStore.getState().state.items;
      // Should only have editor-related items
      const fileTypeItem = items.find(item => item.id === 'file-type');
      const cursorItem = items.find(item => item.id === 'cursor-position');
      
      expect(fileTypeItem).toBeUndefined();
      expect(cursorItem).toBeDefined();
    });

    it('should handle missing editor state gracefully', () => {
      const store = useStatusBarStore.getState();
      
      // Only set file info
      const mockFileInfo: FileInfo = {
        path: '/test/file.ts',
        name: 'file.ts',
        type: 'TypeScript',
        encoding: 'UTF-8',
        size: 1024,
        lineCount: 50,
        isModified: false,
        isReadOnly: false
      };

      store.updateFileInfo(mockFileInfo);

      const items = useStatusBarStore.getState().state.items;
      // Should only have file-related items
      const fileTypeItem = items.find(item => item.id === 'file-type');
      const cursorItem = items.find(item => item.id === 'cursor-position');
      
      expect(fileTypeItem).toBeDefined();
      expect(cursorItem).toBeUndefined();
    });
  });
}); 
