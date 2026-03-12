'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenTool, TrendingUp, Award, Clock, ArrowRight, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/useUserStore';
import { userService } from '@/services/userService';
import { Essay } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { progress, setProgress } = useUserStore();
  const [recentEssays, setRecentEssays] = useState<Essay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (user) {
        const [progressData, essaysData] = await Promise.all([
          userService.getUserProgress(user.id),
          userService.getUserStatistics(user.id),
        ]);
        
        setProgress(progressData);
        // In real app, fetch recent essays from API
        setRecentEssays([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vstep-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Ready to improve your writing skills today?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<PenTool className="h-6 w-6 text-vstep-blue" />}
          label="Essays Written"
          value={progress?.totalEssays || 0}
          color="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-vstep-green" />}
          label="Average Score"
          value={progress?.averageScore.toFixed(1) || '0.0'}
          color="bg-green-50"
        />
        <StatCard
          icon={<Flame className="h-6 w-6 text-vstep-yellow" />}
          label="Current Streak"
          value={`${progress?.currentStreak || 0} days`}
          color="bg-yellow-50"
        />
        <StatCard
          icon={<Award className="h-6 w-6 text-purple-500" />}
          label="Total XP"
          value={progress?.totalXP || 0}
          color="bg-purple-50"
        />
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Practice Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Continue Practice</h2>
            <Link href="/practice" className="text-vstep-blue hover:text-blue-700 text-sm font-medium flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-vstep-blue to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Daily Challenge</h3>
              <p className="text-blue-100 mb-4">Write 200 words to keep your streak alive!</p>
              <Link
                href="/practice"
                className="inline-flex items-center bg-white text-vstep-blue px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <PenTool className="mr-2 h-4 w-4" />
                Start Writing
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Progress Overview</h2>
            <Link href="/progress" className="text-vstep-blue hover:text-blue-700 text-sm font-medium">
              View Details
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Target Level</span>
              <span className="font-semibold text-vstep-blue">{user?.targetLevel || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Level</span>
              <span className="font-semibold text-vstep-green">{progress?.level || 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Best Streak</span>
              <span className="font-semibold text-vstep-yellow">{progress?.bestStreak || 0} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Essays */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Essays</h2>
          <Link href="/history" className="text-vstep-blue hover:text-blue-700 text-sm font-medium flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {recentEssays.length > 0 ? (
          <div className="space-y-3">
            {recentEssays.map((essay) => (
              <Link
                key={essay.id}
                href={`/feedback/${essay.id}`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-vstep-blue hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{essay.topicTitle}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(essay.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{essay.wordCount} words</span>
                    {essay.score && (
                      <span className="font-bold text-vstep-blue">{essay.score}/10</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No essays yet. Start practicing!</p>
            <Link
              href="/practice"
              className="inline-flex items-center bg-vstep-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <PenTool className="mr-2 h-4 w-4" />
              Start Writing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
