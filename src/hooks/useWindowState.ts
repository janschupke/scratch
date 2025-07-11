import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { appWindow } from '@tauri-apps/api/window';

export const useWindowState = () => {
  const { windowState, updateWindowState } = useAppStore();

  useEffect(() => {
    let unlistenResize: (() => void) | undefined;
    let unlistenMove: (() => void) | undefined;

    const saveWindowState = async () => {
      try {
        const position = await appWindow.innerPosition();
        const size = await appWindow.innerSize();
        const isMaximized = await appWindow.isMaximized();
        
        updateWindowState({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          isMaximized,
        });
      } catch (error) {
        console.error('Failed to save window state:', error);
      }
    };

    const setupWindowListeners = async () => {
      try {
        unlistenResize = await appWindow.onResized(saveWindowState);
        unlistenMove = await appWindow.onMoved(saveWindowState);
      } catch (error) {
        console.error('Failed to setup window listeners:', error);
      }
    };

    setupWindowListeners();

    return () => {
      if (unlistenResize) unlistenResize();
      if (unlistenMove) unlistenMove();
    };
  }, [updateWindowState]);

  // Restore window state on app start
  useEffect(() => {
    const restoreWindowState = async () => {
      try {
        if (windowState.isMaximized) {
          await appWindow.maximize();
        } else {
          await appWindow.setPosition({ type: 'Logical', x: windowState.x, y: windowState.y });
          await appWindow.setSize({ type: 'Logical', width: windowState.width, height: windowState.height });
        }
      } catch (error) {
        console.error('Failed to restore window state:', error);
      }
    };

    restoreWindowState();
  }, [windowState]);

  return { windowState };
}; 
