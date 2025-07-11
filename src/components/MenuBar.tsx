import React from 'react';
import { useMenuStore } from '../stores/menuStore';
import { MenuActions } from '../services/menuActions';
import { formatShortcut } from '../utils/shortcutUtils';

const menuConfig = [
  {
    label: 'File',
    items: [
      { label: 'New File', action: MenuActions.newFile, shortcut: 'Ctrl+N' },
      { label: 'Open File...', action: MenuActions.openFile, shortcut: 'Ctrl+O' },
      { label: 'Open Folder...', action: MenuActions.openFolder },
      { label: 'Save', action: MenuActions.save, shortcut: 'Ctrl+S' },
      { label: 'Save As...', action: MenuActions.saveAs },
      { label: 'Exit', action: MenuActions.exit },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', action: MenuActions.undo, shortcut: 'Ctrl+Z' },
      { label: 'Redo', action: MenuActions.redo, shortcut: 'Ctrl+Y' },
      { label: 'Cut', action: MenuActions.cut, shortcut: 'Ctrl+X' },
      { label: 'Copy', action: MenuActions.copy, shortcut: 'Ctrl+C' },
      { label: 'Paste', action: MenuActions.paste, shortcut: 'Ctrl+V' },
      { label: 'Find', action: MenuActions.find, shortcut: 'Ctrl+F' },
      { label: 'Replace', action: MenuActions.replace, shortcut: 'Ctrl+H' },
      { label: 'Select All', action: MenuActions.selectAll, shortcut: 'Ctrl+A' },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Toggle Sidebar', action: MenuActions.toggleSidebar },
      { label: 'Toggle Status Bar', action: MenuActions.toggleStatusBar },
      { label: 'Zoom In', action: MenuActions.zoomIn, shortcut: 'Ctrl+=' },
      { label: 'Zoom Out', action: MenuActions.zoomOut, shortcut: 'Ctrl+-' },
      { label: 'Reset Zoom', action: MenuActions.resetZoom },
      { label: 'Full Screen', action: MenuActions.fullScreen, shortcut: 'F11' },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'About', action: MenuActions.about },
      { label: 'Documentation', action: MenuActions.documentation },
      { label: 'Keyboard Shortcuts', action: MenuActions.shortcuts },
    ],
  },
];

export const MenuBar: React.FC = () => {
  const { isVisible, activeMenu, setActiveMenu } = useMenuStore();
  if (!isVisible) return null;

  return (
    <nav className="bg-vscode-bg border-b border-vscode-border text-vscode-text select-none" role="menubar" aria-label="Application menu">
      <ul className="flex">
        {menuConfig.map(menu => (
          <li
            key={menu.label}
            className="relative group"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={activeMenu === menu.label}
            onFocus={() => setActiveMenu(menu.label)}
            onBlur={() => setActiveMenu(null)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') setActiveMenu(menu.label);
              if (e.key === 'Escape') setActiveMenu(null);
            }}
          >
            <button className="px-4 py-2 focus:outline-none focus:bg-vscode-accent/20" aria-label={menu.label}>
              {menu.label}
            </button>
            {activeMenu === menu.label && (
              <ul className="absolute left-0 mt-1 bg-vscode-bg border border-vscode-border shadow-lg z-50 min-w-[180px]" role="menu">
                {menu.items.map(item => (
                  <li key={item.label} role="menuitem">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-vscode-accent/10 focus:bg-vscode-accent/20 focus:outline-none"
                      onClick={() => { item.action(); setActiveMenu(null); }}
                      tabIndex={0}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <span className="float-right text-xs text-gray-400">{formatShortcut(item.shortcut)}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}; 
