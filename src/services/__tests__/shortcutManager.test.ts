import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ShortcutManager } from '../shortcutManager';
import { Shortcut } from '../../types/shortcuts';

describe('ShortcutManager', () => {
  let shortcutManager: ShortcutManager;

  beforeEach(() => {
    shortcutManager = ShortcutManager.getInstance();
    shortcutManager.start();
  });

  afterEach(() => {
    // Clean up any registered shortcuts
    shortcutManager.stop();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ShortcutManager.getInstance();
      const instance2 = ShortcutManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('registerShortcut', () => {
    it('should register a shortcut', () => {
      const shortcut: Shortcut = {
        id: 'test-shortcut',
        key: 'Cmd+T',
        description: 'Test shortcut',
        category: 'file',
        action: vi.fn(),
        enabled: true,
        visible: true
      };

      shortcutManager.registerShortcut(shortcut);
      
      // We can't directly test the internal map, but we can test that the shortcut is registered
      // by checking that the action is called when the key is pressed
      const mockAction = vi.fn();
      shortcut.action = mockAction;
      
      // Simulate key press
      const event = new KeyboardEvent('keydown', {
        key: 'T',
        metaKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });
  });

  describe('unregisterShortcut', () => {
    it('should unregister a shortcut', () => {
      const shortcut: Shortcut = {
        id: 'test-shortcut',
        key: 'Cmd+T',
        description: 'Test shortcut',
        category: 'file',
        action: vi.fn(),
        enabled: true,
        visible: true
      };

      shortcutManager.registerShortcut(shortcut);
      shortcutManager.unregisterShortcut('test-shortcut');
      
      // The shortcut should no longer be active
      const mockAction = vi.fn();
      shortcut.action = mockAction;
      
      const event = new KeyboardEvent('keydown', {
        key: 'T',
        metaKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe('key parsing', () => {
    it('should parse Cmd key correctly', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'S',
        metaKey: true,
        bubbles: true
      });
      
      // We can't directly test the private method, but we can test the behavior
      const shortcut: Shortcut = {
        id: 'test-shortcut',
        key: 'Cmd+S',
        description: 'Test shortcut',
        category: 'file',
        action: vi.fn(),
        enabled: true,
        visible: true
      };

      shortcutManager.registerShortcut(shortcut);
      document.dispatchEvent(event);
      
      expect(shortcut.action).toHaveBeenCalled();
    });

    it('should parse Cmd+Shift key correctly', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'S',
        metaKey: true,
        shiftKey: true,
        bubbles: true
      });
      
      const shortcut: Shortcut = {
        id: 'test-shortcut',
        key: 'Cmd+Shift+S',
        description: 'Test shortcut',
        category: 'file',
        action: vi.fn(),
        enabled: true,
        visible: true
      };

      shortcutManager.registerShortcut(shortcut);
      document.dispatchEvent(event);
      
      expect(shortcut.action).toHaveBeenCalled();
    });
  });

  describe('shortcut execution', () => {
    it('should execute enabled shortcuts', () => {
      const mockAction = vi.fn();
      const shortcut: Shortcut = {
        id: 'test-shortcut',
        key: 'Cmd+T',
        description: 'Test shortcut',
        category: 'file',
        action: mockAction,
        enabled: true,
        visible: true
      };

      shortcutManager.registerShortcut(shortcut);
      
      const event = new KeyboardEvent('keydown', {
        key: 'T',
        metaKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should not execute disabled shortcuts', () => {
      const mockAction = vi.fn();
      const shortcut: Shortcut = {
        id: 'test-shortcut',
        key: 'Cmd+T',
        description: 'Test shortcut',
        category: 'file',
        action: mockAction,
        enabled: false,
        visible: true
      };

      shortcutManager.registerShortcut(shortcut);
      
      const event = new KeyboardEvent('keydown', {
        key: 'T',
        metaKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(mockAction).not.toHaveBeenCalled();
    });
  });
}); 
