import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';

// Custom render function with providers
export function renderWithProviders(ui: ReactElement, options = {}) {
  // Add any providers needed for testing
  return render(ui, options);
}

// Mock stores for testing
export const mockFileStore = {
  currentFolder: '/test/path',
  fileTree: [],
  openTabs: [],
  activeTabId: null,
  isLoading: false,
  error: null,
  openFolder: vi.fn(),
  loadFileTree: vi.fn(),
  openFile: vi.fn(),
  closeTab: vi.fn(),
  setActiveTab: vi.fn(),
};

export const mockTabStore = {
  tabs: [],
  activeTabId: null,
  tabGroups: [],
  activeGroupId: null,
  tabOrder: [],
  addTab: vi.fn(),
  closeTab: vi.fn(),
  setActiveTab: vi.fn(),
  reorderTabs: vi.fn(),
};

export const mockEditorStore = {
  editorInstance: null,
  settings: {
    wordWrap: 'on',
    minimap: { enabled: true },
    lineNumbers: 'on',
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    tabSize: 2,
    insertSpaces: true,
  },
  isLoading: false,
  error: null,
  setEditorInstance: vi.fn(),
  saveFile: vi.fn(),
  formatDocument: vi.fn(),
  toggleWordWrap: vi.fn(),
  toggleMinimap: vi.fn(),
  toggleLineNumbers: vi.fn(),
  updateSettings: vi.fn(),
  setError: vi.fn(),
};

export const mockAppStore = {
  currentFolder: null,
  openTabs: [],
  activeTabId: null,
  tabOrder: [],
  fileTree: [],
  expandedNodes: [],
  sidebarWidth: 250,
  isSidebarCollapsed: false,
  lastOpenedFiles: [],
  sessionId: 'test-session',
  lastSaved: Date.now(),
  preferences: {
    theme: 'dark',
    editor: {
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      minimap: { enabled: true },
      lineNumbers: 'on',
      autoSave: true,
      autoSaveDelay: 1000,
      formatOnSave: false,
    },
    window: {
      rememberPosition: true,
      rememberSize: true,
      startMaximized: false,
    },
    fileExplorer: {
      showHiddenFiles: false,
      sortBy: 'name',
      sortDirection: 'asc',
    },
    shortcuts: {
      'save': 'Ctrl+S',
      'new-file': 'Ctrl+N',
      'open-file': 'Ctrl+O',
      'format': 'Shift+Alt+F',
    },
  },
  windowState: {
    x: 100,
    y: 100,
    width: 1200,
    height: 800,
    isMaximized: false,
    isFullscreen: false,
    sidebarWidth: 250,
    isSidebarCollapsed: false,
  },
  isLoading: false,
  error: null,
  initializeApp: vi.fn(),
  saveState: vi.fn(),
  loadState: vi.fn(),
  resetState: vi.fn(),
  updatePreferences: vi.fn(),
  updateWindowState: vi.fn(),
  addRecentFile: vi.fn(),
  clearRecentFiles: vi.fn(),
}; 
