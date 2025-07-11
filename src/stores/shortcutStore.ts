import { create } from 'zustand';
import { ShortcutState, Shortcut, ShortcutCategory } from '../types/shortcuts';
import { ShortcutManager } from '../services/shortcutManager';

interface ShortcutStore extends ShortcutState {
  // Actions
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (id: string) => void;
  updateShortcut: (id: string, updates: Partial<Shortcut>) => void;
  setEnabled: (enabled: boolean) => void;
  getShortcutsByCategory: (category: ShortcutCategory) => Shortcut[];
  executeShortcut: (id: string) => void;
}

export const useShortcutStore = create<ShortcutStore>((set, get) => ({
  shortcuts: new Map(),
  enabled: true,
  globalShortcuts: new Set(),
  lastExecuted: null,

  registerShortcut: (shortcut) => {
    set(state => {
      const newShortcuts = new Map(state.shortcuts);
      newShortcuts.set(shortcut.id, shortcut);
      
      if (shortcut.global) {
        const newGlobalShortcuts = new Set(state.globalShortcuts);
        newGlobalShortcuts.add(shortcut.id);
        return { 
          shortcuts: newShortcuts, 
          globalShortcuts: newGlobalShortcuts 
        };
      }
      
      return { shortcuts: newShortcuts };
    });
    
    ShortcutManager.getInstance().registerShortcut(shortcut);
  },

  unregisterShortcut: (id) => {
    set(state => {
      const newShortcuts = new Map(state.shortcuts);
      newShortcuts.delete(id);
      
      const newGlobalShortcuts = new Set(state.globalShortcuts);
      newGlobalShortcuts.delete(id);
      
      return { 
        shortcuts: newShortcuts, 
        globalShortcuts: newGlobalShortcuts 
      };
    });
    
    ShortcutManager.getInstance().unregisterShortcut(id);
  },

  updateShortcut: (id, updates) => {
    set(state => {
      const shortcut = state.shortcuts.get(id);
      if (shortcut) {
        const updatedShortcut = { ...shortcut, ...updates };
        const newShortcuts = new Map(state.shortcuts);
        newShortcuts.set(id, updatedShortcut);
        return { shortcuts: newShortcuts };
      }
      return state;
    });
  },

  setEnabled: (enabled) => set({ enabled }),

  getShortcutsByCategory: (category) => {
    const { shortcuts } = get();
    return Array.from(shortcuts.values()).filter(
      shortcut => shortcut.category === category
    );
  },

  executeShortcut: (id) => {
    const { shortcuts } = get();
    const shortcut = shortcuts.get(id);
    if (shortcut && shortcut.enabled) {
      shortcut.action();
      set({ lastExecuted: id });
    }
  },
})); 
