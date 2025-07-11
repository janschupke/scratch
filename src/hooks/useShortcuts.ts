import { useEffect } from 'react';
import { useShortcutStore } from '../stores/shortcutStore';
import { ShortcutActions } from '../services/shortcutActions';
import { useTabStore } from '../stores/tabStore';

// Platform detection utility
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

export const useShortcuts = () => {
  const { registerShortcut, unregisterShortcut } = useShortcutStore();
  const { activeTabId } = useTabStore();
  const hasActiveTab = activeTabId !== null;
  const hasSelection = false; // TODO: Implement selection detection
  const canUndo = false; // TODO: Implement undo state detection
  const canRedo = false; // TODO: Implement redo state detection

  useEffect(() => {
    // Register all shortcuts
    const shortcuts = [
      // File Operations
      {
        id: 'new-file',
        key: 'Cmd+N',
        description: 'Create new file',
        category: 'file' as const,
        action: () => ShortcutActions.newFile(),
        enabled: true,
        visible: true
      },
      {
        id: 'open-file',
        key: 'Cmd+O',
        description: 'Open file',
        category: 'file' as const,
        action: () => ShortcutActions.openFile(),
        enabled: true,
        visible: true
      },
      {
        id: 'open-folder',
        key: 'Cmd+Shift+O',
        description: 'Open folder',
        category: 'file' as const,
        action: () => ShortcutActions.openFolder(),
        enabled: true,
        visible: true
      },
      {
        id: 'save',
        key: 'Cmd+S',
        description: 'Save file',
        category: 'file' as const,
        action: () => ShortcutActions.saveFile(),
        enabled: hasActiveTab,
        visible: true
      },
      {
        id: 'save-as',
        key: 'Cmd+Shift+S',
        description: 'Save file as',
        category: 'file' as const,
        action: () => ShortcutActions.saveFileAs(),
        enabled: hasActiveTab,
        visible: true
      },
      {
        id: 'close-tab',
        key: 'Cmd+W',
        description: 'Close tab',
        category: 'file' as const,
        action: () => ShortcutActions.closeTab(),
        enabled: hasActiveTab,
        visible: true
      },
      {
        id: 'close-all-tabs',
        key: 'Cmd+Shift+W',
        description: 'Close all tabs',
        category: 'file' as const,
        action: () => ShortcutActions.closeAllTabs(),
        enabled: hasActiveTab,
        visible: true
      },
      // Only register Cmd+Q exit shortcut if not on Mac
      ...(!isMac ? [{
        id: 'exit',
        key: 'Cmd+Q',
        description: 'Exit application',
        category: 'file' as const,
        action: () => ShortcutActions.exit(),
        enabled: true,
        visible: true
      }] : []),

      // Edit Operations
      {
        id: 'undo',
        key: 'Cmd+Z',
        description: 'Undo',
        category: 'edit' as const,
        action: () => ShortcutActions.undo(),
        enabled: canUndo,
        visible: true
      },
      {
        id: 'redo',
        key: 'Cmd+Shift+Z',
        description: 'Redo',
        category: 'edit' as const,
        action: () => ShortcutActions.redo(),
        enabled: canRedo,
        visible: true
      },
      {
        id: 'cut',
        key: 'Cmd+X',
        description: 'Cut',
        category: 'edit' as const,
        action: () => ShortcutActions.cut(),
        enabled: hasSelection,
        visible: true
      },
      {
        id: 'copy',
        key: 'Cmd+C',
        description: 'Copy',
        category: 'edit' as const,
        action: () => ShortcutActions.copy(),
        enabled: hasSelection,
        visible: true
      },
      {
        id: 'paste',
        key: 'Cmd+V',
        description: 'Paste',
        category: 'edit' as const,
        action: () => ShortcutActions.paste(),
        enabled: true,
        visible: true
      },
      {
        id: 'select-all',
        key: 'Cmd+A',
        description: 'Select all',
        category: 'edit' as const,
        action: () => ShortcutActions.selectAll(),
        enabled: hasActiveTab,
        visible: true
      },
      {
        id: 'find',
        key: 'Cmd+F',
        description: 'Find',
        category: 'edit' as const,
        action: () => ShortcutActions.find(),
        enabled: hasActiveTab,
        visible: true
      },
      {
        id: 'replace',
        key: 'Cmd+H',
        description: 'Replace',
        category: 'edit' as const,
        action: () => ShortcutActions.replace(),
        enabled: hasActiveTab,
        visible: true
      },

      // Navigation Operations
      {
        id: 'previous-tab',
        key: 'Cmd+Shift+[',
        description: 'Previous tab',
        category: 'navigation' as const,
        action: () => ShortcutActions.previousTab(),
        enabled: hasActiveTab,
        visible: true
      },
      {
        id: 'next-tab',
        key: 'Cmd+Shift+]',
        description: 'Next tab',
        category: 'navigation' as const,
        action: () => ShortcutActions.nextTab(),
        enabled: hasActiveTab,
        visible: true
      },
      {
        id: 'toggle-sidebar',
        key: 'Cmd+B',
        description: 'Toggle sidebar',
        category: 'view' as const,
        action: () => ShortcutActions.toggleSidebar(),
        enabled: true,
        visible: true
      },
      {
        id: 'toggle-statusbar',
        key: 'Cmd+Shift+B',
        description: 'Toggle status bar',
        category: 'view' as const,
        action: () => ShortcutActions.toggleStatusBar(),
        enabled: true,
        visible: true
      }
    ];

    // Register shortcuts
    shortcuts.forEach(shortcut => {
      registerShortcut(shortcut);
    });

    // Cleanup on unmount
    return () => {
      shortcuts.forEach(shortcut => {
        unregisterShortcut(shortcut.id);
      });
    };
  }, [registerShortcut, unregisterShortcut, hasActiveTab, hasSelection, canUndo, canRedo]);

  // Register tab number shortcuts (Cmd+1-9)
  useEffect(() => {
    const tabShortcuts = Array.from({ length: 9 }, (_, i) => ({
      id: `switch-to-tab-${i + 1}`,
      key: `Cmd+${i + 1}`,
      description: `Switch to tab ${i + 1}`,
      category: 'navigation' as const,
      action: () => ShortcutActions.switchToTab(i + 1),
      enabled: hasActiveTab,
      visible: true
    }));

    tabShortcuts.forEach(shortcut => {
      registerShortcut(shortcut);
    });

    return () => {
      tabShortcuts.forEach(shortcut => {
        unregisterShortcut(shortcut.id);
      });
    };
  }, [registerShortcut, unregisterShortcut, hasActiveTab]);
}; 
