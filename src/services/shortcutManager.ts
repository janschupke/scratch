import { Shortcut } from '../types/shortcuts';

export class ShortcutManager {
  private static instance: ShortcutManager;
  private shortcuts: Map<string, Shortcut> = new Map();
  private listeners: Set<(event: KeyboardEvent) => void> = new Set();

  static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager();
    }
    return ShortcutManager.instance;
  }

  registerShortcut(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  unregisterShortcut(id: string): void {
    this.shortcuts.delete(id);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = this.getKeyFromEvent(event);
    const shortcut = this.findShortcut(key);

    if (shortcut && shortcut.enabled) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        shortcut.action();
        this.notifyShortcutExecuted(shortcut.id);
      } catch (error) {
        console.error(`Shortcut execution failed for ${shortcut.id}:`, error);
      }
    }
  };

  private getKeyFromEvent(event: KeyboardEvent): string {
    const modifiers: string[] = [];
    
    if (event.metaKey) modifiers.push('Cmd');
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    
    const key = event.key.toUpperCase();
    return [...modifiers, key].join('+');
  }

  private findShortcut(key: string): Shortcut | undefined {
    return Array.from(this.shortcuts.values()).find(
      shortcut => shortcut.key === key
    );
  }

  private notifyShortcutExecuted(id: string): void {
    // Notify stores about shortcut execution
    this.listeners.forEach(listener => {
      try {
        const customEvent = new CustomEvent('shortcut', { detail: { id } });
        listener(customEvent as unknown as KeyboardEvent);
      } catch (error) {
        console.error('Shortcut listener error:', error);
      }
    });
  }

  start(): void {
    document.addEventListener('keydown', this.handleKeyDown, true);
  }

  stop(): void {
    document.removeEventListener('keydown', this.handleKeyDown, true);
  }

  addListener(listener: (event: KeyboardEvent) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (event: KeyboardEvent) => void): void {
    this.listeners.delete(listener);
  }
} 
