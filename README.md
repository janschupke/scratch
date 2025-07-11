**An experiment repo. It doesn't work**

# Scratch Editor

A modern, lightweight, and efficient desktop text/code editor for macOS, inspired by VS Code. Built with React, TypeScript, Zustand, Monaco Editor, Tailwind CSS, and Tauri for native integration and packaging.

## Features
- Open folders and browse files in a sidebar tree view
- Multiple tabs with drag-and-drop, pin, and preview support
- Monaco Editor with syntax highlighting and indentation for many languages
- Persistent state: remembers open folders, files, tabs, and window state
- Fast, resource-efficient, and accessible UI
- Dark theme (VS Code-inspired)
- macOS native packaging and distribution (Tauri)
- Comprehensive automated testing (unit, integration, E2E)

## Tech Stack
- **Frontend:** React, TypeScript, Zustand, Monaco Editor, Tailwind CSS
- **Desktop Integration:** Tauri (Rust backend)
- **Testing:** Vitest, React Testing Library, Playwright
- **Packaging:** Tauri build system, GitHub Actions (optional)

## Getting Started

### Prerequisites
- Node.js (>=18)
- npm (>=9)
- Rust & Cargo (for Tauri)
- macOS (for native packaging)

### Install Dependencies
```bash
npm install
```

### Development (Hot Reload)
```bash
# Start the frontend (Vite)
npm run dev

# In another terminal, start Tauri dev (native window)
npm run tauri:dev
```

### Running Tests
```bash
# Run all tests (unit/integration) in non-watch mode
npm run test:run
```

### Packaging for macOS
```bash
# Build the frontend
npm run build

# Package the app for macOS (universal binary)
npm run tauri:build

# For specific architectures:
npm run tauri:build:mac
npm run tauri:build:mac:arm64
npm run tauri:build:mac:x64
```

**Built Application Location:**
After running `npm run tauri:build`, the macOS app bundle is located at:
```
src-tauri/target/release/bundle/macos/Scratch.app
```

You can:
- Double-click to run the app directly
- Drag to Applications folder for installation
- Use `open src-tauri/target/release/bundle/macos/Scratch.app` to launch from terminal

### Release & Notarization (Optional)
See scripts in `package.json` and `.github/workflows/release.yml` for automated signing, notarization, and DMG creation.

## Project Structure
- `src/` - React app source code
- `src-tauri/` - Tauri (Rust) backend
- `src/components/` - UI components
- `src/stores/` - Zustand state management
- `src/utils/` - Utilities (filesystem, storage, language detection)
- `src/styles/` - Tailwind and design system
- `test/` - Test setup and mocks
- `_PRP/` - Implementation plans and reference docs

## Accessibility & Quality
- WCAG 2.1 AA compliance
- >80% test coverage
- Fast startup and low memory usage

## License
MIT
