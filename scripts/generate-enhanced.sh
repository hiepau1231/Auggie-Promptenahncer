#!/usr/bin/env bash
# generate-enhanced.sh
# Generate enhanced version of any Claude Code slash command
# Usage: ./generate-enhanced.sh <skill-name>

set -e

SKILL_NAME="${1:-}"
if [ -z "$SKILL_NAME" ]; then
    echo "Usage: ./generate-enhanced.sh <skill-name>"
    echo "Example: ./generate-enhanced.sh vibecode"
    exit 1
fi

COMMANDS_DIR="$HOME/.claude/commands"
SKILL_FILE="$COMMANDS_DIR/$SKILL_NAME.md"
OUTPUT_FILE="$COMMANDS_DIR/enhance-$SKILL_NAME.md"

# Check if skill exists
if [ ! -f "$SKILL_FILE" ]; then
    echo "❌ Error: Skill '$SKILL_NAME' not found at $SKILL_FILE"
    echo "Available skills:"
    ls -1 "$COMMANDS_DIR"/*.md 2>/dev/null | xargs -n1 basename | sed 's/.md$//' | grep -v "^enhance" | head -10
    exit 1
fi

# Read skill content
CONTENT=$(cat "$SKILL_FILE")

# Parse frontmatter and body
if [[ "$CONTENT" =~ ^---$'\n'(.*)$'\n'---$'\n'(.*)$ ]]; then
    FRONTMATTER="${BASH_REMATCH[1]}"
    BODY="${BASH_REMATCH[2]}"
else
    echo "❌ Error: Could not parse frontmatter from $SKILL_FILE"
    exit 1
fi

# Extract description
DESCRIPTION=$(echo "$FRONTMATTER" | grep -E "^description:" | sed 's/^description:\s*["'"'"']\?//;s/["'"'"']\s*$//' || echo "")

SKILL_UPPER=$(echo "$SKILL_NAME" | tr '[:lower:]' '[:upper:]')

# Generate enhanced command
cat > "$OUTPUT_FILE" << EOF
---
name: enhance-$SKILL_NAME
description: Enhance prompt then run $SKILL_NAME - $DESCRIPTION
---

You are a prompt engineering expert with access to the current codebase.

Prompt to process: \$ARGUMENTS

## STEP 1: ENHANCE

Analyze the prompt. If it mentions project names, files, features, or technologies:
- Use Glob/Grep/Read tools to find related files in the current workspace
- Read key files (package.json, main entry points, related source files)
- Extract: tech stack, file structure, function names, patterns used

Rewrite the prompt to be:
- **Clearer**: Remove ambiguity, use precise language
- **More specific**: Add concrete details from codebase context (file paths, function names, tech stack)
- **Actionable**: Structure so AI can execute immediately without asking more questions
- **Language preserved**: If original prompt is in Vietnamese -> output in Vietnamese. If English -> English.

Display the enhanced prompt:
> **Enhanced Prompt:** <enhanced prompt>

---

## STEP 2: $SKILL_UPPER

Now execute $SKILL_NAME logic with the enhanced prompt:

$BODY

---

> Enhanced from: "\$ARGUMENTS"
EOF

echo "=========================================="
echo "✅ Generated: enhance-$SKILL_NAME.md"
echo "   Location: $OUTPUT_FILE"
echo "=========================================="
echo ""
echo "Usage: /enhance-$SKILL_NAME <your prompt>"