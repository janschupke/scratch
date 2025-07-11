# PRP-2025-07-11-04: Keyboard Shortcuts

## Overview

This PRP implements comprehensive keyboard shortcuts for the Scratch Editor, providing users with efficient keyboard-based navigation and operations that follow macOS best practices and standards.

## User-Facing Description

**User Experience**: Users can work efficiently with keyboard shortcuts
- Users can create new files with Cmd+N
- Users can open files with Cmd+O
- Users can open folders with Cmd+Shift+O
- Users can save files with Cmd+S
- Users can exit the app with Cmd+Q
- Users can switch between tabs with Cmd+1, Cmd+2, etc.
- Users can close tabs with Cmd+W
- Users get standard shortcuts that work like other macOS apps

## Functional Requirements

### 1. File Operations Shortcuts
- **Cmd+N**: Create new file
- **Cmd+O**: Open file dialog
- **Cmd+Shift+O**: Open folder dialog
- **Cmd+S**: Save current file
- **Cmd+Shift+S**: Save file as
- **Cmd+W**: Close current tab
- **Cmd+Shift+W**: Close all tabs
- **Cmd+Q**: Exit application

### 2. Edit Operations Shortcuts
- **Cmd+Z**: Undo
- **Cmd+Shift+Z**: Redo
- **Cmd+X**: Cut
- **Cmd+C**: Copy
- **Cmd+V**: Paste
- **Cmd+A**: Select all
- **Cmd+F**: Find in current file
- **Cmd+Shift+F**: Find in all files
- **Cmd+H**: Replace in current file

### 3. Navigation Shortcuts
- **Cmd+1-9**: Switch to tab by number
- **Cmd+Shift+[**: Previous tab
- **Cmd+Shift+]**: Next tab
- **Cmd+B**: Toggle sidebar
- **Cmd+Shift+B**: Toggle status bar
- **Cmd+0**: Reset zoom
- **Cmd+Plus**: Zoom in
- **Cmd+Minus**: Zoom out

### 4. Editor Shortcuts
- **Cmd+D**: Duplicate line
- **Cmd+Shift+K**: Delete line
- **Cmd+Enter**: Insert line below
- **Cmd+Shift+Enter**: Insert line above
- **Cmd+Shift+Up**: Move line up
- **Cmd+Shift+Down**: Move line down
- **Cmd+/**: Toggle line comment
- **Cmd+Shift+A**: Toggle block comment

### 5. System Shortcuts
- **Cmd+,**: Open preferences
- **Cmd+Shift+P**: Command palette
- **Cmd+K**: Quick open
- **Cmd+Shift+N**: New window
- **Cmd+Shift+T**: Reopen closed tab

## Non-Functional Requirements

### Performance
- **Shortcut Response Time**: < 50ms for all shortcuts
- **No Conflicts**: No shortcut conflicts with system shortcuts
- **UI Responsiveness**: No blocking during shortcut operations
- **Memory Usage**: Minimal memory overhead for shortcut system

### Reliability
- **Consistent Behavior**: Shortcuts work consistently across all states
- **Error Handling**: Graceful handling of shortcut errors
- **State Awareness**: Shortcuts respect current application state
- **Recovery**: Ability to recover from failed shortcut operations

### Accessibility
- **Screen Reader Support**: Screen readers announce shortcut actions
- **High Contrast**: Shortcuts work with high contrast themes
- **Keyboard Only**: Full functionality with keyboard only
- **Focus Management**: Proper focus management after shortcuts

## Technical Implementation Details

### 1. Shortcut System Architecture

```typescript
// src/types/shortcuts.ts
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
```

### 2. Shortcut Manager Implementation

```typescript
// src/services/shortcutManager.ts
import { useEffect, useCallback } from 'react';
import { useShortcutStore } from '../stores/shortcutStore';
import { useFileStore } from '../stores/fileStore';
import { useTabStore } from '../stores/tabStore';
import { useMenuStore } from '../stores/menuStore';

export class ShortcutManager {
  private static instance: ShortcutManager;
  private shortcuts: Map<string, Shortcut> = new Map();
  private listeners: Set<(event: KeyboardEvent) => void> = new Set();

  static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager();
    }
    return ShortcutManager.instance;
  }

  registerShortcut(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  unregisterShortcut(id: string): void {
    this.shortcuts.delete(id);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = this.getKeyFromEvent(event);
    const shortcut = this.findShortcut(key);

    if (shortcut && shortcut.enabled) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        shortcut.action();
        this.notifyShortcutExecuted(shortcut.id);
      } catch (error) {
        console.error(`Shortcut execution failed for ${shortcut.id}:`, error);
      }
    }
  };

  private getKeyFromEvent(event: KeyboardEvent): string {
    const modifiers: string[] = [];
    
    if (event.metaKey) modifiers.push('Cmd');
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    
    const key = event.key.toUpperCase();
    return [...modifiers, key].join('+');
  }

  private findShortcut(key: string): Shortcut | undefined {
    return Array.from(this.shortcuts.values()).find(
      shortcut => shortcut.key === key
    );
  }

  private notifyShortcutExecuted(id: string): void {
    // Notify stores about shortcut execution
    this.listeners.forEach(listener => {
      try {
        listener(new KeyboardEvent('shortcut', { detail: { id } }));
      } catch (error) {
        console.error('Shortcut listener error:', error);
      }
    });
  }

  start(): void {
    document.addEventListener('keydown', this.handleKeyDown, true);
  }

  stop(): void {
    document.removeEventListener('keydown', this.handleKeyDown, true);
  }

  addListener(listener: (event: KeyboardEvent) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (event: KeyboardEvent) => void): void {
    this.listeners.delete(listener);
  }
}
```

### 3. Shortcut Store Implementation

```typescript
// src/stores/shortcutStore.ts
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
```

### 4. Shortcut Actions Implementation

```typescript
// src/services/shortcutActions.ts
import { invoke } from '@tauri-apps/api/tauri';
import { useFileStore } from '../stores/fileStore';
import { useTabStore } from '../stores/tabStore';
import { useMenuStore } from '../stores/menuStore';
import { useShortcutStore } from '../stores/shortcutStore';

export class ShortcutActions {
  // File Operations
  static async newFile() {
    const { addTab } = useTabStore.getState();
    
    const newTab = {
      id: generateId(),
      filePath: '',
      title: 'Untitled',
      isPinned: false,
      isModified: false,
      isNew: true
    };
    
    addTab(newTab);
  }

  static async openFile() {
    try {
      const selected = await invoke('open_file_dialog', {
        options: {
          title: 'Open File',
          filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'html', 'css'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        }
      });
      
      if (selected) {
        const { openFile } = useFileStore.getState();
        const { addTab } = useTabStore.getState();
        const { addRecentFile } = useMenuStore.getState();
        
        await openFile(selected as string);
        addRecentFile(selected as string);
        
        addTab({
          id: generateId(),
          filePath: selected as string,
          title: path.basename(selected as string),
          isPinned: false,
          isModified: false
        });
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }

  static async openFolder() {
    try {
      const selected = await invoke('open_folder_dialog', {
        options: { title: 'Open Folder' }
      });
      
      if (selected) {
        const { setOpenedFolder } = useFileStore.getState();
        setOpenedFolder(selected as string);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  }

  static async saveFile() {
    const { activeTab } = useTabStore.getState();
    const { saveFile } = useFileStore.getState();
    
    if (activeTab) {
      if (activeTab.isNew) {
        return this.saveFileAs();
      } else {
        await saveFile(activeTab.filePath);
      }
    }
  }

  static async saveFileAs() {
    try {
      const selected = await invoke('save_file_dialog', {
        options: {
          title: 'Save File As',
          filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'html', 'css'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        }
      });
      
      if (selected) {
        const { activeTab } = useTabStore.getState();
        const { saveFile } = useFileStore.getState();
        const { addRecentFile } = useMenuStore.getState();
        
        if (activeTab) {
          await saveFile(selected as string);
          addRecentFile(selected as string);
          
          const { updateTab } = useTabStore.getState();
          updateTab(activeTab.id, {
            filePath: selected as string,
            title: path.basename(selected as string),
            isNew: false
          });
        }
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }

  static closeTab() {
    const { activeTab, closeTab } = useTabStore.getState();
    if (activeTab) {
      closeTab(activeTab.id);
    }
  }

  static closeAllTabs() {
    const { tabs, closeAllTabs } = useTabStore.getState();
    closeAllTabs();
  }

  static async exit() {
    const { hasUnsavedChanges } = useTabStore.getState();
    
    if (hasUnsavedChanges) {
      const confirmed = await this.showUnsavedChangesDialog();
      if (!confirmed) {
        return;
      }
    }
    
    await invoke('close_window');
  }

  // Navigation Operations
  static switchToTab(tabIndex: number) {
    const { tabs, focusTab } = useTabStore.getState();
    const tab = tabs[tabIndex - 1]; // Convert 1-based to 0-based
    if (tab) {
      focusTab(tab.id);
    }
  }

  static previousTab() {
    const { tabs, activeTab, focusTab } = useTabStore.getState();
    if (tabs.length > 1 && activeTab) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab.id);
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      focusTab(tabs[previousIndex].id);
    }
  }

  static nextTab() {
    const { tabs, activeTab, focusTab } = useTabStore.getState();
    if (tabs.length > 1 && activeTab) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab.id);
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      focusTab(tabs[nextIndex].id);
    }
  }

  static toggleSidebar() {
    const { isSidebarVisible, setSidebarVisibility } = useLayoutStore.getState();
    setSidebarVisibility(!isSidebarVisible);
  }

  static toggleStatusBar() {
    const { isStatusBarVisible, setStatusBarVisibility } = useLayoutStore.getState();
    setStatusBarVisibility(!isStatusBarVisible);
  }

  // Editor Operations
  static undo() {
    const { activeTab } = useTabStore.getState();
    if (activeTab) {
      // Trigger undo in Monaco editor
      window.monaco?.editor?.getModel(activeTab.filePath)?.undo();
    }
  }

  static redo() {
    const { activeTab } = useTabStore.getState();
    if (activeTab) {
      // Trigger redo in Monaco editor
      window.monaco?.editor?.getModel(activeTab.filePath)?.redo();
    }
  }

  static cut() {
    const { activeTab } = useTabStore.getState();
    if (activeTab) {
      // Trigger cut in Monaco editor
      window.monaco?.editor?.getModel(activeTab.filePath)?.trigger('keyboard', 'cut', {});
    }
  }

  static copy() {
    const { activeTab } = useTabStore.getState();
    if (activeTab) {
      // Trigger copy in Monaco editor
      window.monaco?.editor?.getModel(activeTab.filePath)?.trigger('keyboard', 'copy', {});
    }
  }

  static paste() {
    const { activeTab } = useTabStore.getState();
    if (activeTab) {
      // Trigger paste in Monaco editor
      window.monaco?.editor?.getModel(activeTab.filePath)?.trigger('keyboard', 'paste', {});
    }
  }

  static selectAll() {
    const { activeTab } = useTabStore.getState();
    if (activeTab) {
      // Trigger select all in Monaco editor
      window.monaco?.editor?.getModel(activeTab.filePath)?.trigger('keyboard', 'selectAll', {});
    }
  }

  private static async showUnsavedChangesDialog(): Promise<boolean> {
    // Implementation for unsaved changes dialog
    return true; // Placeholder
  }
}
```

### 5. Shortcut Registration Hook

```typescript
// src/hooks/useShortcuts.ts
import { useEffect } from 'react';
import { useShortcutStore } from '../stores/shortcutStore';
import { ShortcutActions } from '../services/shortcutActions';
import { useFileStore } from '../stores/fileStore';
import { useTabStore } from '../stores/tabStore';

export const useShortcuts = () => {
  const { registerShortcut, unregisterShortcut } = useShortcutStore();
  const { hasActiveTab, hasSelection, canUndo, canRedo } = useTabStore();
  const { isSidebarVisible, isStatusBarVisible } = useLayoutStore();

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
      {
        id: 'exit',
        key: 'Cmd+Q',
        description: 'Exit application',
        category: 'file' as const,
        action: () => ShortcutActions.exit(),
        enabled: true,
        visible: true
      },

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
```

## Testing Requirements

### Unit Tests
- **Shortcut Registration**: Test shortcut registration and unregistration
- **Shortcut Execution**: Test shortcut action execution
- **Key Parsing**: Test keyboard event to shortcut key parsing
- **State Awareness**: Test shortcuts with different application states

### Integration Tests
- **Menu Integration**: Test shortcuts with menu system
- **Editor Integration**: Test shortcuts with Monaco editor
- **Store Integration**: Test shortcuts with all stores
- **Error Handling**: Test shortcut error scenarios

### E2E Tests
- **User Workflow**: Test complete shortcut workflows
- **Keyboard Navigation**: Test keyboard-only navigation
- **Shortcut Conflicts**: Test shortcut conflict resolution
- **Accessibility**: Test shortcuts with screen readers

### Test Coverage Targets
- **Shortcut Manager**: >90% coverage
- **Shortcut Actions**: >85% coverage
- **Shortcut Store**: >85% coverage
- **Error Handling**: >80% coverage

## Accessibility Requirements

### Keyboard Navigation
- **Full Keyboard Support**: All functionality accessible via keyboard
- **No Mouse Dependency**: No operations require mouse
- **Logical Tab Order**: Logical tab order in all dialogs
- **Escape Key**: Escape key closes dialogs and menus

### Screen Reader Support
- **Shortcut Announcements**: Screen readers announce shortcut actions
- **State Changes**: Announce application state changes
- **Error Messages**: Clear error announcements
- **Focus Indicators**: Clear focus indicators

### Visual Feedback
- **Shortcut Hints**: Show keyboard shortcuts in UI
- **Active States**: Clear visual feedback for active shortcuts
- **Disabled States**: Clear indication of disabled shortcuts
- **Loading States**: Show loading states during operations

## Performance Considerations

### Shortcut Responsiveness
- **Fast Execution**: Shortcuts execute quickly (< 50ms)
- **Non-Blocking**: Shortcuts don't block UI
- **Efficient Lookup**: Fast shortcut key lookup
- **Memory Management**: Efficient memory usage

### State Synchronization
- **Real-time Updates**: Shortcut state updates in real-time
- **Efficient Updates**: Efficient state update propagation
- **Minimal Re-renders**: Minimal component re-renders
- **Background Processing**: Background processing for heavy operations

## Potential Risks and Mitigation

### User Experience Risk
- **Risk**: Confusing or conflicting shortcuts
- **Mitigation**: Follow standard conventions, clear documentation

### Performance Risk
- **Risk**: Slow shortcut execution
- **Mitigation**: Efficient implementation, background processing

### Accessibility Risk
- **Risk**: Poor keyboard navigation
- **Mitigation**: Full keyboard support, screen reader testing

### Reliability Risk
- **Risk**: Shortcut failures
- **Mitigation**: Robust error handling, graceful degradation

## Implementation Steps

### Phase 1: Shortcut System Foundation
1. Create shortcut types and interfaces
2. Implement shortcut manager
3. Create shortcut store
4. Test basic shortcut system

### Phase 2: File Operations Shortcuts
1. Implement file operation shortcuts
2. Add file dialogs integration
3. Test file operation workflows
4. Error handling for file operations

### Phase 3: Navigation Shortcuts
1. Implement navigation shortcuts
2. Add tab switching shortcuts
3. Integrate with layout system
4. Test navigation workflows

### Phase 4: Editor Shortcuts
1. Implement editor shortcuts
2. Integrate with Monaco editor
3. Add clipboard operations
4. Test editor workflows

### Phase 5: Polish and Testing
1. Add remaining shortcuts
2. Comprehensive testing
3. Accessibility testing
4. Performance optimization

## Success Criteria

### Functional Success
- [ ] All shortcuts work correctly
- [ ] Shortcuts respect application state
- [ ] No shortcut conflicts
- [ ] Proper error handling

### Performance Success
- [ ] Shortcut response time < 50ms
- [ ] No UI blocking during shortcuts
- [ ] Efficient memory usage
- [ ] Smooth user experience

### Accessibility Success
- [ ] Full keyboard navigation
- [ ] Screen reader compatibility
- [ ] Clear visual feedback
- [ ] Logical tab order

This PRP provides a comprehensive implementation plan for keyboard shortcuts, ensuring users can work efficiently with standard macOS keyboard shortcuts while maintaining accessibility and performance standards. 
