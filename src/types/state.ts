import { Tab } from './tabs';
import { FileNode } from './index';

export interface AppState {
  currentFolder: string | null;
  openTabs: Tab[];
  activeTabId: string | null;
  tabOrder: string[];
  fileTree: FileNode[];
  expandedNodes: string[];
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  lastOpenedFiles: string[]; // Recent files list
  sessionId: string;
  lastSaved: number;
}

export interface EditorState {
  filePath: string;
  cursorPosition: { line: number; column: number };
  scrollPosition: { top: number; left: number };
  selections: Array<{ start: number; end: number }>;
  viewState?: string; // Monaco editor view state
}

export interface TabState {
  id: string;
  filePath: string;
  title: string;
  isPinned: boolean;
  isModified: boolean;
  editorState?: EditorState;
}

export interface ApplicationState {
  windowState: WindowState;
  openedFolder?: string;
  fileTreeState: Record<string, boolean>; // expanded/collapsed
  tabs: TabState[];
  activeTabId?: string;
  lastSaved: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  editor: {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    insertSpaces: boolean;
    wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
    minimap: { enabled: boolean };
    lineNumbers: 'on' | 'off' | 'relative';
    autoSave: boolean;
    autoSaveDelay: number;
    formatOnSave: boolean;
  };
  window: {
    rememberPosition: boolean;
    rememberSize: boolean;
    startMaximized: boolean;
  };
  fileExplorer: {
    showHiddenFiles: boolean;
    sortBy: 'name' | 'type' | 'modified' | 'size';
    sortDirection: 'asc' | 'desc';
  };
  shortcuts: Record<string, string>;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullscreen: boolean;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  screenId?: string; // For multi-monitor support
}

export interface StateMigration {
  version: number;
  migrate: (oldState: any) => any;
} 
