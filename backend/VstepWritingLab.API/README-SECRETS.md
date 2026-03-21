# Cấu hình User Secrets (bắt buộc trước khi chạy)

API key và thông tin nhạy cảm **không** được lưu trong `appsettings.json` để tránh leak khi push code.

## Thiết lập User Secrets

Chạy trong thư mục `VstepWritingLab.API`:

```bash
# Gemini API Key (lấy từ https://aistudio.google.com/apikey)
dotnet user-secrets set "Gemini:ApiKey" "YOUR_GEMINI_API_KEY"
```

## Kiểm tra

```bash
dotnet user-secrets list
```

User Secrets được lưu ngoài repo, chỉ trên máy local của bạn.
