# Scratch Editor Architecture

## Overview
Scratch is a desktop text editor built with React, TypeScript, and Tauri.

## Architecture Layers

### 1. Presentation Layer (Components)
- **Location**: `src/components/`
- **Responsibility**: UI rendering and user interactions
- **Pattern**: Functional components with hooks

### 2. State Management Layer (Stores)
- **Location**: `src/stores/`
- **Responsibility**: Application state and business logic
- **Pattern**: Zustand stores with persistence

### 3. Service Layer (Utilities)
- **Location**: `src/utils/`
- **Responsibility**: File system operations, language detection
- **Pattern**: Singleton classes and utility functions

### 4. Native Integration Layer (Tauri)
- **Location**: `src-tauri/`
- **Responsibility**: Desktop integration and file system access
- **Pattern**: Rust backend with Tauri APIs

## State Management Strategy

### Store Responsibilities
- **AppStore**: Global app state, preferences, window state
- **FileStore**: File system operations, current folder, file tree
- **TabStore**: Tab management, tab groups, tab persistence
- **EditorStore**: Editor instances, content, editor settings

### Store Coordination
- Use `useStoreCoordination()` hook for cross-store operations
- Avoid direct store-to-store dependencies
- Implement proper error handling and rollback mechanisms

## Performance Considerations

### File System
- Implement virtual scrolling for large file trees
- Use file watchers sparingly and clean up properly
- Cache file content for frequently accessed files

### Editor
- Lazy load Monaco Editor instances
- Implement proper cleanup for editor resources
- Use debouncing for auto-save operations

### Memory Management
- Dispose of file watchers on component unmount
- Clear editor instances when tabs are closed
- Implement proper cleanup in useEffect hooks

## Component Architecture

### Common Components
- **ErrorBoundary**: Catches and handles component errors
- **LoadingSpinner**: Consistent loading states
- **ConfirmDialog**: User confirmations

### Layout Components
- **Layout**: Main application layout
- **Sidebar**: File explorer and navigation
- **Tabs**: Tab management interface
- **Editor**: Monaco editor integration

## Error Handling Strategy

### Component Level
- Use ErrorBoundary for component errors
- Implement proper error states
- Provide user-friendly error messages

### Store Level
- Implement proper error handling in async operations
- Use try-catch blocks for file operations
- Log errors appropriately

### Application Level
- Global error handling for uncaught errors
- Graceful degradation for missing features
- Recovery mechanisms for corrupted state

## Testing Strategy

### Unit Tests
- Test utilities and hooks
- Mock external dependencies
- Test store actions and state changes

### Integration Tests
- Test store interactions
- Test component integration
- Test file system operations

### E2E Tests
- Test complete user workflows
- Test file operations
- Test editor functionality

## Performance Optimization

### Code Splitting
- Lazy load components
- Split stores by functionality
- Use dynamic imports for heavy dependencies

### Memory Management
- Implement proper cleanup
- Use weak references where appropriate
- Monitor memory usage

### Caching Strategy
- Cache file content
- Cache language detection results
- Implement LRU cache for frequently accessed data

## Security Considerations

### File System Access
- Validate file paths
- Sanitize user input
- Implement proper permissions

### Data Validation
- Validate file content
- Sanitize user data
- Implement proper type checking

## Future Enhancements

### Plugin System
- Modular architecture for extensions
- Plugin API design
- Extension marketplace

### Advanced Features
- Git integration
- Terminal integration
- Advanced search and replace
- Multi-cursor editing 
