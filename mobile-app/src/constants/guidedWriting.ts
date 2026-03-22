/** Nội dung hướng dẫn — đồng bộ với web `GuidedPanel.tsx` + mở rộng gợi ý tiếng Việt */

export const TASK1_CHECKLIST = [
  'Lời chào (Greeting)',
  'Đoạn mở đầu (Opening)',
  'Giải quyết ý 1 (Bullet 1)',
  'Giải quyết ý 2 (Bullet 2)',
  'Giải quyết ý 3 (Bullet 3)',
  'Đoạn kết (Closing)',
  'Lời kết (Sign-off)',
];

export const TASK2_CHECKLIST = [
  'Mở bài (Introduction & Thesis)',
  'Thân bài 1 (Body Paragraph 1)',
  'Thân bài 2 (Body Paragraph 2)',
  'Thân bài 3 / Phản biện (Tùy chọn)',
  'Kết luận (Conclusion)',
];

export const GUIDED_PHRASES = {
  task1: {
    formalPhrases: [
      'I am writing to complain about…',
      'I would be grateful if you could…',
      'I look forward to hearing from you.',
      'I am requesting that you…',
      'Should this matter remain unresolved…',
    ],
    usefulStructures: [
      'Passive: The issue has not been resolved despite…',
      'Conditional: Should you fail to…, I will…',
      'Present perfect: I have contacted your office twice…',
    ],
  },
  task2: {
    formalPhrases: [
      'It is widely believed that…',
      'There are compelling arguments on both sides…',
      'In conclusion, I firmly believe that…',
      'From my perspective,…',
      'While it is true that…, nevertheless…',
    ],
    usefulStructures: [
      'Concession: Although X, it is important to note that Y',
      'Cause-effect: This has led to / This results in…',
      'Example: For instance, / To illustrate,…',
    ],
  },
};

/** Gợi ý nhanh bằng tiếng Việt */
export const GUIDED_TIPS_VI = {
  task1: [
    'Xác định mục đích: phàn nàn / đề nghị / xin thông tin — giữ giọng phù hợp (formal/semi-formal).',
    'Mỗi ý trong đề nên có một đoạn ngắn; dùng tín hiệu nối: Furthermore, Moreover, However…',
    'Kết thư: nhắc lại mong muốn + cảm ơn + chữ ký (Yours faithfully / Yours sincerely).',
    'Đủ số từ tối thiểu (~120); kiểm tra chính tả tên người / địa điểm trong đề.',
  ],
  task2: [
    'Mở bài: paraphrase đề + nêu quan điểm rõ (thesis) trong 2–3 câu.',
    'Mỗi đoạn thân bài: một ý chính + giải thích + ví dụ ngắn.',
    'Cân bằng lập luận nếu đề hỏi Discuss both views / Advantages & disadvantages.',
    'Kết luận: tóm tắt + nhắc thesis; tránh ý mới. Độ dài ~250 từ trở lên.',
  ],
};

/** English tips — used when app language is English */
export const GUIDED_TIPS_EN = {
  task1: [
    'Clarify purpose: complaint / request / inquiry — keep an appropriate tone (formal/semi-formal).',
    'Give each bullet in the prompt its own short paragraph; use connectors: Furthermore, Moreover, However…',
    'Closing: restate what you want + thanks + sign-off (Yours faithfully / Yours sincerely).',
    'Meet the minimum word count (~120); double-check names and places from the prompt.',
  ],
  task2: [
    'Introduction: paraphrase the task + clear thesis in 2–3 sentences.',
    'Each body paragraph: one main idea + explanation + a short example.',
    'Balance arguments for “Discuss both views” / “Advantages & disadvantages”.',
    'Conclusion: summarise + restate thesis; no new ideas. Aim for ~250+ words.',
  ],
};
