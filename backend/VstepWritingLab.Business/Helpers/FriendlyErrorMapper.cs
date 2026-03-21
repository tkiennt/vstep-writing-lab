using System;

namespace VstepWritingLab.Business.Helpers;

public static class FriendlyErrorMapper
{
    public static string MapAiError(string technicalError)
    {
        if (string.IsNullOrEmpty(technicalError))
            return "Đã có lỗi xảy ra trong quá trình chấm bài. Vui lòng thử lại sau.";

        // Common Gemini Error keywords
        if (technicalError.Contains("API key expired", StringComparison.OrdinalIgnoreCase) || 
            technicalError.Contains("API_KEY_INVALID", StringComparison.OrdinalIgnoreCase))
        {
            return "Hệ thống AI đang gặp vấn đề về cấu hình (API key). Vui lòng liên hệ quản trị viên để cập nhật.";
        }

        if (technicalError.Contains("429") || 
            technicalError.Contains("quota exceeded", StringComparison.OrdinalIgnoreCase) ||
            technicalError.Contains("Too many requests", StringComparison.OrdinalIgnoreCase))
        {
            return "Hệ system đang quá tải do có quá nhiều lượt truy cập. Vui lòng đợi 1-2 phút rồi thử lại.";
        }

        if (technicalError.Contains("500") || 
            technicalError.Contains("Internal Server Error", StringComparison.OrdinalIgnoreCase))
        {
            return "Máy chủ AI của Google đang gặp sự cố tạm thời. Vui lòng thử lại sau ít phút.";
        }

        if (technicalError.Contains("400") || 
            technicalError.Contains("BadRequest", StringComparison.OrdinalIgnoreCase))
        {
            // If it's a generic 400 but not one we recognized above
            return "Yêu cầu không hợp lệ hoặc dữ liệu bài viết quá lớn. Vui lòng kiểm tra lại độ dài bài viết.";
        }

        // Default friendly message
        return "Hệ thống AI đang bận hoặc gặp lỗi kỹ thuật nhỏ. Vui lòng nhấn 'Nộp bài' lại sau giây lát.";
    }
}
