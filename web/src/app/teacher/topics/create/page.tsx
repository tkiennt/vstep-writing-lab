'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
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
import { useSearchParams, useRouter } from 'next/navigation';
import { adminQuestionService } from '@/services/admin/adminQuestionService';

export default function CreateTopic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Task 1',
    level: 'B1',
    content: '',
    status: 'draft'
  });

  useEffect(() => {
    if (editId) {
      setFetching(true);
      // We would ideally have a getById in adminQuestionService
      // but if not, we get all and find it, or we assume getById exists:
      apiFetchTopic(editId);
    }
  }, [editId]);

  const apiFetchTopic = async (id: string) => {
    try {
      // Temporary workaround if getById is not exported directly:
      // In a real scenario we'd call adminQuestionService.getById(id)
      const all = await adminQuestionService.getAll();
      const match = all.find(q => q.id === id);
      if (match) {
        setFormData({
          title: match.title || '',
          type: match.type || 'Task 1',
          level: match.level || 'B1',
          content: (match as any).content || '', // assuming content exists
          status: match.status || 'draft'
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (status: string) => {
    if (!formData.title) {
      alert('Please enter a topic title');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData, status };
      if (editId) {
        await adminQuestionService.update(editId, payload);
      } else {
        await adminQuestionService.create(payload);
      }
      router.push('/teacher/topics');
      router.refresh();
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save the topic');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-foreground">{editId ? 'Edit Topic' : 'Create New Topic'}</h1>
           </div>
           <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-foreground border-border hover:bg-muted"
                onClick={() => handleSave('draft')}
                disabled={loading}
              >
                 <Save className="w-4 h-4" /> Save as Draft
              </Button>
              <Button 
                className="flex items-center gap-2 bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl shadow-sm"
                onClick={() => handleSave('published')}
                disabled={loading}
              >
                 <Eye className="w-4 h-4" /> {editId ? 'Update & Publish' : 'Save & Publish'}
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
                       <input 
                         type="text" 
                         value={formData.title}
                         onChange={e => setFormData({...formData, title: e.target.value})}
                         placeholder="e.g. Advantages and Disadvantages of Studying Abroad" 
                         className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground">Task Type</label>
                       <select 
                         value={formData.type}
                         onChange={e => setFormData({...formData, type: e.target.value})}
                         className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-background text-foreground"
                       >
                          <option value="Task 1">Task 1 (Letter/Email)</option>
                          <option value="Task 2">Task 2 (Essay)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground">Level Focus</label>
                       <select 
                         value={formData.level}
                         onChange={e => setFormData({...formData, level: e.target.value})}
                         className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-background text-foreground"
                       >
                          <option value="B1">B1</option>
                          <option value="B2">B2</option>
                          <option value="C1">C1</option>
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
                          value={formData.content}
                          onChange={e => setFormData({...formData, content: e.target.value})}
                          placeholder="Enter the exact prompt students will see..." 
                          className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground resize-y"
                       />
                    </div>
                 </div>
              </section>
           </div>
        </main>
      </div>
    </>
  );
}
