'use client';

import React, { useState } from 'react';
import { 
  BookMarked, Volume2, Copy, MessageSquareQuote,
  CheckCircle2, Search, Filter, Library, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/components/GlobalProvider';

const MOCK_VOCAB = [
  { id: 1, word: 'Exorbitant', type: 'adj', meaning: 'Unreasonably high in price', example: 'The tuition fees at international universities can be exorbitant.' },
  { id: 2, word: 'Prohibitive', type: 'adj', meaning: 'So high that it prevents people from buying/doing something', example: 'The cost of living in London proved prohibitive for many international students.' },
  { id: 3, word: 'Immerse', type: 'v', meaning: 'Involve oneself deeply in a particular activity or interest', example: 'Studying abroad allows students to immerse themselves in a new culture.' },
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'structures' | 'samples'>('vocab');
  const { addToast } = useGlobal();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', 'Copied to clipboard!');
  };

  const handleSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    } else {
      addToast('error', 'Text-to-speech not supported in this browser.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
           <Library className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> Learning Resources
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Enrich your vocabulary, master sentence structures, and study sample essays.</p>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
         
         {/* Vertical Sidebar Tabs */}
         <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700/50 p-4 shrink-0">
            <div className="space-y-2">
               <button 
                  onClick={() => setActiveTab('vocab')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3
                     ${activeTab === 'vocab' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}`}
               >
                  <BookMarked className="w-4 h-4" /> Vocabulary Bank
               </button>
               <button 
                  onClick={() => setActiveTab('structures')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3
                     ${activeTab === 'structures' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}`}
               >
                  <MessageSquareQuote className="w-4 h-4" /> Sentence Structures
               </button>
               <button 
                  onClick={() => setActiveTab('samples')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3
                     ${activeTab === 'samples' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}`}
               >
                  <FileText className="w-4 h-4" /> Annotated Samples
               </button>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">
                  {activeTab === 'vocab' && 'Flashcards & Lexical Resource'}
                  {activeTab === 'structures' && 'Task-specific Sentence Blueprints'}
                  {activeTab === 'samples' && 'High-Scoring Essays'}
               </h2>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                  </div>
                  <Button variant="outline" className="border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg h-9 px-3">
                     <Filter className="w-4 h-4" />
                  </Button>
               </div>
            </div>

            {/* Vocabulary */}
            {activeTab === 'vocab' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_VOCAB.map(v => (
                     <div key={v.id} className="group bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2 relative z-10">
                           <h3 className="text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">{v.word}</h3>
                           <button onClick={() => handleSpeech(v.word)} className="p-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                              <Volume2 className="w-4 h-4" />
                           </button>
                        </div>
                        <span className="inline-block px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded mb-4 w-max">
                           {v.type}
                        </span>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{v.meaning}</p>
                        <div className="mt-auto bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-600 relative group/eg">
                           <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">&quot;{v.example}&quot;</p>
                           <button onClick={() => handleCopy(v.example)} className="absolute top-2 right-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 opacity-0 group-hover/eg:opacity-100 transition-opacity">
                              <Copy className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Structures */}
            {activeTab === 'structures' && (
               <div className="space-y-6 max-w-3xl">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1 block">Contrast / Intro</span>
                           <h3 className="font-bold text-slate-900 dark:text-white text-lg">While [Fact], I believe that [Opinion].</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy("While [Fact], I believe that [Opinion].")} className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Copy className="w-4 h-4 mr-1"/> Copy
                        </Button>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Use this in the introduction to quickly state the two sides of the topic and present your personal thesis statement.</p>
                     <div className="bg-slate-50 dark:bg-slate-700/50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">&quot;While there are evident drawbacks to studying overseas, I firmly believe that the benefits are far greater.&quot;</p>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1 block">Advantage Presentation</span>
                           <h3 className="font-bold text-slate-900 dark:text-white text-lg">The most compelling argument in favor of [Topic] is [Point].</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy("The most compelling argument in favor of [Topic] is [Point].")} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Copy className="w-4 h-4 mr-1"/> Copy
                        </Button>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-700/50 border-l-4 border-blue-500 p-4 rounded-r-xl mt-4">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">&quot;The most compelling argument in favor of university education is career advancement.&quot;</p>
                     </div>
                  </div>
               </div>
            )}

            {/* Annotated Samples */}
            {activeTab === 'samples' && (
               <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/15 rounded-xl flex items-center justify-center">
                     <BookMarked className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Band 8.0+ Model Essay & Examiner Notes</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Task 2 · Global Warming · C1 Level</p>
                   </div>
                 </div>

                 <div className="flex flex-col lg:flex-row gap-6">
                   <div className="lg:w-[60%] p-6 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl font-serif text-base leading-loose text-slate-800 dark:text-slate-200">
                     <p>The phenomenon of global warming has become an{' '}
                       <span className="bg-yellow-100 dark:bg-yellow-500/20 border border-yellow-300 dark:border-yellow-500/30 rounded px-1 font-medium cursor-help" title="Lexical Highlight: Powerful academic collocation">
                         unprecedented crisis
                       </span>{' '}
                       in the 21st century.
                     </p>
                   </div>
                   <div className="lg:w-[40%]">
                     <div className="bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 shadow-sm relative">
                       <span className="absolute -top-3 left-4 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/30">
                         Lexical Highlight
                       </span>
                       <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 mt-2">&quot;unprecedented crisis&quot;</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600">
                         A powerful collocation that scores highly for vocabulary range.
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Locked Content */}
                 <div className="relative min-h-[350px]">
                   <div className="select-none pointer-events-none blur-sm opacity-60">
                     <div className="lg:w-[60%] p-6 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl font-serif text-sm text-slate-700 dark:text-slate-300">
                       <p>Furthermore, the burning of fossil fuels releases copious amounts of carbon dioxide...</p>
                     </div>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 dark:via-slate-800/80 to-white dark:to-slate-800"></div>
                   <div className="absolute inset-0 flex items-center justify-center p-4">
                     <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center">
                       <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/10 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-amber-200 dark:border-amber-500/20">
                         <span className="text-2xl">👑</span>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Unlock Full Examiner Analysis</h3>
                       <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                         Nâng cấp lên <strong className="text-slate-700 dark:text-slate-200">VSTEP Pro</strong> để đọc toàn bộ bài văn Band 8.0+ này.
                       </p>
                       <Button className="w-full py-5 bg-gradient-to-r from-vstep-dark to-emerald-800 hover:from-emerald-800 hover:to-vstep-dark text-white rounded-xl text-sm font-bold">
                         🌟 Upgrade to Pro Now
                       </Button>
                       <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-medium">Starting from 49.000đ / month</p>
                     </div>
                   </div>
                 </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
