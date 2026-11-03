'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getStoredSupabaseConfig } from '@/lib/supabase';
import { SupabaseModal } from '@/components/SupabaseModal';
import {
  LogIn,
  UserPlus,
  KeyRound,
  Search,
  CheckCircle2,
  Receipt,
  Award,
  BookOpen,
  ShieldCheck,
  Building2,
  ArrowRight,
  Database,
  LayoutDashboard,
} from 'lucide-react';

export default function RootWelcomePage() {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Check if session exists in browser
  const session = React.useMemo(() => {
    if (!isMounted) return null;
    return db.getAuthenticatedSession();
  }, [isMounted]);

  const supabaseConfig = React.useMemo(() => {
    if (!isMounted) {
      return { url: '', anonKey: '', isConfigured: false, source: 'none' as const };
    }
    return getStoredSupabaseConfig();
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xl shadow-xs mb-3">
            🇵🇰
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pakistan School Management SaaS
          </h2>
          <p className="text-xs text-slate-500 font-urdu mt-0.5">
            پاکستان سکول مینجمنٹ سسٹم
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <div className="w-3.5 h-3.5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading School Portal Gateway...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center text-xl shadow-xs">
              🇵🇰
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base block">
                PAKISTAN SCHOOL MANAGEMENT SAAS
              </span>
              <p className="text-[11px] font-urdu text-slate-500 font-semibold leading-none">
                قومی سکول مینجمنٹ سسٹم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Session Shortcut if Already Logged In */}
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/school/login"
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>School Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero & 4 Core Visible Options */}
      <main className="flex-1 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
        {/* Welcome Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-orange-800 text-xs font-semibold shadow-2xs">
            <span>🇵🇰</span>
            <span>Welcome to Pakistan School Management SaaS Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Comprehensive Multi-School Academic Operating System
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Engineered exclusively for Pakistani schools, private school networks, foundation institutions, and cadet colleges. Built on live Supabase PostgreSQL and secure authentication.
          </p>

          <p className="text-base sm:text-lg font-urdu text-orange-700 font-bold">
            سکول ایڈمنسٹریشن، فیس چالان، امتحانات اور اساتذہ کے لیے جدید کلاؤڈ پورٹل
          </p>
        </div>

        {/* 4 PROMINENTLY DISPLAYED VISIBLE CORE OPTIONS */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
          {/* Option 1: School Login */}
          <div className="bg-white rounded-2xl border-2 border-orange-500/80 shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
                <LogIn className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                1. Portal Sign In
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                School Login
              </h2>
              <p className="text-xs font-urdu text-slate-500 font-bold">
                سکول لاگ ان
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in with your approved school administrator email and password to access the protected School Dashboard.
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real Supabase Auth</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Role &amp; approval verification</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/school/login"
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>School Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Option 2: Register Your School */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                2. New Onboarding
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Register Your School
              </h2>
              <p className="text-xs font-urdu text-slate-500 font-bold">
                سکول رجسٹریشن
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Onboard your primary, middle, high school, or college. Receive a unique Application ID for accreditation.
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Pakistani district &amp; tehsil fields</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Logo upload &amp; credentials</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/school/register"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Register School</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Option 3: Forgot Password */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-orange-400 flex items-center justify-center shadow-md">
                <KeyRound className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                3. Credential Help
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Forgot Password
              </h2>
              <p className="text-xs font-urdu text-slate-500 font-bold">
                پاس ورڈ کی بازیابی
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lost administrative access? Dispatch a secure, encrypted password reset link to your registered school email address.
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Encrypted recovery link</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>No plain text passwords</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/school/forgot-password"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Forgot Password</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Option 4: Check Application Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                4. Accreditation Check
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Check Status
              </h2>
              <p className="text-xs font-urdu text-slate-500 font-bold">
                درخواست کی صورتحال
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor your application status (Pending, Under Review, Additional Info, Approved, Rejected) using your Application ID.
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Privacy-verified email check</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Super Admin remarks display</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/school/application-status"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Track Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Matrix for Institutional Compliance */}
        <div className="mt-14 max-w-6xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <Receipt className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <h4 className="font-bold text-xs text-slate-900">3-Part Bank Challans</h4>
            <p className="text-[11px] text-slate-500">Bank, School &amp; Student copies on A4 landscape</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <Award className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-xs text-slate-900">BISE Result Cards</h4>
            <p className="text-[11px] text-slate-500">Official Board format with grading &amp; positions</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h4 className="font-bold text-xs text-slate-900">SLC &amp; Character Certs</h4>
            <p className="text-[11px] text-slate-500">Institutional School Leaving Certificates</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <h4 className="font-bold text-xs text-slate-900">Multi-Tenant Isolation</h4>
            <p className="text-[11px] text-slate-500">Encrypted school_id PostgreSQL RLS</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Pakistan School Management SaaS · Developed for Pakistani Educational Institutions</p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Karachi · Lahore · Rawalpindi · Faisalabad · Peshawar · Quetta</span>
            <span>·</span>
            <span className="font-semibold text-orange-600">Shared Supabase Integration</span>
          </div>
        </div>
      </footer>

      {/* Supabase Status Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}