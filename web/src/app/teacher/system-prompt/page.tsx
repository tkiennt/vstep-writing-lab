'use client';

import React, { useState } from 'react';
import { 
  Save, 
  BrainCircuit, 
  Play,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';

export default function SystemPromptManager() {
  const [testMode, setTestMode] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const mockRunTest = () => {
    setTestLoading(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult(JSON.stringify({
        overallBand: 6.5,
        scores: { task: 7.0, coherence: 6.5, lexical: 6.0, grammar: 5.5 },
        feedback: "Decent attempt but lacks grammatical precision."
      }, null, 2));
      setTestLoading(false);
    }, 2000);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
           <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" /> System Prompt Builder
           </h1>
           <div className="flex items-center gap-3">
              <Button 
                variant={testMode ? "default" : "outline"} 
                onClick={() => setTestMode(!testMode)}
                className={`flex items-center gap-2 rounded-xl transition-all ${testMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
              >
                 <Play className="w-4 h-4" /> {testMode ? 'Exit Playground' : 'Enter Test Environment'}
              </Button>
              <Button className="flex items-center gap-2 bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl shadow-sm">
                 <Save className="w-4 h-4" /> Save System Prompt
              </Button>
           </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full p-8">
           <div className={`mx-auto grid gap-8 pb-20 transition-all duration-500 ease-in-out ${testMode ? 'grid-cols-2 max-w-full' : 'grid-cols-1 max-w-4xl'}`}>
              
              {/* Prompt Editor */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px] relative transition-all">
                 <div className="px-6 py-4 bg-gray-900 flex items-center justify-between shrink-0">
                    <div className="flex gap-1.5">
                       <div className="w-3 h-3 rounded-full bg-red-500"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                       <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-xs font-mono text-gray-400">system_vstep_ai_v2.txt</span>
                 </div>
                 
                 <div className="flex-1 p-6 relative bg-[#1E1E1E]">
                    <div className="absolute inset-0 w-full h-full font-mono text-sm leading-8 select-none p-6 text-gray-500 border-none outline-none resize-none z-10 break-words pointer-events-none">
                       {/* Extremely basic visual mock for colored variables, a real app would use CodeMirror/Monaco */}
                       You are a Cambridge Examiner assessing a <span className="bg-blue-500/20 text-blue-300 font-bold px-1 rounded">{`{{ STUDENT_ESSAY }}`}</span> against <span className="bg-emerald-500/20 text-emerald-300 font-bold px-1 rounded">{`{{ TOPIC_PROMPT }}`}</span>. Output must be strictly JSON format matching <span className="bg-amber-500/20 text-amber-300 font-bold px-1 rounded">{`{{ JSON_SCHEMA }}`}</span>. Be unforgiving for C1 targets (<span className="bg-red-500/20 text-red-300 font-bold px-1 rounded">{`{{ TARGET_BAND }}`}</span>).
                    </div>
                    <textarea 
                       defaultValue={`You are a Cambridge Examiner assessing a {{ STUDENT_ESSAY }} against {{ TOPIC_PROMPT }}. Output must be strictly JSON format matching {{ JSON_SCHEMA }}. Be unforgiving for C1 targets ({{ TARGET_BAND }}).

Examine the following:
1. Lexical coherence.
2. Grammar accuracy.

Ensure your tone is strict but professional.`}
                       className="absolute inset-0 w-full h-full font-mono text-sm leading-8 text-transparent bg-transparent caret-white p-6 outline-none resize-none z-20"
                       spellCheck={false}
                    />
                 </div>
              </div>

              {/* Test Environment Panel (Only visible in testMode) */}
              {testMode && (
                 <div className="bg-gray-50 rounded-3xl border border-gray-200 shadow-inner overflow-hidden flex flex-col h-[700px] animate-in slide-in-from-right-8 duration-300">
                    
                    {/* Top: Input Mock Essay */}
                    <div className="p-6 border-b border-gray-200 flex-1 flex flex-col bg-white">
                       <h3 className="font-bold text-gray-900 text-sm mb-3">1. Paste Mock Essay ({`{{ STUDENT_ESSAY }}`})</h3>
                       <textarea 
                          placeholder="Paste a student essay here to test the prompt against..." 
                          className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-serif outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none mb-4"
                          defaultValue="I think that study abroad is very good for student. Firstly, they can learn many things..."
                       />
                       <div className="flex justify-end gap-3 shrink-0">
                          <Button variant="outline" className="border-gray-200">
                             <RotateCcw className="w-4 h-4 mr-2"/> Reset
                          </Button>
                          <Button onClick={mockRunTest} disabled={testLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]">
                             {testLoading ? 'Running...' : <><Play className="w-4 h-4 mr-2"/> Test Prompt</>}
                          </Button>
                       </div>
                    </div>

                    {/* Bottom: AI Output JSON */}
                    <div className="p-6 bg-gray-900 flex-1 flex flex-col relative">
                       <h3 className="font-bold text-emerald-400 text-sm mb-3 font-mono flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> 2. AI Output JSON Preview
                       </h3>
                       <div className="flex-1 bg-black/50 border border-gray-800 rounded-xl p-4 overflow-auto custom-scrollbar relative">
                          {testLoading ? (
                             <div className="absolute inset-0 flex items-center justify-center text-indigo-400 font-mono text-xs animate-pulse">
                                Awaiting response from Gemini Engine...
                             </div>
                          ) : testResult ? (
                             <pre className="font-mono text-xs text-green-300 w-full">
                                {testResult}
                             </pre>
                          ) : (
                             <p className="text-gray-600 font-mono text-xs text-center mt-20">Click 'Test Prompt' to see results</p>
                          )}
                       </div>
                    </div>

                 </div>
              )}

           </div>
        </main>
      </div>
    </>
  );
}
