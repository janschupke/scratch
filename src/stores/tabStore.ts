import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tab, TabGroup, TabState } from '../types/tabs';

interface TabStore extends TabState {
  // Actions
  addTab: (tab: Omit<Tab, 'id' | 'isActive' | 'lastAccessed'>) => void;
  closeTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  closeTabsToRight: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabAsModified: (tabId: string, isModified: boolean) => void;
  createTabGroup: (name: string) => void;
  moveTabToGroup: (tabId: string, groupId: string) => void;
  closeTabGroup: (groupId: string) => void;
  setActiveGroupId: (groupId: string) => void;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      tabGroups: [],
      activeGroupId: null,
      tabOrder: [],

      addTab: (tabData) => {
        const { tabs, tabOrder } = get();
        const newTab: Tab = {
          ...tabData,
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isActive: false,
          lastAccessed: Date.now(),
        };

        const updatedTabs = [...tabs, newTab];
        const updatedOrder = [...tabOrder, newTab.id];

        set({
          tabs: updatedTabs,
          tabOrder: updatedOrder,
          activeTabId: newTab.id,
        });

        // Update active states
        set({
          tabs: updatedTabs.map(t => ({ ...t, isActive: t.id === newTab.id }))
        });
      },

      closeTab: (tabId) => {
        const { tabs, activeTabId, tabOrder } = get();
        const updatedTabs = tabs.filter(tab => tab.id !== tabId);
        const updatedOrder = tabOrder.filter(id => id !== tabId);

        let newActiveTabId = activeTabId;
        if (activeTabId === tabId) {
          const currentIndex = tabOrder.indexOf(tabId);
          const nextTab = updatedOrder[currentIndex] || updatedOrder[currentIndex - 1];
          newActiveTabId = nextTab || null;
        }

        set({
          tabs: updatedTabs.map(t => ({ ...t, isActive: t.id === newActiveTabId })),
          activeTabId: newActiveTabId,
          tabOrder: updatedOrder,
        });
      },

      closeOtherTabs: (tabId) => {
        const { tabs } = get();
        const updatedTabs = tabs.filter(tab => tab.id === tabId);
        const updatedOrder = [tabId];

        set({
          tabs: updatedTabs.map(t => ({ ...t, isActive: true })),
          activeTabId: tabId,
          tabOrder: updatedOrder,
        });
      },

      closeAllTabs: () => {
        set({
          tabs: [],
          activeTabId: null,
          tabOrder: [],
        });
      },

      closeTabsToRight: (tabId) => {
        const { tabs, tabOrder } = get();
        const currentIndex = tabOrder.indexOf(tabId);
        const tabsToKeep = tabOrder.slice(0, currentIndex + 1);
        const updatedTabs = tabs.filter(tab => tabsToKeep.includes(tab.id));

        set({
          tabs: updatedTabs,
          tabOrder: tabsToKeep,
        });
      },

      setActiveTab: (tabId) => {
        const { tabs } = get();
        set({
          tabs: tabs.map(tab => ({ ...tab, isActive: tab.id === tabId })),
          activeTabId: tabId,
        });
      },

      reorderTabs: (fromIndex: number, toIndex: number) => {
        const { tabOrder, tabs } = get();
        const newOrder = [...tabOrder];
        const [movedTab] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedTab);

        set({
          tabOrder: newOrder,
          tabs: tabs.sort((a, b) => {
            const aIndex = newOrder.indexOf(a.id);
            const bIndex = newOrder.indexOf(b.id);
            return aIndex - bIndex;
          }),
        });
      },

      pinTab: (tabId) => {
        const { tabs } = get();
        set({
          tabs: tabs.map(tab => 
            tab.id === tabId ? { ...tab, isPinned: true } : tab
          ),
        });
      },

      unpinTab: (tabId) => {
        const { tabs } = get();
        set({
          tabs: tabs.map(tab => 
            tab.id === tabId ? { ...tab, isPinned: false } : tab
          ),
        });
      },

      updateTabContent: (tabId, content) => {
        const { tabs } = get();
        const preview = content.split('\n').slice(0, 3).join('\n');
        
        set({
          tabs: tabs.map(tab => 
            tab.id === tabId 
              ? { ...tab, preview, lastAccessed: Date.now() }
              : tab
          ),
        });
      },

      markTabAsModified: (tabId, isModified) => {
        const { tabs } = get();
        set({
          tabs: tabs.map(tab => 
            tab.id === tabId ? { ...tab, isModified } : tab
          ),
        });
      },

      createTabGroup: (name) => {
        const { tabGroups } = get();
        const newGroup: TabGroup = {
          id: `group-${Date.now()}`,
          name,
          tabs: [],
          isActive: false,
        };

        set({
          tabGroups: [...tabGroups, newGroup],
          activeGroupId: newGroup.id,
        });
      },

      moveTabToGroup: (tabId, groupId) => {
        const { tabs, tabGroups } = get();
        const updatedGroups = tabGroups.map(group => {
          if (group.id === groupId) {
            const tab = tabs.find(t => t.id === tabId);
            return tab ? { ...group, tabs: [...group.tabs, tab] } : group;
          }
          return { ...group, tabs: group.tabs.filter(t => t.id !== tabId) };
        });

        set({ tabGroups: updatedGroups });
      },

      closeTabGroup: (groupId) => {
        const { tabGroups, tabs, activeTabId } = get();
        const group = tabGroups.find(g => g.id === groupId);
        if (!group) return;

        const tabIdsToClose = group.tabs.map(t => t.id);
        const updatedTabs = tabs.filter(tab => !tabIdsToClose.includes(tab.id));
        
        let newActiveTabId = activeTabId;
        if (tabIdsToClose.includes(activeTabId!)) {
          newActiveTabId = updatedTabs[0]?.id || null;
        }

        set({
          tabs: updatedTabs.map(t => ({ ...t, isActive: t.id === newActiveTabId })),
          activeTabId: newActiveTabId,
          tabGroups: tabGroups.filter(g => g.id !== groupId),
        });
      },

      setActiveGroupId: (groupId) => {
        set({ activeGroupId: groupId });
      },
    }),
    {
      name: 'tab-storage',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        tabOrder: state.tabOrder,
      }),
    }
  )
); 
