# PRP-07: Packaging & Distribution

## Goals
- Automate macOS .app packaging.
- (Optional) Automate code signing/notarization.
- Set up CI/CD pipeline for automated builds.

## Detailed Implementation Steps

### 1. Tauri Build Configuration

**Best Practices:**
- Configure proper app metadata
- Set up code signing certificates
- Implement notarization for macOS
- Create automated build pipeline
- Optimize bundle size

**Enhanced tauri.conf.json:**
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist",
    "withGlobalTauri": false
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
      },
      "app": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "targets": ["app"],
      "identifier": "com.scratch.dev",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": [],
      "externalBin": [],
      "copyright": "",
      "category": "DeveloperTool",
      "shortDescription": "A lightweight code editor",
      "longDescription": "A modern, lightweight code editor built with React and Tauri",
      "deb": {
        "depends": []
      },
      "macOS": {
        "minimumSystemVersion": "10.13.0",
        "exceptionDomain": "",
        "signingIdentity": null,
        "providerShortName": null,
        "entitlements": null,
        "entitlementsInherit": null,
        "provisioningProfile": null,
        "hardenedRuntime": true,
        "notarization": false
      },
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
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
        "minHeight": 600,
        "center": true,
        "decorations": true,
        "transparent": false,
        "alwaysOnTop": false,
        "skipTaskbar": false,
        "visible": true,
        "fileDropEnabled": true,
        "label": "main"
      }
    ]
  }
}
```

### 2. Build Scripts

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:mac": "tauri build --target universal-apple-darwin",
    "tauri:build:mac:arm64": "tauri build --target aarch64-apple-darwin",
    "tauri:build:mac:x64": "tauri build --target x86_64-apple-darwin",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "clean": "rm -rf dist src-tauri/target",
    "clean:all": "npm run clean && rm -rf node_modules src-tauri/target",
    "package:mac": "npm run build && npm run tauri:build:mac",
    "package:mac:universal": "npm run build && npm run tauri:build:mac",
    "package:mac:arm64": "npm run build && npm run tauri:build:mac:arm64",
    "package:mac:x64": "npm run build && npm run tauri:build:mac:x64",
    "sign:mac": "npm run package:mac && codesign --force --deep --sign - src-tauri/target/release/bundle/macos/Scratch.app",
    "notarize:mac": "npm run sign:mac && xcrun notarytool submit src-tauri/target/release/bundle/macos/Scratch.app --apple-id $APPLE_ID --password $APP_PASSWORD --team-id $TEAM_ID",
    "create:dmg": "npm run package:mac && create-dmg src-tauri/target/release/bundle/macos/Scratch.app",
    "release:mac": "npm run clean && npm run package:mac && npm run sign:mac && npm run notarize:mac"
  }
}
```

### 3. Code Signing Setup

**src-tauri/scripts/sign.sh:**
```bash
#!/bin/bash

# Code signing script for macOS
set -e

APP_NAME="Scratch"
BUNDLE_ID="com.scratch.dev"
CERTIFICATE_NAME="Developer ID Application: Your Name (TEAM_ID)"
ENTITLEMENTS_FILE="src-tauri/entitlements.plist"

# Check if certificate exists
if ! security find-identity -v -p codesigning | grep -q "$CERTIFICATE_NAME"; then
    echo "Certificate not found: $CERTIFICATE_NAME"
    echo "Please install your Developer ID certificate"
    exit 1
fi

# Build the app
echo "Building app..."
npm run tauri:build:mac

# Sign the app
echo "Signing app..."
codesign --force --deep --sign "$CERTIFICATE_NAME" \
    --entitlements "$ENTITLEMENTS_FILE" \
    --options runtime \
    "src-tauri/target/release/bundle/macos/$APP_NAME.app"

echo "App signed successfully!"
```

**src-tauri/entitlements.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.files.downloads.read-write</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-only</key>
    <true/>
</dict>
</plist>
```

### 4. Notarization Setup

**src-tauri/scripts/notarize.sh:**
```bash
#!/bin/bash

# Notarization script for macOS
set -e

APP_NAME="Scratch"
BUNDLE_ID="com.scratch.dev"

# Check environment variables
if [ -z "$APPLE_ID" ] || [ -z "$APP_PASSWORD" ] || [ -z "$TEAM_ID" ]; then
    echo "Please set APPLE_ID, APP_PASSWORD, and TEAM_ID environment variables"
    exit 1
fi

# Submit for notarization
echo "Submitting app for notarization..."
xcrun notarytool submit \
    "src-tauri/target/release/bundle/macos/$APP_NAME.app" \
    --apple-id "$APPLE_ID" \
    --password "$APP_PASSWORD" \
    --team-id "$TEAM_ID" \
    --wait

# Staple the notarization ticket
echo "Stapling notarization ticket..."
xcrun stapler staple "src-tauri/target/release/bundle/macos/$APP_NAME.app"

echo "App notarized successfully!"
```

### 5. GitHub Actions CI/CD

**.github/workflows/build.yml:**
```yaml
name: Build and Release

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  release:
    types: [ published ]

env:
  CARGO_TERM_COLOR: always

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          override: true
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint

  build-macos:
    name: Build macOS
    runs-on: macos-latest
    needs: test
    if: github.event_name == 'release' || github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          override: true
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for macOS
        run: npm run tauri:build:mac
      
      - name: Create DMG
        run: |
          brew install create-dmg
          npm run create:dmg
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: macos-app
          path: |
            src-tauri/target/release/bundle/macos/
            *.dmg

  sign-macos:
    name: Sign and Notarize macOS
    runs-on: macos-latest
    needs: build-macos
    if: github.event_name == 'release'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: macos-app
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          override: true
      
      - name: Install dependencies
        run: npm ci
      
      - name: Import certificate
        uses: apple-actions/import-codesigning-certs@v1
        with:
          p12-file-base64: ${{ secrets.MACOS_CERT_P12 }}
          p12-password: ${{ secrets.MACOS_CERT_PASSWORD }}
      
      - name: Sign app
        run: |
          chmod +x src-tauri/scripts/sign.sh
          ./src-tauri/scripts/sign.sh
        env:
          CERTIFICATE_NAME: ${{ secrets.MACOS_CERT_NAME }}
      
      - name: Notarize app
        run: |
          chmod +x src-tauri/scripts/notarize.sh
          ./src-tauri/scripts/notarize.sh
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APP_PASSWORD: ${{ secrets.APP_PASSWORD }}
          TEAM_ID: ${{ secrets.TEAM_ID }}
      
      - name: Upload signed app
        uses: actions/upload-artifact@v4
        with:
          name: macos-signed-app
          path: src-tauri/target/release/bundle/macos/

  release:
    name: Create Release
    runs-on: ubuntu-latest
    needs: [sign-macos]
    if: github.event_name == 'release'
    
    steps:
      - name: Download signed artifacts
        uses: actions/download-artifact@v4
        with:
          name: macos-signed-app
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            *.app
            *.dmg
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 6. Build Optimization

**src-tauri/Cargo.toml optimizations:**
```toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = 'abort'
strip = true

[profile.release.package."*"]
opt-level = 3
lto = true
codegen-units = 1
```

**vite.config.ts optimizations:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          monaco: ['@monaco-editor/react'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

### 7. App Icons and Assets

**Create icons directory structure:**
```
src-tauri/icons/
├── 32x32.png
├── 128x128.png
├── 128x128@2x.png
├── icon.icns
└── icon.ico
```

**Icon generation script (scripts/generate-icons.sh):**
```bash
#!/bin/bash

# Generate app icons from a high-resolution source
# Requires ImageMagick

SOURCE_ICON="assets/icon-1024.png"
ICONS_DIR="src-tauri/icons"

# Create icons directory
mkdir -p "$ICONS_DIR"

# Generate PNG icons
convert "$SOURCE_ICON" -resize 32x32 "$ICONS_DIR/32x32.png"
convert "$SOURCE_ICON" -resize 128x128 "$ICONS_DIR/128x128.png"
convert "$SOURCE_ICON" -resize 256x256 "$ICONS_DIR/128x128@2x.png"

# Generate ICNS for macOS
mkdir -p temp.iconset
convert "$SOURCE_ICON" -resize 16x16 temp.iconset/icon_16x16.png
convert "$SOURCE_ICON" -resize 32x32 temp.iconset/icon_16x16@2x.png
convert "$SOURCE_ICON" -resize 32x32 temp.iconset/icon_32x32.png
convert "$SOURCE_ICON" -resize 64x64 temp.iconset/icon_32x32@2x.png
convert "$SOURCE_ICON" -resize 128x128 temp.iconset/icon_128x128.png
convert "$SOURCE_ICON" -resize 256x256 temp.iconset/icon_128x128@2x.png
convert "$SOURCE_ICON" -resize 256x256 temp.iconset/icon_256x256.png
convert "$SOURCE_ICON" -resize 512x512 temp.iconset/icon_256x256@2x.png
convert "$SOURCE_ICON" -resize 512x512 temp.iconset/icon_512x512.png
convert "$SOURCE_ICON" -resize 1024x1024 temp.iconset/icon_512x512@2x.png

iconutil -c icns temp.iconset -o "$ICONS_DIR/icon.icns"
rm -rf temp.iconset

# Generate ICO for Windows
convert "$SOURCE_ICON" -resize 256x256 "$ICONS_DIR/icon.ico"

echo "Icons generated successfully!"
```

### 8. Distribution Scripts

**scripts/release.sh:**
```bash
#!/bin/bash

# Release script for macOS
set -e

VERSION=$(node -p "require('./package.json').version")
APP_NAME="Scratch"
DMG_NAME="${APP_NAME// /}-${VERSION}-macOS.dmg"

echo "Building release version $VERSION..."

# Clean previous builds
npm run clean

# Build the app
npm run package:mac

# Sign the app (if certificates are available)
if [ -n "$CERTIFICATE_NAME" ]; then
    echo "Signing app..."
    npm run sign:mac
fi

# Notarize the app (if credentials are available)
if [ -n "$APPLE_ID" ] && [ -n "$APP_PASSWORD" ] && [ -n "$TEAM_ID" ]; then
    echo "Notarizing app..."
    npm run notarize:mac
fi

# Create DMG
echo "Creating DMG..."
npm run create:dmg

# Rename DMG
mv "src-tauri/target/release/bundle/macos/${APP_NAME}.dmg" "src-tauri/target/release/bundle/macos/${DMG_NAME}"

echo "Release build complete: $DMG_NAME"
```

## Testing Steps
1. Test local build process
2. Verify app packaging works
3. Test code signing (if certificates available)
4. Verify notarization process
5. Test GitHub Actions workflow
6. Verify DMG creation
7. Test app installation and execution

## Potential Risks & Mitigation

### 1. Code Signing Issues
**Risk:** Invalid or expired certificates
**Mitigation:**
- Use proper certificate management
- Implement certificate validation
- Handle signing errors gracefully

### 2. Notarization Failures
**Risk:** App rejected by Apple
**Mitigation:**
- Follow Apple's guidelines
- Test notarization locally
- Implement proper entitlements

### 3. Build Failures
**Risk:** CI/CD pipeline failures
**Mitigation:**
- Implement proper error handling
- Add build validation
- Use reliable build environments

### 4. Bundle Size
**Risk:** Large app bundle
**Mitigation:**
- Optimize dependencies
- Use tree shaking
- Implement code splitting

## Success Criteria
- [ ] App builds successfully for macOS
- [ ] Code signing works (if certificates available)
- [ ] Notarization succeeds (if credentials available)
- [ ] GitHub Actions workflow runs successfully
- [ ] DMG creation works
- [ ] App installs and runs correctly
- [ ] Bundle size is reasonable

## Next Steps
After completing packaging and distribution, the basic text editor implementation is complete. Consider additional features like:
- Plugin system
- Advanced search and replace
- Git integration
- Terminal integration
- Extensions marketplace 
