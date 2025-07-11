import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi, expect } from 'vitest';

// Mock stores for testing
export const mockStores = {
  fileStore: {
    currentFolder: '/test/path',
    fileTree: [],
    openTabs: [],
    activeTabId: null,
    isLoading: false,
    error: null,
    openFolder: vi.fn(),
    loadFileTree: vi.fn(),
    openFile: vi.fn(),
    closeTab: vi.fn(),
    setActiveTab: vi.fn(),
  },
  tabStore: {
    tabs: [],
    activeTabId: null,
    tabGroups: [],
    activeGroupId: null,
    tabOrder: [],
    addTab: vi.fn(),
    closeTab: vi.fn(),
    setActiveTab: vi.fn(),
    reorderTabs: vi.fn(),
  },
  editorStore: {
    editorInstance: null,
    settings: {},
    isLoading: false,
    error: null,
    setEditorInstance: vi.fn(),
    saveFile: vi.fn(),
    formatDocument: vi.fn(),
  },
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  storeOverrides?: Partial<typeof mockStores>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { storeOverrides = {}, ...renderOptions } = options;

  // Create a wrapper component with providers
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    // Mock store providers would go here
    return <div data-testid="test-wrapper">{children}</div>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Test data factories
export const createMockFileNode = (overrides: Partial<any> = {}) => ({
  id: 'test-file-1',
  name: 'test.js',
  path: '/test/path/test.js',
  type: 'file' as const,
  ...overrides,
});

export const createMockTab = (overrides: Partial<any> = {}) => ({
  id: 'tab-1',
  title: 'test.js',
  path: '/test/path/test.js',
  isActive: false,
  isModified: false,
  isPinned: false,
  language: 'javascript',
  lastAccessed: Date.now(),
  ...overrides,
});

// Custom matchers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).not.toHaveStyle({ display: 'none' });
  expect(element).not.toHaveAttribute('hidden');
};

export const expectElementToBeHidden = (element: HTMLElement) => {
  const isHidden = 
    element.style.display === 'none' ||
    element.hasAttribute('hidden') ||
    element.getAttribute('aria-hidden') === 'true';
  expect(isHidden).toBe(true);
}; 
