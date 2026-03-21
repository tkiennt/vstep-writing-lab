'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
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

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-white/5 w-full max-w-md p-6 m-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-100 mb-2">{modal.title}</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-white/5">{modal.description}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={hideModal}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 rounded-xl transition-colors"
              >
                {modal.cancelText || 'Cancel'}
              </button>
              <button 
                onClick={() => { modal.onConfirm(); hideModal(); }}
                className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition-all
                  ${modal.type === 'danger'  ? 'bg-red-600 hover:bg-red-700' : 
                    modal.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 
                    'bg-vstep-dark hover:bg-emerald-900'}`}
              >
                {modal.confirmText || 'Confirm'}
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
