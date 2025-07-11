# PRP-2025-01-27-04-Update-Hotkey-Notation

## Overview

**Critical Issue**: Current hotkey display shows "Ctrl + letter" but should show "Cmd + letter" on Mac by default. This creates confusion for users who expect platform-appropriate keyboard shortcuts.

**User Impact**: Users see incorrect keyboard shortcuts that don't match their platform, leading to confusion and poor user experience.

**Priority**: Critical - This affects user understanding of available shortcuts and violates platform conventions.

## Functional Requirements

### Core Functionality
- Display platform-appropriate keyboard shortcuts
- Show "Cmd + letter" on macOS
- Show "Ctrl + letter" on Windows/Linux
- Maintain consistency across all UI elements
- Support dynamic platform detection

### Display Requirements
- **Menu Items**: Show correct platform shortcuts
- **Tooltips**: Display appropriate key combinations
- **Status Bar**: Show current shortcuts
- **Help/Documentation**: Platform-specific shortcut lists

### User Experience
- Immediate visual feedback of correct shortcuts
- Consistent shortcut display throughout application
- Clear indication of platform-specific behavior
- Intuitive shortcut recognition

## Technical Requirements

### Platform-Specific Shortcut Display

#### 1. Shortcut Formatting Utility
```typescript
// Platform-specific shortcut formatting
enum Platform {
  MAC = 'mac',
  WINDOWS = 'windows',
  LINUX = 'linux'
}

interface ShortcutConfig {
  mac: string;
  windows: string;
  linux: string;
}

const formatShortcut = (shortcut: string): string => {
  const platform = getPlatform();
  
  // Convert generic shortcuts to platform-specific
  const shortcuts: Record<string, ShortcutConfig> = {
    'Ctrl+S': { mac: 'Cmd+S', windows: 'Ctrl+S', linux: 'Ctrl+S' },
    'Ctrl+O': { mac: 'Cmd+O', windows: 'Ctrl+O', linux: 'Ctrl+O' },
    'Ctrl+N': { mac: 'Cmd+N', windows: 'Ctrl+N', linux: 'Ctrl+N' },
    'Ctrl+W': { mac: 'Cmd+W', windows: 'Ctrl+W', linux: 'Ctrl+W' },
    'Ctrl+Q': { mac: 'Cmd+Q', windows: 'Ctrl+Q', linux: 'Ctrl+Q' },
    'Ctrl+Z': { mac: 'Cmd+Z', windows: 'Ctrl+Z', linux: 'Ctrl+Z' },
    'Ctrl+Y': { mac: 'Cmd+Y', windows: 'Ctrl+Y', linux: 'Ctrl+Y' },
    'Ctrl+X': { mac: 'Cmd+X', windows: 'Ctrl+X', linux: 'Ctrl+X' },
    'Ctrl+C': { mac: 'Cmd+C', windows: 'Ctrl+C', linux: 'Ctrl+C' },
    'Ctrl+V': { mac: 'Cmd+V', windows: 'Ctrl+V', linux: 'Ctrl+V' },
    'Ctrl+F': { mac: 'Cmd+F', windows: 'Ctrl+F', linux: 'Ctrl+F' },
    'Ctrl+H': { mac: 'Cmd+H', windows: 'Ctrl+H', linux: 'Ctrl+H' },
    'F5': { mac: 'F5', windows: 'F5', linux: 'F5' },
    'F12': { mac: 'F12', windows: 'F12', linux: 'F12' }
  };
  
  const config = shortcuts[shortcut];
  if (!config) return shortcut;
  
  return config[platform];
};

const getPlatform = (): Platform => {
  if (navigator.platform.includes('Mac')) return Platform.MAC;
  if (navigator.platform.includes('Win')) return Platform.WINDOWS;
  return Platform.LINUX;
};
```

#### 2. Menu Item Shortcut Display
```typescript
// Menu item with platform-specific shortcuts
interface MenuItem {
  label: string;
  shortcut?: string;
  action: () => void;
}

const MenuItem: React.FC<{ item: MenuItem }> = ({ item }) => {
  const formattedShortcut = item.shortcut ? formatShortcut(item.shortcut) : '';
  
  return (
    <div className="menu-item" onClick={item.action}>
      <span className="menu-label">{item.label}</span>
      {formattedShortcut && (
        <span className="menu-shortcut">{formattedShortcut}</span>
      )}
    </div>
  );
};
```

#### 3. Tooltip Shortcut Display
```typescript
// Tooltip with platform-specific shortcuts
const ShortcutTooltip: React.FC<{ shortcut: string }> = ({ shortcut }) => {
  const formattedShortcut = formatShortcut(shortcut);
  
  return (
    <div className="tooltip">
      <span>Shortcut: {formattedShortcut}</span>
    </div>
  );
};
```

### Integration Points
- `src/components/MenuBar.tsx` - Menu bar component
- `src/components/Editor/EditorToolbar.tsx` - Editor toolbar
- `src/components/common/` - Common UI components
- `src/utils/shortcutUtils.ts` - Shortcut utility functions

## Testing Requirements

### Unit Tests
```typescript
describe('Shortcut Formatting', () => {
  beforeEach(() => {
    // Mock platform detection
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });
  });
  
  it('should format shortcuts for macOS', () => {
    expect(formatShortcut('Ctrl+S')).toBe('Cmd+S');
    expect(formatShortcut('Ctrl+O')).toBe('Cmd+O');
    expect(formatShortcut('Ctrl+N')).toBe('Cmd+N');
  });
  
  it('should handle unknown shortcuts', () => {
    expect(formatShortcut('Unknown+Key')).toBe('Unknown+Key');
  });
  
  it('should handle shortcuts without modifiers', () => {
    expect(formatShortcut('F5')).toBe('F5');
    expect(formatShortcut('F12')).toBe('F12');
  });
});

describe('Platform Detection', () => {
  it('should detect macOS', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });
    expect(getPlatform()).toBe(Platform.MAC);
  });
  
  it('should detect Windows', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true
    });
    expect(getPlatform()).toBe(Platform.WINDOWS);
  });
  
  it('should detect Linux', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Linux x86_64',
      configurable: true
    });
    expect(getPlatform()).toBe(Platform.LINUX);
  });
});
```

### Integration Tests
```typescript
describe('Menu Display Integration', () => {
  it('should display correct shortcuts in menu items', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });
    
    const menuItems = [
      { label: 'Save', shortcut: 'Ctrl+S' },
      { label: 'Open', shortcut: 'Ctrl+O' }
    ];
    
    render(<MenuBar items={menuItems} />);
    
    expect(screen.getByText('Cmd+S')).toBeInTheDocument();
    expect(screen.getByText('Cmd+O')).toBeInTheDocument();
  });
});
```

### E2E Tests
```typescript
describe('Shortcut Display E2E', () => {
  it('should show platform-appropriate shortcuts', async () => {
    await page.goto('http://localhost:1420');
    
    // Check menu items show correct shortcuts
    const saveShortcut = await page.locator('.menu-shortcut').first();
    const shortcutText = await saveShortcut.textContent();
    
    // Should show Cmd+S on Mac, Ctrl+S on others
    expect(shortcutText).toMatch(/Cmd\+S|Ctrl\+S/);
  });
});
```

## Non-Functional Requirements

### Performance
- Shortcut formatting: <1ms per shortcut
- Platform detection: <1ms
- UI updates: <10ms

### Reliability
- Consistent shortcut display
- Proper platform detection
- Fallback for unknown shortcuts

### Accessibility
- Screen reader support for shortcuts
- Keyboard navigation compatibility
- Clear shortcut descriptions

## Implementation Steps

### Phase 1: Platform Detection
1. **Implement platform detection**
   - Detect macOS vs other platforms
   - Create platform enum
   - Add platform utility functions

2. **Create shortcut mapping**
   - Define common shortcuts
   - Map to platform-specific versions
   - Handle edge cases

### Phase 2: Shortcut Formatting
1. **Implement formatting utility**
   - Create formatShortcut function
   - Add comprehensive shortcut mapping
   - Handle unknown shortcuts

2. **Update UI components**
   - Update menu items
   - Update tooltips
   - Update status bar

### Phase 3: Testing and Validation
1. **Implement tests**
   - Test platform detection
   - Test shortcut formatting
   - Test UI integration

2. **Cross-platform testing**
   - Test on different platforms
   - Verify correct display
   - Check consistency

### Phase 4: Build Verification
1. **Build and test**
   - Run `npm run tauri build`
   - Test on target platforms
   - Verify shortcut display

## Risks and Mitigation

### High Risk: Platform Detection Issues
**Risk**: Platform detection may not work correctly on all systems.
**Mitigation**: 
- Use multiple detection methods
- Add fallback detection
- Comprehensive testing

### Medium Risk: Shortcut Mapping Gaps
**Risk**: Some shortcuts may not be mapped correctly.
**Mitigation**:
- Comprehensive shortcut list
- Fallback to original shortcut
- User feedback for missing mappings

### Low Risk: Performance Impact
**Risk**: Shortcut formatting may impact performance.
**Mitigation**:
- Efficient formatting algorithms
- Caching of formatted shortcuts
- Minimal processing overhead

## Success Criteria

### Functional Success
- [ ] Correct platform shortcuts displayed
- [ ] Consistent shortcut display throughout app
- [ ] Proper platform detection
- [ ] Fallback for unknown shortcuts

### Technical Success
- [ ] All tests pass
- [ ] No performance impact
- [ ] Clean code structure
- [ ] Proper error handling

### Quality Success
- [ ] Platform-appropriate behavior
- [ ] User-friendly display
- [ ] Consistent with platform conventions
- [ ] Comprehensive shortcut coverage

## Dependencies

### Internal Dependencies
- Menu bar component
- Toolbar components
- UI utility functions
- Platform detection utilities

### External Dependencies
- Navigator platform API
- React component system
- CSS styling for shortcuts

## Notes

This PRP ensures users see the correct keyboard shortcuts for their platform, improving usability and reducing confusion. The implementation should be comprehensive and cover all shortcut displays throughout the application.

## References

- [macOS Human Interface Guidelines - Keyboard](https://developer.apple.com/design/human-interface-guidelines/macos/user-interaction/keyboard/)
- [Windows Keyboard Shortcuts](https://support.microsoft.com/en-us/windows/keyboard-shortcuts-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec)
- [Linux Keyboard Shortcuts](https://help.ubuntu.com/stable/ubuntu-help/keyboard-shortcuts.html) 
