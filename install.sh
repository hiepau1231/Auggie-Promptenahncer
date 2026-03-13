#!/usr/bin/env bash

ENHANCE_URL="https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/claude-code-enhance/enhance.md"
DEST_DIR="$HOME/.claude/commands"
DEST_FILE="$DEST_DIR/enhance.md"

# Create destination directory
if ! mkdir -p "$DEST_DIR" 2>/dev/null; then
  echo "❌ Failed to create directory. Check permissions."
  exit 1
fi

# Download enhance.md (curl preferred, wget fallback)
if command -v curl &>/dev/null; then
  if ! curl -fsSL "$ENHANCE_URL" -o "$DEST_FILE"; then
    echo "❌ Failed to download enhance.md. Check your internet connection."
    exit 1
  fi
elif command -v wget &>/dev/null; then
  if ! wget -q "$ENHANCE_URL" -O "$DEST_FILE"; then
    echo "❌ Failed to download enhance.md. Check your internet connection."
    exit 1
  fi
else
  echo "❌ curl or wget is required. Please install one and try again."
  exit 1
fi

echo "✅ /enhance command installed to $DEST_FILE"
echo "   Try it with: /enhance <your prompt>"
