# PRP-2025-07-11-03: Desktop Menu System

## Overview

This PRP implements a standard desktop menu system for the Scratch Editor, providing users with familiar desktop application controls through a menu bar with File, Edit, View, and Help menus.

## User-Facing Description

**User Experience**: Users get familiar desktop application controls
- Users see a standard menu bar with File, Edit, View, and Help menus
- Users can create new files through the File menu
- Users can open existing files through the File menu
- Users can open folders through the File menu
- Users can save files through the File menu
- Users can exit the application through the File menu
- Users get a familiar desktop application experience

## Functional Requirements

### 1. Menu Bar Structure
- **File Menu**: New file, open file, open folder, save, save as, exit
- **Edit Menu**: Undo, redo, cut, copy, paste, find, replace
- **View Menu**: Toggle sidebar, toggle status bar, zoom in/out, reset zoom
- **Help Menu**: About, documentation, keyboard shortcuts

### 2. File Operations
- **New File**: Create new untitled file
- **Open File**: Open existing file with file picker
- **Open Folder**: Open folder with folder picker
- **Save**: Save current file
- **Save As**: Save file with new name/location
- **Recent Files**: List of recently opened files
- **Exit**: Close application with confirmation

### 3. Edit Operations
- **Undo/Redo**: Standard undo/redo functionality
- **Cut/Copy/Paste**: Standard clipboard operations
- **Find**: Find text in current file
- **Replace**: Find and replace text
- **Select All**: Select all text in current file

### 4. View Operations
- **Sidebar Toggle**: Show/hide file sidebar
- **Status Bar Toggle**: Show/hide status bar
- **Zoom Controls**: Zoom in, zoom out, reset zoom
- **Full Screen**: Toggle full screen mode

### 5. Help Operations
- **About**: Show application information
- **Documentation**: Open documentation
- **Keyboard Shortcuts**: Show shortcuts reference
- **Check for Updates**: Check for application updates

## Non-Functional Requirements

### Performance
- **Menu Response Time**: < 50ms for menu interactions
- **File Operations**: < 200ms for file operations
- **UI Responsiveness**: No blocking during operations
- **Memory Usage**: Minimal memory overhead for menu system

### Reliability
- **Error Handling**: Graceful handling of file operation errors
- **State Consistency**: Menu state reflects current application state
- **Data Integrity**: Safe file operations with proper validation
- **Recovery**: Ability to recover from failed operations

### Accessibility
- **Keyboard Navigation**: Full keyboard navigation support
- **Screen Reader**: Proper ARIA labels and announcements
- **High Contrast**: Support for high contrast themes
- **Focus Management**: Proper focus management in dialogs

## Technical Implementation Details

### 1. Menu System Architecture

```typescript
// src/types/menu.ts
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
```

### 2. Menu Store Implementation

```typescript
// src/stores/menuStore.ts
import { create } from 'zustand';
import { MenuState, MenuItem } from '../types/menu';

interface MenuStore extends MenuState {
  // Actions
  setMenuVisibility: (visible: boolean) => void;
  setActiveMenu: (menu: string | null) => void;
  addRecentFile: (filePath: string) => void;
  clearRecentFiles: () => void;
  updateEditState: (state: Partial<Pick<MenuState, 'canUndo' | 'canRedo' | 'hasSelection' | 'hasClipboard'>>) => void;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
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
```

### 3. Menu Actions Implementation

```typescript
// src/services/menuActions.ts
import { invoke } from '@tauri-apps/api/tauri';
import { useFileStore } from '../stores/fileStore';
import { useTabStore } from '../stores/tabStore';
import { useMenuStore } from '../stores/menuStore';

export class MenuActions {
  static async newFile() {
    const { addTab } = useTabStore.getState();
    const { addRecentFile } = useMenuStore.getState();
    
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
        options: {
          title: 'Open Folder'
        }
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
          
          // Update tab with new file path
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

  static async exit() {
    const { hasUnsavedChanges } = useTabStore.getState();
    
    if (hasUnsavedChanges) {
      const confirmed = await this.showUnsavedChangesDialog();
      if (!confirmed) {
        return;
      }
    }
    
    // Close application
    await invoke('close_window');
  }

  private static async showUnsavedChangesDialog(): Promise<boolean> {
    // Implementation for unsaved changes dialog
    return true; // Placeholder
  }
}
```

### 4. Menu Bar Component

```typescript
// src/components/MenuBar/index.tsx
import React, { useState } from 'react';
import { useMenuStore } from '../../stores/menuStore';
import { MenuActions } from '../../services/menuActions';
import { MenuItem } from './MenuItem';
import { cn } from '../../utils/cn';

export const MenuBar: React.FC = () => {
  const { isVisible, activeMenu, setActiveMenu } = useMenuStore();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  if (!isVisible) {
    return null;
  }

  const fileMenuItems = [
    {
      id: 'new-file',
      label: 'New File',
      shortcut: 'Cmd+N',
      action: () => MenuActions.newFile(),
      enabled: true
    },
    {
      id: 'open-file',
      label: 'Open File...',
      shortcut: 'Cmd+O',
      action: () => MenuActions.openFile(),
      enabled: true
    },
    {
      id: 'open-folder',
      label: 'Open Folder...',
      shortcut: 'Cmd+Shift+O',
      action: () => MenuActions.openFolder(),
      enabled: true
    },
    { type: 'separator' },
    {
      id: 'save',
      label: 'Save',
      shortcut: 'Cmd+S',
      action: () => MenuActions.saveFile(),
      enabled: true
    },
    {
      id: 'save-as',
      label: 'Save As...',
      shortcut: 'Cmd+Shift+S',
      action: () => MenuActions.saveFileAs(),
      enabled: true
    },
    { type: 'separator' },
    {
      id: 'exit',
      label: 'Exit',
      shortcut: 'Cmd+Q',
      action: () => MenuActions.exit(),
      enabled: true
    }
  ];

  const editMenuItems = [
    {
      id: 'undo',
      label: 'Undo',
      shortcut: 'Cmd+Z',
      action: () => {/* Implement undo */},
      enabled: false // Will be updated based on state
    },
    {
      id: 'redo',
      label: 'Redo',
      shortcut: 'Cmd+Shift+Z',
      action: () => {/* Implement redo */},
      enabled: false
    },
    { type: 'separator' },
    {
      id: 'cut',
      label: 'Cut',
      shortcut: 'Cmd+X',
      action: () => {/* Implement cut */},
      enabled: false
    },
    {
      id: 'copy',
      label: 'Copy',
      shortcut: 'Cmd+C',
      action: () => {/* Implement copy */},
      enabled: false
    },
    {
      id: 'paste',
      label: 'Paste',
      shortcut: 'Cmd+V',
      action: () => {/* Implement paste */},
      enabled: false
    }
  ];

  const viewMenuItems = [
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      shortcut: 'Cmd+B',
      action: () => {/* Implement sidebar toggle */},
      enabled: true
    },
    {
      id: 'toggle-statusbar',
      label: 'Toggle Status Bar',
      action: () => {/* Implement status bar toggle */},
      enabled: true
    },
    { type: 'separator' },
    {
      id: 'zoom-in',
      label: 'Zoom In',
      shortcut: 'Cmd+Plus',
      action: () => {/* Implement zoom in */},
      enabled: true
    },
    {
      id: 'zoom-out',
      label: 'Zoom Out',
      shortcut: 'Cmd+Minus',
      action: () => {/* Implement zoom out */},
      enabled: true
    },
    {
      id: 'reset-zoom',
      label: 'Reset Zoom',
      shortcut: 'Cmd+0',
      action: () => {/* Implement reset zoom */},
      enabled: true
    }
  ];

  const helpMenuItems = [
    {
      id: 'about',
      label: 'About Scratch Editor',
      action: () => {/* Show about dialog */},
      enabled: true
    },
    {
      id: 'documentation',
      label: 'Documentation',
      action: () => {/* Open documentation */},
      enabled: true
    },
    {
      id: 'keyboard-shortcuts',
      label: 'Keyboard Shortcuts',
      action: () => {/* Show shortcuts dialog */},
      enabled: true
    }
  ];

  return (
    <div className="menu-bar">
      <div className="menu-container">
        <MenuItem
          label="File"
          items={fileMenuItems}
          isActive={activeMenu === 'file'}
          onActivate={() => setActiveMenu('file')}
          onDeactivate={() => setActiveMenu(null)}
          onHover={() => setHoveredMenu('file')}
          onLeave={() => setHoveredMenu(null)}
        />
        <MenuItem
          label="Edit"
          items={editMenuItems}
          isActive={activeMenu === 'edit'}
          onActivate={() => setActiveMenu('edit')}
          onDeactivate={() => setActiveMenu(null)}
          onHover={() => setHoveredMenu('edit')}
          onLeave={() => setHoveredMenu(null)}
        />
        <MenuItem
          label="View"
          items={viewMenuItems}
          isActive={activeMenu === 'view'}
          onActivate={() => setActiveMenu('view')}
          onDeactivate={() => setActiveMenu(null)}
          onHover={() => setHoveredMenu('view')}
          onLeave={() => setHoveredMenu(null)}
        />
        <MenuItem
          label="Help"
          items={helpMenuItems}
          isActive={activeMenu === 'help'}
          onActivate={() => setActiveMenu('help')}
          onDeactivate={() => setActiveMenu(null)}
          onHover={() => setHoveredMenu('help')}
          onLeave={() => setHoveredMenu(null)}
        />
      </div>
    </div>
  );
};
```

### 5. Menu Item Component

```typescript
// src/components/MenuBar/MenuItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface MenuItemProps {
  label: string;
  items: Array<{
    id: string;
    label: string;
    shortcut?: string;
    action?: () => void;
    enabled?: boolean;
    type?: 'separator';
  }>;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onHover: () => void;
  onLeave: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  items,
  isActive,
  onActivate,
  onDeactivate,
  onHover,
  onLeave
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isActive]);

  const handleClick = () => {
    if (isActive) {
      onDeactivate();
    } else {
      onActivate();
    }
  };

  const handleItemClick = (item: any) => {
    if (item.action && item.enabled !== false) {
      item.action();
    }
    setIsOpen(false);
    onDeactivate();
  };

  return (
    <div
      ref={menuRef}
      className={cn(
        'menu-item',
        isActive && 'active'
      )}
      onClick={handleClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <span className="menu-label">{label}</span>
      
      {isOpen && (
        <div className="menu-dropdown">
          {items.map((item, index) => (
            <div key={item.id || index}>
              {item.type === 'separator' ? (
                <div className="menu-separator" />
              ) : (
                <div
                  className={cn(
                    'menu-dropdown-item',
                    item.enabled === false && 'disabled'
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="item-label">{item.label}</span>
                  {item.shortcut && (
                    <span className="item-shortcut">{item.shortcut}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Testing Requirements

### Unit Tests
- **Menu Actions**: Test all menu action implementations
- **Menu State**: Test menu state management
- **File Operations**: Test file operation workflows
- **Error Handling**: Test error scenarios

### Integration Tests
- **Menu Integration**: Test menu with file and tab stores
- **File Operations**: Test complete file operation workflows
- **State Synchronization**: Test menu state with application state
- **Error Recovery**: Test error handling and recovery

### E2E Tests
- **User Workflow**: Test complete menu workflows
- **File Operations**: Test file operations through menu
- **Keyboard Shortcuts**: Test keyboard shortcuts
- **Error Scenarios**: Test error handling scenarios

### Test Coverage Targets
- **Menu Actions**: >90% coverage
- **Menu Components**: >85% coverage
- **File Operations**: >85% coverage
- **Error Handling**: >80% coverage

## Accessibility Requirements

### Keyboard Navigation
- **Menu Navigation**: Full keyboard navigation through menus
- **Shortcut Support**: All menu items have keyboard shortcuts
- **Focus Management**: Proper focus management in menus
- **Escape Key**: Escape key closes open menus

### Screen Reader Support
- **Menu Announcements**: Screen readers announce menu states
- **Item Descriptions**: Clear descriptions for menu items
- **Shortcut Announcements**: Announce keyboard shortcuts
- **State Changes**: Announce menu state changes

### Visual Feedback
- **Active States**: Clear visual feedback for active menus
- **Disabled States**: Clear indication of disabled items
- **Hover States**: Clear hover feedback
- **Focus Indicators**: Clear focus indicators

## Performance Considerations

### Menu Responsiveness
- **Fast Rendering**: Menu items render quickly
- **Smooth Animations**: Smooth menu animations
- **Efficient Updates**: Efficient menu state updates
- **Memory Management**: Efficient memory usage

### File Operations
- **Non-Blocking**: File operations don't block UI
- **Progress Indicators**: Show progress for file operations
- **Background Processing**: Process files in background
- **Error Recovery**: Graceful error recovery

## Potential Risks and Mitigation

### User Experience Risk
- **Risk**: Confusing menu structure
- **Mitigation**: Follow standard menu conventions, clear labeling

### Performance Risk
- **Risk**: Slow menu operations
- **Mitigation**: Efficient menu rendering, background processing

### Reliability Risk
- **Risk**: File operation failures
- **Mitigation**: Robust error handling, data validation

### Security Risk
- **Risk**: Unsafe file operations
- **Mitigation**: File path validation, permission checks

## Implementation Steps

### Phase 1: Menu System Foundation
1. Create menu types and interfaces
2. Implement menu store
3. Create basic menu components
4. Test menu structure

### Phase 2: File Operations
1. Implement file operation actions
2. Add file dialogs
3. Integrate with file store
4. Test file operations

### Phase 3: Edit Operations
1. Implement edit operations
2. Add clipboard support
3. Integrate with editor
4. Test edit operations

### Phase 4: View Operations
1. Implement view operations
2. Add zoom controls
3. Integrate with layout
4. Test view operations

### Phase 5: Help and Polish
1. Implement help operations
2. Add keyboard shortcuts
3. Accessibility testing
4. User experience testing

## Success Criteria

### Functional Success
- [ ] All menu items work correctly
- [ ] File operations complete successfully
- [ ] Edit operations work with editor
- [ ] View operations affect layout properly

### Performance Success
- [ ] Menu response time < 50ms
- [ ] File operations < 200ms
- [ ] No UI blocking during operations
- [ ] Smooth menu animations

### User Experience Success
- [ ] Familiar desktop application experience
- [ ] Clear visual feedback for all actions
- [ ] Intuitive menu structure
- [ ] Helpful error messages

This PRP provides a comprehensive implementation plan for a standard desktop menu system, ensuring users get a familiar and intuitive desktop application experience. 
