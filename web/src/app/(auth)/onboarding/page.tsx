'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ChevronRight, ChevronLeft, Check, User, Target, BarChart3, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'name', title: 'Thông tin cá nhân', icon: User },
  { id: 'current', title: 'Trình độ hiện tại', icon: BarChart3 },
  { id: 'target', title: 'Mục tiêu của bạn', icon: Target },
];

const LEVELS = [
  { id: 'B1', label: 'B1 (Intermediate)', desc: 'Có thể giao tiếp cơ bản, viết đoạn văn ngắn.' },
  { id: 'B2', label: 'B2 (Upper Intermediate)', desc: 'Giao tiếp tự tin, viết bài luận rõ ràng.' },
  { id: 'C1', label: 'C1 (Advanced)', desc: 'Sử dụng ngôn ngữ linh hoạt, viết học thuật tốt.' },
  { id: 'UNKNOWN', label: 'Chưa biết / Mới bắt đầu', desc: 'Tôi chưa thi thử hoặc chưa biết trình độ.' },
];

const TARGET_LEVELS = [
  { id: 'B1', label: 'Chứng chỉ VSTEP B1', desc: 'Yêu cầu ra trường / Xát hạch công chức.' },
  { id: 'B2', label: 'Chứng chỉ VSTEP B2', desc: 'Yêu cầu cao học / Giáo viên tiếng Anh.' },
  { id: 'C1', label: 'Chứng chỉ VSTEP C1', desc: 'Yêu cầu chuyên gia / Giảng viên đại học.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userDoc, isLoading, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (userDoc?.onboardingCompleted) {
      router.push('/practice');
    }
    if (user?.name && !displayName) {
      setDisplayName(user.name);
    }
  }, [isLoading, isAuthenticated, userDoc, user, router, displayName]);

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await (window as any).firebaseAuthToken || localStorage.getItem('firebase-token');
      // In a real app, use auth.currentUser.getIdToken()
      const firebaseUser = (await import('@/lib/firebase')).auth.currentUser;
      const idToken = await firebaseUser?.getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5260'}/api/auth/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ displayName, currentLevel, targetLevel }),
      });

      if (response.ok) {
        // Force refresh user data or redirect
        window.location.href = '/practice';
      } else {
        const err = await response.json();
        alert(err.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Onboarding submit error:', error);
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-vstep-dark rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/20">
              {step + 1}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{STEPS[step].title}</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Bước {step + 1} của 3</p>
            </div>
          </div>
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === step ? 'w-10 bg-emerald-600' : 'w-2 bg-slate-200'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="p-10 sm:p-14">
          
          {/* Step 1: Name */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Chào mừng bạn đến với VSTEP Lab!</h2>
              <p className="text-slate-500 mb-10 font-medium">Chúng mình nên gọi bạn là gì nhỉ?</p>
              
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tên hiển thị</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ví dụ: Kiên Nguyễn"
                  className="w-full px-8 py-5 rounded-[2rem] border-2 border-slate-100 bg-slate-50 text-lg font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Step 2: Current Level */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Trình độ hiện tại của bạn?</h2>
              <p className="text-slate-500 mb-8 font-medium">Điều này giúp AI đưa ra gợi ý sát với khả năng của bạn hơn.</p>
              
              <div className="grid gap-4">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setCurrentLevel(lvl.id)}
                    className={`flex items-start gap-5 p-6 rounded-[2rem] border-2 transition-all text-left group ${
                      currentLevel === lvl.id 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md translate-x-1' 
                        : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      currentLevel === lvl.id ? 'bg-emerald-600' : 'bg-slate-200 group-hover:bg-slate-300'
                    }`}>
                      {currentLevel === lvl.id ? <Check className="w-5 h-5 text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                    </div>
                    <div>
                      <div className={`font-black tracking-tight ${currentLevel === lvl.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {lvl.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">{lvl.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Target Goal */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Mục tiêu bạn muốn đạt được?</h2>
              <p className="text-slate-500 mb-8 font-medium">Chúng mình sẽ đồng hành cùng bạn để đạt được kết quả này.</p>
              
              <div className="grid gap-4">
                {TARGET_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setTargetLevel(lvl.id)}
                    className={`flex items-start gap-5 p-6 rounded-[2rem] border-2 transition-all text-left group ${
                      targetLevel === lvl.id 
                        ? 'border-[#064e3b] bg-emerald-50 shadow-md translate-x-1' 
                        : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      targetLevel === lvl.id ? 'bg-[#064e3b]' : 'bg-slate-200 group-hover:bg-slate-300'
                    }`}>
                      {targetLevel === lvl.id ? <Check className="w-5 h-5 text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                    </div>
                    <div>
                      <div className={`font-black tracking-tight ${targetLevel === lvl.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {lvl.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">{lvl.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-14 flex items-center justify-between">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>

            {step === STEPS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!targetLevel || isSubmitting}
                className="flex items-center gap-3 px-10 py-4.5 rounded-2xl bg-[#064e3b] text-white text-sm font-black hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-950/20 disabled:opacity-50 hover:-translate-y-1 active:translate-y-0"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : <><Check className="w-4 h-4" /> Hoàn tất</>}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={(step === 0 && !displayName) || (step === 1 && !currentLevel)}
                className="flex items-center gap-3 px-10 py-4.5 rounded-2xl bg-[#064e3b] text-white text-sm font-black hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-950/20 disabled:opacity-50 hover:-translate-y-1 active:translate-y-0"
              >
                Tiếp theo <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <p className="mt-10 text-slate-400 text-sm font-medium">Bản nháp của bạn sẽ được lưu tự động sau mỗi bước.</p>
    </div>
  );
}
