# PRP-2025-01-27-05-Add-Status-Bar

## Overview

**UI/UX Improvement**: Implement a status bar at the bottom of the editor to show current file information, cursor position, and other relevant details. This provides users with important context about their current editing session.

**User Impact**: Users will have clear visibility into their current file, cursor position, file encoding, and other useful information, improving the overall editing experience.

**Priority**: Medium - Enhances user experience and provides important contextual information.

## Functional Requirements

### Core Functionality
- Display current file path and name
- Show cursor position (line and column)
- Display file encoding (UTF-8, etc.)
- Show file size and modification status
- Indicate current language/mode
- Display selection information (if text is selected)

### Status Bar Sections
- **File Info**: Path, name, encoding, size
- **Cursor Info**: Line, column, selection
- **Language**: Current file type/language
- **Status**: Modified indicator, save status
- **Position**: Scroll position, zoom level

### User Experience
- Real-time updates as user navigates
- Clear, readable information display
- Non-intrusive design that doesn't interfere with editing
- Responsive to window resizing

## Technical Requirements

### Status Bar Component Structure

#### 1. Main Status Bar Component
```typescript
interface StatusBarProps {
  currentFile?: string;
  cursorPosition?: { line: number; column: number };
  fileEncoding?: string;
  fileSize?: number;
  isModified?: boolean;
  language?: string;
  selection?: { start: number; end: number };
}

const StatusBar: React.FC<StatusBarProps> = ({
  currentFile,
  cursorPosition,
  fileEncoding = 'UTF-8',
  fileSize,
  isModified = false,
  language,
  selection
}) => {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <FileInfo 
          path={currentFile}
          encoding={fileEncoding}
          size={fileSize}
          isModified={isModified}
        />
      </div>
      
      <div className="status-bar-center">
        <LanguageIndicator language={language} />
      </div>
      
      <div className="status-bar-right">
        <CursorInfo 
          position={cursorPosition}
          selection={selection}
        />
      </div>
    </div>
  );
};
```

#### 2. File Information Component
```typescript
const FileInfo: React.FC<{
  path?: string;
  encoding: string;
  size?: number;
  isModified: boolean;
}> = ({ path, encoding, size, isModified }) => {
  const fileName = path ? path.split('/').pop() : 'Untitled';
  const filePath = path ? path.replace(fileName, '') : '';
  
  return (
    <div className="file-info">
      <span className="file-name">
        {fileName}
        {isModified && <span className="modified-indicator">●</span>}
      </span>
      <span className="file-path">{filePath}</span>
      <span className="file-encoding">{encoding}</span>
      {size && <span className="file-size">{formatFileSize(size)}</span>}
    </div>
  );
};
```

#### 3. Cursor Information Component
```typescript
const CursorInfo: React.FC<{
  position?: { line: number; column: number };
  selection?: { start: number; end: number };
}> = ({ position, selection }) => {
  const hasSelection = selection && selection.start !== selection.end;
  
  return (
    <div className="cursor-info">
      {position && (
        <span className="cursor-position">
          Ln {position.line}, Col {position.column}
        </span>
      )}
      {hasSelection && (
        <span className="selection-info">
          ({selection.end - selection.start} chars)
        </span>
      )}
    </div>
  );
};
```

#### 4. Language Indicator Component
```typescript
const LanguageIndicator: React.FC<{ language?: string }> = ({ language }) => {
  if (!language) return null;
  
  return (
    <div className="language-indicator">
      <span className="language-name">{language}</span>
    </div>
  );
};
```

### Integration with Editor

#### 1. Editor State Integration
```typescript
// In editor store
interface EditorState {
  currentFile?: string;
  cursorPosition?: { line: number; column: number };
  selection?: { start: number; end: number };
  isModified: boolean;
  language?: string;
}

const useEditorStore = create<EditorState>((set, get) => ({
  currentFile: undefined,
  cursorPosition: undefined,
  selection: undefined,
  isModified: false,
  language: undefined,
  
  updateCursorPosition: (position: { line: number; column: number }) => {
    set({ cursorPosition: position });
  },
  
  updateSelection: (selection: { start: number; end: number }) => {
    set({ selection });
  },
  
  setModified: (isModified: boolean) => {
    set({ isModified });
  },
  
  setLanguage: (language: string) => {
    set({ language });
  }
}));
```

#### 2. Monaco Editor Integration
```typescript
// In editor component
const Editor: React.FC = () => {
  const { updateCursorPosition, updateSelection, setModified } = useEditorStore();
  
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      updateCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });
    
    // Listen for selection changes
    editor.onDidChangeCursorSelection((e) => {
      updateSelection({
        start: e.selection.getStartOffset(),
        end: e.selection.getEndOffset()
      });
    });
    
    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      setModified(true);
    });
  };
  
  return (
    <MonacoEditor
      onMount={handleEditorDidMount}
      // ... other props
    />
  );
};
```

### Styling and Layout
```css
/* Status bar styling */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
  background-color: var(--status-bar-bg);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
  padding: 0 8px;
}

.status-bar-left,
.status-bar-center,
.status-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modified-indicator {
  color: var(--accent-color);
  font-weight: bold;
}

.cursor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-indicator {
  padding: 2px 6px;
  background-color: var(--badge-bg);
  border-radius: 3px;
  font-size: 11px;
}
```

## Testing Requirements

### Unit Tests
```typescript
describe('StatusBar', () => {
  it('should display file information', () => {
    render(
      <StatusBar
        currentFile="/path/to/file.txt"
        fileEncoding="UTF-8"
        fileSize={1024}
        isModified={true}
      />
    );
    
    expect(screen.getByText('file.txt')).toBeInTheDocument();
    expect(screen.getByText('UTF-8')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('●')).toBeInTheDocument(); // modified indicator
  });
  
  it('should display cursor position', () => {
    render(
      <StatusBar
        cursorPosition={{ line: 10, column: 5 }}
      />
    );
    
    expect(screen.getByText('Ln 10, Col 5')).toBeInTheDocument();
  });
  
  it('should display selection information', () => {
    render(
      <StatusBar
        cursorPosition={{ line: 1, column: 1 }}
        selection={{ start: 0, end: 10 }}
      />
    );
    
    expect(screen.getByText('(10 chars)')).toBeInTheDocument();
  });
  
  it('should display language indicator', () => {
    render(
      <StatusBar
        language="javascript"
      />
    );
    
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
describe('StatusBar Integration', () => {
  it('should update when editor state changes', async () => {
    render(<Editor />);
    
    // Simulate cursor movement
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });
    
    await waitFor(() => {
      expect(screen.getByText(/Ln \d+, Col \d+/)).toBeInTheDocument();
    });
  });
  
  it('should show modified indicator when content changes', async () => {
    render(<Editor />);
    
    // Simulate content change
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'New content' }
    });
    
    await waitFor(() => {
      expect(screen.getByText('●')).toBeInTheDocument();
    });
  });
});
```

## Non-Functional Requirements

### Performance
- Status updates: <16ms (60fps)
- Memory usage: <1MB additional
- Responsive to frequent updates

### Reliability
- Accurate position tracking
- Proper file size calculation
- Correct encoding detection

### Accessibility
- Screen reader support for status information
- Keyboard navigation compatibility
- Clear information hierarchy

## Implementation Steps

### Phase 1: Component Structure
1. **Create status bar components**
   - Main StatusBar component
   - FileInfo component
   - CursorInfo component
   - LanguageIndicator component

2. **Implement styling**
   - CSS for status bar layout
   - Responsive design
   - Theme integration

### Phase 2: Editor Integration
1. **Connect to editor state**
   - Integrate with editor store
   - Listen for cursor changes
   - Track file modifications

2. **Monaco editor integration**
   - Hook into editor events
   - Update status bar in real-time
   - Handle selection changes

### Phase 3: File Information
1. **File metadata display**
   - File path and name
   - File size calculation
   - Encoding detection
   - Modification status

2. **Language detection**
   - File extension detection
   - Language mapping
   - Syntax highlighting integration

### Phase 4: Testing and Validation
1. **Implement tests**
   - Unit tests for components
   - Integration tests with editor
   - E2E tests for user workflows

2. **Manual testing**
   - Test with different file types
   - Verify real-time updates
   - Check responsive behavior

## Risks and Mitigation

### Medium Risk: Performance Impact
**Risk**: Frequent status updates may impact performance.
**Mitigation**:
- Debounce status updates
- Optimize re-renders
- Use efficient state management

### Low Risk: Information Overload
**Risk**: Too much information may clutter the status bar.
**Mitigation**:
- Prioritize essential information
- Allow user customization
- Use compact display format

### Low Risk: Layout Issues
**Risk**: Status bar may not fit in small windows.
**Mitigation**:
- Responsive design
- Truncate long paths
- Hide non-essential info

## Success Criteria

### Functional Success
- [ ] Status bar displays current file information
- [ ] Cursor position updates in real-time
- [ ] File modification status is shown
- [ ] Language indicator works correctly

### Technical Success
- [ ] All tests pass
- [ ] Performance is acceptable
- [ ] Clean code structure
- [ ] Proper error handling

### Quality Success
- [ ] User-friendly information display
- [ ] Non-intrusive design
- [ ] Responsive to window changes
- [ ] Accessible to all users

## Dependencies

### Internal Dependencies
- Editor component
- Editor store
- File system utilities
- Language detection utilities

### External Dependencies
- Monaco Editor API
- React component system
- CSS styling system

## Notes

This PRP enhances the user experience by providing important contextual information. The status bar should be informative but not overwhelming, and should integrate seamlessly with the existing editor interface.

## References

- [VS Code Status Bar](https://code.visualstudio.com/api/references/vscode-api#StatusBarItem)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit) 
