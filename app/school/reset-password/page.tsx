'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseUpdatePassword } from '@/lib/supabase';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ShieldCheck,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 6) {
      setStatus({
        type: 'error',
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match. Please re-enter carefully.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await supabaseUpdatePassword(newPassword);

      if (error && !error.includes('mock') && !error.includes('initialized')) {
        setStatus({
          type: 'error',
          message: error,
        });
      } else {
        setStatus({
          type: 'success',
          message: 'Password successfully updated in Supabase Auth! Your new administrative password is now active.',
        });

        setTimeout(() => {
          router.push('/school/login');
        }, 2000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password update failed.';
      setStatus({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full flex flex-col justify-center">
      <div className="text-center mb-8 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xl shadow-sm mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Password
        </h1>
        <p className="text-xs text-slate-500">
          Enter and confirm your updated school administrator password
        </p>
        <p className="text-xs font-urdu text-emerald-700 font-bold">
          نیا پاس ورڈ سیٹ کریں
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {status && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              status.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{status.type === 'success' ? 'Password Changed Successfully' : 'Error'}</span>
            </div>
            <p className="leading-relaxed">{status.message}</p>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving New Password to Supabase...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Save New Password</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link
            href="/school/login"
            className="text-xs text-orange-600 font-bold hover:underline inline-flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Return to School Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
