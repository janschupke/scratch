import { render, fireEvent, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FolderTree } from '../FolderTree';
import * as fileStoreModule from '../../../stores/fileStore';
import * as fileNavModule from '../../../services/fileNavigation';
import * as fileDetectionModule from '../../../utils/fileDetection';

const mockFileTree = [
  {
    id: '1',
    name: 'src',
    path: '/project/src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'index.ts',
        path: '/project/src/index.ts',
        type: 'file',
      },
      {
        id: '3',
        name: 'app.tsx',
        path: '/project/src/app.tsx',
        type: 'file',
      },
    ],
  },
  {
    id: '4',
    name: 'README.md',
    path: '/project/README.md',
    type: 'file',
  },
];

describe('FolderTree', () => {
  beforeEach(() => {
    vi.spyOn(fileStoreModule, 'useFileStore').mockReturnValue({
      fileTree: mockFileTree,
      openTabs: [
        { id: 'tab-2', path: '/project/src/index.ts', title: 'index.ts', isActive: true, isModified: false, isPinned: false, language: 'ts', lastAccessed: 0 },
      ],
      activeTabId: 'tab-2',
      error: null,
      isLoading: false,
    });
    vi.spyOn(fileNavModule.FileNavigationService, 'openFile').mockResolvedValue({ success: true, tabId: 'tab-2' });
    vi.spyOn(fileDetectionModule.FileTypeDetector, 'detectFileType').mockResolvedValue({
      path: '/mock/path',
      name: 'mockfile.txt',
      extension: '.txt',
      size: 100,
      isText: true,
      encoding: 'utf-8',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders file tree and highlights open/selected files', async () => {
    render(<FolderTree />);
    // Expand the 'src' folder
    await act(async () => {
      fireEvent.click(await screen.findByText('src'));
    });
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(await screen.findByText('index.ts')).toHaveClass('font-bold');
    expect(screen.getByText('index.ts').parentElement).toHaveClass('bg-vscode-accent/20');
    expect(await screen.findByText('app.tsx')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
  });

  it('filters files by search', async () => {
    render(<FolderTree />);
    // Expand the 'src' folder
    await act(async () => {
      fireEvent.click(await screen.findByText('src'));
    });
    const searchInput = screen.getByPlaceholderText('Search files...');
    fireEvent.change(searchInput, { target: { value: 'app' } });
    expect(await screen.findByText('app.tsx')).toBeInTheDocument();
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
    expect(screen.queryByText('README.md')).not.toBeInTheDocument();
  });

  it('calls FileNavigationService.openFile on file click', async () => {
    render(<FolderTree />);
    // Expand the 'src' folder
    await act(async () => {
      fireEvent.click(await screen.findByText('src'));
    });
    const file = await screen.findByText('app.tsx');
    await act(async () => {
      fireEvent.click(file);
    });
    expect(fileNavModule.FileNavigationService.openFile).toHaveBeenCalledWith('/project/src/app.tsx');
  });

  it('supports keyboard navigation (Enter to open)', async () => {
    render(<FolderTree />);
    const file = await screen.findByText('README.md');
    await act(async () => {
      fireEvent.keyDown(file.parentElement!, { key: 'Enter' });
    });
    expect(fileNavModule.FileNavigationService.openFile).toHaveBeenCalledWith('/project/README.md');
  });
}); 
