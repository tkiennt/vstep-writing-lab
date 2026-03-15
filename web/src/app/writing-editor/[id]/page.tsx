'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Info,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useGlobal } from '@/components/GlobalProvider';
import { useRouter } from 'next/navigation';

// ========== MOCK DATA matching Practice List ==========
const MOCK_TOPICS: Record<string, {
  id: string; title: string; type: string; level: string;
  timeLimit: number; minWords: number;
  prompt: string; hints: { title: string; content: string }[];
}> = {
  T001: {
    id: 'T001', title: 'Advantages of Studying Abroad', type: 'Task 2', level: 'B2',
    timeLimit: 40, minWords: 250,
    prompt: 'In the modern world, an increasing number of students choose to go abroad for their higher education.\n\nDiscuss the advantages and disadvantages of studying abroad. Give reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
    hints: [
      { title: 'Suggested Structure', content: 'Intro: Hook, Paraphrase prompt, Thesis statement.\nBody 1: Advantages (World-class education, cultural exposure).\nBody 2: Disadvantages (Culture shock, high costs).\nOutro: Summary and final opinion.' },
      { title: 'High-scoring Vocabulary', content: 'Broaden horizons, Language barrier, Exorbitant fees, Immerse in culture, Global perspective' },
    ]
  },
  T002: {
    id: 'T002', title: 'Formal Email to Hotel Manager', type: 'Task 1', level: 'B1',
    timeLimit: 20, minWords: 120,
    prompt: 'You recently stayed at a hotel and left your laptop charger in your room. Write an email to the hotel manager.\n\nIn your email:\n- Give details of your stay (room number, dates)\n- Explain what you left and where it might be\n- Ask them to send it back to you and explain how you will pay for the postage.\n\nWrite at least 120 words.',
    hints: [
      { title: 'Suggested Structure', content: '1. Greeting (Dear Sir/Madam,)\n2. Purpose of email & Stay details\n3. Description and location of the item\n4. Request for return & Postage payment\n5. Sign-off (Yours faithfully,)' },
      { title: 'Useful Vocabulary', content: 'recently stayed, accidentally left behind, appreciate your assistance, tracking number, cover the postage costs, at your earliest convenience' },
      { title: 'Grammar Note', content: 'Use formal modals for requests: "Could you please check...", "Would it be possible to...", "I would be grateful if..."' }
    ]
  },
  T003: {
    id: 'T003', title: 'Impact of AI on Modern Jobs', type: 'Task 2', level: 'C1',
    timeLimit: 40, minWords: 250,
    prompt: 'Artificial intelligence is increasingly being used to automate tasks in many industries.\n\nDiscuss the potential impacts of AI on the modern job market. Consider both the opportunities and the challenges.\n\nWrite at least 250 words.',
    hints: [
      { title: 'Suggested Structure', content: 'Intro: Define AI briefly, state its growing influence.\nBody 1: Opportunities (new job creation, productivity gains).\nBody 2: Challenges (job displacement, skill gaps).\nOutro: Balanced conclusion with personal opinion.' },
      { title: 'C1-level Vocabulary', content: 'Automation, displacement, upskilling, augment human capabilities, unprecedented, paradigm shift, redundancy' },
    ]
  },
  T004: {
    id: 'T004', title: 'Informal Letter to a Friend', type: 'Task 1', level: 'B1',
    timeLimit: 20, minWords: 120,
    prompt: 'Your friend has recently moved to a new city. Write a letter to your friend.\n\nIn your letter:\n- Ask about their new home and neighborhood\n- Tell them about something interesting that happened recently\n- Suggest a time to visit them\n\nWrite at least 120 words.',
    hints: [
      { title: 'Suggested Structure', content: '1. Informal greeting (Hi / Hey [Name],)\n2. Ask about their new life\n3. Share your news\n4. Propose a visit\n5. Casual sign-off (Take care, / See you soon,)' },
      { title: 'Useful Phrases', content: 'How are you settling in?, I bet you\'re loving..., You won\'t believe what happened!, How about I come visit you...?, Drop me a line when you\'re free' },
    ]
  },
};

export default function WritingEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showModal, addToast } = useGlobal();

  // Look up topic data by ID from URL params
  const topic = MOCK_TOPICS[params.id] || MOCK_TOPICS['T001'];

  const [text, setText] = useState('');
  const [timeLeft, setTimeLeft] = useState(topic.timeLimit * 60);
  const [showHints, setShowHints] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Word count calc
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const minWords = topic.minWords;
  const isSufficient = wordCount >= minWords;

  // Auto-save simulation
  useEffect(() => {
    if (text.length > 50) {
      const timer = setInterval(() => {
        addToast('success', 'Draft auto-saved');
      }, 60000); // every 1 min
      return () => clearInterval(timer);
    }
  }, [text, addToast]);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300; // less than 5 minutes

  const handleSubmit = () => {
    showModal({
      title: 'Submit your essay?',
      description: 'Are you sure you want to submit your writing for AI evaluation? You cannot modify it afterwards.',
      confirmText: 'Yes, Submit',
      cancelText: 'Keep writing',
      type: 'warning',
      onConfirm: () => {
        addToast('loading', 'AI is analyzing your submission...');
        setTimeout(() => {
          router.push(`/results/${params.id}`);
        }, 1500); // fake network delay
      }
    });
  };

  const handleLeave = () => {
    if (wordCount > 10) {
      showModal({
         title: 'Discard draft?',
         description: 'You have unsaved changes. Are you sure you want to leave this page?',
         confirmText: 'Leave',
         cancelText: 'Stay',
         type: 'danger',
         onConfirm: () => router.push('/practice-list')
      });
    } else {
      router.push('/practice-list');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50/50">
      
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 relative z-20">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleLeave} className="text-gray-500 hover:bg-gray-100 rounded-full">
               <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
               <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${topic.type === 'Task 1' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'}`}>{topic.type}</span>
               <h1 className="text-lg font-bold text-gray-900 hidden sm:block">{topic.title}</h1>
            </div>
         </div>
      </header>

      {/* Split View Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
         
         {/* Left Column: Prompt & Hints (40%) */}
         <div className={`w-full md:w-[40%] bg-white border-r border-gray-100 flex flex-col ${!isReady ? 'hidden md:flex' : 'hidden'}`}>
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
               
               <div className="mb-8">
                  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Writing Prompt</h2>
                  <div className="prose prose-sm prose-gray max-w-none text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                    <p className="whitespace-pre-line">{topic.prompt}</p>
                  </div>
               </div>

               {/* Hint Panel Accordion */}
               <div className="rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setShowHints(!showHints)}
                    className="w-full bg-emerald-50/50 px-5 py-4 flex items-center justify-between text-left hover:bg-emerald-50 transition-colors"
                  >
                     <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-emerald-900">AI Assistant Hints</span>
                     </div>
                     <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform ${showHints ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showHints && (
                    <div className="p-5 bg-white space-y-5 animate-in slide-in-from-top-2 duration-200">
                       {topic.hints.map((hint, idx) => (
                         <div key={idx} className="space-y-2">
                           {idx > 0 && <div className="h-px bg-gray-100 w-full"></div>}
                           <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-gray-400"/> {hint.title}</h4>
                           <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-line">
                             {hint.content}
                           </p>
                           <div className="flex gap-2 justify-end mt-1">
                              <button className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                              <button className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                           </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>

            </div>
         </div>

         {/* Right Column: Editor (60%) */}
         <div className={`w-full md:w-[60%] flex flex-col bg-[#FDFDFD] ${!isReady ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Formatting Toolbar */}
            <div className="h-12 border-b border-gray-100 bg-white flex items-center px-4 gap-1 shrink-0">
               <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Bold className="w-4 h-4" /></button>
               <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Italic className="w-4 h-4" /></button>
               <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Underline className="w-4 h-4" /></button>
               <div className="w-px h-5 bg-gray-200 mx-2"></div>
               <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><List className="w-4 h-4" /></button>
               <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ListOrdered className="w-4 h-4" /></button>
            </div>

            {/* Rich Text Editor Mock */}
            <div className="flex-1 relative">
               <textarea 
                  className="absolute inset-0 w-full h-full p-8 md:p-12 resize-none outline-none font-serif text-lg leading-loose text-gray-800 bg-transparent placeholder-gray-300 custom-scrollbar"
                  placeholder="Start writing your essay here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
               />
            </div>
         </div>
      </div>

      {/* Crucial: Status Bar Fixed Bottom */}
      <footer className="h-16 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
         
         <div className="flex items-center gap-6">
            {/* Word Count */}
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Word Count</span>
               <div className={`flex items-baseline gap-1.5 font-bold ${isSufficient ? 'text-emerald-600' : 'text-red-500'}`}>
                  <span className="text-lg leading-none">{wordCount}</span>
                  <span className="text-xs text-gray-400">/ {minWords} min</span>
               </div>
            </div>

            {/* Timer */}
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Time Left</span>
               <div className={`flex items-center gap-1.5 font-bold ${isLowTime ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-lg leading-none font-mono tracking-tight">{formatTime(timeLeft)}</span>
               </div>
            </div>
         </div>

         {/* Actions */}
         <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-400">Draft saved 1m ago</span>
            <Button 
              onClick={handleSubmit}
              disabled={!isSufficient} 
              className={`rounded-xl h-11 px-6 font-bold shadow-sm transition-all
               ${isSufficient ? 'bg-vstep-dark hover:bg-emerald-900 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
               Submit Essay
            </Button>
         </div>

      </footer>
    
    </div>
  );
}
