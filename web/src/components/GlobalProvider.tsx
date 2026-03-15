'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface GlobalContextType {
  // Toast
  addToast: (type: ToastType, message: string) => void;
  // Modal
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
    
    // Auto remove after 3s if not loading
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
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-5 fade-in duration-300 min-w-[300px]
              ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
                toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 
                toast.type === 'loading' ? 'bg-blue-50 border-blue-100 text-blue-800' : 
                'bg-white border-gray-200 text-gray-800'}`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-gray-500 shrink-0" />}
            {toast.type === 'loading' && <Loader2 className="w-5 h-5 text-blue-500 shrink-0 animate-spin" />}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Container */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 m-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{modal.description}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={hideModal}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
               >
                {modal.cancelText || 'Cancel'}
              </button>
              <button 
                onClick={() => {
                  modal.onConfirm();
                  hideModal();
                }}
                className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition-all
                  ${modal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
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
