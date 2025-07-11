# PRP-2025-01-27-03-Fix-Cmd-Q-on-Mac

## Overview

**Critical Issue**: The application currently hijacks Cmd+Q, preventing users from quitting the app normally. System hotkeys should remain functional and not be overridden by the application.

**User Impact**: Users cannot quit the application using the standard macOS shortcut, creating a poor user experience and violating platform conventions.

**Priority**: Critical - This violates macOS user experience guidelines and prevents normal application behavior.

## Functional Requirements

### Core Functionality
- Cmd+Q must properly quit the application on macOS
- System hotkeys should not be overridden by application shortcuts
- Application should respect platform-specific keyboard shortcuts
- Quit functionality should work through both menu and keyboard shortcut

### Platform-Specific Behavior
- **macOS**: Cmd+Q should quit the application
- **Windows/Linux**: Ctrl+Q should quit the application (if implemented)
- **Cross-platform**: Respect platform conventions for system shortcuts

### User Experience
- Immediate response to quit command
- Proper cleanup before application exit
- No data loss during quit process
- Consistent behavior with other macOS applications

## Technical Requirements

### Shortcut Management Fixes

#### 1. Platform Detection and Shortcut Mapping
```typescript
// Platform-specific shortcut configuration
enum Platform {
  MAC = 'mac',
  WINDOWS = 'windows',
  LINUX = 'linux'
}

const getPlatform = (): Platform => {
  if (navigator.platform.includes('Mac')) return Platform.MAC;
  if (navigator.platform.includes('Win')) return Platform.WINDOWS;
  return Platform.LINUX;
};

const getQuitShortcut = (): string => {
  const platform = getPlatform();
  return platform === Platform.MAC ? 'Cmd+Q' : 'Ctrl+Q';
};

const getSystemShortcuts = (): string[] => {
  const platform = getPlatform();
  if (platform === Platform.MAC) {
    return ['Cmd+Q', 'Cmd+W', 'Cmd+M', 'Cmd+H'];
  }
  return ['Ctrl+Q', 'Ctrl+W', 'Alt+F4'];
};
```

#### 2. Shortcut Registration and Conflict Resolution
```typescript
// Prevent conflicts with system shortcuts
class ShortcutManager {
  private registeredShortcuts = new Set<string>();
  private systemShortcuts = getSystemShortcuts();
  
  registerShortcut(shortcut: string, action: () => void): boolean {
    // Check if shortcut conflicts with system shortcuts
    if (this.systemShortcuts.includes(shortcut)) {
      console.warn(`Shortcut ${shortcut} conflicts with system shortcut`);
      return false;
    }
    
    // Register application shortcut
    this.registeredShortcuts.add(shortcut);
    this.bindShortcut(shortcut, action);
    return true;
  }
  
  private bindShortcut(shortcut: string, action: () => void) {
    // Implementation for binding shortcuts
    // Ensure system shortcuts are not overridden
  }
}
```

#### 3. Application Quit Handler
```typescript
// Proper quit handling
const handleQuit = async () => {
  try {
    // Save any unsaved changes
    await saveUnsavedFiles();
    
    // Clean up resources
    await cleanupResources();
    
    // Quit the application
    await invoke('quit_app');
  } catch (error) {
    console.error('Error during quit:', error);
    // Force quit if cleanup fails
    await invoke('quit_app');
  }
};

// Register quit shortcut
shortcutManager.registerShortcut(getQuitShortcut(), handleQuit);
```

### Integration Points
- `src/services/shortcutManager.ts` - Shortcut management system
- `src/hooks/useShortcuts.ts` - Shortcut hook implementation
- `src/stores/appStore.ts` - Application state management
- `src-tauri/src/main.rs` - Tauri backend quit handling

## Testing Requirements

### Unit Tests
```typescript
describe('ShortcutManager', () => {
  it('should detect platform correctly', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });
    
    expect(getPlatform()).toBe(Platform.MAC);
    expect(getQuitShortcut()).toBe('Cmd+Q');
  });
  
  it('should prevent system shortcut conflicts', () => {
    const manager = new ShortcutManager();
    const result = manager.registerShortcut('Cmd+Q', () => {});
    
    expect(result).toBe(false);
  });
  
  it('should allow non-system shortcuts', () => {
    const manager = new ShortcutManager();
    const result = manager.registerShortcut('Cmd+S', () => {});
    
    expect(result).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('Quit Functionality', () => {
  it('should quit application on Cmd+Q', async () => {
    const mockQuit = vi.fn();
    vi.mocked(invoke).mockImplementation((cmd) => {
      if (cmd === 'quit_app') {
        mockQuit();
        return Promise.resolve();
      }
      return Promise.resolve();
    });
    
    // Simulate Cmd+Q
    fireEvent.keyDown(document, { key: 'q', metaKey: true });
    
    await waitFor(() => {
      expect(mockQuit).toHaveBeenCalled();
    });
  });
});
```

### E2E Tests
```typescript
describe('Application Quit E2E', () => {
  it('should quit application when Cmd+Q is pressed', async () => {
    await page.goto('http://localhost:1420');
    
    // Press Cmd+Q
    await page.keyboard.press('Meta+Q');
    
    // Verify application quits
    // This would need to be tested in a real application context
  });
});
```

## Non-Functional Requirements

### Performance
- Shortcut registration: <10ms
- Quit response time: <100ms
- Memory cleanup: Complete within 500ms

### Reliability
- No conflicts with system shortcuts
- Proper cleanup on quit
- Graceful handling of quit failures

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Clear shortcut documentation

## Implementation Steps

### Phase 1: Platform Detection
1. **Implement platform detection**
   - Detect macOS vs other platforms
   - Create platform-specific configurations
   - Set up shortcut mapping

2. **Define system shortcuts**
   - List macOS system shortcuts
   - List Windows/Linux system shortcuts
   - Create conflict detection

### Phase 2: Shortcut Management
1. **Update shortcut manager**
   - Add conflict detection
   - Prevent system shortcut registration
   - Implement proper shortcut binding

2. **Fix quit functionality**
   - Implement proper quit handler
   - Add cleanup procedures
   - Handle quit errors gracefully

### Phase 3: Testing and Validation
1. **Implement tests**
   - Test platform detection
   - Test shortcut conflicts
   - Test quit functionality

2. **Manual testing**
   - Test on macOS
   - Verify Cmd+Q works
   - Check other system shortcuts

### Phase 4: Build Verification
1. **Build and test**
   - Run `npm run tauri build`
   - Test quit functionality
   - Verify no conflicts

## Risks and Mitigation

### High Risk: Platform-Specific Issues
**Risk**: Different platforms may have different shortcut behaviors.
**Mitigation**: 
- Comprehensive platform detection
- Platform-specific testing
- Fallback behaviors

### Medium Risk: Shortcut Conflicts
**Risk**: Application shortcuts may conflict with system shortcuts.
**Mitigation**:
- Comprehensive conflict detection
- Clear documentation of shortcuts
- User-configurable shortcuts

### Low Risk: Performance Impact
**Risk**: Shortcut management may impact performance.
**Mitigation**:
- Efficient shortcut registration
- Minimal overhead
- Proper cleanup

## Success Criteria

### Functional Success
- [ ] Cmd+Q properly quits the application on macOS
- [ ] No conflicts with system shortcuts
- [ ] Proper cleanup on quit
- [ ] Cross-platform compatibility

### Technical Success
- [ ] All tests pass
- [ ] No shortcut conflicts
- [ ] Proper error handling
- [ ] Clean code structure

### Quality Success
- [ ] Platform-specific behavior
- [ ] Proper documentation
- [ ] User-friendly experience
- [ ] Consistent with platform conventions

## Dependencies

### Internal Dependencies
- Shortcut manager implementation
- Application state management
- Tauri backend quit handling

### External Dependencies
- Tauri invoke API
- Platform detection APIs
- Keyboard event handling

## Notes

This PRP addresses a critical user experience issue. The fix should prioritize user expectations and platform conventions over application-specific functionality.

## References

- [macOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos/overview/themes/)
- [Tauri Application Lifecycle](https://tauri.app/v1/api/js/app/)
- [Keyboard Event Handling](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) 
