'use client';

import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  BookOpen, 
  AlignLeft,
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CreateTopic() {
  return (
    <>
      <div className="flex flex-col h-full bg-background">
        
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shrink-0">
           <div className="flex items-center gap-4">
              <Link href="/teacher/topics">
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
                    <ArrowLeft className="w-5 h-5" />
                 </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Create New Topic</h1>
           </div>
           <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2 text-foreground border-border hover:bg-muted">
                 <Eye className="w-4 h-4" /> Preview
              </Button>
              <Button className="flex items-center gap-2 bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl shadow-sm">
                 <Save className="w-4 h-4" /> Save &amp; Publish
              </Button>
           </div>
        </header>

        {/* Form Content */}
        <main className="flex-1 overflow-y-auto w-full">
           <div className="max-w-4xl mx-auto p-8 space-y-8 pb-20">
              
              {/* General Settings */}
              <section className="bg-card rounded-2xl border border-border shadow-sm p-8">
                 <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-muted-foreground" /> Topic Settings
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-sm font-medium text-foreground">Topic Title</label>
                       <input type="text" placeholder="e.g. Advantages and Disadvantages of Studying Abroad" className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground">Task Type</label>
                       <select className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-background text-foreground">
                          <option>Task 1 (Letter/Email)</option>
                          <option>Task 2 (Essay)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground">Level Focus</label>
                       <select className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-background text-foreground">
                          <option>B1</option>
                          <option>B2</option>
                          <option>C1</option>
                          <option>B1 - B2</option>
                          <option>B2 - C1</option>
                       </select>
                    </div>
                 </div>
              </section>

              {/* Topic Prompt Area */}
              <section className="bg-card rounded-2xl border border-border shadow-sm p-8">
                 <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <AlignLeft className="w-5 h-5 text-muted-foreground" /> Topic Prompt
                 </h2>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground">Full Prompt Content</label>
                       <textarea 
                          rows={6}
                          placeholder="Enter the exact prompt students will see..." 
                          className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground resize-y"
                       />
                    </div>
                 </div>
              </section>

              {/* Hints & Vocabulary Support */}
              <section className="bg-card rounded-2xl border border-border shadow-sm p-8">
                 <h2 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                       <BookOpen className="w-5 h-5 text-muted-foreground" /> Structure &amp; Vocabulary Hints
                    </span>
                    <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-semibold text-xs border border-emerald-500/30">
                       <Plus className="w-4 h-4 mr-1" /> Add Hint
                    </Button>
                 </h2>
                 
                 <div className="bg-muted/30 p-4 rounded-xl border border-border mb-4 flex items-start justify-between group">
                    <div className="flex-1 mr-4">
                       <input type="text" defaultValue="Structure Suggestion" className="font-semibold text-sm bg-transparent border-none outline-none text-foreground mb-2 w-full" />
                       <textarea rows={2} defaultValue="Consider a 4-paragraph structure: Introduction, Arguments for, Arguments against, Conclusion." className="w-full bg-transparent border-none outline-none text-sm text-muted-foreground resize-none h-auto overflow-hidden" />
                    </div>
                    <button className="text-muted-foreground/30 hover:text-red-400 transition-colors bg-card p-1 rounded shadow-sm border border-border">
                       <X className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="bg-muted/30 p-4 rounded-xl border border-border flex items-start justify-between group">
                    <div className="flex-1 mr-4">
                       <input type="text" defaultValue="Vocabulary Focus" className="font-semibold text-sm bg-transparent border-none outline-none text-foreground mb-2 w-full" />
                       <textarea rows={2} defaultValue="global perspective, cultural immersion, familiar environment, exorbitant tuition" className="w-full bg-transparent border-none outline-none text-sm text-muted-foreground resize-none h-auto overflow-hidden font-mono" />
                    </div>
                    <button className="text-muted-foreground/30 hover:text-red-400 transition-colors bg-card p-1 rounded shadow-sm border border-border">
                       <X className="w-4 h-4" />
                    </button>
                 </div>
              </section>

           </div>
        </main>
      </div>
    </>
  );
}
