#!/usr/bin/env bash

ENHANCE_URL="https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/claude-code-enhance/enhance.md"
DEST_DIR="$HOME/.claude/commands"
DEST_FILE="$DEST_DIR/enhance.md"
TEMP_FILE="/tmp/enhance_tmp_$$.md"

# Create destination directory
if ! mkdir -p "$DEST_DIR" 2>/dev/null; then
  echo "❌ Failed to create directory. Check permissions."
  exit 1
fi

# Download to temp file first (atomic install/update)
if command -v curl &>/dev/null; then
  if ! curl -fsSL "$ENHANCE_URL" -o "$TEMP_FILE"; then
    echo "❌ Failed to download enhance.md. Check your internet connection."
    rm -f "$TEMP_FILE"
    exit 1
  fi
elif command -v wget &>/dev/null; then
  if ! wget -q "$ENHANCE_URL" -O "$TEMP_FILE"; then
    echo "❌ Failed to download enhance.md. Check your internet connection."
    rm -f "$TEMP_FILE"
    exit 1
  fi
else
  echo "❌ curl or wget is required. Please install one and try again."
  exit 1
fi

# Move temp file to destination (atomic)
if ! mv "$TEMP_FILE" "$DEST_FILE" 2>/dev/null; then
  echo "❌ Failed to install enhance.md. Check permissions."
  rm -f "$TEMP_FILE"
  exit 1
fi

echo "✅ /enhance command installed to $DEST_FILE"
echo "   Try it with: /enhance <your prompt>"