'use client';

import React, { useState } from 'react';
import {
   UploadCloud,
   FileCheck,
   Zap,
   CheckCircle2,
   X,
   FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';

export default function AdminAIImport() {
   const [file, setFile] = useState<boolean>(false);
   const [status, setStatus] = useState<'idle' | 'reading' | 'done'>('idle');

   const handleUploadClick = () => {
      setFile(true);
      setStatus('reading');
      setTimeout(() => {
         setStatus('done');
      }, 3000);
   };

   return (
      <>
         <div className="flex flex-col h-full">

            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
               <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" /> AI Bulk Topic Importer
               </h1>
               {status === 'done' && (
                  <Button className="bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl shadow-sm px-6">
                     Commit to Database
                  </Button>
               )}
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto w-full max-w-6xl mx-auto space-y-8 pb-20">

               {/* Step 1: Big Upload Zone */}
               {!file ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center h-[50vh] flex flex-col items-center justify-center border-dashed group hover:border-blue-400 transition-colors cursor-pointer" onClick={handleUploadClick}>
                     <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:bg-blue-100 transition-colors">
                        <UploadCloud className="w-12 h-12 text-blue-500" />
                     </div>
                     <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Feed the Database</h2>
                     <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
                        Drag and drop official VSTEP PDF exams here. Our Gemini AI will read, extract, and convert them into structured practice topics automatically.
                     </p>
                     <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 px-8 font-bold shadow-md shadow-blue-600/20 text-lg">
                        Browse PDF Files
                     </Button>
                  </div>
               ) : status === 'reading' ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center h-[50vh] flex flex-col items-center justify-center">
                     <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                        <Zap className="w-10 h-10 text-indigo-500 animate-pulse absolute" />
                        <svg className="absolute inset-0 w-full h-full animate-[spin_2s_linear_infinite]" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" fill="none" className="text-indigo-500" strokeDasharray="300" strokeDashoffset="240" strokeLinecap="round" />
                        </svg>
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing PDF via Gemini Pro Vision...</h2>
                     <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">Extracting text, identifying Task 1 & Task 2 prompts, parsing time limits and levels.</p>
                     <div className="w-full max-w-md bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                        <div className="bg-indigo-500 h-full rounded-full w-[65%] animate-pulse"></div>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">

                     <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-800">
                        <div className="flex items-center gap-3">
                           <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                           <span className="font-bold">Successfully extracted 3 topics from "VSTEP_2024_Official.pdf"</span>
                        </div>
                        <button className="text-emerald-600 hover:text-emerald-800" onClick={() => { setFile(false); setStatus('idle'); }}>
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     {/* Step 2: Data Preview Editable Table */}
                     <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                           <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                           <h3 className="font-bold text-gray-900">Data Review (Editable Grid)</h3>
                        </div>

                        <div className="overflow-x-auto p-4">
                           <table className="w-full border-collapse">
                              <thead>
                                 <tr>
                                    <th className="border border-gray-200 bg-gray-50 text-[10px] font-black uppercase text-gray-500 p-3 text-left w-64">Extracted Title</th>
                                    <th className="border border-gray-200 bg-gray-50 text-[10px] font-black uppercase text-gray-500 p-3 text-left w-32">Type</th>
                                    <th className="border border-gray-200 bg-gray-50 text-[10px] font-black uppercase text-gray-500 p-3 text-left w-32">Level</th>
                                    <th className="border border-gray-200 bg-gray-50 text-[10px] font-black uppercase text-gray-500 p-3 text-left">Full Prompt Text</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr>
                                    <td className="border border-gray-200 p-0">
                                       <input type="text" defaultValue="Email to a new pen pal" className="w-full h-full p-3 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 font-medium text-sm text-gray-900 bg-transparent" />
                                    </td>
                                    <td className="border border-gray-200 p-0">
                                       <select className="w-full h-full p-3 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 font-medium text-sm text-gray-600 bg-transparent appearance-none cursor-pointer">
                                          <option>Task 1</option>
                                          <option>Task 2</option>
                                       </select>
                                    </td>
                                    <td className="border border-gray-200 p-0">
                                       <select className="w-full h-full p-3 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 font-medium text-sm text-gray-600 bg-transparent appearance-none cursor-pointer">
                                          <option>B1</option>
                                          <option>B2</option>
                                          <option>C1</option>
                                       </select>
                                    </td>
                                    <td className="border border-gray-200 p-0">
                                       <textarea defaultValue="You have received an email from your new pen pal, Mark. Write a reply..." className="w-full h-full p-3 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 bg-transparent resize-none leading-relaxed" rows={2} />
                                    </td>
                                 </tr>
                                 <tr>
                                    <td className="border border-gray-200 p-0">
                                       <input type="text" defaultValue="Impact of Social Media" className="w-full h-full p-3 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 font-medium text-sm text-gray-900 bg-transparent" />
                                    </td>
                                    <td className="border border-gray-200 p-0">
                                       <select className="w-full h-full p-3 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 font-medium text-sm text-gray-600 bg-transparent appearance-none cursor-pointer">
                                          <option>Task 2</option>
                                          <option>Task 1</option>
                                       </select>
                                    </td>
                                    <td className="border border-gray-200 p-0">
                                       <select className="w-full h-full p-3 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 font-medium text-sm text-gray-600 bg-transparent appearance-none cursor-pointer" defaultValue="B2">
                                          <option>B1</option>
                                          <option value="B2">B2</option>
                                          <option>C1</option>
                                       </select>
                                    </td>
                                    <td className="border border-gray-200 p-0">
                                       <textarea defaultValue="Many people argue that social media has negatively impacted real-life interactions. Discuss..." className="w-full h-full p-3 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 bg-transparent resize-none leading-relaxed" rows={2} />
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <div className="bg-amber-50 p-4 border-t border-amber-100 flex items-center justify-between">
                           <p className="text-amber-800 text-xs font-bold uppercase tracking-wider">Please review cells before saving</p>
                        </div>
                     </div>

                  </div>
               )}

            </main>
         </div>
      </>
   );
}
