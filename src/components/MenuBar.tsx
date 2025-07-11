import React from 'react';
import { useMenuStore } from '../stores/menuStore';
import { MenuActionManager } from '../services/menuActionManager';
import { formatShortcut } from '../utils/shortcutUtils';

const menuConfig = [
  {
    label: 'File',
    items: [
      { id: 'file.newFile', label: 'New File', shortcut: 'Cmd+N' },
      { id: 'file.openFile', label: 'Open File...', shortcut: 'Cmd+O' },
      { id: 'file.openFolder', label: 'Open Folder...', shortcut: 'Cmd+Shift+O' },
      { type: 'separator' },
      { id: 'file.save', label: 'Save', shortcut: 'Cmd+S' },
      { id: 'file.saveAs', label: 'Save As...', shortcut: 'Cmd+Shift+S' },
      { type: 'separator' },
      { id: 'file.close', label: 'Close', shortcut: 'Cmd+W' },
      { id: 'file.exit', label: 'Exit', shortcut: 'Cmd+Q' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { id: 'edit.undo', label: 'Undo', shortcut: 'Cmd+Z' },
      { id: 'edit.redo', label: 'Redo', shortcut: 'Cmd+Shift+Z' },
      { type: 'separator' },
      { id: 'edit.cut', label: 'Cut', shortcut: 'Cmd+X' },
      { id: 'edit.copy', label: 'Copy', shortcut: 'Cmd+C' },
      { id: 'edit.paste', label: 'Paste', shortcut: 'Cmd+V' },
      { id: 'edit.selectAll', label: 'Select All', shortcut: 'Cmd+A' },
      { type: 'separator' },
      { id: 'edit.find', label: 'Find', shortcut: 'Cmd+F' },
      { id: 'edit.replace', label: 'Replace', shortcut: 'Cmd+H' },
    ],
  },
  {
    label: 'View',
    items: [
      { id: 'view.toggleSidebar', label: 'Toggle Sidebar', shortcut: 'Cmd+B' },
      { id: 'view.toggleStatusBar', label: 'Toggle Status Bar' },
      { type: 'separator' },
      { id: 'view.zoomIn', label: 'Zoom In', shortcut: 'Cmd+=' },
      { id: 'view.zoomOut', label: 'Zoom Out', shortcut: 'Cmd+-' },
      { id: 'view.resetZoom', label: 'Reset Zoom', shortcut: 'Cmd+0' },
      { type: 'separator' },
      { id: 'view.fullScreen', label: 'Full Screen', shortcut: 'F11' },
    ],
  },
  {
    label: 'Help',
    items: [
      { id: 'help.about', label: 'About' },
      { id: 'help.documentation', label: 'Documentation' },
      { id: 'help.shortcuts', label: 'Keyboard Shortcuts' },
    ],
  },
];

export const MenuBar: React.FC = () => {
  const { isVisible, activeMenu, setActiveMenu } = useMenuStore();
  const menuActionManager = MenuActionManager.getInstance();

  if (!isVisible) return null;

  const handleMenuClick = async (actionId: string) => {
    try {
      await menuActionManager.executeAction(actionId);
      setActiveMenu(null);
    } catch (error) {
      console.error('Failed to execute menu action:', error);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent, actionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMenuClick(actionId);
    }
  };

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
                  <li key={item.id || item.label} role="menuitem">
                    {item.type === 'separator' ? (
                      <hr className="border-t border-vscode-border my-1" />
                    ) : (
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-vscode-accent/10 focus:bg-vscode-accent/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleMenuClick(item.id!)}
                        onKeyDown={(e) => handleMenuKeyDown(e, item.id!)}
                        tabIndex={0}
                        disabled={!menuActionManager.getAction(item.id!)?.enabled}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && <span className="float-right text-xs text-gray-400">{formatShortcut(item.shortcut)}</span>}
                      </button>
                    )}
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
