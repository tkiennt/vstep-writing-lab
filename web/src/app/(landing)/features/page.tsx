import { BarChart3, CheckCircle2, Clock, BookOpen, Monitor, MessageSquare, Star, Moon } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-16">
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">OUR CORE TECHNOLOGY</p>
          <h2 className="text-slate-900 text-3xl lg:text-4xl font-bold mt-2 tracking-tight">Features of VSTEP Writing</h2>
          <p className="text-slate-600 text-lg mt-4 max-w-2xl mx-auto">Designed to provide the most accurate and helpful feedback for VSTEP learners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-900 hover:shadow-lg transition-all duration-300">
            <BarChart3 className="w-7 h-7 text-slate-900" />
            <h3 className="text-slate-900 font-semibold text-xl mt-5">Instant Band Scoring</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">Receive an immediate estimated VSTEP band score (0-10) based on all four VSTEP writing criteria.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-900 hover:shadow-lg transition-all duration-300">
            <CheckCircle2 className="w-7 h-7 text-slate-900" />
            <h3 className="text-slate-900 font-semibold text-xl mt-5">Grammar Analysis</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">Instant, in-context suggestions to improve sentence structure.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-900 hover:shadow-lg transition-all duration-300">
            <Clock className="w-7 h-7 text-slate-900" />
            <h3 className="text-slate-900 font-semibold text-xl mt-5">Progress Insights</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">Store essays securely and track your performance improvement.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-900 hover:shadow-lg transition-all duration-300">
            <BookOpen className="w-7 h-7 text-slate-900" />
            <h3 className="text-slate-900 font-semibold text-xl mt-5">Vocabulary Enrichment</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">Our AI suggests higher-level academic synonyms to help you achieve B2/C1 bands by diversifying your word choice.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-900 hover:shadow-lg transition-all duration-300">
            <Monitor className="w-7 h-7 text-slate-900" />
            <h3 className="text-slate-900 font-semibold text-xl mt-5">Exam Simulation</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">Practice under realistic exam conditions with an integrated 60-minute timer and automatic word count.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-900 hover:shadow-lg transition-all duration-300">
            <MessageSquare className="w-7 h-7 text-slate-900" />
            <h3 className="text-slate-900 font-semibold text-xl mt-5">AI Chatbot Tutor</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">Instantly explain grammar rules and brainstorm ideas within your feedback flow.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-900 hover:shadow-lg transition-all duration-300">
            <Star className="w-7 h-7 text-slate-900" />
            <h3 className="text-slate-900 font-semibold text-xl mt-5">Adaptive Scoring</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">Feedback personalized to advance with your progress, showing precisely what you need for the next band.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-900 hover:shadow-lg transition-all duration-300">
            <Moon className="w-7 h-7 text-slate-900" />
            <h3 className="text-slate-900 font-semibold text-xl mt-5">Dark Mode Support</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">Study comfortably late at night with a beautifully designed dark interface to reduce eye strain.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
