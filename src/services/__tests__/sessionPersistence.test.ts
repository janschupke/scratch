import { describe, it, expect, beforeEach } from 'vitest';
import { SessionPersistenceService } from '../sessionPersistence';

describe('SessionPersistenceService', () => {
  let service: SessionPersistenceService;
  const options = { autoSave: false, saveInterval: 10000, maxSessions: 5, backupEnabled: true };
  const session = { id: 'test', name: 'Test', timestamp: Date.now(), lastAccessed: Date.now(), folderPaths: [], openFiles: [], activeTabId: null, windowState: {}, editorSettings: {} };

  beforeEach(() => {
    service = new SessionPersistenceService(options);
    localStorage.clear();
  });

  it('should save a session', async () => {
    const result = await service.saveSession(session);
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('test');
    expect(localStorage.getItem('session-test')).not.toBeNull();
  });

  it('should load a session', async () => {
    await service.saveSession(session);
    const loaded = await service.loadSession('test');
    expect(loaded).not.toBeNull();
    expect(loaded.id).toBe('test');
  });

  it('should validate a valid session', async () => {
    const result = await service.validateSession(session);
    expect(result.isValid).toBe(true);
  });

  it('should fail validation for missing fields', async () => {
    const invalid = { ...session, id: undefined };
    const result = await service.validateSession(invalid);
    expect(result.isValid).toBe(false);
  });

  it('should backup and restore a session', async () => {
    await service.saveSession(session);
    await service.backupSession(session);
    const restored = await service.restoreSession('test');
    expect(restored).not.toBeNull();
    expect(restored.id).toBe('test');
  });
}); 
