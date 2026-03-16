import { Zap } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-16">
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">STEP BY STEP</p>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 tracking-tight mt-2">How it works</h2>
          <p className="text-gray-500 text-lg">Three simple steps to significantly boost your writing score.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-start gap-8 relative">
          <div className="hidden md:block absolute top-[60px] left-1/2 -translate-x-1/2 w-2/3 h-px bg-gray-200 border-dashed border-t-2 border-gray-300"></div>

          <div className="flex-1 text-center relative z-10">
            <div className="w-20 h-20 mx-auto bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg mb-6">
              <span className="text-2xl font-black text-emerald-500">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Topic</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Choose from a massive library of official Task 1 letters and Task 2 essays updated for 2026.</p>
          </div>

          <div className="flex-1 text-center relative z-10">
            <div className="w-20 h-20 mx-auto bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg mb-6">
              <span className="text-2xl font-black text-emerald-500">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Write & Submit</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Type your response in our exam-simulated editor before the countdown reaches zero.</p>
          </div>

          <div className="flex-1 text-center relative z-10">
            <div className="w-20 h-20 mx-auto bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg mb-6 bg-gradient-to-br from-white to-emerald-50">
              <Zap className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Get AI Feedback</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Instantly receive a detailed band score, highlighted language mistakes, and actionable advice.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
