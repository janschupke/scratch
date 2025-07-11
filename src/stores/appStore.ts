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

function migrateState(state: any, _fromVersion: number, toVersion: number): Partial<AppState> {
  // Add migration logic here when needed
  return {
    ...state,
    version: toVersion,
  };
} 
