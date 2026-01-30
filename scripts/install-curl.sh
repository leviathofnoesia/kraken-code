#!/bin/bash

set -e

VERSION="5.0.0"
PACKAGE_NAME="kraken-code"
REGISTRY_URL="https://registry.npmjs.org"
OPENCODE_DIR="$HOME/.config/opencode"
PLUGINS_DIR="$OPENCODE_DIR/plugins"

echo "======================================"
echo "Kraken Code v${VERSION} Installer"
echo "======================================"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
  echo "Error: curl is required but not installed"
  echo "Install curl from https://curl.se/download.html"
  exit 1
fi

# Check if tar is available
if ! command -v tar &> /dev/null; then
  echo "Error: tar is required but not installed"
  exit 1
fi

# Create plugin directory
echo "Creating plugin directory..."
mkdir -p "$PLUGINS_DIR"

# Download package
echo "Downloading Kraken Code v${VERSION}..."
TEMP_TGZ=$(mktemp)
DOWNLOAD_URL="${REGISTRY_URL}/${PACKAGE_NAME}/-/${PACKAGE_NAME}-${VERSION}.tgz"

if curl -fsSL --max-time 60 -o "$TEMP_TGZ" "$DOWNLOAD_URL"; then
  echo "Download complete"
else
  echo "Error: Failed to download Kraken Code"
  echo "URL: $DOWNLOAD_URL"
  rm -f "$TEMP_TGZ"
  exit 1
fi

# Extract package
echo "Extracting package..."
cd "$PLUGINS_DIR"

if tar -xzf "$TEMP_TGZ"; then
  echo "Extraction complete"
else
  echo "Error: Failed to extract package"
  rm -f "$TEMP_TGZ"
  exit 1
fi

# Verify installation
PACKAGE_DIR="${PLUGINS_DIR}/package"
if [ ! -d "$PACKAGE_DIR" ]; then
  echo "Error: Package directory not found after extraction"
  rm -f "$TEMP_TGZ"
  exit 1
fi

# Clean up
rm -f "$TEMP_TGZ"

# Get kraken-code CLI path
KRAKEN_CLI="$PACKAGE_DIR/dist/cli/index.js"

# Initialize Kraken Code configuration
if [ -f "$KRAKEN_CLI" ]; then
  echo ""
  echo "Initializing Kraken Code configuration..."
  bun run "$KRAKEN_CLI" init --minimal
  if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Kraken Code initialized successfully!"
  else
    echo ""
    echo "⚠️  Initialization failed. Run manually: kraken-code init --minimal"
  fi
else
  echo ""
  echo "⚠️  CLI not found. Run manually: kraken-code init --minimal"
fi

# Get actual package name (might be scoped)
ACTUAL_PACKAGE_NAME=$(ls "$PLUGINS_DIR" | grep -v "^package$" | head -1)

if [ -z "$ACTUAL_PACKAGE_NAME" ]; then
  ACTUAL_PACKAGE_NAME="package"
fi

# Success message
echo ""
echo "======================================"
echo "Installation Complete!"
echo "======================================"
echo ""
echo "Kraken Code v${VERSION} installed to: $PLUGINS_DIR/$ACTUAL_PACKAGE_NAME"
echo ""
echo "Next Steps:"
echo "1. Restart OpenCode to load plugin"
echo "2. Use 'blitz' or 'blz' to activate Blitzkrieg Mode"
echo "3. Run: kraken-code --help for more options"
echo ""
echo "Documentation: https://github.com/leviathofnoesia/kraken-code"
echo ""
