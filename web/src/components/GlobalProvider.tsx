'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2, Ban } from 'lucide-react';
import { AuthProvider } from './AuthProvider';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface GlobalContextType {
  addToast: (type: ToastType, message: string) => void;
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
}

interface ModalConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showModal = useCallback((config: ModalConfig) => setModal(config), []);
  const hideModal = useCallback(() => setModal(null), []);

  return (
    <GlobalContext.Provider value={{ addToast, showModal, hideModal }}>
      <AuthProvider>
        {children}
      </AuthProvider>
      
      {/* ── Toast Container ── */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-right-5 fade-in duration-300 min-w-[300px]
              ${toast.type === 'success' ? 'bg-slate-800 border-emerald-500/20 text-slate-200' : 
                toast.type === 'error'   ? 'bg-slate-800 border-red-500/20 text-slate-200' : 
                toast.type === 'loading' ? 'bg-slate-800 border-blue-500/20 text-slate-200' : 
                'bg-slate-800 border-white/5 text-slate-200'}`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error'   && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info'    && <Info className="w-5 h-5 text-slate-400 shrink-0" />}
            {toast.type === 'loading' && <Loader2 className="w-5 h-5 text-blue-400 shrink-0 animate-spin" />}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    {/* ✨ Premium Global Modal ✨ */}
    {modal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-300 m-4 flex flex-col">
          <div className="px-8 pt-8 pb-4 flex flex-col items-center text-center space-y-4">
             <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border ${
                modal.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                modal.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
             }`}>
                {modal.type === 'danger' && <Ban className="w-8 h-8" />}
                {modal.type === 'warning' && <AlertCircle className="w-8 h-8" />}
                {(modal.type === 'info' || !modal.type) && <Info className="w-8 h-8" />}
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{modal.title}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">System Authorization Required</p>
             </div>
          </div>

          <div className="px-8 py-6">
             <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl">
                <p className="text-sm font-medium text-slate-400 leading-relaxed text-center leading-6">
                   {modal.description}
                </p>
             </div>
          </div>

          <div className="px-8 pb-8 flex gap-3">
            <button 
              onClick={hideModal}
              className="flex-1 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all"
            >
              {modal.cancelText || 'Cancel'}
            </button>
            <button 
              onClick={() => { modal.onConfirm(); hideModal(); }}
              className={`flex-1 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white rounded-2xl shadow-lg transition-all active:scale-95
                ${modal.type === 'danger'  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40' : 
                  modal.type === 'warning' ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-900/40' : 
                  'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'}`}
            >
              {modal.confirmText || 'Confirm Action'}
            </button>
          </div>
        </div>
      </div>
    )}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within GlobalProvider');
  return context;
};
