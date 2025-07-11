import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';
import { useAppStore } from './stores/appStore';
import { useFileStore } from './stores/fileStore';

function App() {
  const { 
    initializeApp, 
    isLoading, 
    error: appError, 
    saveState,
    sidebarWidth,
    isSidebarCollapsed,
    preferences
  } = useAppStore();

  const { 
    error: fileError,
    clearError
  } = useFileStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    // Save state on app close
    const handleBeforeUnload = () => {
      saveState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveState]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const error = appError || fileError;

  return (
    <ErrorBoundary>
      <div className={`h-screen ${preferences.theme === 'dark' ? 'dark' : ''}`}>
        <Layout
          sidebarWidth={sidebarWidth}
          isSidebarCollapsed={isSidebarCollapsed}
          onSidebarToggle={() => {}} // Will be implemented
          onSidebarResize={() => {}} // Will be implemented
        />
        
        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="ml-4 text-white hover:text-gray-200">
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App; 
