export interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  enabled: boolean;
  visible: boolean;
  action: () => void;
  submenu?: MenuItem[];
}

export interface MenuBar {
  file: MenuItem[];
  edit: MenuItem[];
  view: MenuItem[];
  help: MenuItem[];
}

export interface MenuState {
  isVisible: boolean;
  activeMenu: string | null;
  recentFiles: string[];
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  hasClipboard: boolean;
} 
