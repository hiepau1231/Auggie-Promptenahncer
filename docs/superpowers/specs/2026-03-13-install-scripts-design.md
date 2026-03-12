# Install Scripts Design

**Date:** 2026-03-13
**Status:** Approved

## Problem

Người dùng cuối muốn cài đặt hoặc update `/enhance` command cho Claude Code mà không cần clone repo, không cần Node.js, chỉ cần chạy 1 lệnh duy nhất.

## Solution

Tạo 2 script ở root repo — `install.sh` (macOS/Linux) và `install.ps1` (Windows) — mỗi script tải `enhance.md` thẳng từ GitHub raw URL và đặt vào `~/.claude/commands/`.

## Files

```
install.sh      # macOS / Linux bash script
install.ps1     # Windows PowerShell script
README.md       # Updated với install commands
```

## Behavior

Cả 2 script thực hiện các bước sau:

1. Tạo `~/.claude/commands/` nếu chưa tồn tại
2. Tải `enhance.md` từ GitHub raw URL → ghi vào `~/.claude/commands/enhance.md`
3. In thông báo thành công hoặc lỗi

Không có version checking. Không backup. Chạy lần nào cũng overwrite — dùng được cho cả install lẫn update.

## Usage

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/svsairevanth12/Auggie-Promptenahncer/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/svsairevanth12/Auggie-Promptenahncer/main/install.ps1 | iex
```

## Output

**Thành công:**
```
✅ /enhance command installed to ~/.claude/commands/enhance.md
   Try it with: /enhance <your prompt>
```

**Thất bại:**
```
❌ Failed to download enhance.md. Check your internet connection.
```

## Out of Scope

- Version checking / diff
- Backup file cũ trước khi overwrite
- Uninstall script
- Cross-platform single script (Node.js)
