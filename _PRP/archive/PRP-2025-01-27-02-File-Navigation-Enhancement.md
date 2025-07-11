# PRP-2025-01-27-02-File-Navigation-Enhancement

## Overview

This PRP enhances the file navigation system in the Scratch Editor to provide seamless file browsing and tab management. When users click on a file in the sidebar, the file opens in a new tab or focuses on the existing tab if already open. The editor automatically switches to the selected file, making it easy to navigate between files in the project.

### User-Facing Description

When users click on a file in the sidebar, the file opens in a new tab or focuses on the existing tab if already open. The editor automatically switches to the selected file, making it easy to navigate between files in the project.

### Scope

- Enhance sidebar file tree click handling
- Implement intelligent tab management (open new vs focus existing)
- Add visual feedback for file selection
- Implement file type detection and appropriate editor configuration
- Add keyboard navigation support for file tree
- Implement file preview functionality for quick viewing
- Add file search/filter functionality in sidebar

## Functional Requirements

### File Selection Behavior
- **Single Click**: Opens file in new tab or focuses existing tab
- **Double Click**: Opens file in new tab (always)
- **Right Click**: Shows context menu with file options
- **Keyboard Navigation**: Arrow keys to navigate, Enter to open

### Tab Management
- **New File**: Opens in new tab with appropriate title
- **Existing File**: Focuses existing tab and scrolls to it
- **Tab Limit**: Maximum number of open tabs (configurable)
- **Tab Ordering**: Most recently used ordering
- **Tab Pinning**: Ability to pin important tabs

### File Type Handling
- **Text Files**: Open in text editor with syntax highlighting
- **Binary Files**: Show warning or preview if possible
- **Large Files**: Show size warning and loading indicator
- **Unsupported Files**: Show appropriate error message

### Visual Feedback
- **Selected File**: Highlight in sidebar
- **Open Files**: Visual indicator in sidebar
- **Modified Files**: Asterisk or indicator in tab
- **Loading State**: Show loading spinner during file operations

## Technical Requirements

### File Navigation Service

```typescript
// src/services/fileNavigation.ts
export interface FileNavigationOptions {
  forceNewTab?: boolean;
  preview?: boolean;
  focus?: boolean;
}

export interface FileNavigationResult {
  success: boolean;
  tabId?: string;
  error?: string;
  fileInfo?: FileInfo;
}

export class FileNavigationService {
  openFile(filePath: string, options?: FileNavigationOptions): Promise<FileNavigationResult>;
  closeFile(tabId: string): Promise<void>;
  focusTab(tabId: string): void;
  getOpenFiles(): string[];
  isFileOpen(filePath: string): boolean;
}
```

### Enhanced File Tree Component

```typescript
// src/components/Sidebar/FileTree.tsx
export interface FileTreeProps {
  onFileSelect: (filePath: string, options?: FileNavigationOptions) => void;
  onFileContextMenu: (filePath: string, event: React.MouseEvent) => void;
  selectedFile?: string;
  openFiles: string[];
  searchQuery?: string;
}

export interface FileTreeItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  isOpen?: boolean;
  isSelected?: boolean;
  children?: FileTreeItem[];
}
```

### Tab Management Enhancement

```typescript
// src/stores/tabStore.ts
export interface TabState {
  id: string;
  filePath: string;
  title: string;
  isModified: boolean;
  isPinned: boolean;
  lastAccessed: number;
  content?: string;
  language?: string;
}

export interface TabStore {
  tabs: TabState[];
  activeTabId: string | null;
  maxTabs: number;
  
  openTab(filePath: string, options?: FileNavigationOptions): string;
  closeTab(tabId: string): void;
  focusTab(tabId: string): void;
  pinTab(tabId: string): void;
  unpinTab(tabId: string): void;
  getTabByFilePath(filePath: string): TabState | undefined;
}
```

## Implementation Steps

### Phase 1: Enhanced File Navigation Service

1. **Create File Navigation Service**
   - Implement `FileNavigationService` class
   - Add file opening logic with tab management
   - Add file type detection and validation
   - Add error handling for file operations

2. **Implement File Type Detection**
   - Add comprehensive file type detection
   - Handle binary files appropriately
   - Add file size validation
   - Implement loading states for large files

3. **Add File Validation**
   - Check file permissions
   - Validate file paths
   - Handle file system errors
   - Add file encoding detection

### Phase 2: Enhanced Sidebar File Tree

1. **Update File Tree Component**
   - Add click handlers for file selection
   - Implement visual feedback for selected/open files
   - Add keyboard navigation support
   - Add context menu functionality

2. **Add File Search/Filter**
   - Implement real-time file filtering
   - Add search highlighting
   - Add keyboard shortcuts for search
   - Persist search state

3. **Enhance Visual Indicators**
   - Show file icons based on type
   - Indicate open files in sidebar
   - Show modified file indicators
   - Add loading states

### Phase 3: Advanced Tab Management

1. **Implement Smart Tab Opening**
   - Check if file is already open
   - Focus existing tab or open new one
   - Handle tab limits and ordering
   - Add tab pinning functionality

2. **Add Tab Context Menu**
   - Close tab option
   - Close other tabs option
   - Close all tabs option
   - Pin/unpin tab option

3. **Implement Tab Persistence**
   - Save tab state between sessions
   - Restore tabs on app startup
   - Handle file path changes
   - Clean up invalid tabs

### Phase 4: File Preview and Quick Actions

1. **Add File Preview**
   - Quick preview for text files
   - Image preview for supported formats
   - Binary file information display
   - Preview in new window option

2. **Implement Quick Actions**
   - Open in default app
   - Copy file path
   - Show in Finder/Explorer
   - File properties display

3. **Add Drag and Drop Support**
   - Drag files to open in new tabs
   - Drag files to reorder tabs
   - Drag files to create new windows
   - Handle external file drops

### Phase 5: Performance and Polish

1. **Optimize File Tree Rendering**
   - Virtual scrolling for large directories
   - Lazy loading of directory contents
   - Debounced search input
   - Efficient file filtering

2. **Add Keyboard Shortcuts**
   - Ctrl/Cmd+P for quick file open
   - Ctrl/Cmd+Shift+P for command palette
   - Arrow keys for file navigation
   - Enter for file opening

3. **Enhance Error Handling**
   - Graceful handling of file system errors
   - User-friendly error messages
   - Retry mechanisms for failed operations
   - Logging for debugging

## Testing Requirements

### Unit Tests

```typescript
// src/services/__tests__/fileNavigation.test.ts
describe('FileNavigationService', () => {
  test('opens new file in new tab');
  test('focuses existing tab for already open file');
  test('handles file type detection correctly');
  test('validates file permissions');
  test('handles file system errors gracefully');
});

describe('FileTree Component', () => {
  test('renders file tree correctly');
  test('handles file selection events');
  test('supports keyboard navigation');
  test('filters files based on search query');
  test('shows appropriate visual indicators');
});

describe('TabStore', () => {
  test('manages tab state correctly');
  test('handles tab limits properly');
  test('persists tab state between sessions');
  test('handles tab pinning correctly');
});
```

### Integration Tests

```typescript
// src/test/integration/file-navigation.test.ts
describe('File Navigation Integration', () => {
  test('file selection opens correct tab');
  test('tab switching updates editor content');
  test('file tree reflects open files');
  test('keyboard navigation works end-to-end');
  test('file search filters results correctly');
});
```

### E2E Tests

```typescript
// src/test/e2e/file-navigation.e2e.test.ts
describe('File Navigation E2E', () => {
  test('user can navigate files using sidebar');
  test('user can open multiple files in tabs');
  test('user can search and filter files');
  test('user can use keyboard shortcuts for navigation');
  test('user can preview files without opening');
});
```

## Non-Functional Requirements

### Performance
- File tree should render within 100ms for directories with <1000 files
- File opening should complete within 500ms for files <1MB
- Search filtering should respond within 50ms
- Tab switching should be instantaneous

### Accessibility
- Full keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Proper ARIA labels and roles

### Error Handling
- Graceful handling of file system errors
- User-friendly error messages
- Retry mechanisms for transient failures
- Proper cleanup on operation failure

### Security
- Validate file paths before operations
- Sanitize file content appropriately
- Handle permission errors gracefully
- Prevent directory traversal attacks

## Code Examples

### File Navigation Service Implementation

```typescript
// src/services/fileNavigation.ts
export class FileNavigationService {
  private tabStore: TabStore;
  private fileStore: FileStore;

  constructor(tabStore: TabStore, fileStore: FileStore) {
    this.tabStore = tabStore;
    this.fileStore = fileStore;
  }

  async openFile(filePath: string, options: FileNavigationOptions = {}): Promise<FileNavigationResult> {
    try {
      // Check if file is already open
      const existingTab = this.tabStore.getTabByFilePath(filePath);
      
      if (existingTab && !options.forceNewTab) {
        // Focus existing tab
        this.tabStore.focusTab(existingTab.id);
        return {
          success: true,
          tabId: existingTab.id,
          fileInfo: await this.getFileInfo(filePath)
        };
      }

      // Validate file before opening
      const fileInfo = await this.validateAndGetFileInfo(filePath);
      if (!fileInfo.isValid) {
        return {
          success: false,
          error: fileInfo.error
        };
      }

      // Open new tab
      const tabId = this.tabStore.openTab(filePath, {
        title: fileInfo.name,
        language: fileInfo.language,
        content: await this.loadFileContent(filePath)
      });

      return {
        success: true,
        tabId,
        fileInfo
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async validateAndGetFileInfo(filePath: string): Promise<FileInfo> {
    const stats = await invoke('tauri', {
      cmd: 'getFileInfo',
      args: { path: filePath }
    });

    if (stats.isDirectory) {
      throw new Error('Cannot open directory as file');
    }

    if (stats.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File too large to open');
    }

    return {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      language: this.detectLanguage(filePath),
      isValid: true
    };
  }
}
```

### Enhanced File Tree Component

```typescript
// src/components/Sidebar/FileTree.tsx
export const FileTree: React.FC<FileTreeProps> = ({
  onFileSelect,
  onFileContextMenu,
  selectedFile,
  openFiles,
  searchQuery
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [filteredFiles, setFilteredFiles] = useState<FileTreeItem[]>([]);
  const fileTreeRef = useRef<HTMLDivElement>(null);

  const handleFileClick = (filePath: string, event: React.MouseEvent) => {
    event.preventDefault();
    onFileSelect(filePath, {
      focus: true,
      forceNewTab: event.ctrlKey || event.metaKey
    });
  };

  const handleFileContextMenu = (filePath: string, event: React.MouseEvent) => {
    event.preventDefault();
    onFileContextMenu(filePath, event);
  };

  const handleKeyDown = (event: React.KeyboardEvent, filePath: string) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        onFileSelect(filePath, { focus: true });
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Navigate to next file
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Navigate to previous file
        break;
    }
  };

  const renderFileItem = (item: FileTreeItem) => {
    const isSelected = selectedFile === item.path;
    const isOpen = openFiles.includes(item.path);
    const isDirectory = item.type === 'directory';

    return (
      <div
        key={item.path}
        className={cn(
          'file-tree-item',
          isSelected && 'selected',
          isOpen && 'open',
          isDirectory && 'directory'
        )}
        onClick={(e) => !isDirectory && handleFileClick(item.path, e)}
        onContextMenu={(e) => handleFileContextMenu(item.path, e)}
        onKeyDown={(e) => handleKeyDown(e, item.path)}
        tabIndex={0}
        role="treeitem"
        aria-selected={isSelected}
      >
        <FileIcon type={item.type} />
        <span className="file-name">{item.name}</span>
        {isOpen && <OpenIndicator />}
        {isSelected && <SelectedIndicator />}
      </div>
    );
  };

  return (
    <div ref={fileTreeRef} className="file-tree" role="tree">
      {filteredFiles.map(renderFileItem)}
    </div>
  );
};
```

## Risks and Mitigation

### Risk 1: Large Directory Performance
- **Risk**: Very large directories could slow down file tree rendering
- **Mitigation**: Implement virtual scrolling and lazy loading

### Risk 2: File System Permissions
- **Risk**: Users may not have permission to access certain files
- **Mitigation**: Implement proper permission checking and user-friendly error messages

### Risk 3: Memory Usage
- **Risk**: Opening many large files could consume excessive memory
- **Mitigation**: Implement file size limits and content streaming

### Risk 4: File Path Changes
- **Risk**: Files may be moved or deleted while open
- **Mitigation**: Implement file change detection and graceful handling

## Accessibility Considerations

### Keyboard Navigation
- Full keyboard navigation for file tree
- Proper focus management
- Clear visual indicators for focused items
- Logical tab order

### Screen Reader Support
- Proper ARIA labels for file items
- Announcement of file selection
- Clear descriptions of file operations
- Status updates for loading states

### Visual Accessibility
- High contrast file tree items
- Clear visual indicators for file states
- Proper sizing for touch targets
- Color-blind friendly indicators

## Success Criteria

- [ ] File clicks open files in appropriate tabs
- [ ] Existing files focus existing tabs correctly
- [ ] File tree shows visual indicators for open/selected files
- [ ] Keyboard navigation works for all file operations
- [ ] File search/filter works correctly
- [ ] File type detection works for common formats
- [ ] Error handling is comprehensive and user-friendly
- [ ] Performance is acceptable for large directories
- [ ] All tests pass with >80% coverage
- [ ] No TypeScript errors or linting warnings
- [ ] Build completes successfully
- [ ] Accessibility requirements are met

## Dependencies

- Existing sidebar and file tree components
- Tab store and file store
- Monaco editor integration
- Tauri file system APIs
- File type detection utilities
- Settings persistence system

## Timeline

- **Phase 1**: 3-4 hours (File navigation service)
- **Phase 2**: 3-4 hours (Enhanced file tree)
- **Phase 3**: 2-3 hours (Advanced tab management)
- **Phase 4**: 2-3 hours (File preview and quick actions)
- **Phase 5**: 2-3 hours (Performance and polish)

**Total Estimated Time**: 12-17 hours 
