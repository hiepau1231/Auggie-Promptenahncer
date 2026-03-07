# Công cụ Cải thiện Prompt Nhận biết Ngữ cảnh cho Claude Code

Lấy cảm hứng từ [Auggie Prompt Enhancer](https://github.com/svsairevanth/Auggie-Promptenahncer), công cụ này mang ý tưởng **cải thiện prompt nhận biết ngữ cảnh** tương tự đến [Claude Code](https://claude.ai/code) dưới dạng một slash command.

Thay vì sử dụng Augment SDK, nó tận dụng các công cụ file tích hợp của Claude Code (Read, Glob, Grep) để hiểu codebase của bạn trước khi cải thiện prompt.

## Cách hoạt động

```
Bạn nhập:  /enhance thêm tìm kiếm vào ứng dụng của tôi
                ↓
Claude đọc codebase của bạn (package.json, routers, models...)
                ↓
Xuất ra một prompt đã cải thiện với đường dẫn file thực, tên hàm, tech stack
                ↓
Copy-paste prompt đã cải thiện vào bất kỳ công cụ AI nào
```

## Cài đặt

**1 bước** — copy file `enhance.md` vào thư mục commands của Claude Code:

**macOS / Linux:**
```bash
cp enhance.md ~/.claude/commands/enhance.md
```

**Windows:**
```cmd
copy enhance.md %USERPROFILE%\.claude\commands\enhance.md
```

> Nếu thư mục `commands/` chưa tồn tại, hãy tạo nó trước:
> ```bash
> mkdir -p ~/.claude/commands
> ```

## Cách sử dụng

Mở bất kỳ dự án nào trong Claude Code, sau đó nhập:

```
/enhance <prompt sơ bộ của bạn>
```

### Ví dụ

```
/enhance thêm phân trang vào danh sách bài viết
```
```
/enhance sửa lỗi đăng nhập
```
```
/enhance viết tests cho module xác thực
```

Claude sẽ tự động đọc các file dự án của bạn và xuất ra một prompt đã cải thiện, nhận biết ngữ cảnh, sẵn sàng để copy-paste.

## Ví dụ kết quả

**Đầu vào:**
```
/enhance thêm tìm kiếm vào news_reader
```

**Đầu ra:**
```
Trong dự án `news_reader`, mở rộng route tìm kiếm hiện có tại
`app/routers/home.py:107` để cũng tìm kiếm các trường `summary` và `content`
(hiện tại chỉ tìm kiếm `title`).

Sử dụng pattern LIKE escaping hiện có:
  q_escaped = q.replace('\', '\\').replace('%', '\%')...

Thêm phân trang (10/trang qua ?page=N) và hiển thị số lượng kết quả.
Tech stack: FastAPI + SQLAlchemy sync + Jinja2 + Tailwind CSS
```

## Yêu cầu

- [Claude Code](https://claude.ai/code) đã được cài đặt và đang chạy
- Bất kỳ dự án nào được mở trong Claude Code

Không cần API keys. Không cần extensions. Không cần đăng nhập ngoài chính Claude Code.

## Khác biệt so với Auggie Prompt Enhancer

| | Auggie (VS Code) | Công cụ này (Claude Code) |
|---|---|---|
| Nền tảng | VS Code extension | Claude Code CLI |
| Nguồn ngữ cảnh | Augment SDK `FileSystemContext` | Read/Glob/Grep tích hợp của Claude |
| AI backend | Augment Code API | Claude (phiên hiện tại) |
| Yêu cầu đăng nhập | Có (tài khoản Augment) | Không (sử dụng phiên Claude hiện có) |
| Cài đặt | Cài đặt VS Code extension | Copy 1 file |

## Tại sao sử dụng công cụ này?

- ✅ **Không cần setup phức tạp** - Chỉ cần copy 1 file
- ✅ **Không cần tài khoản bổ sung** - Sử dụng Claude session hiện có
- ✅ **Nhận biết ngữ cảnh** - Prompts được cải thiện với thông tin thực từ codebase
- ✅ **Hoạt động với mọi dự án** - Bất kỳ ngôn ngữ, framework nào
- ✅ **Miễn phí** - Không có chi phí bổ sung ngoài Claude Code

## Giấy phép

MIT - Tự do sử dụng, chỉnh sửa và phân phối
