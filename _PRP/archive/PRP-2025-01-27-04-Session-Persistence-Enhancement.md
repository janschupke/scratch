# PRP-2025-01-27-04-Session-Persistence-Enhancement

## Overview

This PRP enhances the session persistence system in the Scratch Editor to provide comprehensive workspace state restoration. The editor remembers which files were open and which folders were accessed between sessions. When users reopen the editor, their previous workspace is restored exactly as they left it, including the open folder, all open tabs, and their positions. The editor also saves this information automatically during use, so even if the app is closed unexpectedly, users won't lose their work context.

### User-Facing Description

The editor remembers which files were open and which folders were accessed between sessions. When users reopen the editor, their previous workspace is restored exactly as they left it. This includes the open folder, all open tabs, and their positions. The editor also saves this information automatically during use, so even if the app is closed unexpectedly, users won't lose their work context.

### Scope

- Enhance session persistence to save complete workspace state
- Implement automatic state saving during app usage
- Add workspace restoration on app startup
- Implement file path validation and recovery
- Add session backup and recovery mechanisms
- Provide session management options
- Implement cross-session tab ordering and pinning

## Functional Requirements

### Workspace State Persistence
- **Open Folders**: Remember all opened folder paths
- **Open Files**: Remember all open files with their content state
- **Tab Order**: Preserve tab order and active tab selection
- **Tab Pinning**: Remember which tabs are pinned
- **Editor State**: Save cursor positions, selections, and scroll positions
- **Window State**: Remember window size, position, and layout

### Automatic State Saving
- **Real-Time Saving**: Save state changes immediately
- **Periodic Saving**: Backup state at regular intervals
- **Event-Based Saving**: Save on specific user actions
- **Crash Recovery**: Ensure state is saved before app closes

### Workspace Restoration
- **Startup Restoration**: Restore workspace on app launch
- **File Validation**: Check if saved files still exist
- **Path Recovery**: Handle moved or renamed files
- **Graceful Degradation**: Handle missing files gracefully

### Session Management
- **Multiple Sessions**: Support multiple workspace sessions
- **Session Switching**: Allow switching between saved sessions
- **Session Cleanup**: Remove invalid or old sessions
- **Session Export/Import**: Backup and restore session data

## Technical Requirements

### Enhanced Session Store

```typescript
// src/stores/sessionStore.ts
export interface WorkspaceSession {
  id: string;
  name: string;
  timestamp: number;
  lastAccessed: number;
  folderPaths: string[];
  openFiles: OpenFileState[];
  activeTabId: string | null;
  windowState: WindowState;
  editorSettings: EditorSettings;
}

export interface OpenFileState {
  filePath: string;
  tabId: string;
  title: string;
  content: string;
  isModified: boolean;
  isPinned: boolean;
  cursorPosition: Position;
  scrollPosition: ScrollPosition;
  selection: Selection | null;
  language: string;
  encoding: string;
}

export interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
  sidebarVisible: boolean;
  statusBarVisible: boolean;
  zoomLevel: number;
}

export interface SessionStore {
  sessions: WorkspaceSession[];
  currentSession: WorkspaceSession | null;
  
  saveSession(session: WorkspaceSession): Promise<void>;
  loadSession(sessionId: string): Promise<WorkspaceSession | null>;
  deleteSession(sessionId: string): Promise<void>;
  listSessions(): Promise<WorkspaceSession[]>;
  createSession(name: string): Promise<string>;
  updateCurrentSession(): Promise<void>;
}
```

### Session Persistence Service

```typescript
// src/services/sessionPersistence.ts
export interface SessionPersistenceOptions {
  autoSave: boolean;
  saveInterval: number;
  maxSessions: number;
  backupEnabled: boolean;
}

export interface SessionPersistenceResult {
  success: boolean;
  error?: string;
  sessionId?: string;
}

export class SessionPersistenceService {
  private options: SessionPersistenceOptions;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  
  constructor(options: SessionPersistenceOptions) {
    this.options = options;
  }
  
  startAutoSave(): void;
  stopAutoSave(): void;
  saveSession(session: WorkspaceSession): Promise<SessionPersistenceResult>;
  loadSession(sessionId: string): Promise<WorkspaceSession | null>;
  validateSession(session: WorkspaceSession): Promise<ValidationResult>;
  backupSession(session: WorkspaceSession): Promise<void>;
  restoreSession(backupId: string): Promise<WorkspaceSession | null>;
}
```

### File Path Recovery Service

```typescript
// src/services/filePathRecovery.ts
export interface FileRecoveryResult {
  success: boolean;
  originalPath: string;
  recoveredPath?: string;
  error?: string;
}

export class FilePathRecoveryService {
  validateFilePath(filePath: string): Promise<boolean>;
  findFileByBasename(basename: string, searchPaths: string[]): Promise<string | null>;
  suggestAlternativePaths(filePath: string): Promise<string[]>;
  recoverFilePaths(session: WorkspaceSession): Promise<WorkspaceSession>;
  handleMissingFiles(session: WorkspaceSession): Promise<WorkspaceSession>;
}
```

## Implementation Steps

### Phase 1: Enhanced Session Store

1. **Create Enhanced Session Store**
   - Implement comprehensive session state management
   - Add session CRUD operations
   - Implement session validation and recovery
   - Add session metadata management

2. **Implement Session Data Structures**
   - Define complete workspace session schema
   - Add file state persistence structures
   - Implement window state management
   - Add editor settings persistence

3. **Add Session Validation**
   - Validate file paths on session load
   - Implement file existence checking
   - Add session integrity validation
   - Handle corrupted session data

### Phase 2: Automatic State Saving

1. **Implement Auto-Save System**
   - Create automatic state saving mechanism
   - Add configurable save intervals
   - Implement event-based saving triggers
   - Add save state indicators

2. **Add Real-Time State Tracking**
   - Track file content changes
   - Monitor tab state changes
   - Track window state changes
   - Implement change detection

3. **Implement Crash Recovery**
   - Add emergency state saving
   - Implement graceful shutdown handling
   - Add state recovery on startup
   - Handle unexpected app termination

### Phase 3: Workspace Restoration

1. **Create Workspace Restoration Service**
   - Implement session loading logic
   - Add file path validation
   - Implement graceful error handling
   - Add restoration progress indicators

2. **Add File Path Recovery**
   - Implement file path validation
   - Add file search and recovery
   - Implement path suggestion system
   - Handle moved/renamed files

3. **Implement State Synchronization**
   - Sync restored state with current stores
   - Update UI components with restored state
   - Handle state conflicts
   - Implement incremental restoration

### Phase 4: Session Management Features

1. **Add Multiple Session Support**
   - Implement session switching
   - Add session naming and organization
   - Implement session cleanup
   - Add session metadata management

2. **Implement Session Backup/Recovery**
   - Add session export functionality
   - Implement session import
   - Add backup scheduling
   - Implement backup verification

3. **Add Session Configuration**
   - Implement session settings
   - Add auto-save configuration
   - Implement session limits
   - Add session cleanup policies

### Phase 5: Advanced Features and Polish

1. **Add Session Analytics**
   - Track session usage patterns
   - Implement session performance metrics
   - Add session optimization suggestions
   - Implement session health monitoring

2. **Implement Cross-Session Features**
   - Add session comparison
   - Implement session merging
   - Add session templates
   - Implement session sharing

3. **Add Performance Optimizations**
   - Implement efficient state serialization
   - Add state compression
   - Implement lazy loading for large sessions
   - Add state caching mechanisms

## Testing Requirements

### Unit Tests

```typescript
// src/stores/__tests__/sessionStore.test.ts
describe('SessionStore', () => {
  test('saves session state correctly');
  test('loads session state accurately');
  test('validates session data properly');
  test('handles corrupted session data');
  test('manages multiple sessions correctly');
});

describe('SessionPersistenceService', () => {
  test('saves sessions automatically');
  test('loads sessions successfully');
  test('validates file paths correctly');
  test('handles missing files gracefully');
  test('creates backups properly');
});

describe('FilePathRecoveryService', () => {
  test('validates file paths correctly');
  test('finds alternative file paths');
  test('recovers moved files');
  test('handles missing files gracefully');
});
```

### Integration Tests

```typescript
// src/test/integration/session-persistence.test.ts
describe('Session Persistence Integration', () => {
  test('saves workspace state during usage');
  test('restores workspace state on startup');
  test('handles file path changes between sessions');
  test('manages multiple workspace sessions');
  test('recovers from unexpected app closure');
});
```

### E2E Tests

```typescript
// src/test/e2e/session-persistence.e2e.test.ts
describe('Session Persistence E2E', () => {
  test('user workspace is restored after app restart');
  test('user can switch between multiple sessions');
  test('app handles missing files gracefully');
  test('session data is saved automatically');
  test('user can export and import sessions');
});
```

## Non-Functional Requirements

### Performance
- Session saving should complete within 100ms
- Session loading should complete within 500ms
- Auto-save should not impact editor performance
- Session data should be efficiently serialized

### Reliability
- Session data should be saved reliably
- Recovery should work even with corrupted data
- File path recovery should be robust
- Graceful handling of all error conditions

### Storage
- Session data should be compressed efficiently
- Old sessions should be cleaned up automatically
- Storage usage should be reasonable
- Backup data should be managed properly

### Security
- Session data should be stored securely
- File paths should be validated
- Sensitive data should not be persisted
- Session data should be properly sanitized

## Code Examples

### Session Store Implementation

```typescript
// src/stores/sessionStore.ts
export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  currentSession: null,

  saveSession: async (session: WorkspaceSession) => {
    try {
      const persistenceService = new SessionPersistenceService({
        autoSave: true,
        saveInterval: 30000,
        maxSessions: 10,
        backupEnabled: true
      });

      const result = await persistenceService.saveSession(session);
      
      if (result.success) {
        set((state) => ({
          sessions: state.sessions.map(s => 
            s.id === session.id ? session : s
          ),
          currentSession: session
        }));
      }

      return result;
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  },

  loadSession: async (sessionId: string) => {
    try {
      const persistenceService = new SessionPersistenceService({
        autoSave: true,
        saveInterval: 30000,
        maxSessions: 10,
        backupEnabled: true
      });

      const session = await persistenceService.loadSession(sessionId);
      
      if (session) {
        // Validate and recover file paths
        const recoveryService = new FilePathRecoveryService();
        const recoveredSession = await recoveryService.recoverFilePaths(session);
        
        set((state) => ({
          currentSession: recoveredSession
        }));

        return recoveredSession;
      }

      return null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  },

  updateCurrentSession: async () => {
    const state = get();
    if (!state.currentSession) return;

    // Collect current workspace state
    const tabStore = useTabStore.getState();
    const fileStore = useFileStore.getState();
    const appStore = useAppStore.getState();

    const updatedSession: WorkspaceSession = {
      ...state.currentSession,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      folderPaths: fileStore.openFolders,
      openFiles: tabStore.tabs.map(tab => ({
        filePath: tab.filePath,
        tabId: tab.id,
        title: tab.title,
        content: tab.content || '',
        isModified: tab.isModified,
        isPinned: tab.isPinned,
        cursorPosition: tab.cursorPosition || { line: 1, column: 1 },
        scrollPosition: tab.scrollPosition || { scrollTop: 0, scrollLeft: 0 },
        selection: tab.selection || null,
        language: tab.language || 'plaintext',
        encoding: tab.encoding || 'utf-8'
      })),
      activeTabId: tabStore.activeTabId,
      windowState: {
        width: appStore.windowWidth,
        height: appStore.windowHeight,
        x: appStore.windowX,
        y: appStore.windowY,
        isMaximized: appStore.isMaximized,
        sidebarVisible: appStore.sidebarVisible,
        statusBarVisible: appStore.statusBarVisible,
        zoomLevel: appStore.zoomLevel
      },
      editorSettings: {
        theme: appStore.theme,
        fontSize: appStore.fontSize,
        fontFamily: appStore.fontFamily,
        tabSize: appStore.tabSize,
        insertSpaces: appStore.insertSpaces,
        wordWrap: appStore.wordWrap
      }
    };

    await state.saveSession(updatedSession);
  }
}));
```

### Session Persistence Service

```typescript
// src/services/sessionPersistence.ts
export class SessionPersistenceService {
  private options: SessionPersistenceOptions;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(options: SessionPersistenceOptions) {
    this.options = options;
  }

  async saveSession(session: WorkspaceSession): Promise<SessionPersistenceResult> {
    try {
      // Validate session data
      const validationResult = await this.validateSession(session);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Compress session data
      const compressedData = await this.compressSessionData(session);
      
      // Save to storage
      await invoke('tauri', {
        cmd: 'writeTextFile',
        args: {
          path: `sessions/${session.id}.json`,
          content: JSON.stringify(compressedData)
        }
      });

      // Create backup if enabled
      if (this.options.backupEnabled) {
        await this.backupSession(session);
      }

      return {
        success: true,
        sessionId: session.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadSession(sessionId: string): Promise<WorkspaceSession | null> {
    try {
      // Try to load from primary storage
      let sessionData: string;
      
      try {
        sessionData = await invoke('tauri', {
          cmd: 'readTextFile',
          args: { path: `sessions/${sessionId}.json` }
        });
      } catch (error) {
        // Try to load from backup
        const backupSession = await this.restoreSession(sessionId);
        if (backupSession) {
          return backupSession;
        }
        throw error;
      }

      const parsedData = JSON.parse(sessionData);
      const session = await this.decompressSessionData(parsedData);

      // Validate loaded session
      const validationResult = await this.validateSession(session);
      if (!validationResult.isValid) {
        console.warn('Session validation failed:', validationResult.error);
        // Try to recover session data
        return await this.recoverSession(session);
      }

      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  startAutoSave(): void {
    if (this.options.autoSave && !this.autoSaveTimer) {
      this.autoSaveTimer = setInterval(async () => {
        const sessionStore = useSessionStore.getState();
        if (sessionStore.currentSession) {
          await sessionStore.updateCurrentSession();
        }
      }, this.options.saveInterval);
    }
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private async validateSession(session: WorkspaceSession): Promise<ValidationResult> {
    // Check required fields
    if (!session.id || !session.name || !session.timestamp) {
      return {
        isValid: false,
        error: 'Missing required session fields'
      };
    }

    // Validate file paths
    for (const file of session.openFiles) {
      if (!file.filePath || !file.tabId) {
        return {
          isValid: false,
          error: 'Invalid file state in session'
        };
      }
    }

    return { isValid: true };
  }

  private async compressSessionData(session: WorkspaceSession): Promise<any> {
    // Implement data compression for large sessions
    return {
      id: session.id,
      name: session.name,
      timestamp: session.timestamp,
      lastAccessed: session.lastAccessed,
      data: session // For now, return full session
    };
  }

  private async decompressSessionData(data: any): Promise<WorkspaceSession> {
    // Implement data decompression
    return data.data || data;
  }
}
```

### File Path Recovery Service

```typescript
// src/services/filePathRecovery.ts
export class FilePathRecoveryService {
  async validateFilePath(filePath: string): Promise<boolean> {
    try {
      const stats = await invoke('tauri', {
        cmd: 'getFileInfo',
        args: { path: filePath }
      });
      return stats.exists && !stats.isDirectory;
    } catch (error) {
      return false;
    }
  }

  async findFileByBasename(basename: string, searchPaths: string[]): Promise<string | null> {
    for (const searchPath of searchPaths) {
      try {
        const files = await invoke('tauri', {
          cmd: 'readDir',
          args: { path: searchPath, recursive: true }
        });

        for (const file of files) {
          if (path.basename(file.path) === basename) {
            return file.path;
          }
        }
      } catch (error) {
        // Continue searching in other paths
        continue;
      }
    }

    return null;
  }

  async recoverFilePaths(session: WorkspaceSession): Promise<WorkspaceSession> {
    const recoveredSession = { ...session };
    const searchPaths = session.folderPaths;

    for (let i = 0; i < recoveredSession.openFiles.length; i++) {
      const file = recoveredSession.openFiles[i];
      
      // Check if file still exists
      const fileExists = await this.validateFilePath(file.filePath);
      
      if (!fileExists) {
        // Try to find the file by basename
        const basename = path.basename(file.filePath);
        const recoveredPath = await this.findFileByBasename(basename, searchPaths);
        
        if (recoveredPath) {
          recoveredSession.openFiles[i] = {
            ...file,
            filePath: recoveredPath
          };
        } else {
          // Mark file as missing
          recoveredSession.openFiles[i] = {
            ...file,
            filePath: `MISSING:${file.filePath}`,
            content: `// File not found: ${file.filePath}\n// This file may have been moved or deleted.`
          };
        }
      }
    }

    return recoveredSession;
  }

  async handleMissingFiles(session: WorkspaceSession): Promise<WorkspaceSession> {
    const handledSession = { ...session };
    
    // Filter out missing files or create placeholder tabs
    handledSession.openFiles = handledSession.openFiles.filter(file => {
      if (file.filePath.startsWith('MISSING:')) {
        // Ask user if they want to keep missing files
        // For now, we'll keep them with a warning
        return true;
      }
      return true;
    });

    return handledSession;
  }
}
```

## Risks and Mitigation

### Risk 1: Data Corruption
- **Risk**: Session data could become corrupted during save/load
- **Mitigation**: Implement data validation, backup systems, and recovery mechanisms

### Risk 2: Performance Impact
- **Risk**: Auto-saving could impact editor performance
- **Mitigation**: Implement efficient serialization, debounced saving, and background processing

### Risk 3: File Path Changes
- **Risk**: Files may be moved or deleted between sessions
- **Mitigation**: Implement robust file path recovery and graceful handling of missing files

### Risk 4: Storage Limitations
- **Risk**: Session data could consume excessive storage
- **Mitigation**: Implement data compression, cleanup policies, and storage limits

## Accessibility Considerations

### Session Management
- Provide clear session management interface
- Add keyboard navigation for session switching
- Implement screen reader support for session operations
- Add clear error messages for session issues

### Recovery Process
- Provide clear feedback during session restoration
- Add progress indicators for long operations
- Implement user confirmation for file recovery
- Add accessible error handling

## Success Criteria

- [ ] Workspace state is saved automatically during usage
- [ ] Workspace is restored correctly on app startup
- [ ] File path changes are handled gracefully
- [ ] Multiple sessions can be managed
- [ ] Session data is saved reliably
- [ ] Recovery works even with corrupted data
- [ ] Performance impact is minimal
- [ ] All tests pass with >80% coverage
- [ ] No TypeScript errors or linting warnings
- [ ] Build completes successfully
- [ ] Session management is accessible

## Dependencies

- Existing stores (tabStore, fileStore, appStore)
- File system APIs
- Storage persistence system
- File path utilities
- Compression libraries (optional)
- Settings management system

## Timeline

- **Phase 1**: 3-4 hours (Enhanced session store)
- **Phase 2**: 3-4 hours (Automatic state saving)
- **Phase 3**: 3-4 hours (Workspace restoration)
- **Phase 4**: 2-3 hours (Session management features)
- **Phase 5**: 2-3 hours (Advanced features and polish)

**Total Estimated Time**: 13-18 hours 
