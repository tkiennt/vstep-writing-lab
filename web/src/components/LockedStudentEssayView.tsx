'use client';

import React from 'react';
import { Lock, Crown, Sparkles, Star, CheckCircle2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LockedStudentEssayView() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="text-sm font-bold text-gray-900">Model Essay Library</h1>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-200">
            Free Plan
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-6">

        {/* Main Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Title Bar */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Band 8.0+ Model Essay & Examiner Notes</h2>
                <p className="text-sm text-gray-500 font-medium">Task 2 · Global Warming · C1 Level</p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* FREE CONTENT SECTION (Visible) */}
          {/* ============================================ */}
          <div className="px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Left: Essay Text (60%) */}
              <div className="lg:w-[60%] p-8 bg-gray-50 border border-gray-200 rounded-2xl font-serif text-lg leading-loose text-gray-800 selection:bg-emerald-200">
                <p>
                  The phenomenon of global warming has become an{' '}
                  <span className="bg-yellow-100 border border-yellow-300 rounded px-1 font-medium cursor-help" title="Lexical Highlight: Powerful academic collocation">
                    unprecedented crisis
                  </span>{' '}
                  in the 21st century. While some attribute this primarily to natural cycles, there is overwhelming consensus among scientists that human activities are the principal catalysts. This essay will examine the major causes of climate change and propose practical solutions that governments and individuals can implement.
                </p>
              </div>

              {/* Right: Annotation Card (40%) - Read Only */}
              <div className="lg:w-[40%]">
                <div className="bg-white border-2 border-amber-200 rounded-2xl p-5 shadow-sm relative">
                  {/* Badge */}
                  <span className="absolute -top-3 left-4 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">
                    Lexical Highlight
                  </span>
                  {/* Content - Read only */}
                  <h4 className="font-bold text-gray-900 text-sm mb-3 mt-2">&quot;unprecedented crisis&quot;</h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                    A powerful collocation that scores highly for vocabulary range. Demonstrates awareness of precise academic terms and shows the writer can express urgency without informal language. Examiners reward C1-level word pairings like this.
                  </p>
                  {/* Score indicator */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Impact</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-5 h-1.5 rounded-full ${i <= 4 ? 'bg-amber-400' : 'bg-gray-200'}`}></div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-700">+0.5 Lexical</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ============================================ */}
          {/* LOCKED CONTENT SECTION (Premium Paywall) */}
          {/* ============================================ */}
          <div className="relative">

            {/* Blurred Content Preview */}
            <div className="px-8 pb-8 select-none pointer-events-none" aria-hidden="true">
              <div className="flex flex-col lg:flex-row gap-8">

                {/* Left: Blurred Essay Text */}
                <div className="lg:w-[60%] p-8 bg-gray-50 border border-gray-200 rounded-2xl font-serif text-lg leading-loose text-gray-800">
                  <p className="blur-[2px]">
                    Furthermore, the burning of fossil fuels releases{' '}
                    <span className="bg-yellow-100 border border-yellow-300 rounded px-1">
                      copious amounts
                    </span>{' '}
                    of carbon dioxide into the atmosphere, creating a{' '}
                    <span className="bg-blue-100 border border-blue-300 rounded px-1">
                      greenhouse effect
                    </span>{' '}
                    that traps heat and raises global temperatures. Deforestation exacerbates this problem by reducing the planet&apos;s capacity to absorb CO2.
                  </p>
                  <p className="mt-6 blur-[3px]">
                    In terms of solutions, governments should{' '}
                    <span className="bg-green-100 border border-green-300 rounded px-1">
                      incentivize renewable energy adoption
                    </span>{' '}
                    through tax breaks and subsidies. On an individual level, citizens can contribute by reducing their carbon footprint through sustainable lifestyle choices such as using public transport.
                  </p>
                </div>

                {/* Right: Blurred Annotation Cards */}
                <div className="lg:w-[40%] space-y-4">
                  <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-sm blur-[2px]">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">Cohesion Device</span>
                    <h4 className="font-bold text-gray-900 text-sm mt-3 mb-2">&quot;Furthermore&quot;</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">Effective transition word showing addition. Scores well for coherence & cohesion criteria.</p>
                  </div>
                  <div className="bg-white border-2 border-green-200 rounded-2xl p-5 shadow-sm blur-[3px]">
                    <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">Grammar Range</span>
                    <h4 className="font-bold text-gray-900 text-sm mt-3 mb-2">&quot;should incentivize&quot;</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">Modal + formal verb combination demonstrating C1 grammatical control.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Gradient Overlay - Fade to white */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white backdrop-blur-[1px]"></div>

            {/* Premium CTA Card - Centered */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full text-center relative overflow-hidden">
                
                {/* Decorative gradient corners */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  {/* Crown Icon */}
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-amber-200/50">
                    <Crown className="w-8 h-8 text-amber-500" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-3">
                    Unlock Full Examiner Analysis
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs mx-auto">
                    Nâng cấp lên <strong className="text-gray-700">VSTEP Pro</strong> để đọc toàn bộ bài văn Band 8.0+ này và xem chi tiết các chú thích từ vựng, ngữ pháp ăn điểm.
                  </p>

                  {/* Benefits */}
                  <div className="flex flex-col gap-2 mb-6 text-left max-w-xs mx-auto">
                    {[
                      'Full annotated model essays',
                      'Examiner commentary & tips',
                      'Vocabulary & grammar scoring notes',
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full py-6 bg-gradient-to-r from-vstep-dark to-emerald-800 hover:from-emerald-800 hover:to-vstep-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 transition-all duration-200">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade to Pro Now
                  </Button>

                  <p className="text-[11px] text-gray-400 mt-3 font-medium">Starting from 49.000đ / month</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
