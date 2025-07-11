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
