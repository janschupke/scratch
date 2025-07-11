# PRP-06: State Persistence

## Goals
- Save open folders, files, tabs, and window state on close.
- Restore state on launch.
- Implement user preferences persistence.

## Detailed Implementation Steps

### 1. State Management Architecture

**Best Practices:**
- Use Tauri's storage API for persistent data
- Implement proper error handling for storage operations
- Use debouncing for frequent state updates
- Implement state validation and migration
- Separate user preferences from app state

**Storage Strategy:**
- App State: Current session data (tabs, active files, etc.)
- User Preferences: Settings, themes, editor config
- Window State: Position, size, layout preferences

### 2. Storage Utilities

**src/utils/storage.ts:**
```typescript
import { Store } from '@tauri-apps/api/store';
import { debounce } from 'lodash-es';

export class StorageManager {
  private static instance: StorageManager;
  private appStore: Store;
  private preferencesStore: Store;
  private windowStore: Store;

  private constructor() {
    this.appStore = new Store('.app-state.dat');
    this.preferencesStore = new Store('.preferences.dat');
    this.windowStore = new Store('.window-state.dat');
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // App State Methods
  async saveAppState(state: any): Promise<void> {
    try {
      await this.appStore.set('app-state', state);
      await this.appStore.save();
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  }

  async loadAppState(): Promise<any | null> {
    try {
      return await this.appStore.get('app-state');
    } catch (error) {
      console.error('Failed to load app state:', error);
      return null;
    }
  }

  // Preferences Methods
  async savePreferences(preferences: any): Promise<void> {
    try {
      await this.preferencesStore.set('preferences', preferences);
      await this.preferencesStore.save();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  async loadPreferences(): Promise<any | null> {
    try {
      return await this.preferencesStore.get('preferences');
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return null;
    }
  }

  // Window State Methods
  async saveWindowState(state: any): Promise<void> {
    try {
      await this.windowStore.set('window-state', state);
      await this.windowStore.save();
    } catch (error) {
      console.error('Failed to save window state:', error);
    }
  }

  async loadWindowState(): Promise<any | null> {
    try {
      return await this.windowStore.get('window-state');
    } catch (error) {
      console.error('Failed to load window state:', error);
      return null;
    }
  }

  // Debounced save methods for performance
  debouncedSaveAppState = debounce(this.saveAppState.bind(this), 1000);
  debouncedSavePreferences = debounce(this.savePreferences.bind(this), 500);
  debouncedSaveWindowState = debounce(this.saveWindowState.bind(this), 500);

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await this.appStore.clear();
      await this.preferencesStore.clear();
      await this.windowStore.clear();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}
```

### 3. State Types and Interfaces

**src/types/state.ts:**
```typescript
export interface AppState {
  currentFolder: string | null;
  openTabs: Tab[];
  activeTabId: string | null;
  tabOrder: string[];
  fileTree: FileNode[];
  expandedNodes: string[];
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  lastOpenedFiles: string[]; // Recent files list
  sessionId: string;
  lastSaved: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  editor: {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    insertSpaces: boolean;
    wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
    minimap: { enabled: boolean };
    lineNumbers: 'on' | 'off' | 'relative';
    autoSave: boolean;
    autoSaveDelay: number;
    formatOnSave: boolean;
  };
  window: {
    rememberPosition: boolean;
    rememberSize: boolean;
    startMaximized: boolean;
  };
  fileExplorer: {
    showHiddenFiles: boolean;
    sortBy: 'name' | 'type' | 'modified' | 'size';
    sortDirection: 'asc' | 'desc';
  };
  shortcuts: Record<string, string>;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullscreen: boolean;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
}

export interface StateMigration {
  version: number;
  migrate: (oldState: any) => any;
}
```

### 4. Enhanced App Store with Persistence

**src/stores/appStore.ts:**
```typescript
import { create } from 'zustand';
import { StorageManager } from '../utils/storage';
import { AppState, UserPreferences, WindowState } from '../types/state';

interface AppStore extends AppState {
  preferences: UserPreferences;
  windowState: WindowState;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeApp: () => Promise<void>;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
  resetState: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateWindowState: (state: Partial<WindowState>) => Promise<void>;
  addRecentFile: (filePath: string) => void;
  clearRecentFiles: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  editor: {
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    minimap: { enabled: true },
    lineNumbers: 'on',
    autoSave: true,
    autoSaveDelay: 1000,
    formatOnSave: false,
  },
  window: {
    rememberPosition: true,
    rememberSize: true,
    startMaximized: false,
  },
  fileExplorer: {
    showHiddenFiles: false,
    sortBy: 'name',
    sortDirection: 'asc',
  },
  shortcuts: {
    'save': 'Ctrl+S',
    'new-file': 'Ctrl+N',
    'open-file': 'Ctrl+O',
    'format': 'Shift+Alt+F',
  },
};

const DEFAULT_WINDOW_STATE: WindowState = {
  x: 100,
  y: 100,
  width: 1200,
  height: 800,
  isMaximized: false,
  isFullscreen: false,
  sidebarWidth: 250,
  isSidebarCollapsed: false,
};

export const useAppStore = create<AppStore>((set, get) => {
  const storage = StorageManager.getInstance();

  return {
    // Initial state
    currentFolder: null,
    openTabs: [],
    activeTabId: null,
    tabOrder: [],
    fileTree: [],
    expandedNodes: [],
    sidebarWidth: 250,
    isSidebarCollapsed: false,
    lastOpenedFiles: [],
    sessionId: `session-${Date.now()}`,
    lastSaved: Date.now(),
    preferences: DEFAULT_PREFERENCES,
    windowState: DEFAULT_WINDOW_STATE,
    isLoading: false,
    error: null,

    // Actions
    initializeApp: async () => {
      set({ isLoading: true, error: null });

      try {
        // Load preferences first
        const savedPreferences = await storage.loadPreferences();
        if (savedPreferences) {
          set({ preferences: { ...DEFAULT_PREFERENCES, ...savedPreferences } });
        }

        // Load window state
        const savedWindowState = await storage.loadWindowState();
        if (savedWindowState) {
          set({ windowState: { ...DEFAULT_WINDOW_STATE, ...savedWindowState } });
        }

        // Load app state
        const savedAppState = await storage.loadAppState();
        if (savedAppState) {
          // Validate and migrate state if needed
          const validatedState = validateAndMigrateState(savedAppState);
          set(validatedState);
        }
      } catch (error) {
        set({ error: `Failed to initialize app: ${error}` });
      } finally {
        set({ isLoading: false });
      }
    },

    saveState: async () => {
      const state = get();
      const { preferences, windowState, ...appState } = state;

      try {
        await Promise.all([
          storage.debouncedSaveAppState(appState),
          storage.debouncedSavePreferences(preferences),
          storage.debouncedSaveWindowState(windowState),
        ]);

        set({ lastSaved: Date.now() });
      } catch (error) {
        set({ error: `Failed to save state: ${error}` });
      }
    },

    loadState: async () => {
      set({ isLoading: true, error: null });

      try {
        const savedState = await storage.loadAppState();
        if (savedState) {
          const validatedState = validateAndMigrateState(savedState);
          set(validatedState);
        }
      } catch (error) {
        set({ error: `Failed to load state: ${error}` });
      } finally {
        set({ isLoading: false });
      }
    },

    resetState: async () => {
      try {
        await storage.clearAllData();
        set({
          currentFolder: null,
          openTabs: [],
          activeTabId: null,
          tabOrder: [],
          fileTree: [],
          expandedNodes: [],
          sidebarWidth: 250,
          isSidebarCollapsed: false,
          lastOpenedFiles: [],
          sessionId: `session-${Date.now()}`,
          lastSaved: Date.now(),
        });
      } catch (error) {
        set({ error: `Failed to reset state: ${error}` });
      }
    },

    updatePreferences: async (newPreferences) => {
      const { preferences } = get();
      const updatedPreferences = { ...preferences, ...newPreferences };

      set({ preferences: updatedPreferences });
      await storage.debouncedSavePreferences(updatedPreferences);
    },

    updateWindowState: async (newWindowState) => {
      const { windowState } = get();
      const updatedWindowState = { ...windowState, ...newWindowState };

      set({ windowState: updatedWindowState });
      await storage.debouncedSaveWindowState(updatedWindowState);
    },

    addRecentFile: (filePath) => {
      const { lastOpenedFiles } = get();
      const updatedFiles = [filePath, ...lastOpenedFiles.filter(f => f !== filePath)].slice(0, 10);
      set({ lastOpenedFiles: updatedFiles });
    },

    clearRecentFiles: () => {
      set({ lastOpenedFiles: [] });
    },
  };
});

// State validation and migration
function validateAndMigrateState(state: any): Partial<AppState> {
  const currentVersion = 1;
  const stateVersion = state.version || 0;

  if (stateVersion < currentVersion) {
    // Migrate state if needed
    return migrateState(state, stateVersion, currentVersion);
  }

  return state;
}

function migrateState(state: any, fromVersion: number, toVersion: number): Partial<AppState> {
  // Add migration logic here when needed
  return {
    ...state,
    version: toVersion,
  };
}
```

### 5. Window State Management

**src/hooks/useWindowState.ts:**
```typescript
import { useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { useAppStore } from '../stores/appStore';

export function useWindowState() {
  const { windowState, updateWindowState } = useAppStore();

  useEffect(() => {
    const saveWindowState = async () => {
      try {
        const position = await appWindow.innerPosition();
        const size = await appWindow.innerSize();
        const isMaximized = await appWindow.isMaximized();
        const isFullscreen = await appWindow.isFullscreen();

        await updateWindowState({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          isMaximized,
          isFullscreen,
        });
      } catch (error) {
        console.error('Failed to save window state:', error);
      }
    };

    // Save window state on window events
    const unlistenResize = appWindow.onResized(saveWindowState);
    const unlistenMove = appWindow.onMoved(saveWindowState);
    const unlistenMaximize = appWindow.onMaximized(saveWindowState);
    const unlistenUnmaximize = appWindow.onUnmaximized(saveWindowState);

    return () => {
      unlistenResize();
      unlistenMove();
      unlistenMaximize();
      unlistenUnmaximize();
    };
  }, [updateWindowState]);

  // Restore window state on mount
  useEffect(() => {
    const restoreWindowState = async () => {
      if (windowState.rememberPosition && windowState.rememberSize) {
        try {
          await appWindow.setPosition(windowState.x, windowState.y);
          await appWindow.setSize(windowState.width, windowState.height);
        } catch (error) {
          console.error('Failed to restore window state:', error);
        }
      }

      if (windowState.isMaximized) {
        try {
          await appWindow.maximize();
        } catch (error) {
          console.error('Failed to maximize window:', error);
        }
      }
    };

    restoreWindowState();
  }, []);

  return windowState;
}
```

### 6. Auto-Save Hook

**src/hooks/useAutoSave.ts:**
```typescript
import { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { useTabStore } from '../stores/tabStore';

export function useAutoSave() {
  const { preferences, saveState } = useAppStore();
  const { tabs } = useTabStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!preferences.editor.autoSave) return;

    const debouncedSave = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveState();
      }, preferences.editor.autoSaveDelay);
    };

    // Save state when tabs change
    debouncedSave();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tabs, preferences.editor.autoSave, preferences.editor.autoSaveDelay, saveState]);

  return null;
}
```

### 7. Enhanced App Component

**src/App.tsx:**
```typescript
import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppStore } from './stores/appStore';
import { useWindowState } from './hooks/useWindowState';
import { useAutoSave } from './hooks/useAutoSave';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  const { 
    initializeApp, 
    isLoading, 
    error, 
    saveState,
    openTabs, 
    activeTabId, 
    sidebarWidth,
    isSidebarCollapsed,
    preferences
  } = useAppStore();

  const windowState = useWindowState();
  useAutoSave();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    // Save state on app close
    const handleBeforeUnload = () => {
      saveState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveState]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className={`h-screen ${preferences.theme === 'dark' ? 'dark' : ''}`}>
        <Layout
          sidebarWidth={sidebarWidth}
          isSidebarCollapsed={isSidebarCollapsed}
          tabs={openTabs}
          activeTabId={activeTabId}
          onSidebarToggle={() => {}} // Will be implemented
          onSidebarResize={() => {}} // Will be implemented
          onTabSelect={() => {}} // Will be implemented
          onTabClose={() => {}} // Will be implemented
          onTabReorder={() => {}} // Will be implemented
        />
        
        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => {}} className="ml-4 text-white hover:text-gray-200">
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

### 8. Loading Screen Component

**src/components/LoadingScreen.tsx:**
```typescript
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen bg-vscode-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-vscode-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-vscode-text text-lg">Loading...</p>
      </div>
    </div>
  );
};
```

## Testing Steps
1. Test app initialization and state loading
2. Verify state persistence across app restarts
3. Test auto-save functionality
4. Verify window state restoration
5. Test preferences persistence
6. Verify error handling for storage operations
7. Test state migration (if needed)

## Potential Risks & Mitigation

### 1. Storage Corruption
**Risk:** Corrupted state files
**Mitigation:**
- Implement state validation
- Add backup/restore functionality
- Handle storage errors gracefully

### 2. Performance Issues
**Risk:** Slow state loading/saving
**Mitigation:**
- Use debounced saves
- Implement incremental saves
- Optimize state structure

### 3. State Synchronization
**Risk:** State getting out of sync
**Mitigation:**
- Implement state validation
- Add state versioning
- Handle migration properly

### 4. Storage Quotas
**Risk:** Exceeding storage limits
**Mitigation:**
- Implement state size limits
- Add cleanup mechanisms
- Monitor storage usage

## Success Criteria
- [ ] App state persists across restarts
- [ ] Window position and size are remembered
- [ ] User preferences are saved and restored
- [ ] Auto-save works correctly
- [ ] Error handling works for storage issues
- [ ] State migration works (if needed)
- [ ] Performance is acceptable

## Next Steps
After completing state persistence, proceed to PRP-07 for packaging and distribution implementation. 
