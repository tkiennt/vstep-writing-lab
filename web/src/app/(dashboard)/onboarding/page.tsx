'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Target, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/useUserStore';
import { authService } from '@/services/authService';
import { VSTEPLevel } from '@/types';
import { VSTEP_LEVELS } from '@/utils/constants';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setTargetLevel } = useUserStore();
  const [selectedLevel, setSelectedLevel] = useState<VSTEPLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedLevel || !user) return;

    setIsSubmitting(true);
    try {
      // Save target level to backend
      await authService.setTargetLevel(user.id, selectedLevel);
      
      // Update local store
      setTargetLevel(selectedLevel);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving target level:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Target className="h-16 w-16 text-vstep-blue" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Set Your Goal
          </h1>
          <p className="text-xl text-gray-600">
            Choose your target VSTEP level to personalize your practice
          </p>
        </div>

        {/* Level Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {(Object.keys(VSTEP_LEVELS) as VSTEPLevel[]).map((level) => (
            <div
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                selectedLevel === level
                  ? 'border-vstep-blue bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  selectedLevel === level ? 'text-vstep-blue' : 'text-gray-700'
                }`}>
                  {level}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {VSTEP_LEVELS[level].label}
                </div>
                {selectedLevel === level && (
                  <div className="flex items-center justify-center text-vstep-blue">
                    <Check className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <InfoCard
            level="B1"
            description="Intermediate - Basic writing skills for everyday topics"
            icon="📝"
          />
          <InfoCard
            level="B2"
            description="Upper Intermediate - Independent use in most situations"
            icon="✍️"
          />
          <InfoCard
            level="C1"
            description="Advanced - Effective operational proficiency"
            icon="🎯"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedLevel || isSubmitting}
          className="w-full bg-vstep-blue hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Saving...
            </>
          ) : (
            'Continue to Dashboard'
          )}
        </button>
      </div>
    </div>
  );
}

// Info Card Component
function InfoCard({
  level,
  description,
  icon,
}: {
  level: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold text-gray-900 mb-1">Level {level}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  );
}
