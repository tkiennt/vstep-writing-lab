'use client';

import React, { useState, useEffect } from 'react';
import { History, FileText, ChevronRight, Clock, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { submissionService } from '@/services/submissionService';
import { SubmissionListItemResponse } from '@/types';
import { useGlobal } from '@/components/GlobalProvider';

export default function HistoryPage() {
  const [submissions, setSubmissions] = useState<SubmissionListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useGlobal();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await submissionService.getHistory();
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching history:', error);
        addToast('error', 'Failed to load practice history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [addToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Practice History</h1>
        <p className="text-gray-500 mt-2">View all your past essays and feedback reports</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <History className="h-16 w-16 text-gray-200 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No essays yet</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Start practicing to see your diagnostic reports and improvements here.</p>
          <Link href="/practice-list">
            <Button className="bg-vstep-dark hover:bg-emerald-900 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-emerald-900/10">
              <FileText className="mr-2 h-4 w-4" />
              Start Writing Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((s) => (
            <Link key={s.submissionId} href={`/results/${s.submissionId}`}>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    s.status === 'scored' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {s.status === 'scored' ? (
                      <span className="text-xl font-black">{s.overallScore?.toFixed(1) || '0.0'}</span>
                    ) : (
                      <Clock className="w-6 h-6 animate-pulse" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        s.taskType.toLowerCase().includes('task 1') ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'
                      }`}>
                        {s.taskType}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {s.questionTitle || 'Writing Submission'}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">{s.wordCount} words • {s.mode} mode</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {s.status === 'pending' && (
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full">Evaluating...</span>
                  )}
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-all">
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
