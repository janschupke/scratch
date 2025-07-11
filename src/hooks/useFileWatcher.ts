import { useEffect, useRef, useCallback } from 'react';
import { useFileStore } from '../stores/fileStore';

export function useFileWatcher(folderPath: string | null) {
  const { loadFileTree } = useFileStore();
  const watcherRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Memoize the loadFileTree function to prevent unnecessary re-renders
  const memoizedLoadFileTree = useCallback(loadFileTree, [loadFileTree]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!folderPath) {
      return;
    }

    // Set up file system watcher
    const setupWatcher = async () => {
      try {
        // This would use Tauri's file system watching capabilities
        // Implementation depends on Tauri's file watching API
        console.log('Setting up file watcher for:', folderPath);
        
        // For now, just log the setup
        // TODO: Implement actual file watching when Tauri API is available
        
        // Store watcher reference for cleanup
        watcherRef.current = {
          path: folderPath,
          close: () => {
            console.log('Cleaning up file watcher for:', folderPath);
          }
        };
      } catch (error) {
        console.error('Failed to setup file watcher:', error);
      }
    };

    setupWatcher();

    // Cleanup function
    return () => {
      if (watcherRef.current && isMountedRef.current) {
        try {
          watcherRef.current.close();
        } catch (error) {
          console.error('Error cleaning up file watcher:', error);
        }
        watcherRef.current = null;
      }
    };
  }, [folderPath, memoizedLoadFileTree]);

  return null;
} 
