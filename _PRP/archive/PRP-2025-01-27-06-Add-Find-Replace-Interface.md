# PRP-2025-01-27-06-Add-Find-Replace-Interface

## Overview

**UI/UX Improvement**: Create an expandable find/replace UI at the bottom of the editor for text search and replacement functionality. This provides users with powerful search capabilities similar to modern code editors.

**User Impact**: Users will be able to quickly find and replace text within files, improving productivity and editing efficiency.

**Priority**: Medium - Enhances editing capabilities and user productivity.

## Functional Requirements

### Core Functionality
- **Find Text**: Search for text within current file
- **Replace Text**: Replace found text with new text
- **Find All**: Highlight all occurrences of search term
- **Replace All**: Replace all occurrences at once
- **Case Sensitive**: Toggle case-sensitive search
- **Regular Expressions**: Support regex search patterns
- **Whole Word**: Match whole words only

### UI Components
- **Find Input**: Text input for search term
- **Replace Input**: Text input for replacement
- **Search Options**: Checkboxes for case sensitive, regex, whole word
- **Action Buttons**: Find, Replace, Replace All, Find All
- **Results Counter**: Show number of matches found
- **Navigation**: Previous/Next match buttons

### User Experience
- Expandable/collapsible interface
- Keyboard shortcuts (Cmd+F, Cmd+H)
- Real-time search highlighting
- Clear visual feedback for matches
- Smooth navigation between matches

## Technical Requirements

### Find/Replace Component Structure

#### 1. Main Find/Replace Component
```typescript
interface FindReplaceProps {
  isVisible: boolean;
  onClose: () => void;
  editor?: monaco.editor.IStandaloneCodeEditor;
}

const FindReplace: React.FC<FindReplaceProps> = ({
  isVisible,
  onClose,
  editor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

  if (!isVisible) return null;

  return (
    <div className="find-replace-panel">
      <div className="find-replace-header">
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="find-replace-content">
        <div className="find-section">
          <input
            type="text"
            placeholder="Find"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="find-input"
          />
          <div className="search-options">
            <label>
              <input
                type="checkbox"
                checked={isCaseSensitive}
                onChange={(e) => setIsCaseSensitive(e.target.checked)}
              />
              Case sensitive
            </label>
            <label>
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setIsRegex(e.target.checked)}
              />
              Regex
            </label>
            <label>
              <input
                type="checkbox"
                checked={isWholeWord}
                onChange={(e) => setIsWholeWord(e.target.checked)}
              />
              Whole word
            </label>
          </div>
        </div>
        
        <div className="replace-section">
          <input
            type="text"
            placeholder="Replace"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="replace-input"
          />
        </div>
        
        <div className="action-buttons">
          <button onClick={() => findNext()}>Find Next</button>
          <button onClick={() => findPrevious()}>Find Previous</button>
          <button onClick={() => replace()}>Replace</button>
          <button onClick={() => replaceAll()}>Replace All</button>
        </div>
        
        <div className="results-info">
          {matchCount > 0 && (
            <span>{currentMatch} of {matchCount} matches</span>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### 2. Search State Management
```typescript
interface SearchState {
  searchTerm: string;
  replaceTerm: string;
  isCaseSensitive: boolean;
  isRegex: boolean;
  isWholeWord: boolean;
  matchCount: number;
  currentMatch: number;
  isVisible: boolean;
}

const useSearchStore = create<SearchState>((set, get) => ({
  searchTerm: '',
  replaceTerm: '',
  isCaseSensitive: false,
  isRegex: false,
  isWholeWord: false,
  matchCount: 0,
  currentMatch: 0,
  isVisible: false,
  
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setReplaceTerm: (term: string) => set({ replaceTerm: term }),
  setCaseSensitive: (value: boolean) => set({ isCaseSensitive: value }),
  setRegex: (value: boolean) => set({ isRegex: value }),
  setWholeWord: (value: boolean) => set({ isWholeWord: value }),
  setMatchCount: (count: number) => set({ matchCount: count }),
  setCurrentMatch: (match: number) => set({ currentMatch: match }),
  setVisible: (visible: boolean) => set({ isVisible: visible }),
  
  reset: () => set({
    searchTerm: '',
    replaceTerm: '',
    isCaseSensitive: false,
    isRegex: false,
    isWholeWord: false,
    matchCount: 0,
    currentMatch: 0
  })
}));
```

#### 3. Monaco Editor Integration
```typescript
// Search functionality with Monaco Editor
class SearchController {
  private editor: monaco.editor.IStandaloneCodeEditor;
  private searchModel: monaco.editor.FindMatch[] = [];
  private currentMatchIndex = 0;
  
  constructor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
  }
  
  find(searchTerm: string, options: SearchOptions): void {
    if (!searchTerm) {
      this.clearSearch();
      return;
    }
    
    const findOptions: monaco.editor.IFindOptions = {
      caseSensitive: options.isCaseSensitive,
      wholeWord: options.isWholeWord,
      useRegularExpressions: options.isRegex
    };
    
    // Find all matches
    this.searchModel = this.editor.getModel()?.findMatches(
      searchTerm,
      false, // isRegex
      findOptions.useRegularExpressions,
      findOptions.caseSensitive,
      findOptions.wholeWord,
      false // isMultiline
    ) || [];
    
    // Highlight matches
    this.highlightMatches();
    
    // Update match count
    this.updateMatchCount();
  }
  
  findNext(): void {
    if (this.searchModel.length === 0) return;
    
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.searchModel.length;
    this.goToMatch(this.currentMatchIndex);
  }
  
  findPrevious(): void {
    if (this.searchModel.length === 0) return;
    
    this.currentMatchIndex = this.currentMatchIndex === 0 
      ? this.searchModel.length - 1 
      : this.currentMatchIndex - 1;
    this.goToMatch(this.currentMatchIndex);
  }
  
  replace(replaceTerm: string): void {
    if (this.searchModel.length === 0) return;
    
    const match = this.searchModel[this.currentMatchIndex];
    if (!match) return;
    
    // Replace the current match
    this.editor.executeEdits('find-replace', [{
      range: match.range,
      text: replaceTerm
    }]);
    
    // Refresh search after replacement
    this.find(this.getSearchTerm(), this.getSearchOptions());
  }
  
  replaceAll(replaceTerm: string): void {
    if (this.searchModel.length === 0) return;
    
    // Sort matches in reverse order to maintain positions
    const sortedMatches = [...this.searchModel].sort((a, b) => 
      b.range.startLineNumber - a.range.startLineNumber ||
      b.range.startColumn - a.range.startColumn
    );
    
    // Replace all matches
    this.editor.executeEdits('find-replace-all', 
      sortedMatches.map(match => ({
        range: match.range,
        text: replaceTerm
      }))
    );
    
    // Clear search after replacement
    this.clearSearch();
  }
  
  private highlightMatches(): void {
    // Clear existing decorations
    this.editor.deltaDecorations([], []);
    
    // Add new decorations for matches
    const decorations = this.searchModel.map((match, index) => ({
      range: match.range,
      options: {
        className: index === this.currentMatchIndex 
          ? 'search-match-current' 
          : 'search-match'
      }
    }));
    
    this.editor.deltaDecorations([], decorations);
  }
  
  private goToMatch(index: number): void {
    if (index >= 0 && index < this.searchModel.length) {
      const match = this.searchModel[index];
      this.editor.revealRange(match.range);
      this.editor.setSelection(match.range);
      this.highlightMatches();
    }
  }
  
  private clearSearch(): void {
    this.searchModel = [];
    this.currentMatchIndex = 0;
    this.editor.deltaDecorations([], []);
  }
  
  private updateMatchCount(): void {
    // Update store with match count
    useSearchStore.getState().setMatchCount(this.searchModel.length);
    useSearchStore.getState().setCurrentMatch(
      this.searchModel.length > 0 ? this.currentMatchIndex + 1 : 0
    );
  }
}
```

### Styling and Layout
```css
/* Find/Replace panel styling */
.find-replace-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--panel-bg);
  border-top: 1px solid var(--border-color);
  padding: 8px;
  z-index: 1000;
}

.find-replace-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
}

.find-replace-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.find-section,
.replace-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.find-input,
.replace-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--input-bg);
  color: var(--text-primary);
}

.search-options {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.search-options label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--button-bg);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
}

.action-buttons button:hover {
  background-color: var(--button-hover-bg);
}

.results-info {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Search match highlighting */
.search-match {
  background-color: var(--search-match-bg);
  border: 1px solid var(--search-match-border);
}

.search-match-current {
  background-color: var(--search-match-current-bg);
  border: 1px solid var(--search-match-current-border);
}
```

## Testing Requirements

### Unit Tests
```typescript
describe('FindReplace', () => {
  it('should render find/replace interface', () => {
    render(<FindReplace isVisible={true} onClose={() => {}} />);
    
    expect(screen.getByPlaceholderText('Find')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Replace')).toBeInTheDocument();
    expect(screen.getByText('Find Next')).toBeInTheDocument();
    expect(screen.getByText('Replace All')).toBeInTheDocument();
  });
  
  it('should handle search options', () => {
    render(<FindReplace isVisible={true} onClose={() => {}} />);
    
    const caseSensitiveCheckbox = screen.getByLabelText('Case sensitive');
    fireEvent.click(caseSensitiveCheckbox);
    expect(caseSensitiveCheckbox).toBeChecked();
  });
  
  it('should update search term', () => {
    render(<FindReplace isVisible={true} onClose={() => {}} />);
    
    const findInput = screen.getByPlaceholderText('Find');
    fireEvent.change(findInput, { target: { value: 'test' } });
    
    expect(findInput).toHaveValue('test');
  });
});
```

### Integration Tests
```typescript
describe('Search Functionality Integration', () => {
  it('should find text in editor', async () => {
    const mockEditor = createMockEditor();
    render(<FindReplace isVisible={true} onClose={() => {}} editor={mockEditor} />);
    
    const findInput = screen.getByPlaceholderText('Find');
    fireEvent.change(findInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(mockEditor.findMatches).toHaveBeenCalledWith('test', expect.any(Object));
    });
  });
  
  it('should replace text in editor', async () => {
    const mockEditor = createMockEditor();
    render(<FindReplace isVisible={true} onClose={() => {}} editor={mockEditor} />);
    
    const replaceInput = screen.getByPlaceholderText('Replace');
    fireEvent.change(replaceInput, { target: { value: 'replacement' } });
    
    const replaceButton = screen.getByText('Replace');
    fireEvent.click(replaceButton);
    
    await waitFor(() => {
      expect(mockEditor.executeEdits).toHaveBeenCalled();
    });
  });
});
```

## Non-Functional Requirements

### Performance
- Search response: <100ms for files <10MB
- Real-time highlighting: <16ms updates
- Memory usage: <5MB additional

### Reliability
- Accurate search results
- Proper regex handling
- Correct replacement behavior

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Clear focus indicators

## Implementation Steps

### Phase 1: Component Structure
1. **Create find/replace components**
   - Main FindReplace component
   - Search options components
   - Action button components

2. **Implement styling**
   - CSS for find/replace panel
   - Search match highlighting
   - Responsive design

### Phase 2: Search Functionality
1. **Implement search controller**
   - Monaco editor integration
   - Search algorithm implementation
   - Match highlighting

2. **Add search options**
   - Case sensitive search
   - Regex support
   - Whole word matching

### Phase 3: Replace Functionality
1. **Implement replace operations**
   - Single replace
   - Replace all
   - Undo/redo support

2. **Add navigation**
   - Find next/previous
   - Match counter
   - Current match indicator

### Phase 4: Integration and Testing
1. **Keyboard shortcuts**
   - Cmd+F for find
   - Cmd+H for replace
   - Escape to close

2. **Testing and validation**
   - Unit tests for components
   - Integration tests with editor
   - E2E tests for workflows

## Risks and Mitigation

### Medium Risk: Performance with Large Files
**Risk**: Search may be slow on very large files.
**Mitigation**:
- Implement search limits
- Use efficient search algorithms
- Add progress indicators

### Low Risk: Regex Complexity
**Risk**: Complex regex patterns may cause issues.
**Mitigation**:
- Validate regex patterns
- Provide clear error messages
- Add regex testing

### Low Risk: UI Clutter
**Risk**: Find/replace panel may clutter the interface.
**Mitigation**:
- Collapsible design
- Keyboard shortcuts
- Clean, minimal UI

## Success Criteria

### Functional Success
- [ ] Find text functionality works correctly
- [ ] Replace text functionality works correctly
- [ ] Search options (case, regex, whole word) work
- [ ] Navigation between matches works

### Technical Success
- [ ] All tests pass
- [ ] Performance is acceptable
- [ ] Clean code structure
- [ ] Proper error handling

### Quality Success
- [ ] User-friendly interface
- [ ] Keyboard shortcut support
- [ ] Responsive design
- [ ] Accessible to all users

## Dependencies

### Internal Dependencies
- Editor component
- Search store
- Monaco editor integration
- Keyboard shortcut system

### External Dependencies
- Monaco Editor API
- React component system
- CSS styling system

## Notes

This PRP adds essential search and replace functionality that users expect from modern code editors. The implementation should be performant and user-friendly, with proper keyboard shortcuts and visual feedback.

## References

- [Monaco Editor Find API](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html#findModel)
- [VS Code Find/Replace](https://code.visualstudio.com/docs/editor/codebasics#_search-and-replace)
- [React Performance with Search](https://react.dev/learn/optimizing-performance) 
