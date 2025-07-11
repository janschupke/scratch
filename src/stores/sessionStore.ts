import { create } from 'zustand';
import { SessionPersistenceService } from '../services/sessionPersistence';
import { FilePathRecoveryService } from '../services/filePathRecovery';
import { useTabStore } from './tabStore';
import { useFileStore } from './fileStore';
import { useAppStore } from './appStore';

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

export interface EditorSettings {
  theme: string;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: string;
}

export interface Position {
  line: number;
  column: number;
}

export interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
}

export interface Selection {
  start: Position;
  end: Position;
}

export interface SessionStore {
  sessions: WorkspaceSession[];
  currentSession: WorkspaceSession | null;
  saveSession(session: WorkspaceSession): Promise<any>;
  loadSession(sessionId: string): Promise<WorkspaceSession | null>;
  deleteSession(sessionId: string): Promise<void>;
  listSessions(): Promise<WorkspaceSession[]>;
  createSession(name: string): Promise<string>;
  updateCurrentSession(): Promise<void>;
}

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
        set((_state) => ({
          sessions: _state.sessions.map(s => s.id === session.id ? session : s),
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
        set((_state) => ({
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

  deleteSession: async (sessionId: string) => {
    set((_state) => ({
      sessions: _state.sessions.filter((s: any) => s.id !== sessionId)
    }));
    // Optionally, delete from persistence
  },

  listSessions: async () => {
    // This would load from persistence in a real app
    return get().sessions;
  },

  createSession: async (name: string) => {
    const id = `${Date.now()}`;
    const now = Date.now();
    const newSession: WorkspaceSession = {
      id,
      name,
      timestamp: now,
      lastAccessed: now,
      folderPaths: [],
      openFiles: [],
      activeTabId: null,
      windowState: {
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        isMaximized: false,
        sidebarVisible: true,
        statusBarVisible: true,
        zoomLevel: 1
      },
      editorSettings: {
        theme: 'light',
        fontSize: 14,
        fontFamily: 'monospace',
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'off'
      }
    };
    set((state) => ({
      sessions: [...state.sessions, newSession],
      currentSession: newSession
    }));
    return id;
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
      folderPaths: fileStore.currentFolder ? [fileStore.currentFolder] : [],
      openFiles: tabStore.tabs.map(tab => ({
        filePath: tab.path,
        tabId: tab.id,
        title: tab.title,
        content: tab.content || '',
        isModified: tab.isModified,
        isPinned: tab.isPinned,
        cursorPosition: tab.editorState?.cursorPosition || { line: 1, column: 1 },
        scrollPosition: tab.editorState?.scrollPosition || { scrollTop: 0, scrollLeft: 0 },
        selection: tab.editorState?.selection || null,
        language: tab.language || 'plaintext',
        encoding: 'utf-8'
      })),
      activeTabId: tabStore.activeTabId,
      windowState: {
        width: appStore.windowState.width,
        height: appStore.windowState.height,
        x: appStore.windowState.x,
        y: appStore.windowState.y,
        isMaximized: appStore.windowState.isMaximized,
        sidebarVisible: !appStore.windowState.isSidebarCollapsed,
        statusBarVisible: true, // TODO: derive from preferences if needed
        zoomLevel: appStore.preferences.editor.fontSize
      },
      editorSettings: {
        theme: appStore.preferences.theme,
        fontSize: appStore.preferences.editor.fontSize,
        fontFamily: appStore.preferences.editor.fontFamily,
        tabSize: appStore.preferences.editor.tabSize,
        insertSpaces: appStore.preferences.editor.insertSpaces,
        wordWrap: appStore.preferences.editor.wordWrap
      }
    };
    await state.saveSession(updatedSession);
  }
})); 
