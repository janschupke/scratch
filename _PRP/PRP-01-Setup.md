# PRP-01: Project Setup

## Goals
- Initialize React + TypeScript project with Vite.
- Add Tailwind CSS.
- Set up Tauri for desktop integration.
- Add scripts for dev, build, and packaging.

## Detailed Implementation Steps

### 1. Initialize Vite Project
```bash
npm create vite@latest scratch -- --template react-ts
cd scratch
npm install
```

**Best Practices:**
- Use Vite for fast HMR and build times
- Choose TypeScript template for type safety
- Use descriptive project name

**Risks:**
- Ensure Node.js version is 16+ for Tauri compatibility
- Verify npm/yarn is properly configured

### 2. Configure Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js Configuration:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VS Code dark theme colors
        'vscode-bg': '#1e1e1e',
        'vscode-sidebar': '#252526',
        'vscode-tabs': '#2d2d30',
        'vscode-text': '#cccccc',
        'vscode-accent': '#007acc',
      }
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode toggle
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar for VS Code-like appearance */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4f4f4f;
}
```

### 3. Install Tauri Dependencies
```bash
npm install @tauri-apps/cli @tauri-apps/api
npx tauri init
```

**Tauri Configuration (tauri.conf.json):**
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Scratch",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "dialog": {
        "all": true
      },
      "fs": {
        "all": true,
        "scope": ["**"]
      },
      "path": {
        "all": true
      },
      "window": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.scratch.dev",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "Scratch",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

### 4. Update package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write .",
    "package:mac": "tauri build --target universal-apple-darwin"
  }
}
```

### 5. Essential Dependencies
```bash
# State management
npm install zustand

# Icons (optional)
npm install lucide-react

# Utilities
npm install lodash-es clsx tailwind-merge

# TypeScript types
npm install -D @types/node

# Testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D @vitest/ui @vitest/coverage-istanbul
npm install -D @playwright/test
npm install -D msw
```

### 6. Project Structure Setup
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── Sidebar/
│   ├── Tabs/
│   └── Editor/
├── hooks/
├── stores/
├── types/
├── utils/
├── styles/           # Design system and styling
├── test/             # Test utilities and setup
├── App.tsx
└── main.tsx
```

### 7. Basic App.tsx Structure
```typescript
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="h-screen bg-vscode-bg text-vscode-text flex">
      {/* Sidebar will go here */}
      <div className="w-64 bg-vscode-sidebar border-r border-gray-700">
        Sidebar
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs will go here */}
        <div className="h-8 bg-vscode-tabs border-b border-gray-700">
          Tabs
        </div>
        
        {/* Editor will go here */}
        <div className="flex-1">
          Editor
        </div>
      </div>
    </div>
  );
}

export default App;
```

## Testing Steps
1. Run `npm run dev` - should open browser with Vite dev server
2. Run `npm run tauri:dev` - should open desktop app
3. Run `npm run build` - should build for production
4. Run `npm run tauri:build` - should create desktop app bundle
5. Run `npm test` - should run unit tests
6. Run `npm run test:coverage` - should generate coverage report
7. Run `npm run test:e2e` - should run E2E tests

## Potential Risks & Mitigation

### 1. Tauri Installation Issues
**Risk:** Rust toolchain not installed or outdated
**Mitigation:** 
- Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Update Rust: `rustup update`
- Verify: `rustc --version`

### 2. macOS Build Dependencies
**Risk:** Missing Xcode Command Line Tools
**Mitigation:**
- Install: `xcode-select --install`
- Verify: `xcode-select -p`

### 3. TypeScript Configuration
**Risk:** TypeScript errors in Tauri integration
**Mitigation:**
- Ensure `tsconfig.json` includes Tauri types
- Add `"@tauri-apps/api"` to types array

### 4. Performance Considerations
**Risk:** Slow development builds
**Mitigation:**
- Use Vite's fast HMR
- Configure Tauri for development mode
- Monitor bundle size with `npm run build`

## Success Criteria
- [ ] Vite dev server runs without errors
- [ ] Tauri desktop app opens successfully
- [ ] Hot reload works in desktop app
- [ ] Production build completes
- [ ] Basic layout renders correctly
- [ ] Dark theme colors are applied
- [ ] Unit tests run successfully
- [ ] Test coverage reporting works
- [ ] E2E tests can be executed

## Next Steps
After completing this setup, proceed to PRP-02 for UI skeleton implementation. 
