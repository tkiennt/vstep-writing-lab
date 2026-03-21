'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Lightbulb,
  CheckCircle2,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Plus,
  X,
  Check,
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HintRule {
  id: number;
  title: string;
  description: string;
}

const INITIAL_HINTS: HintRule[] = [
  { id: 1, title: 'Lexical Resource Hint 1', description: 'Always suggest using C1 adverbs like "exceedingly", "remarkably" when students use "very".' },
  { id: 2, title: 'Lexical Resource Hint 2', description: 'Replace "good" with C1-level alternatives: "exceptional", "outstanding", "exemplary".' },
  { id: 3, title: 'Cohesion Hint', description: 'Suggest discourse markers: "Furthermore", "Nevertheless", "Consequently" for paragraph transitions.' },
];

export default function ResourceHintsManager() {
  const [hintsActive, setHintsActive] = useState(true);
  const [hints, setHints] = useState<HintRule[]>(INITIAL_HINTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [noteText, setNoteText] = useState('A powerful collocation that scores highly for vocabulary. Shows awareness of precise academic terms.');
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteOriginal] = useState('A powerful collocation that scores highly for vocabulary. Shows awareness of precise academic terms.');

  const handleAddHint = () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    const newHint: HintRule = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim(),
    };
    setHints([...hints, newHint]);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleDeleteHint = (id: number) => {
    setHints(hints.filter(h => h.id !== id));
  };

  const startEdit = (hint: HintRule) => {
    setEditingId(hint.id);
    setEditTitle(hint.title);
    setEditDesc(hint.description);
  };

  const handleSaveEdit = () => {
    setHints(hints.map(h => h.id === editingId ? { ...h, title: editTitle, description: editDesc } : h));
    setEditingId(null);
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(f => f.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
    e.target.value = '';
  };

  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleCancelNote = () => {
    setNoteText(noteOriginal);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-background">
        
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shrink-0">
           <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" /> Hints &amp; Resources Manager
           </h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-8 pb-20">
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* ========== Hint Manager ========== */}
              <div className="bg-card rounded-3xl border border-border shadow-sm p-8 h-max">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-lg font-bold text-foreground">Hint Manager</h2>
                       <p className="text-sm text-muted-foreground mt-1">Configure global AI hints for students.</p>
                    </div>
                    <button 
                       onClick={() => setHintsActive(!hintsActive)}
                       className="flex items-center gap-2 text-sm font-bold text-foreground"
                    >
                       {hintsActive ? 'Active' : 'Disabled'}
                       {hintsActive ? 
                          <ToggleRight className="w-10 h-10 text-emerald-500" /> : 
                          <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                       }
                    </button>
                 </div>

                 <div className="space-y-4">
                    {hints.map((hint) => (
                       <div key={hint.id} className="flex items-start justify-between p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 hover:border-amber-500/30 transition-colors group">
                          {editingId === hint.id ? (
                            <div className="flex-1 space-y-3 mr-4">
                              <input 
                                type="text" 
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border text-sm font-bold text-foreground outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 bg-background"
                              />
                              <textarea 
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 resize-none bg-background"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-xs text-muted-foreground">Cancel</Button>
                                <Button size="sm" onClick={handleSaveEdit} className="text-xs bg-vstep-dark text-white rounded-lg"><Check className="w-3 h-3 mr-1" /> Save</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 mr-4">
                                 <h4 className="font-bold text-foreground text-sm mb-1">{hint.title}</h4>
                                 <p className="text-sm text-muted-foreground line-clamp-2">{hint.description}</p>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                 <button onClick={() => startEdit(hint)} className="text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                                 <button onClick={() => handleDeleteHint(hint.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </>
                          )}
                       </div>
                    ))}

                    {showAddForm ? (
                      <div className="p-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 space-y-3">
                        <input 
                          type="text" 
                          placeholder="Hint title (e.g. Grammar Suggestion)" 
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 bg-background text-foreground placeholder:text-muted-foreground"
                        />
                        <textarea 
                          placeholder="Describe the hint rule..." 
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 resize-none bg-background text-foreground placeholder:text-muted-foreground"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => { setShowAddForm(false); setNewTitle(''); setNewDesc(''); }} className="text-xs text-muted-foreground">Cancel</Button>
                          <Button size="sm" onClick={handleAddHint} disabled={!newTitle.trim() || !newDesc.trim()} className="text-xs bg-vstep-dark text-white rounded-lg">
                            <Plus className="w-3 h-3 mr-1" /> Add Rule
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setShowAddForm(true)} className="w-full border-dashed border-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl h-12">
                         + Add Global Hint Engine Rule
                      </Button>
                    )}
                 </div>
              </div>

              {/* ========== Resource Importer (CSV) ========== */}
              <div className="bg-card rounded-3xl border border-border shadow-sm p-8 h-max">
                 <div className="mb-8">
                    <h2 className="text-lg font-bold text-foreground">Resource Importer</h2>
                    <p className="text-sm text-muted-foreground mt-1">Bulk upload vocabulary or sample texts via CSV.</p>
                 </div>

                 <input 
                   ref={fileInputRef}
                   type="file" 
                   accept=".csv,.xlsx,.xls" 
                   multiple
                   className="hidden" 
                   onChange={handleFileChange}
                 />

                 <div 
                   className="border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-emerald-500/10 cursor-pointer"
                   onClick={handleBrowseFiles}
                 >
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-sm mb-4 border border-border">
                       <UploadCloud className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Drag &amp; Drop CSV files here</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs">Supports .csv files with columns: Word, Type, Meaning, Example.</p>
                    <Button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleBrowseFiles(); }}
                      className="bg-card text-emerald-400 border border-emerald-500/30 shadow-sm hover:bg-emerald-500/10 rounded-xl px-6"
                    >
                       Browse Files
                    </Button>
                 </div>

                 {uploadSuccess && (
                   <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 animate-in slide-in-from-bottom-2 duration-200">
                     <CheckCircle2 className="w-4 h-4" /> File uploaded successfully!
                   </div>
                 )}

                 {uploadedFiles.length > 0 && (
                   <div className="mt-4 space-y-2">
                     <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Uploaded Files</h4>
                     {uploadedFiles.map((f, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border">
                         <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                           <File className="w-4 h-4 text-muted-foreground" /> {f}
                         </div>
                         <button onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-400 p-1 rounded transition-colors">
                           <X className="w-3.5 h-3.5" />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
           </div>

           {/* ========== Annotation Editor (Sample Texts) ========== */}
           <div className="bg-card rounded-3xl border border-border shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                       <BookOpen className="w-5 h-5 text-blue-400" /> Model Essay Annotation Editor
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Highlight text in samples to add detailed examiner commentary.</p>
                 </div>
                 <select className="border border-border rounded-xl text-sm font-bold text-foreground shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 w-64 bg-background cursor-pointer px-3 py-2">
                    <option>Select Sample Essay...</option>
                    <option>Task 2: Global Warming (Band 8.0)</option>
                 </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 p-8 bg-muted/20 border border-border rounded-2xl font-serif text-lg leading-loose text-foreground">
                    <p>
                       The phenomenon of global warming has become an <span className="bg-amber-400/20 border-b-2 border-amber-400 cursor-pointer rounded px-1">unprecedented crisis</span> in the 21st century. While some attribute this primarily to natural cycles, there is <span className="bg-blue-400/20 border-b-2 border-blue-400 cursor-pointer rounded px-1">overwhelming consensus</span> that human activities are the principal catalysts.
                    </p>
                 </div>
                 <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card border-2 border-amber-500/30 rounded-2xl p-4 shadow-sm relative">
                       <span className="absolute -top-3 left-4 bg-amber-500/15 text-amber-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-amber-500/30">Lexical Highlight</span>
                       <h4 className="font-bold text-foreground text-sm mb-2 mt-1">&quot;unprecedented crisis&quot;</h4>
                       <textarea 
                         className="w-full text-sm text-muted-foreground bg-background rounded-lg border border-border p-3 outline-none h-24 mb-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 resize-none" 
                         value={noteText}
                         onChange={(e) => { setNoteText(e.target.value); setNoteSaved(false); }}
                       />
                       <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelNote} className="text-xs font-semibold text-muted-foreground">Cancel</Button>
                          <Button size="sm" onClick={handleSaveNote} className="text-xs font-semibold bg-vstep-dark text-white rounded-lg">
                            {noteSaved ? <><Check className="w-3 h-3 mr-1" /> Saved!</> : 'Save Note'}
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

        </main>
      </div>
    </>
  );
}
