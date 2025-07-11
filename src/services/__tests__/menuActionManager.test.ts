import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuActionManager, MenuAction } from '../menuActionManager';
import { MenuActions } from '../menuActions';

// Mock the MenuActions class
vi.mock('../menuActions', () => ({
  MenuActions: {
    newFile: vi.fn(),
    openFile: vi.fn(),
    openFolder: vi.fn(),
    save: vi.fn(),
    saveAs: vi.fn(),
    close: vi.fn(),
    exit: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    cut: vi.fn(),
    copy: vi.fn(),
    paste: vi.fn(),
    selectAll: vi.fn(),
    find: vi.fn(),
    replace: vi.fn(),
    toggleSidebar: vi.fn(),
    toggleStatusBar: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    fullScreen: vi.fn(),
    about: vi.fn(),
    documentation: vi.fn(),
    shortcuts: vi.fn(),
  },
}));

describe('MenuActionManager', () => {
  let manager: MenuActionManager;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Get a fresh instance
    manager = MenuActionManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = MenuActionManager.getInstance();
      const instance2 = MenuActionManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('registerAction', () => {
    it('should register a new action', () => {
      const action: MenuAction = {
        id: 'test.action',
        label: 'Test Action',
        shortcut: 'Cmd+T',
        enabled: true,
        action: vi.fn(),
      };

      manager.registerAction(action);
      const retrievedAction = manager.getAction('test.action');
      
      expect(retrievedAction).toBeDefined();
      expect(retrievedAction?.id).toBe('test.action');
      expect(retrievedAction?.label).toBe('Test Action');
    });

    it('should overwrite existing action with same id', () => {
      const action1: MenuAction = {
        id: 'test.action',
        label: 'Test Action 1',
        enabled: true,
        action: vi.fn(),
      };

      const action2: MenuAction = {
        id: 'test.action',
        label: 'Test Action 2',
        enabled: false,
        action: vi.fn(),
      };

      manager.registerAction(action1);
      manager.registerAction(action2);
      
      const retrievedAction = manager.getAction('test.action');
      expect(retrievedAction?.label).toBe('Test Action 2');
      expect(retrievedAction?.enabled).toBe(false);
    });
  });

  describe('executeAction', () => {
    it('should execute a valid action', async () => {
      const mockAction = vi.fn();
      const action: MenuAction = {
        id: 'test.action',
        label: 'Test Action',
        enabled: true,
        action: mockAction,
      };

      manager.registerAction(action);
      await manager.executeAction('test.action');

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should throw error for non-existent action', async () => {
      await expect(manager.executeAction('non.existent')).rejects.toThrow('Action not found: non.existent');
    });

    it('should throw error for disabled action', async () => {
      const action: MenuAction = {
        id: 'test.action',
        label: 'Test Action',
        enabled: false,
        action: vi.fn(),
      };

      manager.registerAction(action);
      await expect(manager.executeAction('test.action')).rejects.toThrow('Action is disabled: test.action');
    });

    it('should handle action execution errors', async () => {
      const errorAction = vi.fn().mockRejectedValue(new Error('Action failed'));
      const action: MenuAction = {
        id: 'test.action',
        label: 'Test Action',
        enabled: true,
        action: errorAction,
      };

      manager.registerAction(action);
      await expect(manager.executeAction('test.action')).rejects.toThrow('Action failed');
    });
  });

  describe('updateActionState', () => {
    it('should update action enabled state', () => {
      const action: MenuAction = {
        id: 'test.action',
        label: 'Test Action',
        enabled: true,
        action: vi.fn(),
      };

      manager.registerAction(action);
      manager.updateActionState('test.action', false);
      
      const retrievedAction = manager.getAction('test.action');
      expect(retrievedAction?.enabled).toBe(false);
    });

    it('should do nothing for non-existent action', () => {
      expect(() => manager.updateActionState('non.existent', false)).not.toThrow();
    });
  });

  describe('getAction', () => {
    it('should return action if exists', () => {
      const action: MenuAction = {
        id: 'test.action',
        label: 'Test Action',
        enabled: true,
        action: vi.fn(),
      };

      manager.registerAction(action);
      const retrievedAction = manager.getAction('test.action');
      
      expect(retrievedAction).toBeDefined();
      expect(retrievedAction?.id).toBe('test.action');
    });

    it('should return undefined for non-existent action', () => {
      const retrievedAction = manager.getAction('non.existent');
      expect(retrievedAction).toBeUndefined();
    });
  });

  describe('getAllActions', () => {
    it('should return all registered actions', () => {
      const action1: MenuAction = {
        id: 'test.action1',
        label: 'Test Action 1',
        enabled: true,
        action: vi.fn(),
      };

      const action2: MenuAction = {
        id: 'test.action2',
        label: 'Test Action 2',
        enabled: false,
        action: vi.fn(),
      };

      manager.registerAction(action1);
      manager.registerAction(action2);
      
      const allActions = manager.getAllActions();
      // The manager already has default actions registered, so we expect more than 2
      expect(allActions.length).toBeGreaterThan(2);
      expect(allActions.some(a => a.id === 'test.action1')).toBe(true);
      expect(allActions.some(a => a.id === 'test.action2')).toBe(true);
    });
  });

  describe('default actions', () => {
    it('should have file menu actions registered', () => {
      const fileActions = [
        'file.newFile',
        'file.openFile',
        'file.openFolder',
        'file.save',
        'file.saveAs',
        'file.close',
        'file.exit',
      ];

      fileActions.forEach(actionId => {
        const action = manager.getAction(actionId);
        expect(action).toBeDefined();
        expect(action?.id).toBe(actionId);
      });
    });

    it('should have edit menu actions registered', () => {
      const editActions = [
        'edit.undo',
        'edit.redo',
        'edit.cut',
        'edit.copy',
        'edit.paste',
        'edit.selectAll',
        'edit.find',
        'edit.replace',
      ];

      editActions.forEach(actionId => {
        const action = manager.getAction(actionId);
        expect(action).toBeDefined();
        expect(action?.id).toBe(actionId);
      });
    });

    it('should have view menu actions registered', () => {
      const viewActions = [
        'view.toggleSidebar',
        'view.toggleStatusBar',
        'view.zoomIn',
        'view.zoomOut',
        'view.resetZoom',
        'view.fullScreen',
      ];

      viewActions.forEach(actionId => {
        const action = manager.getAction(actionId);
        expect(action).toBeDefined();
        expect(action?.id).toBe(actionId);
      });
    });

    it('should have help menu actions registered', () => {
      const helpActions = [
        'help.about',
        'help.documentation',
        'help.shortcuts',
      ];

      helpActions.forEach(actionId => {
        const action = manager.getAction(actionId);
        expect(action).toBeDefined();
        expect(action?.id).toBe(actionId);
      });
    });

    it('should execute file actions correctly', async () => {
      await manager.executeAction('file.newFile');
      expect(MenuActions.newFile).toHaveBeenCalledTimes(1);

      await manager.executeAction('file.openFile');
      expect(MenuActions.openFile).toHaveBeenCalledTimes(1);

      await manager.executeAction('file.save');
      expect(MenuActions.save).toHaveBeenCalledTimes(1);
    });

    it('should execute edit actions correctly', async () => {
      await manager.executeAction('edit.undo');
      expect(MenuActions.undo).toHaveBeenCalledTimes(1);

      await manager.executeAction('edit.copy');
      expect(MenuActions.copy).toHaveBeenCalledTimes(1);

      await manager.executeAction('edit.selectAll');
      expect(MenuActions.selectAll).toHaveBeenCalledTimes(1);
    });

    it('should execute view actions correctly', async () => {
      await manager.executeAction('view.toggleSidebar');
      expect(MenuActions.toggleSidebar).toHaveBeenCalledTimes(1);

      await manager.executeAction('view.zoomIn');
      expect(MenuActions.zoomIn).toHaveBeenCalledTimes(1);

      await manager.executeAction('view.resetZoom');
      expect(MenuActions.resetZoom).toHaveBeenCalledTimes(1);
    });
  });
}); 
