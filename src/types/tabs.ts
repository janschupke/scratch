export interface Tab {
  id: string;
  title: string;
  path: string;
  isActive: boolean;
  isModified: boolean;
  isPinned: boolean;
  language: string;
  lastAccessed: number;
  content?: string; // File content
  preview?: string; // First few lines of content
  editorState?: any; // Editor state (cursor, scroll, selections, viewState)
}

export interface TabGroup {
  id: string;
  name: string;
  tabs: Tab[];
  isActive: boolean;
}

export interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  tabGroups: TabGroup[];
  activeGroupId: string | null;
  tabOrder: string[]; // Maintains tab order for reordering
} 
