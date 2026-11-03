'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    setErrorMessage(null);
    try {
      await db.logout();
      onClose();
      router.push('/school/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logout failed. Please try again.';
      setErrorMessage(msg);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            Sign Out of School Portal?
          </h3>
          <p className="text-xs font-urdu text-slate-500 font-bold">
            کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟
          </p>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            Are you sure you want to terminate your administrative session? You will be redirected to the School Login page and protected dashboard access will be locked until you sign in again.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Safe Session Termination:</span> All school records, fee challans, student admissions, and syllabus data remain permanently preserved in Supabase.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {isLoggingOut ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
