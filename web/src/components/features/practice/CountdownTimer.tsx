'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  initialSeconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasFinished) setHasFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, hasFinished]);

  const percentage = timeLeft / initialSeconds;
  
  let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let iconClass = 'text-emerald-600';
  
  if (percentage < 0.2) {
    colorClass = 'text-red-700 bg-red-50 border-red-200 animate-pulse';
    iconClass = 'text-red-600';
  } else if (percentage < 0.5) {
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    iconClass = 'text-amber-600';
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="flex flex-col items-end">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${colorClass} font-mono font-bold text-lg transition-colors duration-500`}>
        <Clock className={`w-5 h-5 ${iconClass}`} />
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
      
      {hasFinished && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-red-900/20 font-bold z-50 animate-in slide-in-from-top-4">
          Hết giờ! Hãy nộp bài ngay.
        </div>
      )}
    </div>
  );
};
