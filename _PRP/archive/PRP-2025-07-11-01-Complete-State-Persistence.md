# PRP-2025-07-11-01: Complete State Persistence

## Overview

This PRP implements complete state persistence for the Scratch Editor, ensuring that users can close and reopen the application to find their workspace exactly as they left it. This includes window position, size, opened folders, tabs, cursor positions, and scroll states.

## User-Facing Description

**User Experience**: Users get a fully persistent workspace that remembers everything
- Users can close and reopen the app to find their window exactly where they left it
- Users see the same window size and position they had before
- Users find their opened folder still selected in the sidebar
- Users see all their previously opened tabs still available
- Users can continue editing exactly where they left off in each file
- Users don't lose their cursor position or scroll position in any file

## Functional Requirements

### 1. Window State Persistence
- **Window Position**: Save and restore window x, y coordinates
- **Window Size**: Save and restore window width and height
- **Window State**: Save and restore maximized/minimized state
- **Screen Resolution**: Handle multi-monitor setups and resolution changes

### 2. Application State Persistence
- **Opened Folder**: Remember the currently opened folder path
- **File Tree State**: Remember expanded/collapsed folder states
- **Active Tab**: Remember which tab was active when app was closed
- **Tab Order**: Preserve the exact order of tabs

### 3. Editor State Persistence
- **Cursor Position**: Remember cursor line and column in each file
- **Scroll Position**: Remember vertical and horizontal scroll positions
- **Selection State**: Remember text selections in each file
- **Editor Settings**: Remember editor-specific settings per file

### 4. Session Recovery
- **Graceful Recovery**: Handle corrupted state files gracefully
- **Migration Support**: Support state format migrations
- **Backup Strategy**: Maintain backup of previous state
- **Error Handling**: Provide clear error messages for state issues

## Non-Functional Requirements

### Performance
- **State Save Time**: < 50ms to save complete state
- **State Load Time**: < 100ms to restore complete state
- **Memory Usage**: < 5MB for state storage
- **File Size**: < 1MB for state file

### Reliability
- **Data Integrity**: 100% state preservation between sessions
- **Error Recovery**: Graceful handling of corrupted state files
- **Backup Strategy**: Automatic backup of previous state
- **Migration Support**: Handle state format changes

### Security
- **File Permissions**: Secure state file permissions
- **Data Privacy**: No sensitive data in state files
- **Path Validation**: Validate file paths before restoration

## Technical Implementation Details

### 1. State Management Architecture

```typescript
// src/types/state.ts
export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
  screenId?: string;
}

export interface EditorState {
  filePath: string;
  cursorPosition: { line: number; column: number };
  scrollPosition: { top: number; left: number };
  selections: Array<{ start: number; end: number }>;
  viewState?: string; // Monaco editor view state
}

export interface ApplicationState {
  windowState: WindowState;
  openedFolder?: string;
  fileTreeState: Record<string, boolean>; // expanded/collapsed
  tabs: TabState[];
  activeTabId?: string;
  lastSaved: number;
}

export interface TabState {
  id: string;
  filePath: string;
  title: string;
  isPinned: boolean;
  isModified: boolean;
  editorState?: EditorState;
}
```

### 2. State Storage Implementation

```typescript
// src/stores/appStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApplicationState, WindowState, TabState } from '../types/state';

interface AppStore extends ApplicationState {
  // Actions
  setWindowState: (state: WindowState) => void;
  setOpenedFolder: (path: string) => void;
  setFileTreeState: (state: Record<string, boolean>) => void;
  setTabs: (tabs: TabState[]) => void;
  setActiveTab: (id: string) => void;
  
  // State persistence
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
  clearState: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      windowState: {
        x: 100,
        y: 100,
        width: 1200,
        height: 800,
        maximized: false,
      },
      fileTreeState: {},
      tabs: [],
      
      // Actions
      setWindowState: (state) => set({ windowState: state }),
      setOpenedFolder: (path) => set({ openedFolder: path }),
      setFileTreeState: (state) => set({ fileTreeState: state }),
      setTabs: (tabs) => set({ tabs }),
      setActiveTab: (id) => set({ activeTabId: id }),
      
      // State persistence
      saveState: async () => {
        const state = get();
        // Implementation will use Tauri store API
      },
      loadState: async () => {
        // Implementation will load from Tauri store
      },
      clearState: () => {
        set({
          windowState: { x: 100, y: 100, width: 1200, height: 800, maximized: false },
          fileTreeState: {},
          tabs: [],
          activeTabId: undefined,
        });
      },
    }),
    {
      name: 'scratch-editor-state',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle state migrations
        return persistedState;
      },
    }
  )
);
```

### 3. Window State Management

```typescript
// src/hooks/useWindowState.ts
import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { appWindow } from '@tauri-apps/api/window';

export const useWindowState = () => {
  const { windowState, setWindowState } = useAppStore();

  useEffect(() => {
    // Save window state on window events
    const saveWindowState = async () => {
      const position = await appWindow.innerPosition();
      const size = await appWindow.innerSize();
      const isMaximized = await appWindow.isMaximized();
      
      setWindowState({
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        maximized: isMaximized,
      });
    };

    // Listen for window events
    const unlistenResize = await appWindow.onResized(saveWindowState);
    const unlistenMove = await appWindow.onMoved(saveWindowState);

    return () => {
      unlistenResize();
      unlistenMove();
    };
  }, [setWindowState]);

  // Restore window state on app start
  useEffect(() => {
    const restoreWindowState = async () => {
      if (windowState.maximized) {
        await appWindow.maximize();
      } else {
        await appWindow.setPosition(windowState.x, windowState.y);
        await appWindow.setSize(windowState.width, windowState.height);
      }
    };

    restoreWindowState();
  }, [windowState]);

  return { windowState };
};
```

### 4. Editor State Integration

```typescript
// src/components/Editor/MonacoEditor.tsx
import { useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useFileStore } from '../../stores/fileStore';

interface MonacoEditorProps {
  filePath: string;
  content: string;
}

export const MonacoEditor = ({ filePath, content }: MonacoEditorProps) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const { tabs, setTabs } = useAppStore();
  const { activeTab } = useFileStore();

  useEffect(() => {
    if (editorRef.current && activeTab?.filePath === filePath) {
      // Restore editor state
      const tab = tabs.find(t => t.filePath === filePath);
      if (tab?.editorState) {
        const { cursorPosition, scrollPosition, viewState } = tab.editorState;
        
        // Restore cursor position
        editorRef.current.setPosition({
          lineNumber: cursorPosition.line,
          column: cursorPosition.column,
        });
        
        // Restore scroll position
        editorRef.current.setScrollPosition({
          scrollTop: scrollPosition.top,
          scrollLeft: scrollPosition.left,
        });
        
        // Restore view state if available
        if (viewState) {
          editorRef.current.restoreViewState(JSON.parse(viewState));
        }
      }
    }
  }, [filePath, activeTab, tabs]);

  // Save editor state on changes
  const saveEditorState = () => {
    if (editorRef.current && activeTab) {
      const position = editorRef.current.getPosition();
      const scrollPosition = editorRef.current.getScrollPosition();
      const viewState = editorRef.current.saveViewState();
      
      const editorState = {
        filePath: activeTab.filePath,
        cursorPosition: {
          line: position.lineNumber,
          column: position.column,
        },
        scrollPosition: {
          top: scrollPosition.scrollTop,
          left: scrollPosition.scrollLeft,
        },
        viewState: JSON.stringify(viewState),
      };
      
      // Update tab with editor state
      const updatedTabs = tabs.map(tab =>
        tab.filePath === activeTab.filePath
          ? { ...tab, editorState }
          : tab
      );
      setTabs(updatedTabs);
    }
  };

  return (
    <div className="monaco-editor-container">
      {/* Monaco Editor implementation */}
    </div>
  );
};
```

## Testing Requirements

### Unit Tests
- **State Management**: Test state save/load operations
- **Window State**: Test window position/size persistence
- **Editor State**: Test cursor/scroll position restoration
- **Tab State**: Test tab order and active tab persistence

### Integration Tests
- **Full Session**: Test complete app close/reopen cycle
- **State Migration**: Test state format version migrations
- **Error Recovery**: Test corrupted state file handling
- **Multi-Monitor**: Test window state across different monitors

### E2E Tests
- **User Workflow**: Test complete user session with multiple files
- **State Persistence**: Test state preservation across app restarts
- **Error Scenarios**: Test graceful handling of state errors

### Test Coverage Targets
- **State Management**: >90% coverage
- **Window State**: >85% coverage
- **Editor State**: >85% coverage
- **Error Handling**: >80% coverage

## Accessibility Requirements

### Keyboard Navigation
- **State Recovery**: Keyboard shortcuts work after state restoration
- **Focus Management**: Proper focus restoration on app restart
- **Screen Reader**: State changes announced to screen readers

### Visual Feedback
- **Loading States**: Clear indication when restoring state
- **Error States**: Clear error messages for state issues
- **Progress Indicators**: Show progress during state restoration

## Performance Considerations

### Optimization Strategies
- **Debounced Saves**: Debounce state saves to avoid excessive writes
- **Incremental Updates**: Only save changed state portions
- **Background Saves**: Save state in background without blocking UI
- **Compression**: Compress state data to reduce file size

### Memory Management
- **State Cleanup**: Clean up old state data periodically
- **Memory Limits**: Limit state size to prevent memory issues
- **Garbage Collection**: Proper cleanup of state references

## Potential Risks and Mitigation

### Data Loss Risk
- **Risk**: Corrupted state files causing data loss
- **Mitigation**: Automatic backup of previous state, graceful error handling

### Performance Risk
- **Risk**: Large state files causing slow app startup
- **Mitigation**: State compression, incremental loading, size limits

### Migration Risk
- **Risk**: Breaking changes in state format
- **Mitigation**: Versioned state format, migration functions, backward compatibility

### Security Risk
- **Risk**: Sensitive data in state files
- **Mitigation**: Path validation, no sensitive data storage, secure file permissions

## Implementation Steps

### Phase 1: State Management Foundation
1. Create state types and interfaces
2. Implement basic state store with Zustand
3. Add persistence middleware
4. Create state migration system

### Phase 2: Window State Implementation
1. Implement window state hooks
2. Add window event listeners
3. Create window state restoration
4. Test multi-monitor scenarios

### Phase 3: Editor State Integration
1. Integrate with Monaco Editor
2. Implement cursor/scroll position saving
3. Add view state restoration
4. Test editor state persistence

### Phase 4: Application State Integration
1. Integrate with file store
2. Implement tab state persistence
3. Add file tree state saving
4. Test complete session recovery

### Phase 5: Error Handling and Testing
1. Implement error recovery mechanisms
2. Add comprehensive test coverage
3. Test edge cases and error scenarios
4. Performance optimization

## Success Criteria

### Functional Success
- [ ] Window position and size are preserved
- [ ] All tabs are restored with correct order
- [ ] Cursor positions are restored in all files
- [ ] Scroll positions are maintained
- [ ] File tree state is preserved

### Performance Success
- [ ] State save time < 50ms
- [ ] State load time < 100ms
- [ ] State file size < 1MB
- [ ] No UI blocking during state operations

### Reliability Success
- [ ] 100% state preservation between sessions
- [ ] Graceful handling of corrupted state files
- [ ] Successful state format migrations
- [ ] No data loss in error scenarios

This PRP provides a comprehensive implementation plan for complete state persistence, ensuring users can rely on the app to maintain their workspace exactly as they left it. 
