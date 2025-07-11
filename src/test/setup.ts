import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Tauri APIs
vi.mock('@tauri-apps/api/dialog', () => ({
  open: vi.fn(),
}));

vi.mock('@tauri-apps/api/fs', () => ({
  readDir: vi.fn(),
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
  basename: vi.fn(),
  dirname: vi.fn(),
  extname: vi.fn(),
}));

vi.mock('@tauri-apps/api/store', () => ({
  Store: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn(),
    save: vi.fn(),
    clear: vi.fn(),
  })),
}));

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn().mockImplementation(({ value, onChange }: any) => {
    const React = require('react');
    return React.createElement('textarea', {
      'data-testid': 'monaco-editor',
      value,
      onChange: (e: any) => onChange?.(e.target.value),
    });
  }),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})); 
