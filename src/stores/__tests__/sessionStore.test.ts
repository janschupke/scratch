import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionStore } from '../sessionStore';

vi.mock('../../services/sessionPersistence', () => {
  return {
    SessionPersistenceService: class {
      constructor() {}
      async saveSession(session: any) { return { success: true, sessionId: session.id }; }
      async loadSession(sessionId: string) { return { id: sessionId, name: 'Test', timestamp: Date.now(), lastAccessed: Date.now(), folderPaths: [], openFiles: [], activeTabId: null, windowState: {}, editorSettings: {} }; }
      async validateSession(_session: any) { return { isValid: true }; }
      async backupSession(_session: any) { return; }
      async restoreSession(_sessionId: string) { return null; }
    }
  };
});

vi.mock('../../services/filePathRecovery', () => {
  return {
    FilePathRecoveryService: class {
      async recoverFilePaths(session: any) { return session; }
    }
  };
});

describe('SessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({
      sessions: [],
      currentSession: null
    });
  });

  it('should create a new session', async () => {
    const store = useSessionStore.getState();
    const id = await store.createSession('Test Session');
    expect(typeof id).toBe('string');
    expect(useSessionStore.getState().currentSession).not.toBeNull();
    expect(useSessionStore.getState().sessions.length).toBe(1);
  });

  it('should save a session', async () => {
    const store = useSessionStore.getState();
    const id = await store.createSession('Test Session');
    const session = useSessionStore.getState().currentSession!;
    const result = await store.saveSession(session);
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe(id);
  });

  it('should load a session', async () => {
    const store = useSessionStore.getState();
    const id = await store.createSession('Test Session');
    const loaded = await store.loadSession(id);
    expect(loaded).not.toBeNull();
    expect(useSessionStore.getState().currentSession).not.toBeNull();
  });

  it('should delete a session', async () => {
    const store = useSessionStore.getState();
    const id = await store.createSession('Test Session');
    await store.deleteSession(id);
    expect(useSessionStore.getState().sessions.length).toBe(0);
  });

  it('should list sessions', async () => {
    const store = useSessionStore.getState();
    await store.createSession('Session 1');
    await store.createSession('Session 2');
    const sessions = await store.listSessions();
    expect(sessions.length).toBe(2);
  });

  it('should update current session', async () => {
    const store = useSessionStore.getState();
    await store.createSession('Test Session');
    await store.updateCurrentSession();
    expect(useSessionStore.getState().currentSession).not.toBeNull();
  });
}); 
