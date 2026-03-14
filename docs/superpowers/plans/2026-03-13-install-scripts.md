# Install Scripts Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo `install.sh` và `install.ps1` cho phép người dùng cài đặt hoặc update `/enhance` command chỉ bằng 1 lệnh, không cần clone repo.

**Architecture:** Hai script độc lập (bash + PowerShell) tải `enhance.md` từ GitHub raw URL về `~/.claude/commands/`. Không có dependencies. README được cập nhật với install instructions.

**Tech Stack:** bash, PowerShell, curl, wget (fallback), Invoke-WebRequest

---

## Chunk 1: install.sh

### Task 1: Tạo install.sh

**Files:**
- Create: `install.sh`

- [ ] **Step 1: Tạo file install.sh**

```bash
#!/usr/bin/env bash

ENHANCE_URL="https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenhancer/main/claude-code-enhance/enhance.md"
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
```

Note: Không dùng `set -e` — dùng explicit `if ! ...; then exit 1` để kiểm soát error messages rõ ràng.

- [ ] **Step 2: Cấp quyền execute**

```bash
chmod +x install.sh
```

- [ ] **Step 3: Verify syntax**

```bash
bash -n install.sh
```
Expected: không có output (không có lỗi syntax)

---

## Chunk 2: install.ps1

### Task 2: Tạo install.ps1

**Files:**
- Create: `install.ps1`

- [ ] **Step 1: Tạo file install.ps1**

Download về temp file trước, sau đó move vào destination để tránh để lại partial file nếu download thất bại.

```powershell
$ErrorActionPreference = "Stop"

$EnhanceUrl = "https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenhancer/main/claude-code-enhance/enhance.md"
$DestDir = Join-Path $env:USERPROFILE ".claude\commands"
$DestFile = Join-Path $DestDir "enhance.md"
$TempFile = Join-Path $env:TEMP "enhance_tmp_$([System.IO.Path]::GetRandomFileName()).md"

# Create destination directory
try {
    New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
} catch {
    Write-Host "❌ Failed to create directory. Check permissions."
    exit 1
}

# Download to temp file first
try {
    Invoke-WebRequest -Uri $EnhanceUrl -OutFile $TempFile -UseBasicParsing
} catch {
    Write-Host "❌ Failed to download enhance.md. Check your internet connection."
    if (Test-Path $TempFile) { Remove-Item $TempFile -Force }
    exit 1
}

# Move temp file to destination
try {
    Move-Item -Path $TempFile -Destination $DestFile -Force
} catch {
    Write-Host "❌ Failed to create directory. Check permissions."
    if (Test-Path $TempFile) { Remove-Item $TempFile -Force }
    exit 1
}

Write-Host "✅ /enhance command installed to $DestFile"
Write-Host "   Try it with: /enhance <your prompt>"
```

- [ ] **Step 2: Verify syntax (PowerShell parser)**

```powershell
powershell -NoProfile -Command "$errors = $null; [System.Management.Automation.Language.Parser]::ParseFile('install.ps1', [ref]$null, [ref]$errors); if ($errors) { $errors } else { 'No syntax errors' }"
```
Expected: `No syntax errors`

---

## Chunk 3: Update README.md

### Task 3: Thêm section Claude Code vào README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Thêm section sau dòng `---` đầu tiên (dòng 21) trong README**

Tìm dòng:
```
---

## Tính năng
```

Chèn đoạn sau vào TRƯỚC `## Tính năng`:

```markdown
## Claude Code — Lệnh /enhance

Nếu bạn dùng [Claude Code](https://claude.ai/code) thay vì VS Code extension, cài đặt lệnh `/enhance` bằng 1 lệnh:

**macOS / Linux** (yêu cầu `curl` hoặc `wget`):

    curl -fsSL https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenhancer/main/install.sh | bash

**Windows (PowerShell):**

Chạy lần đầu để cho phép scripts (chỉ cần 1 lần):

    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

Sau đó cài đặt:

    Invoke-WebRequest -Uri https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenhancer/main/install.ps1 -OutFile install.ps1; .\install.ps1; Remove-Item install.ps1

Sau khi cài xong, dùng trong bất kỳ project nào:

    /enhance <prompt của bạn>

> Lệnh này hoạt động cho cả install lẫn update — chạy lại bất cứ lúc nào để lấy phiên bản mới nhất.

---
```

---

## Chunk 4: Smoke test

### Task 4: Verify toàn bộ

- [ ] **Step 1: Kiểm tra install.sh tồn tại và có quyền execute**

```bash
ls -la install.sh
```
Expected: có `x` trong permissions (e.g., `-rwxr-xr-x`)

- [ ] **Step 2: Kiểm tra install.ps1 tồn tại**

```bash
ls -la install.ps1
```

- [ ] **Step 3: Test install.sh error handling**

Test với URL không tồn tại (404):

```bash
sed 's|hiepau1231/Auggie-Promptenhancer|invalid-user/invalid-repo-404|' install.sh | bash
echo "Exit code: $?"
```
Expected:
```
❌ Failed to download enhance.md. Check your internet connection.
Exit code: 1
```

Note: Script currently shows generic error message. Future improvement: distinguish HTTP errors (404, 403) from network errors.

- [ ] **Step 4: Test actual install.sh workflow**

Run the actual installer and verify destination:

```bash
./install.sh
ls -la ~/.claude/commands/enhance.md
head -5 ~/.claude/commands/enhance.md
```
Expected: File exists with correct content (starts with `---`)

- [ ] **Step 5: Test update workflow (rerun)**

Run installer again to verify update behavior:

```bash
./install.sh
echo "Exit code: $?"
```
Expected: Exit code 0, file updated successfully

- [ ] **Step 6: Test install.ps1 workflow (Windows)**

First, ensure script execution is allowed (if not already configured):

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Then run the PowerShell installer:

```powershell
.\install.ps1
Test-Path "$env:USERPROFILE\.claude\commands\enhance.md"
Get-Content "$env:USERPROFILE\.claude\commands\enhance.md" | Select-Object -First 5
```
Expected: File exists with correct content (starts with `---`)

- [ ] **Step 7: Test install.ps1 update workflow (rerun)**

Run installer again to verify update behavior:

```powershell
.\install.ps1
echo $LASTEXITCODE
```
Expected: Exit code 0, file updated successfully

- [ ] **Step 8: Kiểm tra README chứa cả 2 install commands**

```bash
grep "install.sh" README.md && echo "install.sh OK"
grep "install.ps1" README.md && echo "install.ps1 OK"
```
Expected: cả 2 dòng đều in ra

---

## Commit Strategy

**Single commit after all validation passes:**

```bash
git add install.sh install.ps1 README.md
git commit -m "feat: add install scripts for /enhance command

- Add install.sh for macOS/Linux with atomic temp-file download
- Add install.ps1 for Windows with error handling
- Update README with one-command install instructions"
```

Note: Do NOT commit per chunk. All files are committed together after smoke tests pass.
