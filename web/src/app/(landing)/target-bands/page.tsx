import { Target, Award } from 'lucide-react';

export default function TargetBandsPage() {
  return (
    <section className="py-24 bg-vstep-dark text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        <div className="text-center mb-16">
          <p className="text-emerald-300/70 text-sm font-medium tracking-widest uppercase">PERSONALIZED PATHS</p>
          <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight mt-2">Tailored for every target</h2>
          <p className="text-emerald-100/70 text-lg">Whether you need to graduate or go abroad, we&apos;ve got you covered.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-black mb-1">B1 Level</h3>
            <div className="text-blue-300 font-bold mb-4 tracking-widest text-sm">4.0 - 6.0</div>
            <p className="text-sm text-gray-400">Focuses on building basic sentence structures, everyday vocabulary, and paragraph coherence.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black mb-1 text-emerald-400">B2 Level</h3>
            <div className="text-emerald-300 font-bold mb-4 tracking-widest text-sm">6.5 - 8.0</div>
            <p className="text-sm text-gray-400">Our most popular track. Trains complex grammar, academic vocabulary, and strong task fulfillment.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-2xl font-black mb-1 text-amber-400">C1 Level</h3>
            <div className="text-amber-300 font-bold mb-4 tracking-widest text-sm">8.5 - 10.0</div>
            <p className="text-sm text-gray-400">Advanced training. Unforgiving grading on lexical resource nuances and native-like flow.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
