# PRP-00: Design System & Testing Foundation

## Goals
- Establish unified UI/styling system with consistent design patterns
- Set up comprehensive automated testing infrastructure
- Create reusable component library with proper accessibility
- Implement TDD approach for all feature development
- Provide foundation for all subsequent PRPs

## Detailed Implementation Steps

### 1. Unified Design System Implementation

**Problem Analysis:**
- Inconsistent styling patterns across components
- Duplicated color definitions and class names
- Missing accessibility features
- No standardized component patterns

**Solution: Comprehensive Design System**

**src/styles/design-system.ts:**
```typescript
// Design tokens and theme configuration
export const designTokens = {
  colors: {
    // VS Code Dark Theme Colors
    vscode: {
      bg: '#1e1e1e',
      sidebar: '#252526',
      tabs: '#2d2d30',
      text: '#cccccc',
      accent: '#007acc',
      error: '#f48771',
      warning: '#cca700',
      success: '#89d185',
      muted: '#6a6a6a',
      border: '#3c3c3c',
      hover: '#2a2d2e',
      active: '#094771',
    },
    // Semantic colors
    semantic: {
      error: '#f48771',
      warning: '#cca700',
      success: '#89d185',
      info: '#007acc',
    },
    // Grayscale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  typography: {
    fontFamily: {
      mono: 'Menlo, Monaco, "Courier New", monospace',
      sans: 'Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },
} as const;

export type DesignTokens = typeof designTokens;
```

**src/styles/tailwind.config.ts:**
```typescript
import type { Config } from 'tailwindcss';
import { designTokens } from './design-system';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vscode: designTokens.colors.vscode,
        semantic: designTokens.colors.semantic,
      },
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      zIndex: designTokens.zIndex,
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
```

### 2. Component Library Foundation

**src/components/ui/Button.tsx:**
```typescript
import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-vscode-accent text-white hover:bg-blue-600 focus:ring-blue-500',
      secondary: 'bg-vscode-sidebar text-vscode-text border border-vscode-border hover:bg-vscode-hover',
      danger: 'bg-semantic-error text-white hover:bg-red-600 focus:ring-red-500',
      ghost: 'text-vscode-text hover:bg-vscode-hover focus:ring-vscode-accent',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**src/components/ui/Input.tsx:**
```typescript
import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-vscode-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full px-3 py-2 border border-vscode-border rounded-md shadow-sm',
            'bg-vscode-sidebar text-vscode-text placeholder-vscode-muted',
            'focus:outline-none focus:ring-2 focus:ring-vscode-accent focus:border-vscode-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-semantic-error focus:ring-semantic-error focus:border-semantic-error',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            error ? 'text-semantic-error' : 'text-vscode-muted'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**src/utils/cn.ts:**
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3. Testing Infrastructure Setup

**src/test/setup.ts:**
```typescript
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
  default: vi.fn().mockImplementation(({ value, onChange }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )),
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
```

**src/test/test-utils.tsx:**
```typescript
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

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
  expect(element).toHaveStyle({ display: 'none' }) || 
  expect(element).toHaveAttribute('hidden') ||
  expect(element).toHaveAttribute('aria-hidden', 'true');
};
```

### 4. Component Testing Examples

**src/components/ui/__tests__/Button.test.tsx:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-vscode-accent');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-vscode-sidebar');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-semantic-error');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-vscode-text');
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**src/components/Sidebar/__tests__/FolderTree.test.tsx:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FolderTree } from '../FolderTree';
import { createMockFileNode } from '../../../test/test-utils';

describe('FolderTree', () => {
  const mockNodes = [
    createMockFileNode({ id: 'folder-1', name: 'src', type: 'folder' }),
    createMockFileNode({ id: 'file-1', name: 'index.js', type: 'file' }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders file tree nodes', () => {
    render(<FolderTree nodes={mockNodes} />);
    
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('index.js')).toBeInTheDocument();
  });

  it('shows folder icons for folders', () => {
    render(<FolderTree nodes={mockNodes} />);
    
    const folderIcon = screen.getByTestId('folder-icon');
    expect(folderIcon).toBeInTheDocument();
  });

  it('shows file icons for files', () => {
    render(<FolderTree nodes={mockNodes} />);
    
    const fileIcon = screen.getByTestId('file-icon');
    expect(fileIcon).toBeInTheDocument();
  });

  it('expands/collapses folders on click', () => {
    render(<FolderTree nodes={mockNodes} />);
    
    const folder = screen.getByText('src');
    const expandButton = folder.parentElement?.querySelector('[data-testid="expand-button"]');
    
    fireEvent.click(expandButton!);
    expect(screen.getByTestId('expanded-content')).toBeInTheDocument();
    
    fireEvent.click(expandButton!);
    expect(screen.queryByTestId('expanded-content')).not.toBeInTheDocument();
  });

  it('shows loading state when expanding folder', () => {
    const folderWithChildren = createMockFileNode({
      id: 'folder-2',
      name: 'large-folder',
      type: 'folder',
      children: [],
    });

    render(<FolderTree nodes={[folderWithChildren]} />);
    
    const folder = screen.getByText('large-folder');
    const expandButton = folder.parentElement?.querySelector('[data-testid="expand-button"]');
    
    fireEvent.click(expandButton!);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 5. Store Testing Examples

**src/stores/__tests__/fileStore.test.ts:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileStore } from '../fileStore';
import { createMockFileNode } from '../../test/test-utils';

// Mock the FileSystemManager
vi.mock('../../utils/fileSystem', () => ({
  FileSystemManager: {
    getInstance: vi.fn(() => ({
      selectFolder: vi.fn(),
      readDirectory: vi.fn(),
      readFile: vi.fn(),
      getFileExtension: vi.fn(),
      getLanguageFromExtension: vi.fn(),
      isTextFile: vi.fn(),
    })),
  },
}));

describe('useFileStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useFileStore());
    
    expect(result.current.currentFolder).toBeNull();
    expect(result.current.fileTree).toEqual([]);
    expect(result.current.openTabs).toEqual([]);
    expect(result.current.activeTabId).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('opens folder successfully', async () => {
    const { result } = renderHook(() => useFileStore());
    const mockFolderPath = '/test/path';
    const mockFileNodes = [
      createMockFileNode({ name: 'test.js' }),
      createMockFileNode({ name: 'src', type: 'folder' }),
    ];

    // Mock the file system manager
    const mockFileSystem = {
      selectFolder: vi.fn().mockResolvedValue(mockFolderPath),
      readDirectory: vi.fn().mockResolvedValue(mockFileNodes),
    };

    vi.mocked(require('../../utils/fileSystem').FileSystemManager.getInstance)
      .mockReturnValue(mockFileSystem);

    await act(async () => {
      await result.current.openFolder();
    });

    expect(result.current.currentFolder).toBe(mockFolderPath);
    expect(result.current.fileTree).toEqual(mockFileNodes);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles folder opening errors', async () => {
    const { result } = renderHook(() => useFileStore());
    const mockError = new Error('Failed to open folder');

    const mockFileSystem = {
      selectFolder: vi.fn().mockRejectedValue(mockError),
    };

    vi.mocked(require('../../utils/fileSystem').FileSystemManager.getInstance)
      .mockReturnValue(mockFileSystem);

    await act(async () => {
      await result.current.openFolder();
    });

    expect(result.current.error).toBe('Failed to open folder: Failed to open folder');
    expect(result.current.isLoading).toBe(false);
  });

  it('opens file and creates tab', async () => {
    const { result } = renderHook(() => useFileStore());
    const mockFilePath = '/test/path/test.js';
    const mockContent = 'console.log("hello world");';

    const mockFileSystem = {
      readFile: vi.fn().mockResolvedValue(mockContent),
      getFileExtension: vi.fn().mockReturnValue('js'),
      getLanguageFromExtension: vi.fn().mockReturnValue('javascript'),
      isTextFile: vi.fn().mockReturnValue(true),
    };

    vi.mocked(require('../../utils/fileSystem').FileSystemManager.getInstance)
      .mockReturnValue(mockFileSystem);

    await act(async () => {
      await result.current.openFile(mockFilePath);
    });

    expect(result.current.openTabs).toHaveLength(1);
    expect(result.current.openTabs[0].path).toBe(mockFilePath);
    expect(result.current.openTabs[0].language).toBe('javascript');
    expect(result.current.activeTabId).toBe(result.current.openTabs[0].id);
  });

  it('prevents opening non-text files', async () => {
    const { result } = renderHook(() => useFileStore());
    const mockFilePath = '/test/path/image.png';

    const mockFileSystem = {
      getFileExtension: vi.fn().mockReturnValue('png'),
      isTextFile: vi.fn().mockReturnValue(false),
    };

    vi.mocked(require('../../utils/fileSystem').FileSystemManager.getInstance)
      .mockReturnValue(mockFileSystem);

    await act(async () => {
      await result.current.openFile(mockFilePath);
    });

    expect(result.current.error).toBe('Only text files can be opened in the editor');
    expect(result.current.openTabs).toHaveLength(0);
  });
});
```

### 6. Integration Testing Examples

**src/test/integration/__tests__/file-opening.test.ts:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { Sidebar } from '../../components/Sidebar';
import { useFileStore } from '../../stores/fileStore';

describe('File Opening Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens file from sidebar and creates tab', async () => {
    const mockFileNode = {
      id: '/test/path/file.js',
      name: 'file.js',
      path: '/test/path/file.js',
      type: 'file' as const,
    };

    // Mock the file store
    const mockOpenFile = vi.fn().mockResolvedValue(true);
    vi.mocked(useFileStore).mockReturnValue({
      ...mockStores.fileStore,
      openFile: mockOpenFile,
    });

    renderWithProviders(<Sidebar />);

    // Click on file in sidebar
    const fileItem = screen.getByText('file.js');
    fireEvent.click(fileItem);

    await waitFor(() => {
      expect(mockOpenFile).toHaveBeenCalledWith('/test/path/file.js');
    });
  });

  it('shows error when file cannot be opened', async () => {
    const mockOpenFile = vi.fn().mockRejectedValue(new Error('File not found'));
    vi.mocked(useFileStore).mockReturnValue({
      ...mockStores.fileStore,
      openFile: mockOpenFile,
    });

    renderWithProviders(<Sidebar />);

    const fileItem = screen.getByText('file.js');
    fireEvent.click(fileItem);

    await waitFor(() => {
      expect(screen.getByText(/File not found/)).toBeInTheDocument();
    });
  });
});
```

### 7. E2E Testing Setup

**src/test/e2e/__tests__/editor-workflow.test.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Editor Workflow', () => {
  test('complete file editing workflow', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    // Open folder
    await page.click('[data-testid="open-folder-button"]');
    
    // Wait for folder dialog and select folder
    const folderDialog = page.locator('[data-testid="folder-dialog"]');
    await folderDialog.waitFor();
    
    // Select a test folder (this would be set up in test environment)
    await page.click('[data-testid="folder-item"]');
    await page.click('[data-testid="select-folder-button"]');

    // Wait for file tree to load
    await page.waitForSelector('[data-testid="file-tree"]');

    // Open a file
    await page.click('[data-testid="file-item"]');

    // Wait for editor to load
    await page.waitForSelector('[data-testid="monaco-editor"]');

    // Type in the editor
    await page.fill('[data-testid="monaco-editor"]', 'console.log("hello world");');

    // Save the file
    await page.click('[data-testid="save-button"]');

    // Verify save was successful
    await expect(page.locator('[data-testid="save-indicator"]')).toBeVisible();

    // Close the tab
    await page.click('[data-testid="close-tab-button"]');

    // Verify tab is closed
    await expect(page.locator('[data-testid="file-tab"]')).not.toBeVisible();
  });

  test('handles unsaved changes warning', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open a file and make changes
    await page.click('[data-testid="file-item"]');
    await page.fill('[data-testid="monaco-editor"]', 'modified content');

    // Try to close tab without saving
    await page.click('[data-testid="close-tab-button"]');

    // Verify confirmation dialog appears
    await expect(page.locator('[data-testid="unsaved-changes-dialog"]')).toBeVisible();
    
    // Cancel the dialog
    await page.click('[data-testid="cancel-button"]');

    // Verify tab is still open
    await expect(page.locator('[data-testid="file-tab"]')).toBeVisible();
  });
});
```

### 8. Testing Scripts and Configuration

**package.json testing scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:run && npm run test:e2e",
    "test:ci": "npm run test:coverage && npm run test:e2e"
  }
}
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Testing Steps
1. Set up testing infrastructure and dependencies
2. Create design system and component library
3. Implement unit tests for all components
4. Write integration tests for store interactions
5. Create E2E tests for critical user flows
6. Set up CI/CD testing pipeline
7. Monitor and maintain test coverage
8. Verify all subsequent PRPs can use this foundation

## Potential Risks & Mitigation

### 1. Testing Complexity
**Risk**: Tests become difficult to maintain
**Mitigation**: Use consistent patterns and test utilities

### 2. Performance Impact
**Risk**: Tests slow down development
**Mitigation**: Use fast test runners and parallel execution

### 3. False Positives
**Risk**: Tests fail intermittently
**Mitigation**: Use stable selectors and proper async handling

### 4. Coverage Gaps
**Risk**: Important code paths not tested
**Mitigation**: Regular coverage analysis and review

## Success Criteria
- [ ] All components have unit tests with >80% coverage
- [ ] Store interactions are thoroughly tested
- [ ] E2E tests cover critical user workflows
- [ ] Design system is consistent and accessible
- [ ] Testing pipeline runs in CI/CD
- [ ] Tests are fast and reliable
- [ ] Foundation supports all subsequent PRPs
- [ ] Development team can use consistent patterns

## Next Steps
After completing this foundation, all subsequent PRPs will have:
- Consistent, accessible UI components
- Comprehensive test coverage
- Reliable automated testing pipeline
- Maintainable and scalable architecture
- Clear development standards and patterns 
