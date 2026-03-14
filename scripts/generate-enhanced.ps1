# generate-enhanced.ps1
# Generate enhanced version of any Claude Code slash command
# Usage: ./generate-enhanced.ps1 <skill-name>

param(
    [Parameter(Mandatory=$true)]
    [string]$SkillName
)

$ErrorActionPreference = "Stop"

# Paths
$CommandsDir = "$env:USERPROFILE\.claude\commands"
$SkillFile = "$CommandsDir\$SkillName.md"
$OutputFile = "$CommandsDir\enhance-$SkillName.md"

# Check if skill exists
if (-not (Test-Path $SkillFile)) {
    Write-Host "❌ Error: Skill '$SkillName' not found at $SkillFile" -ForegroundColor Red
    Write-Host "Available skills:"
    Get-ChildItem $CommandsDir -Filter "*.md" | 
        Where-Object { $_.BaseName -notlike "enhance*" } |
        ForEach-Object { Write-Host "  - $($_.BaseName)" }
    exit 1
}

# Read skill content
$Content = Get-Content $SkillFile -Raw

# Parse frontmatter and body
if ($Content -match '(?s)^---\r?\n(.*?)\r?\n---\r?\n(.*)$') {
    $Frontmatter = $Matches[1]
    $Body = $Matches[2].Trim()
} else {
    Write-Host "❌ Error: Could not parse frontmatter from $SkillFile" -ForegroundColor Red
    exit 1
}

# Extract description from frontmatter
$Description = ""
if ($Frontmatter -match 'description:\s*["'']?(.+?)["'']?\s*$') {
    $Description = $Matches[1].Trim('"').Trim("'")
}

$SkillNameUpper = $SkillName.ToUpper()

# Generate enhanced command content
$EnhancedContent = @"
---
name: enhance-$SkillName
description: Enhance prompt then run $SkillName - $Description
---

You are a prompt engineering expert with access to the current codebase.

Prompt to process: ``$ARGUMENTS

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

## STEP 2: $SkillNameUpper

Now execute $SkillName logic with the enhanced prompt:

$Body

---

> Enhanced from: "``$ARGUMENTS"
"@

# Write output with UTF-8 encoding (no BOM)
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText($OutputFile, $EnhancedContent, $Utf8NoBomEncoding)

Write-Host "=========================================="
Write-Host "✅ Generated: enhance-$SkillName.md" -ForegroundColor Green
Write-Host "   Location: $OutputFile"
Write-Host "=========================================="
Write-Host ""
Write-Host "Usage: /enhance-$SkillName <your prompt>"