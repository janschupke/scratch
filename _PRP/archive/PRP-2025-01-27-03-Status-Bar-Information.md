# PRP-2025-01-27-03-Status-Bar-Information

## Overview

This PRP implements a comprehensive status bar system for the Scratch Editor that displays useful file information and editor state. The status bar appears at the bottom of the editor showing the current file type, total number of lines, cursor position, encoding, and other contextual information that updates automatically as users switch between files or make changes.

### User-Facing Description

A status bar appears at the bottom of the editor showing useful file information. Users can see the current file type (e.g., "TypeScript", "JavaScript", "Markdown") and the total number of lines in the file. This information updates automatically as users switch between files or make changes.

### Scope

- Implement status bar component with file information display
- Show file type, line count, cursor position, and encoding
- Add real-time updates as user navigates and edits
- Implement status bar visibility toggle
- Add additional status indicators (read-only, modified, etc.)
- Provide status bar customization options
- Add keyboard shortcuts for status bar interactions

## Functional Requirements

### Core Status Information
- **File Type**: Display detected language (TypeScript, JavaScript, Markdown, etc.)
- **Line Count**: Show total number of lines in current file
- **Cursor Position**: Display current line and column position
- **File Encoding**: Show file encoding (UTF-8, UTF-16, etc.)
- **File Size**: Display file size in human-readable format

### Editor State Information
- **Modified Status**: Show asterisk (*) for unsaved changes
- **Read-Only Status**: Indicate if file is read-only
- **Selection Info**: Show selection size when text is selected
- **Zoom Level**: Display current editor zoom percentage
- **Indentation**: Show current indentation settings

### Real-Time Updates
- **File Changes**: Update when switching between files
- **Cursor Movement**: Update position as user navigates
- **Content Changes**: Update line count as user edits
- **Selection Changes**: Update selection information
- **Zoom Changes**: Update zoom level display

### Interactive Features
- **Click to Focus**: Click on status items to focus editor
- **Context Menu**: Right-click for additional options
- **Keyboard Navigation**: Navigate status items with keyboard
- **Tooltips**: Hover for detailed information

## Technical Requirements

### Status Bar Component

```typescript
// src/components/Editor/StatusBar.tsx
export interface StatusBarProps {
  fileInfo?: FileInfo;
  editorState?: EditorState;
  onStatusItemClick?: (item: StatusItem) => void;
  onStatusItemContextMenu?: (item: StatusItem, event: React.MouseEvent) => void;
}

export interface StatusItem {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  tooltip?: string;
  clickable?: boolean;
  className?: string;
}

export interface FileInfo {
  path: string;
  name: string;
  type: string;
  encoding: string;
  size: number;
  lineCount: number;
  isModified: boolean;
  isReadOnly: boolean;
}

export interface EditorState {
  cursorPosition: { line: number; column: number };
  selection: { start: Position; end: Position } | null;
  zoomLevel: number;
  indentation: string;
  language: string;
}
```

### Status Bar Store

```typescript
// src/stores/statusBarStore.ts
export interface StatusBarState {
  isVisible: boolean;
  items: StatusItem[];
  fileInfo: FileInfo | null;
  editorState: EditorState | null;
  customItems: StatusItem[];
}

export interface StatusBarStore {
  state: StatusBarState;
  
  setVisibility(visible: boolean): void;
  updateFileInfo(fileInfo: FileInfo): void;
  updateEditorState(editorState: EditorState): void;
  addCustomItem(item: StatusItem): void;
  removeCustomItem(id: string): void;
  clearCustomItems(): void;
}
```

### Status Information Service

```typescript
// src/services/statusInformation.ts
export interface StatusInformationResult {
  fileType: string;
  encoding: string;
  lineCount: number;
  fileSize: string;
  language: string;
}

export class StatusInformationService {
  detectFileType(filePath: string): Promise<string>;
  detectEncoding(content: string): Promise<string>;
  countLines(content: string): number;
  formatFileSize(bytes: number): string;
  detectLanguage(filePath: string, content: string): Promise<string>;
}
```

## Implementation Steps

### Phase 1: Core Status Bar Component

1. **Create Status Bar Component**
   - Implement basic status bar layout
   - Add status item rendering
   - Implement click and context menu handlers
   - Add keyboard navigation support

2. **Implement Status Items**
   - File type display with icon
   - Line count with formatting
   - Cursor position display
   - Encoding information
   - File size display

3. **Add Visual Styling**
   - Implement status bar design system
   - Add hover and focus states
   - Implement responsive layout
   - Add proper accessibility attributes

### Phase 2: Status Information Service

1. **Create Status Information Service**
   - Implement file type detection
   - Add encoding detection
   - Implement line counting
   - Add file size formatting

2. **Add Language Detection**
   - Integrate with existing language detection
   - Add support for new file types
   - Implement fallback detection
   - Add custom language mappings

3. **Implement Real-Time Updates**
   - Connect to editor state changes
   - Add file change listeners
   - Implement cursor position tracking
   - Add selection change handling

### Phase 3: Status Bar Store and State Management

1. **Create Status Bar Store**
   - Implement Zustand store for status bar state
   - Add action creators for state updates
   - Implement persistence for user preferences
   - Add state synchronization

2. **Connect to Editor State**
   - Subscribe to editor state changes
   - Update status information in real-time
   - Handle editor focus and blur events
   - Manage editor lifecycle

3. **Add Custom Status Items**
   - Allow users to add custom status items
   - Implement custom item configuration
   - Add custom item persistence
   - Provide default status items

### Phase 4: Interactive Features

1. **Add Click Interactions**
   - Implement click handlers for status items
   - Add focus editor functionality
   - Implement quick actions for status items
   - Add keyboard shortcuts

2. **Implement Context Menus**
   - Add right-click context menus
   - Implement status item options
   - Add copy to clipboard functionality
   - Add status bar customization

3. **Add Tooltips and Help**
   - Implement detailed tooltips
   - Add help text for status items
   - Provide status item descriptions
   - Add accessibility labels

### Phase 5: Advanced Features and Polish

1. **Add Status Bar Customization**
   - Allow users to show/hide status items
   - Implement status item reordering
   - Add custom status item creation
   - Provide status bar themes

2. **Implement Performance Optimizations**
   - Debounce status updates
   - Implement efficient state updates
   - Add virtual rendering for large files
   - Optimize re-rendering

3. **Add Accessibility Features**
   - Implement proper ARIA labels
   - Add keyboard navigation
   - Support screen readers
   - Add high contrast mode support

## Testing Requirements

### Unit Tests

```typescript
// src/components/Editor/__tests__/StatusBar.test.tsx
describe('StatusBar Component', () => {
  test('renders status items correctly');
  test('handles click events properly');
  test('supports keyboard navigation');
  test('displays file information accurately');
  test('updates in real-time');
});

describe('StatusInformationService', () => {
  test('detects file types correctly');
  test('counts lines accurately');
  test('formats file sizes properly');
  test('detects encoding correctly');
  test('identifies languages accurately');
});

describe('StatusBarStore', () => {
  test('manages state correctly');
  test('updates file information');
  test('handles custom items');
  test('persists user preferences');
});
```

### Integration Tests

```typescript
// src/test/integration/status-bar.test.ts
describe('Status Bar Integration', () => {
  test('status bar updates with file changes');
  test('status bar reflects editor state');
  test('status bar responds to user interactions');
  test('status bar persists user preferences');
  test('status bar works with different file types');
});
```

### E2E Tests

```typescript
// src/test/e2e/status-bar.e2e.test.ts
describe('Status Bar E2E', () => {
  test('user can see file information in status bar');
  test('user can interact with status bar items');
  test('user can customize status bar display');
  test('status bar updates as user edits files');
  test('status bar shows correct information for different files');
});
```

## Non-Functional Requirements

### Performance
- Status bar updates should complete within 50ms
- File information detection should complete within 100ms
- Status bar should not impact editor performance
- Memory usage should be minimal

### Accessibility
- Full keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Proper ARIA labels and roles

### Error Handling
- Graceful handling of file system errors
- Fallback display for missing information
- User-friendly error messages
- Proper cleanup on errors

### Security
- Sanitize file information display
- Handle sensitive file paths appropriately
- Validate file content before analysis
- Prevent information disclosure

## Code Examples

### Status Bar Component Implementation

```typescript
// src/components/Editor/StatusBar.tsx
export const StatusBar: React.FC<StatusBarProps> = ({
  fileInfo,
  editorState,
  onStatusItemClick,
  onStatusItemContextMenu
}) => {
  const statusBarStore = useStatusBarStore();
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  const handleItemClick = (item: StatusItem) => {
    if (item.clickable && onStatusItemClick) {
      onStatusItemClick(item);
    }
  };

  const handleItemContextMenu = (item: StatusItem, event: React.MouseEvent) => {
    if (onStatusItemContextMenu) {
      onStatusItemContextMenu(item, event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, item: StatusItem) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleItemClick(item);
        break;
      case 'ArrowRight':
        event.preventDefault();
        // Navigate to next item
        break;
      case 'ArrowLeft':
        event.preventDefault();
        // Navigate to previous item
        break;
    }
  };

  const renderStatusItem = (item: StatusItem) => (
    <div
      key={item.id}
      className={cn(
        'status-item',
        item.clickable && 'clickable',
        focusedItem === item.id && 'focused',
        item.className
      )}
      onClick={() => handleItemClick(item)}
      onContextMenu={(e) => handleItemContextMenu(item, e)}
      onKeyDown={(e) => handleKeyDown(e, item)}
      onFocus={() => setFocusedItem(item.id)}
      onBlur={() => setFocusedItem(null)}
      tabIndex={item.clickable ? 0 : -1}
      role={item.clickable ? 'button' : 'status'}
      aria-label={item.tooltip || `${item.label}: ${item.value}`}
      title={item.tooltip}
    >
      {item.icon && <span className="status-icon">{item.icon}</span>}
      <span className="status-label">{item.label}</span>
      <span className="status-value">{item.value}</span>
    </div>
  );

  if (!statusBarStore.state.isVisible) {
    return null;
  }

  return (
    <div className="status-bar" role="status" aria-live="polite">
      <div className="status-items">
        {statusBarStore.state.items.map(renderStatusItem)}
      </div>
      <div className="status-custom">
        {statusBarStore.state.customItems.map(renderStatusItem)}
      </div>
    </div>
  );
};
```

### Status Information Service

```typescript
// src/services/statusInformation.ts
export class StatusInformationService {
  async detectFileType(filePath: string): Promise<string> {
    const extension = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript React',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript React',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.less': 'Less',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.swift': 'Swift',
      '.kt': 'Kotlin'
    };

    return languageMap[extension] || 'Plain Text';
  }

  detectEncoding(content: string): Promise<string> {
    // Simple UTF-8 detection
    const hasUtf8Bom = content.startsWith('\uFEFF');
    const hasUtf16Bom = content.startsWith('\uFFFE') || content.startsWith('\uFEFF');
    
    if (hasUtf8Bom) return 'UTF-8 BOM';
    if (hasUtf16Bom) return 'UTF-16';
    
    // Check for non-ASCII characters
    const hasNonAscii = /[\u0080-\uFFFF]/.test(content);
    return hasNonAscii ? 'UTF-8' : 'ASCII';
  }

  countLines(content: string): number {
    if (!content) return 0;
    return content.split('\n').length;
  }

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  async detectLanguage(filePath: string, content: string): Promise<string> {
    // Use existing language detection or enhance it
    const fileType = await this.detectFileType(filePath);
    
    // Additional heuristics based on content
    if (fileType === 'Plain Text') {
      if (content.includes('<?php')) return 'PHP';
      if (content.includes('#!/usr/bin/env python')) return 'Python';
      if (content.includes('#!/usr/bin/env ruby')) return 'Ruby';
      if (content.includes('#!/usr/bin/env node')) return 'JavaScript';
    }

    return fileType;
  }
}
```

### Status Bar Store

```typescript
// src/stores/statusBarStore.ts
export const useStatusBarStore = create<StatusBarStore>((set, get) => ({
  state: {
    isVisible: true,
    items: [],
    fileInfo: null,
    editorState: null,
    customItems: []
  },

  setVisibility: (visible: boolean) => {
    set((state) => ({
      state: { ...state.state, isVisible: visible }
    }));
  },

  updateFileInfo: (fileInfo: FileInfo) => {
    set((state) => ({
      state: { ...state.state, fileInfo }
    }));
  },

  updateEditorState: (editorState: EditorState) => {
    set((state) => ({
      state: { ...state.state, editorState }
    }));
  },

  addCustomItem: (item: StatusItem) => {
    set((state) => ({
      state: {
        ...state.state,
        customItems: [...state.state.customItems, item]
      }
    }));
  },

  removeCustomItem: (id: string) => {
    set((state) => ({
      state: {
        ...state.state,
        customItems: state.state.customItems.filter(item => item.id !== id)
      }
    }));
  },

  clearCustomItems: () => {
    set((state) => ({
      state: { ...state.state, customItems: [] }
    }));
  }
}));
```

## Risks and Mitigation

### Risk 1: Performance Impact
- **Risk**: Status bar updates could slow down editor performance
- **Mitigation**: Implement debounced updates and efficient state management

### Risk 2: File System Access
- **Risk**: File information detection could fail on certain file types
- **Mitigation**: Implement robust error handling and fallback detection

### Risk 3: Memory Usage
- **Risk**: Storing file information could consume excessive memory
- **Mitigation**: Implement efficient caching and cleanup strategies

### Risk 4: Accessibility Compliance
- **Risk**: Status bar might not be fully accessible
- **Mitigation**: Implement comprehensive accessibility features and testing

## Accessibility Considerations

### Keyboard Navigation
- Full keyboard navigation for status items
- Proper focus management
- Clear visual indicators for focused items
- Logical tab order

### Screen Reader Support
- Proper ARIA labels for status items
- Announcement of status changes
- Clear descriptions of status information
- Status updates for dynamic content

### Visual Accessibility
- High contrast status bar items
- Clear visual indicators for different states
- Proper sizing for touch targets
- Color-blind friendly indicators

## Success Criteria

- [ ] Status bar displays file type and line count correctly
- [ ] Status bar updates in real-time as user navigates and edits
- [ ] Status bar shows cursor position and selection information
- [ ] Status bar can be toggled on/off
- [ ] Status bar supports keyboard navigation
- [ ] Status bar is fully accessible
- [ ] Status bar performance is acceptable
- [ ] All tests pass with >80% coverage
- [ ] No TypeScript errors or linting warnings
- [ ] Build completes successfully
- [ ] Status bar customization works correctly

## Dependencies

- Existing editor components
- File store and editor store
- Language detection utilities
- File system APIs
- Settings persistence system
- Design system components

## Timeline

- **Phase 1**: 2-3 hours (Core status bar component)
- **Phase 2**: 2-3 hours (Status information service)
- **Phase 3**: 2-3 hours (Status bar store and state management)
- **Phase 4**: 2-3 hours (Interactive features)
- **Phase 5**: 2-3 hours (Advanced features and polish)

**Total Estimated Time**: 10-15 hours 
