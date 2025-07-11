import { create } from 'zustand';
import { MenuState } from '../types/menu';

interface MenuStore extends MenuState {
  setMenuVisibility: (visible: boolean) => void;
  setActiveMenu: (menu: string | null) => void;
  addRecentFile: (filePath: string) => void;
  clearRecentFiles: () => void;
  updateEditState: (state: Partial<Pick<MenuState, 'canUndo' | 'canRedo' | 'hasSelection' | 'hasClipboard'>>) => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  isVisible: true,
  activeMenu: null,
  recentFiles: [],
  canUndo: false,
  canRedo: false,
  hasSelection: false,
  hasClipboard: false,

  setMenuVisibility: (visible) => set({ isVisible: visible }),
  setActiveMenu: (menu) => set({ activeMenu: menu }),

  addRecentFile: (filePath) => {
    set(state => {
      const recentFiles = [filePath, ...state.recentFiles.filter(f => f !== filePath)].slice(0, 10);
      return { recentFiles };
    });
  },

  clearRecentFiles: () => set({ recentFiles: [] }),

  updateEditState: (state) => set(state),
})); 
