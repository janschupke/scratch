import React from 'react';
import { useTabStore } from '../../stores/tabStore';

interface TabContextMenuProps {
  x: number;
  y: number;
  tabId: string;
  onClose: () => void;
}

export const TabContextMenu: React.FC<TabContextMenuProps> = ({
  x,
  y,
  tabId,
  onClose,
}) => {
  const { 
    closeTab, 
    closeOtherTabs, 
    closeTabsToRight, 
    pinTab, 
    unpinTab 
  } = useTabStore();

  const tab = useTabStore(state => state.tabs.find(t => t.id === tabId));
  const tabs = useTabStore(state => state.tabs);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  if (!tab) return null;

  const menuItems = [
    {
      label: 'Close',
      action: () => closeTab(tabId),
      disabled: false,
    },
    {
      label: 'Close Others',
      action: () => closeOtherTabs(tabId),
      disabled: tabs.length <= 1,
    },
    {
      label: 'Close to the Right',
      action: () => closeTabsToRight(tabId),
      disabled: tabs.findIndex(t => t.id === tabId) === tabs.length - 1,
    },
    { label: '---', action: () => {}, disabled: true },
    {
      label: tab.isPinned ? 'Unpin' : 'Pin',
      action: () => tab.isPinned ? unpinTab(tabId) : pinTab(tabId),
      disabled: false,
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="fixed z-50 bg-vscode-sidebar border border-gray-600 rounded shadow-lg py-1 min-w-48"
        style={{ left: x, top: y }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleAction(item.action)}
            disabled={item.disabled}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
              item.label === '---' ? 'border-t border-gray-600 my-1' : ''
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}; 
