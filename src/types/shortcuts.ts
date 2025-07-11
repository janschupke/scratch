export interface Shortcut {
  id: string;
  key: string;
  description: string;
  category: ShortcutCategory;
  action: () => void | Promise<void>;
  enabled: boolean;
  visible: boolean;
  global?: boolean;
}

export type ShortcutCategory = 
  | 'file'
  | 'edit'
  | 'navigation'
  | 'editor'
  | 'view'
  | 'system';

export interface ShortcutState {
  shortcuts: Map<string, Shortcut>;
  enabled: boolean;
  globalShortcuts: Set<string>;
  lastExecuted: string | null;
}

export interface ShortcutContext {
  hasActiveTab: boolean;
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isSidebarVisible: boolean;
  isStatusBarVisible: boolean;
  zoomLevel: number;
} 
