import { debounce } from 'lodash-es';

export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // App State Methods
  async saveAppState(state: any): Promise<void> {
    try {
      localStorage.setItem('app-state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  }

  async loadAppState(): Promise<any | null> {
    try {
      const data = localStorage.getItem('app-state');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load app state:', error);
      return null;
    }
  }

  // Preferences Methods
  async savePreferences(preferences: any): Promise<void> {
    try {
      localStorage.setItem('preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  async loadPreferences(): Promise<any | null> {
    try {
      const data = localStorage.getItem('preferences');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return null;
    }
  }

  // Window State Methods
  async saveWindowState(state: any): Promise<void> {
    try {
      localStorage.setItem('window-state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save window state:', error);
    }
  }

  async loadWindowState(): Promise<any | null> {
    try {
      const data = localStorage.getItem('window-state');
      return data ? JSON.parse(data) : null;
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
      localStorage.removeItem('app-state');
      localStorage.removeItem('preferences');
      localStorage.removeItem('window-state');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
} 
