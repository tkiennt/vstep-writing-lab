'use client';

import React, { useState } from 'react';
import { 
  BookMarked,
  Volume2,
  Copy,
  MessageSquareQuote,
  CheckCircle2,
  Search,
  Filter,
  Library
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
    // Basic text-to-speech
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
           <Library className="w-8 h-8 text-emerald-600" /> Learning Resources
        </h1>
        <p className="text-gray-500 mt-2">Enrich your vocabulary, master sentence structures, and study sample essays.</p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
         
         {/* Vertical Sidebar Tabs */}
         <div className="w-full md:w-64 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 p-4 shrink-0">
            <div className="space-y-2">
               <button 
                  onClick={() => setActiveTab('vocab')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3
                     ${activeTab === 'vocab' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100/50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
               >
                  <BookMarked className="w-4 h-4" /> Vocabulary Bank
               </button>
               <button 
                  onClick={() => setActiveTab('structures')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3
                     ${activeTab === 'structures' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100/50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
               >
                  <MessageSquareQuote className="w-4 h-4" /> Sentence Structures
               </button>
               <button 
                  onClick={() => setActiveTab('samples')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3
                     ${activeTab === 'samples' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100/50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
               >
                  <FileText className="w-4 h-4" /> Annotated Samples
               </button>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
            
            {/* Toolbar Area */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
               <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest text-xs">
                  {activeTab === 'vocab' && 'Flashcards & Lexical Resource'}
                  {activeTab === 'structures' && 'Task-specific Sentence Blueprints'}
                  {activeTab === 'samples' && 'High-Scoring Essays'}
               </h2>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium" />
                  </div>
                  <Button variant="outline" className="border-gray-200 text-gray-600 rounded-lg h-9 px-3">
                     <Filter className="w-4 h-4" />
                  </Button>
               </div>
            </div>

            {/* View: Vocabulary */}
            {activeTab === 'vocab' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_VOCAB.map(v => (
                     <div key={v.id} className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2 relative z-10">
                           <h3 className="text-2xl font-serif font-bold text-vstep-dark tracking-tight">{v.word}</h3>
                           <button onClick={() => handleSpeech(v.word)} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                              <Volume2 className="w-4 h-4" />
                           </button>
                        </div>
                        <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded mb-4 w-max">
                           {v.type}
                        </span>
                        <p className="text-sm font-semibold text-gray-700 mb-4">{v.meaning}</p>
                        <div className="mt-auto bg-gray-50 p-3 rounded-xl border border-gray-100 relative group/eg">
                           <p className="text-xs text-gray-600 italic leading-relaxed">"{v.example}"</p>
                           <button onClick={() => handleCopy(v.example)} className="absolute top-2 right-2 text-gray-400 hover:text-emerald-600 opacity-0 group-hover/eg:opacity-100 transition-opacity">
                              <Copy className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* View: Structures */}
            {activeTab === 'structures' && (
               <div className="space-y-6 max-w-3xl">
                  {/* Item 1 */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm border-gray-200 hover:border-emerald-300 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1 block">Contrast / Intro</span>
                           <h3 className="font-bold text-gray-900 text-lg">While [Fact], I believe that [Opinion].</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy("While [Fact], I believe that [Opinion].")} className="text-gray-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Copy className="w-4 h-4 mr-1"/> Copy
                        </Button>
                     </div>
                     <p className="text-sm text-gray-600 mb-4">Use this in the introduction to quickly state the two sides of the topic and present your personal thesis statement.</p>
                     <div className="bg-gray-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                        <p className="text-sm font-medium text-gray-800 italic">"While there are evident drawbacks to studying overseas, I firmly believe that the benefits are far greater."</p>
                     </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm border-gray-200 hover:border-emerald-300 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Advantage Presentation</span>
                           <h3 className="font-bold text-gray-900 text-lg">The most compelling argument in favor of [Topic] is [Point].</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy("The most compelling argument in favor of [Topic] is [Point].")} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Copy className="w-4 h-4 mr-1"/> Copy
                        </Button>
                     </div>
                     <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-xl mt-4">
                        <p className="text-sm font-medium text-gray-800 italic">"The most compelling argument in favor of university education is career advancement."</p>
                     </div>
                  </div>
               </div>
            )}

            {/* View: Annotated Samples — LockedStudentEssayView */}
            {activeTab === 'samples' && (
               <div className="space-y-6">

                 {/* Title */}
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                     <BookMarked className="w-5 h-5 text-emerald-600" />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-gray-900 tracking-tight">Band 8.0+ Model Essay & Examiner Notes</h3>
                     <p className="text-xs text-gray-500 font-medium">Task 2 · Global Warming · C1 Level</p>
                   </div>
                 </div>

                 {/* FREE CONTENT */}
                 <div className="flex flex-col lg:flex-row gap-6">
                   {/* Essay */}
                   <div className="lg:w-[60%] p-6 bg-gray-50 border border-gray-200 rounded-2xl font-serif text-base leading-loose text-gray-800 selection:bg-emerald-200">
                     <p>
                       The phenomenon of global warming has become an{' '}
                       <span className="bg-yellow-100 border border-yellow-300 rounded px-1 font-medium cursor-help" title="Lexical Highlight: Powerful academic collocation">
                         unprecedented crisis
                       </span>{' '}
                       in the 21st century. While some attribute this primarily to natural cycles, there is overwhelming consensus among scientists that human activities are the principal catalysts. This essay will examine the major causes of climate change and propose practical solutions.
                     </p>
                   </div>
                   {/* Annotation Card - Read Only */}
                   <div className="lg:w-[40%]">
                     <div className="bg-white border-2 border-amber-200 rounded-2xl p-5 shadow-sm relative">
                       <span className="absolute -top-3 left-4 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">
                         Lexical Highlight
                       </span>
                       <h4 className="font-bold text-gray-900 text-sm mb-3 mt-2">&quot;unprecedented crisis&quot;</h4>
                       <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                         A powerful collocation that scores highly for vocabulary range. Demonstrates awareness of precise academic terms and shows the writer can express urgency without informal language.
                       </p>
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

                 {/* LOCKED CONTENT */}
                 <div className="relative min-h-[350px]">
                   {/* Blurred Preview */}
                   <div className="select-none pointer-events-none" aria-hidden="true">
                     <div className="flex flex-col lg:flex-row gap-6">
                       <div className="lg:w-[60%] p-6 bg-gray-50 border border-gray-200 rounded-2xl font-serif text-base leading-loose text-gray-800">
                         <p className="blur-[2px]">
                           Furthermore, the burning of fossil fuels releases{' '}
                           <span className="bg-yellow-100 border border-yellow-300 rounded px-1">copious amounts</span>{' '}
                           of carbon dioxide into the atmosphere, creating a{' '}
                           <span className="bg-blue-100 border border-blue-300 rounded px-1">greenhouse effect</span>{' '}
                           that traps heat and raises global temperatures.
                         </p>
                         <p className="mt-4 blur-[3px]">
                           In terms of solutions, governments should{' '}
                           <span className="bg-green-100 border border-green-300 rounded px-1">incentivize renewable energy</span>{' '}
                           through tax breaks and subsidies. Citizens can also contribute by reducing their carbon footprint.
                         </p>
                       </div>
                       <div className="lg:w-[40%] space-y-4">
                         <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-sm blur-[2px]">
                           <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">Cohesion</span>
                           <h4 className="font-bold text-gray-900 text-sm mt-3">&quot;Furthermore&quot;</h4>
                           <p className="text-sm text-gray-600 mt-2">Effective transition word for coherence criteria.</p>
                         </div>
                         <div className="bg-white border-2 border-green-200 rounded-2xl p-5 shadow-sm blur-[3px]">
                           <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">Grammar</span>
                           <h4 className="font-bold text-gray-900 text-sm mt-3">&quot;should incentivize&quot;</h4>
                           <p className="text-sm text-gray-600 mt-2">Modal + formal verb for C1 grammatical control.</p>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Gradient Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

                   {/* CTA Card */}
                   <div className="absolute inset-0 flex items-center justify-center p-4">
                     <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full text-center relative overflow-hidden">
                       <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>
                       <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
                       <div className="relative z-10">
                         <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-amber-200/50">
                           <span className="text-2xl">👑</span>
                         </div>
                         <h3 className="text-xl font-black text-gray-900 tracking-tight mb-3">Unlock Full Examiner Analysis</h3>
                         <p className="text-sm text-gray-500 leading-relaxed mb-6">
                           Nâng cấp lên <strong className="text-gray-700">VSTEP Pro</strong> để đọc toàn bộ bài văn Band 8.0+ này và xem chi tiết các chú thích từ vựng, ngữ pháp ăn điểm.
                         </p>
                         <Button className="w-full py-5 bg-gradient-to-r from-vstep-dark to-emerald-800 hover:from-emerald-800 hover:to-vstep-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 transition-all duration-200">
                           🌟 Upgrade to Pro Now
                         </Button>
                         <p className="text-[11px] text-gray-400 mt-3 font-medium">Starting from 49.000đ / month</p>
                       </div>
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

// Needed since we use FileText from lucide-react but it was missing in the top import
import { FileText } from 'lucide-react';
