<p align="center">
  <img src="https://raw.githubusercontent.com/svsairevanth12/Auggie-Promptenahncer/main/icon.png" width="128" alt="Prompt Enhancer Logo">
</p>

<h1 align="center">Auggie Prompt Enhancer</h1>

<p align="center">
  <b>Biến đổi các AI prompts mơ hồ thành hướng dẫn rõ ràng, cụ thể</b><br>
  Được hỗ trợ bởi Augment SDK với khả năng nhận biết ngữ cảnh codebase
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=AugieeCredit.auggie-promptenhancer">
    <img src="https://img.shields.io/visual-studio-marketplace/v/AugieeCredit.auggie-promptenhancer?style=flat-square" alt="Version">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=AugieeCredit.auggie-promptenhancer">
    <img src="https://img.shields.io/visual-studio-marketplace/i/AugieeCredit.auggie-promptenhancer?style=flat-square" alt="Installs">
  </a>
</p>

---

## Claude Code — Lệnh /enhance

Nếu bạn dùng [Claude Code](https://claude.ai/code) thay vì VS Code extension, cài đặt lệnh `/enhance` bằng 1 lệnh:

**macOS / Linux** (yêu cầu `curl` hoặc `wget`):

```bash
curl -fsSL https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/install.sh | bash
```

**Windows (PowerShell):**

Chạy lần đầu để cho phép scripts (chỉ cần 1 lần):

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Sau đó cài đặt:

```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/install.ps1 -OutFile install.ps1; .\install.ps1; Remove-Item install.ps1
```

Sau khi cài xong, dùng trong bất kỳ project nào:

```
/enhance <prompt của bạn>
```

> Lệnh này hoạt động cho cả install lẫn update — chạy lại bất cứ lúc nào để lấy phiên bản mới nhất.

### Enhanced Commands — Chain /enhance với skill khác

Muốn gọi `/enhance` kết hợp với skill khác (như `/vibecode`, `/vibecheck`) trong 1 lệnh? Dùng enhanced commands:

```
/enhance-vibecode <prompt>    # Enhance → orchestrate subagents
/enhance-vibecheck <prompt>   # Enhance → feature health check
/enhance-vibefast <prompt>    # Enhance → fast implementation
```

**Thêm skill mới vào enhanced commands:**

1. Tạo skill mới trong `~/.claude/commands/my-skill.md`
2. Chạy generator:

```powershell
# Windows
Invoke-WebRequest -Uri https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/scripts/generate-enhanced.ps1 -OutFile generate-enhanced.ps1
.\generate-enhanced.ps1 my-skill
```

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/scripts/generate-enhanced.sh | bash -s my-skill
```

3. Dùng: `/enhance-my-skill <prompt>`

---

## Tính năng

- ✨ **Cải thiện thông minh** - Biến đổi prompts mơ hồ thành hướng dẫn chi tiết
- 🧠 **Nhận biết Codebase** - Sử dụng ngữ cảnh dự án của bạn để có kết quả tốt hơn
- 📝 **Templates tùy chỉnh** - Tạo và lưu các system prompts của riêng bạn
- 📋 **Tự động Copy** - Prompt đã cải thiện được copy vào clipboard ngay lập tức

---

## Cài đặt

### 1. Cài đặt Extension

**Từ VS Code Marketplace:**
Tìm kiếm "Prompt Enhancer" trong Extensions (`Ctrl+Shift+X`)

**Hoặc từ file VSIX:**
```powershell
code --install-extension auggie-promptenhancer-0.1.0.vsix
```

### 2. Cài đặt Augment CLI

```powershell
npm install -g @augmentcode/auggie@prerelease
```

### 3. Đăng nhập

```powershell
auggie login
```

### 4. Tải lại VS Code

`Ctrl+Shift+P` → "Reload Window"

---

## Cách sử dụng

1. Nhấp vào **✨ Enhance** trên thanh trạng thái (góc dưới bên phải)
2. Nhập prompt của bạn
3. Nhấp **Enhance Prompt**
4. Dán kết quả bằng `Ctrl+V`

---

## Templates tùy chỉnh

Tạo các system prompts của riêng bạn cho các trường hợp sử dụng khác nhau:

| Nút | Chức năng |
|--------|--------|
| ⚙️ | Chỉnh sửa template hiện tại |
| + | Tạo template mới |
| Dropdown | Chuyển đổi giữa các templates |

Templates được lưu cục bộ và duy trì qua các phiên làm việc.

---

## Cấu trúc dự án

```
src/                        # Mã nguồn VS Code extension
  extension.ts              # Entry point chính
  promptEnhancer.ts         # Logic cải thiện prompt với Augment SDK
  inputPanel.ts             # Giao diện webview
  statusBar.ts              # Quản lý thanh trạng thái
claude-code-enhance/        # Claude Code slash command
  enhance.md                # Lệnh /enhance cho Claude Code
  README.md                 # Hướng dẫn cài đặt thủ công
```

---

## Công nghệ sử dụng

- **TypeScript** - Ngôn ngữ lập trình
- **VS Code Extension API** - Framework extension
- **Augment SDK** (@augmentcode/auggie-sdk v0.1.9) - Cải thiện prompt với ngữ cảnh codebase
- **esbuild** - Đóng gói và build

---

## Khắc phục sự cố

| Vấn đề | Giải pháp |
|-------|-----|
| Không tìm thấy CLI | `npm install -g @augmentcode/auggie@prerelease` |
| Lỗi xác thực | `auggie login` |
| Không hoạt động | Tải lại VS Code |
| Extension không khởi động | Kiểm tra Output channel "Prompt Enhancer" |

---

## Phát triển

### Build từ mã nguồn

```bash
npm install
npm run build
```

### Đóng gói extension

```bash
npm run package
```

### Chạy ở chế độ development

```bash
npm run watch
```

---

## Đóng góp

Contributions, issues và feature requests đều được chào đón!

Xem [issues page](https://github.com/svsairevanth12/Auggie-Promptenahncer/issues).

---

## Giấy phép

MIT © [AugieeCredit](https://github.com/svsairevanth12)

---

## Liên kết

- [Repository](https://github.com/svsairevanth12/Auggie-Promptenahncer)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=AugieeCredit.auggie-promptenhancer)
- [Augment SDK](https://www.npmjs.com/package/@augmentcode/auggie-sdk)
