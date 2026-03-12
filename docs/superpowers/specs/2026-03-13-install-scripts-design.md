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

## GitHub URLs

- Repo: `https://github.com/hiepau1231/Auggie-Promptenahncer`
  **Lưu ý:** Tên repo có typo (`Promptenahncer` thay vì `Promptenhancer`) — đây là tên thật trên GitHub. KHÔNG sửa typo này, sẽ làm hỏng URL.
- Raw URL của enhance.md:
  `https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/claude-code-enhance/enhance.md`
- Scripts pull từ branch `main`.

## Behavior

Cả 2 script thực hiện các bước sau:

1. Tạo `~/.claude/commands/` nếu chưa tồn tại
2. Tải `enhance.md` từ GitHub raw URL → ghi vào `~/.claude/commands/enhance.md`
3. In thông báo thành công hoặc lỗi
4. Exit với code 0 (thành công) hoặc 1 (thất bại)

Không có version checking. Không backup. Chạy lần nào cũng overwrite — dùng được cho cả install lẫn update.

## Error Handling

**install.sh:**
- Dùng `curl -fsSL` (flag `-f` bắt buộc để detect HTTP errors như 404)
- Nếu `curl` không có sẵn → check `wget` làm fallback; nếu cả 2 không có → in lỗi, exit 1
- Nếu `curl`/`wget` trả về non-zero exit code → in lỗi network, exit 1
- Nếu `mkdir -p` fail → in lỗi permissions, exit 1

**install.ps1:**
- Dùng `Invoke-WebRequest` lưu về file temp, sau đó copy vào destination (KHÔNG dùng `irm | iex`)
- Dùng `try/catch` bắt lỗi download và lỗi filesystem
- Nếu fail → in lỗi, exit 1
- Dùng `$env:USERPROFILE` để expand `~` trên Windows

## Usage

**macOS / Linux** (yêu cầu `curl` hoặc `wget`):
```bash
curl -fsSL https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/install.sh | bash
```

**Windows (PowerShell):**

Bước 1 — chỉ cần chạy 1 lần nếu chưa set:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Bước 2 — download và chạy script:
```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/install.ps1 -OutFile install.ps1; .\install.ps1; Remove-Item install.ps1
```

README sẽ ghi chú rõ về execution policy cho Windows users.

## Output

**Thành công (macOS/Linux):**
```
✅ /enhance command installed to ~/.claude/commands/enhance.md
   Try it with: /enhance <your prompt>
```

**Thành công (Windows — hiển thị full path):**
```
✅ /enhance command installed to C:\Users\<name>\.claude\commands\enhance.md
   Try it with: /enhance <your prompt>
```

**Thất bại (network):**
```
❌ Failed to download enhance.md. Check your internet connection.
```

**Thất bại (permissions):**
```
❌ Failed to create directory. Check permissions.
```

**Thất bại (curl/wget không có):**
```
❌ curl or wget is required. Please install one and try again.
```

## Out of Scope

- Version checking / diff
- Backup file cũ trước khi overwrite
- Uninstall script
- Cross-platform single script (Node.js)
