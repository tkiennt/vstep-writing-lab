'use client';

import { History, FileText } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Practice History</h1>
        <p className="text-gray-600 mt-2">View all your past essays and feedback</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
        <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No essays yet</h2>
        <p className="text-gray-600 mb-6">Start practicing to see your essay history here</p>
        <a
          href="/practice"
          className="inline-flex items-center bg-vstep-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <FileText className="mr-2 h-4 w-4" />
          Start Writing
        </a>
      </div>
    </div>
  );
}
