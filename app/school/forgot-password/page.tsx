'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabaseResetPassword } from '@/lib/supabase';
import { db } from '@/lib/db';
import {
  KeyRound,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogIn,
  ShieldCheck,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid official school email address.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { success, error } = await supabaseResetPassword(
        cleanEmail,
        `${origin}/school/reset-password`
      );

      if (error && !error.includes('mock') && !error.includes('initialized')) {
        setStatus({
          type: 'error',
          message: error,
        });
      } else {
        setStatus({
          type: 'success',
          message: `A secure password reset link has been dispatched to ${cleanEmail}. Please check your inbox and spam folder to set your new administrative password.`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link.';
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
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-orange-400 font-bold flex items-center justify-center text-xl shadow-sm mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Forgot Password
        </h1>
        <p className="text-xs text-slate-500">
          Recover administrative access to your school management portal
        </p>
        <p className="text-xs font-urdu text-slate-600 font-bold">
          پاس ورڈ کی بازیابی کا فارم
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
              <span>{status.type === 'success' ? 'Reset Link Dispatched' : 'Error'}</span>
            </div>
            <p className="leading-relaxed">{status.message}</p>

            {status.type === 'success' && (
              <div className="pt-2 border-t border-emerald-200/60 mt-2">
                <Link
                  href="/school/reset-password"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-900 underline hover:no-underline text-xs"
                >
                  <span>Set New Password Now (Development &amp; Direct Flow) →</span>
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSendReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered School Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@iqbalschool.edu.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 pl-9"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              We will send an encrypted Supabase Auth link to reset your account password.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending Reset Link via Supabase...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Send Password Reset Link</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <Link
            href="/school/login"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
          >
            <LogIn className="w-3.5 h-3.5 text-orange-600" />
            <span>Back to Login</span>
          </Link>

          <Link
            href="/school/register"
            className="text-emerald-700 font-semibold hover:underline"
          >
            Register School
          </Link>
        </div>
      </div>
    </div>
  );
}
