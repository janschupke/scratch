export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
}

export interface Tab {
  id: string;
  title: string;
  path: string;
  isActive: boolean;
  isModified: boolean;
  isPinned: boolean;
  language: string;
  lastAccessed: number;
  preview?: string; // First few lines of content
}

export interface EditorState {
  content: string;
  language: string;
  isDirty: boolean;
}

export interface AppState {
  currentFolder: string | null;
  openTabs: Tab[];
  activeTabId: string | null;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
} 
