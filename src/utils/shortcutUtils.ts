// Platform-specific shortcut formatting and detection
export enum Platform {
  MAC = 'mac',
  WINDOWS = 'windows',
  LINUX = 'linux'
}

export const getPlatform = (): Platform => {
  if (typeof navigator !== 'undefined' && navigator.platform.includes('Mac')) return Platform.MAC;
  if (typeof navigator !== 'undefined' && navigator.platform.includes('Win')) return Platform.WINDOWS;
  return Platform.LINUX;
};

interface ShortcutConfig {
  mac: string;
  windows: string;
  linux: string;
}

const shortcutMap: Record<string, ShortcutConfig> = {
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
  'Ctrl+A': { mac: 'Cmd+A', windows: 'Ctrl+A', linux: 'Ctrl+A' },
  'Ctrl+=': { mac: 'Cmd+=', windows: 'Ctrl+=', linux: 'Ctrl+=' },
  'Ctrl+-': { mac: 'Cmd+-', windows: 'Ctrl+-', linux: 'Ctrl+-' },
  'F5': { mac: 'F5', windows: 'F5', linux: 'F5' },
  'F12': { mac: 'F12', windows: 'F12', linux: 'F12' }
};

export const formatShortcut = (shortcut: string): string => {
  const platform = getPlatform();
  const config = shortcutMap[shortcut];
  if (!config) return shortcut;
  return config[platform];
}; 
