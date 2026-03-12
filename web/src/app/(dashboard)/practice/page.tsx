'use client';

import { useEffect, useState } from 'react';
import { PenTool, Clock, BookOpen } from 'lucide-react';
import { topicService } from '@/services/essayService';
import { Topic } from '@/types';

export default function PracticePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await topicService.getAllTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
      // Mock data for demo
      setTopics([
        {
          id: '1',
          title: 'Technology in Education',
          taskType: 'opinion',
          prompt: 'Some people believe that technology has revolutionized education. Others think that traditional methods are still the best. Discuss both views and give your opinion.',
          instructions: 'Write an essay discussing both views. Provide reasons and examples.',
          wordLimit: 250,
          timeLimit: 40,
          difficulty: 'B2',
          category: 'Education',
        },
        {
          id: '2',
          title: 'Environmental Protection',
          taskType: 'problem-solution',
          prompt: 'Global warming is one of the biggest threats facing our planet today. What are the causes of global warming? What solutions can you suggest?',
          instructions: 'Write about the causes and suggest possible solutions.',
          wordLimit: 250,
          timeLimit: 40,
          difficulty: 'B2',
          category: 'Environment',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Writing Practice</h1>
        <p className="text-gray-600 mt-2">Choose a topic and start improving your writing skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          topic.difficulty === 'B1' ? 'bg-blue-100 text-blue-700' :
          topic.difficulty === 'B2' ? 'bg-green-100 text-green-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {topic.difficulty}
        </span>
        <BookOpen className="h-5 w-5 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{topic.prompt}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {topic.timeLimit} min
        </div>
        <div className="flex items-center">
          <PenTool className="h-4 w-4 mr-1" />
          {topic.wordLimit} words
        </div>
      </div>

      <a
        href={`/practice/${topic.id}`}
        className="block w-full bg-vstep-blue hover:bg-blue-700 text-white text-center py-2 rounded-lg font-medium transition-colors"
      >
        Start Writing
      </a>
    </div>
  );
}
