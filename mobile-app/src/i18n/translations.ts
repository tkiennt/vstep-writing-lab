export type AppLanguage = 'vi' | 'en';

export type TranslationDict = {
  common_error: string;
  common_ok: string;
  nav_practice: string;
  nav_profile: string;
  nav_write: string;
  nav_modeSelect: string;
  profile_title: string;
  profile_subtitle: string;
  profile_email: string;
  profile_name: string;
  profile_role: string;
  profile_logout: string;
  profile_appearance: string;
  profile_theme: string;
  profile_theme_light: string;
  profile_theme_dark: string;
  profile_language: string;
  profile_language_vi: string;
  profile_language_en: string;
  practice_lead: string;
  practice_loading: string;
  practice_all: string;
  practice_task1: string;
  practice_task2: string;
  practice_search_ph: string;
  practice_empty: string;
  practice_tap_hint: string;
  practice_task_pill1: string;
  practice_task_pill2: string;
  practice_default_topic: string;
  practice_load_error: string;
  mode_lead: string;
  mode_back: string;
  mode_guided_sub: string;
  mode_guided_b0: string;
  mode_guided_b1: string;
  mode_guided_b2: string;
  mode_practice_sub: string;
  mode_practice_b0: string;
  mode_practice_b1: string;
  mode_practice_b2: string;
  mode_exam_sub: string;
  mode_exam_b0: string;
  mode_exam_b1: string;
  mode_exam_b2: string;
  write_loading: string;
  write_load_fail_title: string;
  write_load_fail_msg: string;
  write_err_short_title: string;
  write_err_short_msg: string;
  write_err_submit_title: string;
  write_err_user: string;
  write_task1_label: string;
  write_task2_label: string;
  write_exam_banner: string;
  write_exam_ready_title: string;
  write_exam_ready_lead: string;
  write_exam_rule_hide: string;
  write_exam_rule_grade: string;
  write_exam_rule_line: string;
  write_exam_start: string;
  write_exam_back: string;
  write_time_left: string;
  write_prompt_title: string;
  write_key_points: string;
  write_hints: string;
  write_guided_ai_title: string;
  write_guided_ai_caption: string;
  write_guided_loading: string;
  write_guided_fallback_title: string;
  write_guided_fallback_caption: string;
  write_guided_no_outline: string;
  write_guided_retry: string;
  write_guided_tips_title: string;
  write_guided_vocab_title: string;
  write_guided_formal: string;
  write_guided_structures: string;
  write_your_essay: string;
  write_placeholder_min: string;
  write_wc_line: string;
  write_submit_ai: string;
  write_mode_guided: string;
  write_mode_exam: string;
  write_mode_practice: string;
  grading_kicker: string;
  grading_criterion_tf: string;
  grading_criterion_org: string;
  grading_criterion_vocab: string;
  grading_criterion_gr: string;
  grading_total_title: string;
  grading_task_type: string;
  grading_cefr: string;
  grading_warn_title: string;
  grading_essay_graded: string;
  grading_legend: string;
  grading_strengths: string;
  grading_improve: string;
  grading_roadmap: string;
  grading_weeks_unit: string;
  grading_week_header: string;
  grading_model: string;
  grading_back: string;
  error_modal_fallback: string;
  auth_login_fail: string;
  auth_val_email_pw: string;
  auth_val_email: string;
  auth_register_fail: string;
  auth_val_register: string;
  auth_val_pw_len: string;
  auth_val_pw_match: string;
  auth_forgot_err_email: string;
  auth_forgot_err_email_fmt: string;
  boundary_title: string;
  boundary_body: string;
  boundary_hint: string;
  boundary_retry: string;
};

export const translations: Record<AppLanguage, TranslationDict> = {
  vi: {
    common_error: 'Lỗi',
    common_ok: 'OK',
    nav_practice: 'Luyện tập',
    nav_profile: 'Tài khoản',
    nav_write: 'Làm bài',
    nav_modeSelect: 'Chế độ làm bài',
    profile_title: 'Hồ sơ & cài đặt',
    profile_subtitle: 'Thông tin tài khoản, giao diện và ngôn ngữ.',
    profile_email: 'Email',
    profile_name: 'Họ tên',
    profile_role: 'Vai trò',
    profile_logout: 'Đăng xuất',
    profile_appearance: 'Giao diện',
    profile_theme: 'Chế độ sáng / tối',
    profile_theme_light: 'Sáng',
    profile_theme_dark: 'Tối',
    profile_language: 'Ngôn ngữ',
    profile_language_vi: 'Tiếng Việt',
    profile_language_en: 'English',
    practice_lead:
      'Chọn đề rồi chọn chế độ: Guided / Practice / Exam (giống flow web). Có thể lọc Task 1–2 và tìm theo từ khóa.',
    practice_loading: 'Đang tải đề thi…',
    practice_all: 'Tất cả',
    practice_task1: 'Task 1',
    practice_task2: 'Task 2',
    practice_search_ph: 'Tìm theo chủ đề, từ khóa…',
    practice_empty: 'Không có đề phù hợp. Thử đổi bộ lọc hoặc từ khóa.',
    practice_tap_hint: 'Chạm để chọn chế độ',
    practice_task_pill1: 'Task 1 · Email / Letter',
    practice_task_pill2: 'Task 2 · Essay',
    practice_default_topic: 'Đề luyện',
    practice_load_error: `Không tải được danh sách đề{{net}}.

Đang dùng API: {{apiUrl}}

127.0.0.1 / localhost trên ĐIỆN THOẠI là chính điện thoại — không phải PC.

Chọn MỘT cách:

• WiFi (Android/iPhone): trên PC chạy ipconfig → IPv4
  EXPO_PUBLIC_API_URL=http://192.168.x.x:5288
  (Mở firewall Windows cho cổng 5288 nếu cần.)

• Android + USB: adb reverse tcp:5288 tcp:5288
  rồi EXPO_PUBLIC_API_URL=http://127.0.0.1:5288

• iPhone: không dùng 127.0.0.1 — dùng IP WiFi như trên.

Backend: dotnet run --launch-profile http
Đổi .env → npx expo start -c`,
    mode_lead: 'Chọn chế độ làm bài',
    mode_back: 'Quay lại danh sách',
    mode_guided_sub: 'Có hướng dẫn',
    mode_guided_b0: 'Outline theo đề (Gemini — cùng API web)',
    mode_guided_b1: 'Key points từ đề + chạm đánh dấu từng bước',
    mode_guided_b2: 'Lỗi mạng → gợi ý dự phòng chung',
    mode_practice_sub: 'Luyện tập',
    mode_practice_b0: 'Đề bài + gợi ý key points',
    mode_practice_b1: 'Tự do viết, gửi chấm AI',
    mode_practice_b2: 'Phù hợp ôn tập hằng ngày',
    mode_exam_sub: 'Thi thử',
    mode_exam_b0: 'Màn hình xác nhận — bấm Bắt đầu mới tính giờ',
    mode_exam_b1: 'Ẩn gợi ý — đếm ngược 20’ / 40’',
    mode_exam_b2: 'Viết xong gửi chấm AI',
    write_loading: 'Đang tải đề…',
    write_load_fail_title: 'Lỗi',
    write_load_fail_msg:
      'Không tải được đề bài.\n\n{{detail}}\n\nAPI: {{apiUrl}}\n\nUSB: adb reverse tcp:5288 tcp:5288',
    write_err_short_title: 'Quá ngắn',
    write_err_short_msg: 'Cần ít nhất khoảng {{min}} từ.',
    write_err_submit_title: 'Lỗi',
    write_err_user: 'Thiếu thông tin người dùng hoặc đề bài.',
    write_task1_label: 'Bài viết số 1',
    write_task2_label: 'Bài viết số 2',
    write_exam_banner: 'Exam · Thi thử',
    write_exam_ready_title: 'Sẵn sàng làm bài?',
    write_exam_ready_lead:
      'Thời gian chỉ chạy sau khi bạn bấm "Bắt đầu làm bài". Đọc kỹ đề trước — chế độ thi ẩn gợi ý key points.',
    write_exam_rule_hide: 'Không hiển thị phần gợi ý từ đề (mô phỏng phòng thi).',
    write_exam_rule_grade: 'Có thể gửi chấm AI sau khi viết xong.',
    write_exam_rule_line: '• {{task}} · thời lượng gợi ý: {{mins}} phút',
    write_exam_start: 'Bắt đầu làm bài',
    write_exam_back: '← Quay lại chọn chế độ',
    write_time_left: 'Thời gian còn lại',
    write_prompt_title: 'Đề bài',
    write_key_points: 'Key points từ đề',
    write_hints: 'Gợi ý',
    write_guided_ai_title: 'Hướng dẫn theo đề (AI)',
    write_guided_ai_caption:
      'Nội dung được tạo từ đề bài hiện tại (API outline — Gemini), giống trang luyện trên web.',
    write_guided_loading: 'Đang tạo hướng dẫn theo chủ đề…',
    write_guided_fallback_title: 'Gợi ý dự phòng (chung)',
    write_guided_fallback_caption:
      'Dùng khi không tải được hướng dẫn theo đề — không chi tiết theo chủ đề như AI.',
    write_guided_no_outline: 'Không nhận được outline từ máy chủ — hiển thị gợi ý dự phòng bên dưới.',
    write_guided_retry: 'Thử tạo lại hướng dẫn',
    write_guided_tips_title: 'Mẹo làm bài (tiếng Việt)',
    write_guided_vocab_title: 'Gợi ý từ vựng & cấu trúc (English)',
    write_guided_formal: 'Formal phrases',
    write_guided_structures: 'Useful structures',
    write_your_essay: 'Bài làm của bạn',
    write_placeholder_min: 'Tối thiểu khoảng {{min}} từ…',
    write_wc_line: '{{wc}} từ · tối thiểu gợi ý {{min}} từ',
    write_submit_ai: 'Gửi chấm AI',
    write_mode_guided: 'Guided · Có hướng dẫn',
    write_mode_exam: 'Exam · Thi thử',
    write_mode_practice: 'Practice · Luyện tập',
    grading_kicker: 'Kết quả chấm AI',
    grading_criterion_tf: 'Hoàn thành nhiệm vụ',
    grading_criterion_org: 'Tổ chức & mạch lạc',
    grading_criterion_vocab: 'Từ vựng',
    grading_criterion_gr: 'Ngữ pháp',
    grading_total_title: 'Điểm tổng kết VSTEP',
    grading_task_type: 'Loại bài viết',
    grading_cefr: 'Trình độ ước lượng',
    grading_warn_title: 'Gợi ý: bám sát đề',
    grading_essay_graded: 'Bài viết đã chấm',
    grading_legend: 'Gạch xanh: điểm mạnh · Gạch đỏ: cần sửa',
    grading_strengths: 'Điểm mạnh',
    grading_improve: 'Cần cải thiện',
    grading_roadmap: 'Lộ trình học tập',
    grading_weeks_unit: 'tuần',
    grading_week_header: 'Tuần {{week}}: {{focus}}',
    grading_model: 'Model',
    grading_back: 'Quay lại',
    error_modal_fallback: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    auth_login_fail: 'Đăng nhập thất bại',
    auth_val_email_pw: 'Vui lòng nhập email và mật khẩu',
    auth_val_email: 'Vui lòng sử dụng email hợp lệ',
    auth_register_fail: 'Đăng ký thất bại',
    auth_val_register: 'Vui lòng điền đầy đủ thông tin',
    auth_val_pw_len: 'Mật khẩu cần ít nhất 8 ký tự',
    auth_val_pw_match: 'Mật khẩu xác nhận không khớp',
    auth_forgot_err_email: 'Vui lòng nhập email',
    auth_forgot_err_email_fmt: 'Vui lòng nhập email hợp lệ',
    boundary_title: 'Đã có lỗi khi khởi chạy',
    boundary_body: 'Mở Metro terminal trên PC để xem stack đầy đủ. Dưới đây là thông báo lỗi:',
    boundary_hint:
      'Gợi ý: cập nhật app Expo Go (SDK 54), đồng bộ cổng Metro với QR (8081/8082), kiểm tra EXPO_PUBLIC_* trong .env.',
    boundary_retry: 'Thử lại',
  },
  en: {
    common_error: 'Error',
    common_ok: 'OK',
    nav_practice: 'Practice',
    nav_profile: 'Account',
    nav_write: 'Writing',
    nav_modeSelect: 'Choose mode',
    profile_title: 'Profile & settings',
    profile_subtitle: 'Account info, appearance, and language.',
    profile_email: 'Email',
    profile_name: 'Display name',
    profile_role: 'Role',
    profile_logout: 'Log out',
    profile_appearance: 'Appearance',
    profile_theme: 'Light / dark mode',
    profile_theme_light: 'Light',
    profile_theme_dark: 'Dark',
    profile_language: 'Language',
    profile_language_vi: 'Vietnamese',
    profile_language_en: 'English',
    practice_lead:
      'Pick a prompt, then choose Guided / Practice / Exam (same as the web). Filter Task 1–2 and search by keyword.',
    practice_loading: 'Loading prompts…',
    practice_all: 'All',
    practice_task1: 'Task 1',
    practice_task2: 'Task 2',
    practice_search_ph: 'Search topic or keyword…',
    practice_empty: 'No matching prompts. Try another filter or keyword.',
    practice_tap_hint: 'Tap to choose a mode',
    practice_task_pill1: 'Task 1 · Email / Letter',
    practice_task_pill2: 'Task 2 · Essay',
    practice_default_topic: 'Practice prompt',
    practice_load_error: `Could not load prompts{{net}}.

API in use: {{apiUrl}}

On a phone, 127.0.0.1 / localhost refers to the phone itself — not your PC.

Pick ONE approach:

• Wi‑Fi (Android/iPhone): on PC run ipconfig → IPv4
  EXPO_PUBLIC_API_URL=http://192.168.x.x:5288
  (Open Windows firewall for port 5288 if needed.)

• Android + USB: adb reverse tcp:5288 tcp:5288
  then EXPO_PUBLIC_API_URL=http://127.0.0.1:5288

• iPhone: do not use 127.0.0.1 — use the Wi‑Fi IP as above.

Backend: dotnet run --launch-profile http
Change .env → npx expo start -c`,
    mode_lead: 'Choose how to practise',
    mode_back: 'Back to list',
    mode_guided_sub: 'With guidance',
    mode_guided_b0: 'Topic outline (Gemini — same API as web)',
    mode_guided_b1: 'Key points + tap to check each step',
    mode_guided_b2: 'If offline → generic fallback tips',
    mode_practice_sub: 'Practice',
    mode_practice_b0: 'Prompt + key-point hints',
    mode_practice_b1: 'Free writing, then AI grading',
    mode_practice_b2: 'Good for daily practice',
    mode_exam_sub: 'Mock exam',
    mode_exam_b0: 'Confirm screen — timer starts only after Begin',
    mode_exam_b1: 'Hints hidden — 20’ / 40’ countdown',
    mode_exam_b2: 'Submit for AI grading when done',
    write_loading: 'Loading prompt…',
    write_load_fail_title: 'Error',
    write_load_fail_msg:
      'Could not load the prompt.\n\n{{detail}}\n\nAPI: {{apiUrl}}\n\nUSB: adb reverse tcp:5288 tcp:5288',
    write_err_short_title: 'Too short',
    write_err_short_msg: 'You need at least about {{min}} words.',
    write_err_submit_title: 'Error',
    write_err_user: 'Missing user or prompt data.',
    write_task1_label: 'Task 1 writing',
    write_task2_label: 'Task 2 writing',
    write_exam_banner: 'Exam · Mock test',
    write_exam_ready_title: 'Ready to start?',
    write_exam_ready_lead:
      'The timer runs only after you tap “Begin”. Read the prompt carefully — exam mode hides key-point hints.',
    write_exam_rule_hide: 'Key-point hints from the prompt are hidden (exam-style).',
    write_exam_rule_grade: 'You can request AI grading after you finish writing.',
    write_exam_rule_line: '• {{task}} · suggested time: {{mins}} min',
    write_exam_start: 'Begin writing',
    write_exam_back: '← Back to mode selection',
    write_time_left: 'Time left',
    write_prompt_title: 'Prompt',
    write_key_points: 'Key points',
    write_hints: 'Hints',
    write_guided_ai_title: 'Guidance for this prompt (AI)',
    write_guided_ai_caption:
      'Generated for the current prompt (outline API — Gemini), same as the web practice page.',
    write_guided_loading: 'Generating topic-specific guidance…',
    write_guided_fallback_title: 'Fallback tips (generic)',
    write_guided_fallback_caption:
      'Used when the topic outline cannot be loaded — not as specific as AI.',
    write_guided_no_outline: 'No outline from the server — showing fallback tips below.',
    write_guided_retry: 'Try generating guidance again',
    write_guided_tips_title: 'Quick tips (Vietnamese)',
    write_guided_vocab_title: 'Vocabulary & structures (English)',
    write_guided_formal: 'Formal phrases',
    write_guided_structures: 'Useful structures',
    write_your_essay: 'Your essay',
    write_placeholder_min: 'At least ~{{min}} words…',
    write_wc_line: '{{wc}} words · suggested minimum {{min}} words',
    write_submit_ai: 'Submit for AI grading',
    write_mode_guided: 'Guided',
    write_mode_exam: 'Exam',
    write_mode_practice: 'Practice',
    grading_kicker: 'AI grading result',
    grading_criterion_tf: 'Task fulfilment',
    grading_criterion_org: 'Organisation & coherence',
    grading_criterion_vocab: 'Vocabulary',
    grading_criterion_gr: 'Grammar',
    grading_total_title: 'VSTEP overall score',
    grading_task_type: 'Task',
    grading_cefr: 'Estimated level',
    grading_warn_title: 'Tip: stay on topic',
    grading_essay_graded: 'Graded essay',
    grading_legend: 'Green underline: strengths · Red underline: to fix',
    grading_strengths: 'Strengths',
    grading_improve: 'Areas to improve',
    grading_roadmap: 'Study roadmap',
    grading_weeks_unit: 'weeks',
    grading_week_header: 'Week {{week}}: {{focus}}',
    grading_model: 'Model',
    grading_back: 'Back',
    error_modal_fallback: 'Something went wrong. Please try again.',
    auth_login_fail: 'Sign-in failed',
    auth_val_email_pw: 'Please enter email and password',
    auth_val_email: 'Please use a valid email',
    auth_register_fail: 'Registration failed',
    auth_val_register: 'Please fill in all fields',
    auth_val_pw_len: 'Password must be at least 8 characters',
    auth_val_pw_match: 'Passwords do not match',
    auth_forgot_err_email: 'Please enter your email',
    auth_forgot_err_email_fmt: 'Please enter a valid email',
    boundary_title: 'Startup error',
    boundary_body: 'Open the Metro terminal on your PC for the full stack. Message:',
    boundary_hint:
      'Tip: update Expo Go (SDK 54), match the Metro port to the QR (8081/8082), check EXPO_PUBLIC_* in .env.',
    boundary_retry: 'Try again',
  },
};

export function interpolate(
  template: string,
  vars: Record<string, string | number | undefined>
): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) continue;
    s = s.split(`{{${k}}}`).join(String(v));
  }
  return s;
}
