# .gitignore đã được cập nhật! ✅

## Những gì đã thêm vào `.gitignore`

### 1. **Qoder AI Cache** ⭐
```
.qoder/              # Loại bỏ cache và cấu hình Qoder
```

### 2. **Node.js & Dependencies**
```
node_modules/        # Thư viện npm
npm-debug.log       # Log gỡ lỗi
.npm/               # Cache npm
.eslintcache        # Cache ESLint
```

### 3. **Next.js Build Output**
```
.next/              # Build output của Next.js
out/                # Static export
build/              # Build folder
dist/               # Distribution folder
```

### 4. **Environment Files**
```
.env                # Biến môi trường chính
.env.local          # Override cục bộ
.env.*.local       # Environment-specific
```

### 5. **IDE & Editors**
```
.vscode/           # VS Code settings
.idea/             # IntelliJ IDEA
*.swp, *.swo       # Vim swap files
*~                 # Backup files
```

### 6. **Visual Studio (Backend)**
```
.vs/               # Visual Studio workspace
bin/               # Compiled binaries
obj/               # Object files
*.user, *.suo      # VS user files
```

### 7. **Firebase**
```
.firebase/         # Firebase local emulator
.firebaserc        # Firebase config
firebase-debug.log
firestore-debug.log
```

### 8. **OS Files**
```
.DS_Store         # macOS metadata
Thumbs.db         # Windows thumbnails
.Spotlight-V100   # macOS Spotlight
.Trashes          # Trash info
```

### 9. **Testing & Coverage**
```
coverage/         # Test coverage reports
.nyc_output/      # NYC coverage data
```

### 10. **TypeScript**
```
*.tsbuildinfo     # TypeScript build info
```

### 11. **Temporary Files**
```
tmp/, temp/       # Temporary directories
*.tmp, *.temp     # Temporary files
```

### 12. **Error Logs**
```
build_errors.txt
business_errors.txt
```

---

## Cấu trúc `.gitignore` trong project

### Root Level: `/vstep-writing-lab/.gitignore`
- Áp dụng cho toàn bộ project
- Bao gồm cả backend (.NET) và frontend (Next.js)

### Web Level: `/vstep-writing-lab/web/.gitignore`
- Cụ thể cho Next.js frontend
- Loại bỏ các file không cần thiết của web

---

## File nào KHÔNG nên commit ❌

1. **Dependencies**
   - `node_modules/`
   - `.npm/`

2. **Build Output**
   - `.next/`
   - `bin/`
   - `obj/`

3. **Environment Secrets**
   - `.env`
   - `.env.local`

4. **Cache Files**
   - `.qoder/cache/`
   - `.eslintcache`

5. **IDE Settings**
   - `.vscode/`
   - `.idea/`

6. **OS Files**
   - `.DS_Store`
   - `Thumbs.db`

7. **Logs**
   - `*.log`
   - `logs/`

---

## File nào NÊN commit ✅

### Root Level
- ✅ `README.md`
- ✅ `docs/`
- ✅ Backend code
- ✅ `.qoder/agents/` (nếu có custom agents)
- ✅ `.qoder/skills/` (nếu có custom skills)

### Web Directory
- ✅ `src/` - Tất cả source code
- ✅ `public/` - Static assets
- ✅ `package.json` - Dependencies
- ✅ Config files (tailwind.config, tsconfig, etc.)
- ✅ `.env.example` - Environment template

---

## Hướng dẫn sử dụng

### Sau khi clone repository:

```bash
# 1. Cài đặt dependencies
cd web
npm install

# 2. Tạo file environment từ template
cp .env.example .env.local

# 3. Chỉnh sửa thông tin trong .env.local
# (Thêm Firebase credentials, API URL, etc.)

# 4. Chạy development server
npm run dev
```

### Kiểm tra file nào bị ignore:

```bash
# Xem tất cả file bị ignore
git status --ignored

# Kiểm tra file cụ thể có bị ignore không
git check-ignore -v path/to/file
```

### Dọn dẹp file đã commit nhầm:

```bash
# Xóa khỏi git tracking nhưng giữ lại local
git rm --cached -r node_modules/
git rm --cached -r .next/
git rm --cached -r .qoder/

# Commit việc xóa
git commit -m "Remove files that should be in .gitignore"
```

---

## Tài liệu tham khảo

- `.gitignore_guide.md` - Hướng dẫn chi tiết
- [GitHub .gitignore Templates](https://github.com/github/gitignore)
- [Git Docs - Ignoring Files](https://git-scm.com/docs/gitignore)

---

## Tóm tắt

✅ **Đã thêm:**
- Qoder cache (`.qoder/`)
- Node.js dependencies
- Next.js build output
- Environment files
- IDE settings
- OS files
- Firebase logs
- TypeScript build info
- Temporary files

🎯 **Mục đích:**
- Giảm kích thước repository
- Bảo mật thông tin nhạy cảm
- Tránh xung đột khi merge
- Giữ repo sạch sẽ

📝 **Lưu ý:**
- KHÔNG commit `.env` hoặc `.env.local`
- KHÔNG commit `node_modules/`
- KHÔNG commit `.qoder/cache/`
- NÊN commit `.env.example` làm template
