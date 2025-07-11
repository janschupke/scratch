# PRP-2025-01-27-08-Connect-Menu-Actions

## Overview

**UI/UX Improvement**: Currently menu items do nothing - hook them up to appropriate functionality (File > Open, Edit > Copy/Paste, etc.). This makes the menu system functional and provides users with expected application behavior.

**User Impact**: Users will be able to use menu items for common operations, making the application fully functional and providing a complete user experience.

**Priority**: Medium - Essential for making the application fully functional and user-friendly.

## Functional Requirements

### Core Functionality
- **File Menu Actions**: New, Open, Save, Save As, Close, Exit
- **Edit Menu Actions**: Undo, Redo, Cut, Copy, Paste, Find, Replace
- **View Menu Actions**: Toggle Sidebar, Toggle Status Bar, Zoom In/Out
- **Help Menu Actions**: About, Keyboard Shortcuts

### Action Requirements
- **File Operations**: Open file dialogs, save operations, file management
- **Edit Operations**: Clipboard operations, undo/redo, find/replace
- **View Operations**: UI state management, zoom controls
- **Help Operations**: Information display, documentation

### User Experience
- Immediate response to menu actions
- Clear visual feedback for operations
- Error handling for failed operations
- Consistent behavior across all menu items

## Technical Requirements

### Menu Action Implementation

#### 1. File Menu Actions
```typescript
// File menu action handlers
const handleNewFile = async () => {
  try {
    // Create new file in editor
    const newFile = await createNewFile();
    useFileStore.getState().setCurrentFile(newFile);
    useEditorStore.getState().setContent('');
    useEditorStore.getState().setModified(false);
    
    // Update tab store
    useTabStore.getState().addTab({
      id: newFile.id,
      title: newFile.name,
      path: newFile.path,
      isModified: false
    });
    
    console.log('New file created:', newFile.name);
  } catch (error) {
    console.error('Failed to create new file:', error);
    showError('Failed to create new file');
  }
};

const handleOpenFile = async () => {
  try {
    // Open file dialog
    const selectedFiles = await open({
      multiple: false,
      filters: [{
        name: 'All Files',
        extensions: ['*']
      }]
    });
    
    if (selectedFiles && selectedFiles.length > 0) {
      const filePath = selectedFiles[0];
      const content = await readTextFile(filePath);
      
      // Update stores
      useFileStore.getState().setCurrentFile(filePath);
      useEditorStore.getState().setContent(content);
      useEditorStore.getState().setModified(false);
      
      // Update tab store
      useTabStore.getState().addTab({
        id: filePath,
        title: filePath.split('/').pop() || 'Untitled',
        path: filePath,
        isModified: false
      });
      
      console.log('File opened:', filePath);
    }
  } catch (error) {
    console.error('Failed to open file:', error);
    showError('Failed to open file');
  }
};

const handleSave = async () => {
  try {
    const currentFile = useFileStore.getState().currentFile;
    const content = useEditorStore.getState().content;
    
    if (!currentFile) {
      // If no current file, trigger save as
      return handleSaveAs();
    }
    
    // Save current file
    await writeTextFile(currentFile, content);
    useEditorStore.getState().setModified(false);
    useTabStore.getState().updateTab(currentFile, { isModified: false });
    
    console.log('File saved:', currentFile);
  } catch (error) {
    console.error('Failed to save file:', error);
    showError('Failed to save file');
  }
};

const handleSaveAs = async () => {
  try {
    const content = useEditorStore.getState().content;
    
    // Open save dialog
    const savePath = await save({
      filters: [{
        name: 'All Files',
        extensions: ['*']
      }]
    });
    
    if (savePath) {
      await writeTextFile(savePath, content);
      useFileStore.getState().setCurrentFile(savePath);
      useEditorStore.getState().setModified(false);
      
      // Update tab store
      useTabStore.getState().addTab({
        id: savePath,
        title: savePath.split('/').pop() || 'Untitled',
        path: savePath,
        isModified: false
      });
      
      console.log('File saved as:', savePath);
    }
  } catch (error) {
    console.error('Failed to save file:', error);
    showError('Failed to save file');
  }
};

const handleClose = () => {
  const currentFile = useFileStore.getState().currentFile;
  if (currentFile) {
    useTabStore.getState().closeTab(currentFile);
    useFileStore.getState().setCurrentFile(null);
    useEditorStore.getState().setContent('');
  }
};

const handleExit = async () => {
  try {
    // Check for unsaved changes
    const hasUnsavedChanges = useEditorStore.getState().isModified;
    
    if (hasUnsavedChanges) {
      const shouldSave = await showConfirmDialog(
        'Unsaved Changes',
        'Do you want to save your changes before exiting?'
      );
      
      if (shouldSave) {
        await handleSave();
      }
    }
    
    // Exit application
    await invoke('quit_app');
  } catch (error) {
    console.error('Failed to exit application:', error);
    await invoke('quit_app');
  }
};
```

#### 2. Edit Menu Actions
```typescript
// Edit menu action handlers
const handleUndo = () => {
  const editor = useEditorStore.getState().editor;
  if (editor) {
    editor.trigger('keyboard', 'undo', null);
  }
};

const handleRedo = () => {
  const editor = useEditorStore.getState().editor;
  if (editor) {
    editor.trigger('keyboard', 'redo', null);
  }
};

const handleCut = () => {
  const editor = useEditorStore.getState().editor;
  if (editor) {
    editor.trigger('keyboard', 'cut', null);
  }
};

const handleCopy = () => {
  const editor = useEditorStore.getState().editor;
  if (editor) {
    editor.trigger('keyboard', 'copy', null);
  }
};

const handlePaste = () => {
  const editor = useEditorStore.getState().editor;
  if (editor) {
    editor.trigger('keyboard', 'paste', null);
  }
};

const handleFind = () => {
  // Show find/replace panel
  useSearchStore.getState().setVisible(true);
  useSearchStore.getState().setSearchMode('find');
};

const handleReplace = () => {
  // Show find/replace panel in replace mode
  useSearchStore.getState().setVisible(true);
  useSearchStore.getState().setSearchMode('replace');
};
```

#### 3. View Menu Actions
```typescript
// View menu action handlers
const handleToggleSidebar = () => {
  const currentState = useAppStore.getState().sidebarVisible;
  useAppStore.getState().setSidebarVisible(!currentState);
};

const handleToggleStatusBar = () => {
  const currentState = useAppStore.getState().statusBarVisible;
  useAppStore.getState().setStatusBarVisible(!currentState);
};

const handleZoomIn = () => {
  const editor = useEditorStore.getState().editor;
  if (editor) {
    const currentZoom = editor.getZoomLevel();
    editor.updateOptions({ fontSize: currentZoom + 1 });
  }
};

const handleZoomOut = () => {
  const editor = useEditorStore.getState().editor;
  if (editor) {
    const currentZoom = editor.getZoomLevel();
    editor.updateOptions({ fontSize: Math.max(8, currentZoom - 1) });
  }
};

const handleResetZoom = () => {
  const editor = useEditorStore.getState().editor;
  if (editor) {
    editor.updateOptions({ fontSize: 14 }); // Default font size
  }
};
```

#### 4. Help Menu Actions
```typescript
// Help menu action handlers
const handleShowShortcuts = () => {
  // Show keyboard shortcuts dialog
  useAppStore.getState().setShortcutsDialogVisible(true);
};

const handleShowAbout = () => {
  // Show about dialog
  useAppStore.getState().setAboutDialogVisible(true);
};
```

### Integration with Stores

#### 1. App Store Updates
```typescript
// App store for UI state
interface AppState {
  sidebarVisible: boolean;
  statusBarVisible: boolean;
  shortcutsDialogVisible: boolean;
  aboutDialogVisible: boolean;
  
  setSidebarVisible: (visible: boolean) => void;
  setStatusBarVisible: (visible: boolean) => void;
  setShortcutsDialogVisible: (visible: boolean) => void;
  setAboutDialogVisible: (visible: boolean) => void;
}

const useAppStore = create<AppState>((set) => ({
  sidebarVisible: true,
  statusBarVisible: true,
  shortcutsDialogVisible: false,
  aboutDialogVisible: false,
  
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setStatusBarVisible: (visible) => set({ statusBarVisible: visible }),
  setShortcutsDialogVisible: (visible) => set({ shortcutsDialogVisible: visible }),
  setAboutDialogVisible: (visible) => set({ aboutDialogVisible: visible })
}));
```

#### 2. Search Store Updates
```typescript
// Search store for find/replace functionality
interface SearchState {
  isVisible: boolean;
  searchMode: 'find' | 'replace';
  
  setVisible: (visible: boolean) => void;
  setSearchMode: (mode: 'find' | 'replace') => void;
}

const useSearchStore = create<SearchState>((set) => ({
  isVisible: false,
  searchMode: 'find',
  
  setVisible: (visible) => set({ isVisible: visible }),
  setSearchMode: (mode) => set({ searchMode: mode })
}));
```

### Error Handling and User Feedback
```typescript
// Error handling utilities
const showError = (message: string) => {
  // Show error notification
  console.error(message);
  // Could integrate with a notification system
};

const showConfirmDialog = async (title: string, message: string): Promise<boolean> => {
  // Show confirmation dialog
  // This would integrate with a dialog system
  return window.confirm(`${title}\n\n${message}`);
};

const createNewFile = async () => {
  // Create a new file with default content
  const timestamp = Date.now();
  const fileName = `untitled-${timestamp}.txt`;
  
  return {
    id: `new-${timestamp}`,
    name: fileName,
    path: null,
    content: ''
  };
};
```

## Testing Requirements

### Unit Tests
```typescript
describe('Menu Actions', () => {
  it('should handle new file action', async () => {
    const mockSetCurrentFile = vi.fn();
    const mockSetContent = vi.fn();
    
    vi.mocked(useFileStore.getState).mockReturnValue({
      setCurrentFile: mockSetCurrentFile
    });
    
    vi.mocked(useEditorStore.getState).mockReturnValue({
      setContent: mockSetContent,
      setModified: vi.fn()
    });
    
    await handleNewFile();
    
    expect(mockSetCurrentFile).toHaveBeenCalled();
    expect(mockSetContent).toHaveBeenCalledWith('');
  });
  
  it('should handle open file action', async () => {
    const mockOpen = vi.fn().mockResolvedValue(['/test/file.txt']);
    const mockReadTextFile = vi.fn().mockResolvedValue('file content');
    
    vi.mocked(open).mockImplementation(mockOpen);
    vi.mocked(readTextFile).mockImplementation(mockReadTextFile);
    
    await handleOpenFile();
    
    expect(mockOpen).toHaveBeenCalled();
    expect(mockReadTextFile).toHaveBeenCalledWith('/test/file.txt');
  });
  
  it('should handle save action', async () => {
    const mockWriteTextFile = vi.fn().mockResolvedValue(undefined);
    
    vi.mocked(useFileStore.getState).mockReturnValue({
      currentFile: '/test/file.txt'
    });
    
    vi.mocked(useEditorStore.getState).mockReturnValue({
      content: 'file content',
      setModified: vi.fn()
    });
    
    vi.mocked(writeTextFile).mockImplementation(mockWriteTextFile);
    
    await handleSave();
    
    expect(mockWriteTextFile).toHaveBeenCalledWith('/test/file.txt', 'file content');
  });
});
```

### Integration Tests
```typescript
describe('Menu Actions Integration', () => {
  it('should integrate with editor for edit actions', () => {
    const mockEditor = {
      trigger: vi.fn()
    };
    
    vi.mocked(useEditorStore.getState).mockReturnValue({
      editor: mockEditor
    });
    
    handleUndo();
    expect(mockEditor.trigger).toHaveBeenCalledWith('keyboard', 'undo', null);
    
    handleCopy();
    expect(mockEditor.trigger).toHaveBeenCalledWith('keyboard', 'copy', null);
  });
  
  it('should integrate with stores for view actions', () => {
    const mockSetSidebarVisible = vi.fn();
    
    vi.mocked(useAppStore.getState).mockReturnValue({
      sidebarVisible: true,
      setSidebarVisible: mockSetSidebarVisible
    });
    
    handleToggleSidebar();
    expect(mockSetSidebarVisible).toHaveBeenCalledWith(false);
  });
});
```

## Non-Functional Requirements

### Performance
- Menu action response: <100ms
- File operations: <500ms for typical files
- UI updates: <16ms for smooth experience

### Reliability
- Proper error handling for all operations
- Graceful degradation for failed operations
- Data integrity during file operations

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Clear error messages

## Implementation Steps

### Phase 1: File Operations
1. **Implement file menu actions**
   - New file functionality
   - Open file with dialog
   - Save and save as operations
   - Close and exit functionality

2. **Add file system integration**
   - Tauri file system APIs
   - Error handling
   - User feedback

### Phase 2: Edit Operations
1. **Implement edit menu actions**
   - Clipboard operations
   - Undo/redo functionality
   - Find/replace integration

2. **Add editor integration**
   - Monaco editor API calls
   - State management
   - Error handling

### Phase 3: View Operations
1. **Implement view menu actions**
   - Sidebar toggle
   - Status bar toggle
   - Zoom controls

2. **Add UI state management**
   - Store updates
   - Component state
   - Persistence

### Phase 4: Help Operations
1. **Implement help menu actions**
   - About dialog
   - Shortcuts dialog
   - Information display

2. **Add dialog components**
   - Modal dialogs
   - Information display
   - User interaction

### Phase 5: Testing and Validation
1. **Implement tests**
   - Unit tests for actions
   - Integration tests
   - Error scenario tests

2. **Manual testing**
   - Test all menu items
   - Verify functionality
   - Check error handling

## Risks and Mitigation

### Medium Risk: File System Errors
**Risk**: File operations may fail due to permissions or system issues.
**Mitigation**:
- Comprehensive error handling
- User-friendly error messages
- Graceful fallbacks

### Low Risk: Editor Integration Issues
**Risk**: Monaco editor API calls may not work as expected.
**Mitigation**:
- Proper API usage
- Error handling
- Fallback mechanisms

### Low Risk: State Management Complexity
**Risk**: Multiple store interactions may cause issues.
**Mitigation**:
- Clear store responsibilities
- Proper state updates
- Comprehensive testing

## Success Criteria

### Functional Success
- [ ] All file menu actions work correctly
- [ ] All edit menu actions work correctly
- [ ] All view menu actions work correctly
- [ ] All help menu actions work correctly

### Technical Success
- [ ] All tests pass
- [ ] Proper error handling
- [ ] Clean code structure
- [ ] No regressions

### Quality Success
- [ ] User-friendly operations
- [ ] Consistent behavior
- [ ] Clear error messages
- [ ] Responsive interface

## Dependencies

### Internal Dependencies
- File store
- Editor store
- App store
- Tab store
- Search store

### External Dependencies
- Tauri file system APIs
- Monaco editor API
- React component system
- Dialog/modal system

## Notes

This PRP makes the application fully functional by connecting all menu actions to their appropriate functionality. The implementation should be robust, user-friendly, and provide clear feedback for all operations.

## References

- [Tauri File System API](https://tauri.app/v1/api/js/fs/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/)
- [React State Management](https://react.dev/learn/managing-state) 
