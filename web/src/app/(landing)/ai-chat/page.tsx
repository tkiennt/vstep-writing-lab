import { Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIChatPage() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-12">
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">AI ASSISTANT</p>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 tracking-tight mt-2">AI Writing Tutor</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Ask our AI tutor anything about VSTEP writing — grammar rules, essay structure, vocabulary tips, and more.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">VSTEP Writing AI</h3>
              <span className="text-xs text-emerald-600 font-medium">● Online</span>
            </div>
          </div>

          {/* Chat body */}
          <div className="p-6 min-h-[300px] bg-gray-50/50 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-gray-100 max-w-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Xin chào! 👋 Tôi là AI tutor của VSTEP Writing Lab. Bạn có thể hỏi tôi bất cứ điều gì về kỹ năng viết VSTEP — từ cấu trúc câu, từ vựng học thuật, đến cách đạt band 8.0+. Hãy bắt đầu nhé!
                </p>
              </div>
            </div>
          </div>

          {/* Chat input */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <input 
              type="text" 
              placeholder="Ask about VSTEP writing tips, grammar, vocabulary..." 
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
            />
            <Button className="bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl px-5">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
