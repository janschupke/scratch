# PRP-2025-01-27-01-Menu-System-Implementation

## Overview

This PRP implements the complete menu system functionality for the Scratch Editor, connecting all menu items to their respective actions. The menu UI is already in place, and this implementation will add the actual functionality behind each menu item, providing users with full access to editor functions through the menu bar.

### User-Facing Description

Users can access all editor functions through the menu bar. The File menu allows opening folders and files, the Edit menu provides copy/paste and find/replace functions, and the View menu controls editor appearance. All menu items work as expected and provide visual feedback when clicked.

### Scope

- Implement File menu functionality (Open Folder, Open File, Save, Save As, Close)
- Implement Edit menu functionality (Copy, Paste, Cut, Find, Replace, Select All)
- Implement View menu functionality (Toggle Sidebar, Toggle Status Bar, Zoom In/Out)
- Add visual feedback for menu interactions
- Ensure proper keyboard shortcuts work with menu items
- Implement proper error handling for menu actions

## Functional Requirements

### File Menu
- **Open Folder**: Opens folder selection dialog, loads folder into sidebar
- **Open File**: Opens file selection dialog, opens file in new tab
- **Save**: Saves current file if modified
- **Save As**: Opens save dialog for current file
- **Close**: Closes current tab
- **Exit**: Closes the application

### Edit Menu
- **Undo**: Undoes last action in current editor
- **Redo**: Redoes last undone action
- **Cut**: Cuts selected text to clipboard
- **Copy**: Copies selected text to clipboard
- **Paste**: Pastes text from clipboard
- **Select All**: Selects all text in current editor
- **Find**: Opens find dialog
- **Replace**: Opens find/replace dialog

### View Menu
- **Toggle Sidebar**: Shows/hides the file tree sidebar
- **Toggle Status Bar**: Shows/hides the status bar
- **Zoom In**: Increases editor font size
- **Zoom Out**: Decreases editor font size
- **Reset Zoom**: Resets editor zoom to default

## Technical Requirements

### Menu Action Implementation

```typescript
// src/services/menuActions.ts
export interface MenuAction {
  id: string;
  label: string;
  shortcut?: string;
  enabled: boolean;
  action: () => void | Promise<void>;
}

export class MenuActionManager {
  private actions: Map<string, MenuAction> = new Map();
  
  registerAction(action: MenuAction): void;
  executeAction(actionId: string): Promise<void>;
  updateActionState(actionId: string, enabled: boolean): void;
  getAction(actionId: string): MenuAction | undefined;
}
```

### File Operations

```typescript
// src/services/fileOperations.ts
export interface FileOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class FileOperations {
  openFolder(): Promise<FileOperationResult>;
  openFile(): Promise<FileOperationResult>;
  saveFile(filePath?: string): Promise<FileOperationResult>;
  saveFileAs(): Promise<FileOperationResult>;
}
```

### Editor Operations

```typescript
// src/services/editorOperations.ts
export class EditorOperations {
  undo(): void;
  redo(): void;
  cut(): void;
  copy(): void;
  paste(): void;
  selectAll(): void;
  find(): void;
  replace(): void;
}
```

### View Operations

```typescript
// src/services/viewOperations.ts
export class ViewOperations {
  toggleSidebar(): void;
  toggleStatusBar(): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
}
```

## Implementation Steps

### Phase 1: Core Menu Action Infrastructure

1. **Create Menu Action Manager**
   - Implement `MenuActionManager` class
   - Add action registration and execution methods
   - Add state management for enabled/disabled actions
   - Add proper TypeScript interfaces

2. **Create Service Classes**
   - Implement `FileOperations` class
   - Implement `EditorOperations` class
   - Implement `ViewOperations` class
   - Add proper error handling and result types

3. **Connect Menu Items to Actions**
   - Register all menu actions with the manager
   - Connect menu click handlers to action execution
   - Add proper async/await handling for file operations

### Phase 2: File Menu Implementation

1. **Open Folder Functionality**
   - Implement folder selection dialog using Tauri API
   - Load folder contents into sidebar
   - Handle errors gracefully
   - Update file store with new folder

2. **Open File Functionality**
   - Implement file selection dialog
   - Open file in new tab
   - Handle unsupported file types
   - Update tab store with new file

3. **Save Operations**
   - Implement save functionality for current file
   - Add save as dialog
   - Handle file write errors
   - Update file modification state

4. **Close Operations**
   - Implement tab closing
   - Handle unsaved changes
   - Update tab store accordingly

### Phase 3: Edit Menu Implementation

1. **Basic Edit Operations**
   - Connect undo/redo to Monaco editor
   - Implement cut/copy/paste using clipboard API
   - Add select all functionality
   - Handle editor state properly

2. **Find/Replace Operations**
   - Integrate with existing find/replace UI
   - Show/hide find dialog on menu action
   - Handle find/replace state management
   - Add keyboard shortcuts

### Phase 4: View Menu Implementation

1. **Sidebar Toggle**
   - Connect to sidebar visibility state
   - Update UI accordingly
   - Persist preference in settings

2. **Status Bar Toggle**
   - Connect to status bar visibility state
   - Update UI accordingly
   - Persist preference in settings

3. **Zoom Operations**
   - Implement zoom in/out functionality
   - Connect to editor zoom state
   - Add zoom limits and constraints
   - Persist zoom level in settings

### Phase 5: Integration and Polish

1. **Keyboard Shortcuts**
   - Ensure all menu items have proper shortcuts
   - Handle platform-specific shortcuts (Cmd vs Ctrl)
   - Add shortcut display in menu items

2. **Visual Feedback**
   - Add loading states for file operations
   - Show success/error messages
   - Update menu item states based on context

3. **Error Handling**
   - Add comprehensive error handling
   - Show user-friendly error messages
   - Handle edge cases gracefully

## Testing Requirements

### Unit Tests

```typescript
// src/services/__tests__/menuActions.test.ts
describe('MenuActionManager', () => {
  test('registers actions correctly');
  test('executes actions successfully');
  test('handles action errors gracefully');
  test('updates action states properly');
});

describe('FileOperations', () => {
  test('opens folder successfully');
  test('opens file successfully');
  test('saves file correctly');
  test('handles file operation errors');
});

describe('EditorOperations', () => {
  test('performs edit operations correctly');
  test('handles clipboard operations');
  test('manages find/replace state');
});

describe('ViewOperations', () => {
  test('toggles UI elements correctly');
  test('manages zoom levels properly');
  test('persists view preferences');
});
```

### Integration Tests

```typescript
// src/test/integration/menu-system.test.ts
describe('Menu System Integration', () => {
  test('file menu operations work end-to-end');
  test('edit menu operations work with editor');
  test('view menu operations update UI correctly');
  test('keyboard shortcuts work with menu items');
});
```

### E2E Tests

```typescript
// src/test/e2e/menu-system.e2e.test.ts
describe('Menu System E2E', () => {
  test('user can open folder through menu');
  test('user can save file through menu');
  test('user can perform edit operations through menu');
  test('user can toggle view elements through menu');
});
```

## Non-Functional Requirements

### Performance
- Menu actions should respond within 100ms
- File operations should not block UI
- Large file operations should show progress indicators

### Accessibility
- All menu items must have proper ARIA labels
- Keyboard navigation must work for all menu items
- Screen reader compatibility for menu interactions

### Error Handling
- Graceful handling of file system errors
- User-friendly error messages
- Proper cleanup on operation failure

### Security
- Validate file paths before operations
- Sanitize file content appropriately
- Handle permission errors gracefully

## Code Examples

### Menu Action Registration

```typescript
// src/services/menuActions.ts
export const registerMenuActions = (manager: MenuActionManager) => {
  // File menu actions
  manager.registerAction({
    id: 'file.openFolder',
    label: 'Open Folder',
    shortcut: 'Cmd+O',
    enabled: true,
    action: async () => {
      const result = await fileOperations.openFolder();
      if (result.success) {
        // Update file store with new folder
        fileStore.setCurrentFolder(result.data);
      } else {
        // Show error message
        showError('Failed to open folder', result.error);
      }
    }
  });

  // Edit menu actions
  manager.registerAction({
    id: 'edit.copy',
    label: 'Copy',
    shortcut: 'Cmd+C',
    enabled: true,
    action: () => {
      editorOperations.copy();
    }
  });

  // View menu actions
  manager.registerAction({
    id: 'view.toggleSidebar',
    label: 'Toggle Sidebar',
    shortcut: 'Cmd+B',
    enabled: true,
    action: () => {
      viewOperations.toggleSidebar();
    }
  });
};
```

### File Operations Implementation

```typescript
// src/services/fileOperations.ts
export class FileOperations {
  async openFolder(): Promise<FileOperationResult> {
    try {
      const selected = await invoke('tauri', {
        cmd: 'open',
        options: {
          directory: true,
          multiple: false
        }
      });

      if (selected && selected.length > 0) {
        const folderPath = selected[0];
        const files = await this.scanFolder(folderPath);
        
        return {
          success: true,
          data: {
            path: folderPath,
            files: files
          }
        };
      }

      return { success: false, error: 'No folder selected' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveFile(filePath?: string): Promise<FileOperationResult> {
    try {
      const currentFile = tabStore.getCurrentFile();
      if (!currentFile) {
        return { success: false, error: 'No file to save' };
      }

      const path = filePath || currentFile.path;
      const content = editorStore.getContent();

      await invoke('tauri', {
        cmd: 'writeTextFile',
        args: { path, content }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

## Risks and Mitigation

### Risk 1: File System Permissions
- **Risk**: Users may not have permission to access certain folders/files
- **Mitigation**: Implement proper permission checking and user-friendly error messages

### Risk 2: Large File Operations
- **Risk**: Opening very large files could freeze the UI
- **Mitigation**: Implement file size limits and progress indicators

### Risk 3: Platform Differences
- **Risk**: Menu behavior may differ between platforms
- **Mitigation**: Use platform-specific shortcuts and test on all target platforms

### Risk 4: State Synchronization
- **Risk**: Menu state may become out of sync with actual editor state
- **Mitigation**: Implement proper state management and validation

## Accessibility Considerations

### Keyboard Navigation
- All menu items must be accessible via keyboard
- Proper focus management for menu interactions
- Clear visual indicators for focused items

### Screen Reader Support
- Proper ARIA labels for all menu items
- Announcement of menu state changes
- Clear descriptions of menu actions

### Visual Accessibility
- High contrast menu items
- Clear visual feedback for interactions
- Proper sizing for touch targets

## Success Criteria

- [ ] All menu items execute their intended actions
- [ ] File operations work correctly with proper error handling
- [ ] Edit operations integrate properly with Monaco editor
- [ ] View operations update UI state correctly
- [ ] Keyboard shortcuts work for all menu items
- [ ] Visual feedback is provided for all interactions
- [ ] Error handling is comprehensive and user-friendly
- [ ] All tests pass with >80% coverage
- [ ] No TypeScript errors or linting warnings
- [ ] Build completes successfully
- [ ] Accessibility requirements are met

## Dependencies

- Existing menu UI components
- Monaco editor integration
- File store and tab store
- Tauri file system APIs
- Clipboard API
- Settings persistence system

## Timeline

- **Phase 1**: 2-3 hours (Core infrastructure)
- **Phase 2**: 3-4 hours (File menu implementation)
- **Phase 3**: 2-3 hours (Edit menu implementation)
- **Phase 4**: 2-3 hours (View menu implementation)
- **Phase 5**: 2-3 hours (Integration and polish)

**Total Estimated Time**: 11-16 hours 
